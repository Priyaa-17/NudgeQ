import express from 'express';

const router = express.Router();

router.post('/subscribe', (req, res) => {
  res.json({ success: true });
});

export default router;