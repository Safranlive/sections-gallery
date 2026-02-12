const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Stripe configuration and helper functions
 */
const stripeConfig = {
  apiVersion: '2023-10-16',
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
};

/**
 * Create a customer in Stripe
 */
async function createCustomer(email, shopifyDomain) {
  try {
    const customer = await stripe.customers.create({
      email,
      metadata: {
        shopifyDomain,
      },
    });
    return customer;
  } catch (error) {
    console.error('Create Stripe customer error:', error);
    throw error;
  }
}

/**
 * Create a checkout session
 */
async function createCheckoutSession({ priceId, customerId, metadata }) {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      metadata,
    });
    return session;
  } catch (error) {
    console.error('Create checkout session error:', error);
    throw error;
  }
}

/**
 * Verify webhook signature
 */
function verifyWebhook(payload, signature) {
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      stripeConfig.webhookSecret
    );
    return event;
  } catch (error) {
    console.error('Webhook verification error:', error);
    throw error;
  }
}

module.exports = {
  stripe,
  stripeConfig,
  createCustomer,
  createCheckoutSession,
  verifyWebhook,
};
