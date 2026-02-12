const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();

/**
 * Get available subscription plans
 */
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        features: [
          '5 sections per month',
          'Basic support',
          'Community access',
        ],
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 29.99,
        priceId: process.env.STRIPE_PRO_PRICE_ID,
        features: [
          'Unlimited sections',
          'Priority support',
          'Advanced analytics',
          'Custom sections',
        ],
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 99.99,
        priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
        features: [
          'Everything in Pro',
          'Dedicated support',
          'White-label options',
          'API access',
          'Custom development',
        ],
      },
    ];

    res.json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Failed to get plans' });
  }
});

/**
 * Get current subscription
 */
router.get('/current', async (req, res) => {
  try {
    const { shop } = req.session;

    const store = await prisma.store.findUnique({
      where: { shopifyDomain: shop },
      include: {
        subscription: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const currentSubscription = store.subscription[0] || null;

    res.json({
      subscription: currentSubscription,
      planType: store.planType,
    });
  } catch (error) {
    console.error('Get current subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

/**
 * Create checkout session for subscription
 */
router.post('/create-checkout', async (req, res) => {
  try {
    const { shop } = req.session;
    const { priceId, planType } = req.body;

    if (!priceId || !planType) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const store = await prisma.store.findUnique({
      where: { shopifyDomain: shop },
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: store.email,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      metadata: {
        storeId: store.id,
        shopifyDomain: shop,
        planType,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Create checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

/**
 * Cancel subscription
 */
router.post('/cancel', async (req, res) => {
  try {
    const { shop } = req.session;

    const store = await prisma.store.findUnique({
      where: { shopifyDomain: shop },
      include: {
        subscription: {
          where: { status: 'ACTIVE' },
          take: 1,
        },
      },
    });

    if (!store || !store.subscription[0]) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const subscription = store.subscription[0];

    // Cancel in Stripe
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    }

    // Update in database
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

module.exports = router;