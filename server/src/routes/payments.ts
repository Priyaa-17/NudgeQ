import express from 'express';
import Stripe from 'stripe';
import { prisma } from '../server.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
});

// Create payment intent
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { amount, currency = 'usd', type } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        userId: req.user!.id,
        type
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Get premium plans
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'premium_monthly',
        name: 'Premium Monthly',
        price: 9.99,
        interval: 'month',
        features: [
          'Unlimited quests',
          'Advanced analytics',
          'Priority support',
          'Exclusive badges',
          'Custom themes'
        ]
      },
      {
        id: 'premium_yearly',
        name: 'Premium Yearly',
        price: 99.99,
        interval: 'year',
        features: [
          'Unlimited quests',
          'Advanced analytics',
          'Priority support',
          'Exclusive badges',
          'Custom themes',
          '2 months free'
        ]
      }
    ];

    res.json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Failed to get plans' });
  }
});

// Purchase coins/gems
router.post('/purchase', authenticateToken, async (req, res) => {
  try {
    const { type, amount, paymentIntentId } = req.body;

    // Verify payment
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Update user currency
    const updateData: any = {};
    if (type === 'coins') {
      updateData.coins = { increment: amount };
    } else if (type === 'gems') {
      updateData.gems = { increment: amount };
    }

    await prisma.user.update({
      where: { id: req.user!.id },
      data: updateData
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Failed to process purchase' });
  }
});

export default router;