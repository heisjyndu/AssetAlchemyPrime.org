const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../database');

const router = express.Router();

// Create payment intent
router.post('/create-intent', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;
    const userId = req.user.userId;

    // Validate amount
    if (!amount || amount < 1000) { // Minimum $10.00
      return res.status(400).json({ error: 'Minimum amount is $10' });
    }

    if (amount > 5000000) { // Maximum $50,000
      return res.status(400).json({ error: 'Maximum amount is $50,000' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        userId,
        type: 'deposit'
      }
    });

    res.json({
      client_secret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Webhook to handle successful payments
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handleSuccessfulPayment(paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handleFailedPayment(failedPayment);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

async function handleSuccessfulPayment(paymentIntent) {
  try {
    const userId = paymentIntent.metadata.userId;
    const amount = paymentIntent.amount / 100; // Convert from cents

    // Record the transaction
    await pool.query(
      'INSERT INTO transactions (user_id, type, amount, method, status, tx_hash) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, 'deposit', amount, 'stripe', 'completed', paymentIntent.id]
    );

    console.log(`Payment successful for user ${userId}: $${amount}`);
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

async function handleFailedPayment(paymentIntent) {
  try {
    const userId = paymentIntent.metadata.userId;
    const amount = paymentIntent.amount / 100;

    // Record the failed transaction
    await pool.query(
      'INSERT INTO transactions (user_id, type, amount, method, status, tx_hash) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, 'deposit', amount, 'stripe', 'failed', paymentIntent.id]
    );

    console.log(`Payment failed for user ${userId}: $${amount}`);
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

module.exports = router;