import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ friends: [] });
});

router.get('/requests', (req, res) => {
  res.json({ requests: [] });
});

export default router;