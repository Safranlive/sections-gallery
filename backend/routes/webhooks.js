const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { stripe } = require('../config/stripe');

const prisma = new PrismaClient();

// Shopify webhook verification
const verifyShopifyWebhook = (req, res, next) => {
  const hmac = req.headers['x-shopify-hmac-sha256'];
  const shop = req.headers['x-shopify-shop-domain'];
  
  // TODO: Implement proper HMAC verification
  // For now, just check shop exists
  if (!shop) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  req.shop = shop;
  next();
};

// App uninstalled webhook
router.post('/app-uninstalled', express.raw({ type: 'application/json' }), verifyShopifyWebhook, async (req, res) => {
  try {
    const shop = req.shop;

    // Log webhook
    await prisma.webhookLog.create({
      data: {
        shopifyDomain: shop,
        topic: 'app/uninstalled',
        payload: req.body.toString(),
      },
    });

    // Deactivate store
    const store = await prisma.store.update({
      where: { shopifyDomain: shop },
      data: {
        isActive: false,
        uninstalledAt: new Date(),
      },
    });

    // Cancel active subscriptions
    await prisma.subscription.updateMany({
      where: {
        storeId: store.id,
        status: 'ACTIVE',
      },
      data: { status: 'CANCELED' },
    });

    // Log analytics
    await prisma.analytics.create({
      data: {
        storeId: store.id,
        eventType: 'APP_UNINSTALLED',
      },
    });

    // Mark webhook as processed
    await prisma.webhookLog.updateMany({
      where: {
        shopifyDomain: shop,
        topic: 'app/uninstalled',
        processed: false,
      },
      data: { processed: true },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('App uninstalled webhook error:', error);
    
    // Log error
    await prisma.webhookLog.updateMany({
      where: {
        shopifyDomain: req.shop,
        topic: 'app/uninstalled',
        processed: false,
      },
      data: {
        processed: true,
        error: error.message,
      },
    });
    
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// GDPR: Customer data request
router.post('/customers-data-request', express.raw({ type: 'application/json' }), verifyShopifyWebhook, async (req, res) => {
  try {
    const shop = req.shop;

    await prisma.webhookLog.create({
      data: {
        shopifyDomain: shop,
        topic: 'customers/data_request',
        payload: req.body.toString(),
        processed: true,
      },
    });

    // Since we don't store customer PII, return empty dataset
    res.status(200).json({
      message: 'No customer data stored',
      data: {},
    });
  } catch (error) {
    console.error('Customer data request webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// GDPR: Customer data erasure
router.post('/customers-redact', express.raw({ type: 'application/json' }), verifyShopifyWebhook, async (req, res) => {
  try {
    const shop = req.shop;

    await prisma.webhookLog.create({
      data: {
        shopifyDomain: shop,
        topic: 'customers/redact',
        payload: req.body.toString(),
        processed: true,
      },
    });

    // Since we don't store customer PII, nothing to delete
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Customer redact webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// GDPR: Shop data erasure
router.post('/shop-redact', express.raw({ type: 'application/json' }), verifyShopifyWebhook, async (req, res) => {
  try {
    const shop = req.shop;

    await prisma.webhookLog.create({
      data: {
        shopifyDomain: shop,
        topic: 'shop/redact',
        payload: req.body.toString(),
      },
    });

    // Delete shop data after 48 hours (GDPR requirement)
    const store = await prisma.store.findUnique({
      where: { shopifyDomain: shop },
    });

    if (store) {
      // Mark for deletion
      await prisma.store.update({
        where: { id: store.id },
        data: {
          scheduledForDeletion: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Shop redact webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Stripe webhook handler
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        // Handle successful subscription
        const session = event.data.object;
        await handleCheckoutComplete(session);
        break;

      case 'customer.subscription.updated':
        // Handle subscription update
        const subscription = event.data.object;
        await handleSubscriptionUpdate(subscription);
        break;

      case 'customer.subscription.deleted':
        // Handle subscription cancellation
        const canceledSub = event.data.object;
        await handleSubscriptionCanceled(canceledSub);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

// Helper functions for Stripe webhooks
async function handleCheckoutComplete(session) {
  const { storeId, planType } = session.metadata;
  
  await prisma.subscription.create({
    data: {
      storeId,
      tier: planType,
      status: 'ACTIVE',
      stripeSubscriptionId: session.subscription,
      currentPeriodEnd: new Date(session.current_period_end * 1000),
    },
  });
}

async function handleSubscriptionUpdate(subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status.toUpperCase(),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
}

async function handleSubscriptionCanceled(subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: 'CANCELED' },
  });
}

module.exports = router;