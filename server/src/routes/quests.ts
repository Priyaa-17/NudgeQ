import express from 'express';

const router = express.Router();

// Mock quests data
const mockQuests = [
  {
    id: '1',
    title: 'Morning Productivity',
    description: 'Complete your morning routine and tackle your most important task',
    category: 'Productivity',
    xpReward: 50,
    coinReward: 25,
    difficulty: 'EASY',
    isActive: true
  },
  {
    id: '2',
    title: 'Fitness Challenge',
    description: 'Complete a 30-minute workout and track your progress',
    category: 'Health',
    xpReward: 75,
    coinReward: 40,
    difficulty: 'MEDIUM',
    isActive: true
  }
];

router.get('/', (req, res) => {
  res.json({ quests: mockQuests });
});

export default router;