import express from 'express';

const router = express.Router();

router.get('/potential-matches', (req, res) => {
  res.json({ users: [] });
});

router.get('/matches', (req, res) => {
  res.json({ matches: [] });
});

export default router;