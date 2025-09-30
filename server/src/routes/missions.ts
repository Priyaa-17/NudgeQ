import express from 'express';

const router = express.Router();

// Mock missions data
const mockMissions = [
  {
    id: '1',
    title: 'Complete 3 Tasks',
    description: 'Complete any 3 tasks today',
    type: 'DAILY',
    target: 3,
    current: 1,
    xpReward: 15,
    coinReward: 10,
    isCompleted: false,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  }
];

router.get('/', (req, res) => {
  res.json({ missions: mockMissions });
});

router.post('/daily/generate', (req, res) => {
  res.json({ missions: mockMissions });
});

export default router;