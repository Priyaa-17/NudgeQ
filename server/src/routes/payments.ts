import express from 'express';

const router = express.Router();

router.get('/plans', (req, res) => {
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
    }
  ];
  res.json({ plans });
});

export default router;