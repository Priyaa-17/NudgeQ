import express from 'express';
import { z } from 'zod';
import { prisma } from '../server.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const createMissionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['DAILY', 'WEEKLY', 'CUSTOM', 'SOCIAL']),
  target: z.number().min(1).default(1),
  xpReward: z.number().min(1).default(10),
  coinReward: z.number().min(1).default(5),
  dueDate: z.string().datetime().optional()
});

// Get user's missions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const missions = await prisma.mission.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ missions });
  } catch (error) {
    console.error('Get missions error:', error);
    res.status(500).json({ error: 'Failed to get missions' });
  }
});

// Create a mission
router.post('/', authenticateToken, async (req, res) => {
  try {
    const data = createMissionSchema.parse(req.body);

    const mission = await prisma.mission.create({
      data: {
        ...data,
        userId: req.user!.id,
        dueDate: data.dueDate ? new Date(data.dueDate) : null
      }
    });

    res.status(201).json({ mission });
  } catch (error) {
    console.error('Create mission error:', error);
    res.status(500).json({ error: 'Failed to create mission' });
  }
});

// Update mission progress
router.put('/:missionId/progress', authenticateToken, async (req, res) => {
  try {
    const { missionId } = req.params;
    const { increment = 1 } = req.body;

    const mission = await prisma.mission.findFirst({
      where: {
        id: missionId,
        userId: req.user!.id,
        isCompleted: false
      }
    });

    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }

    const newCurrent = Math.min(mission.current + increment, mission.target);
    const isCompleted = newCurrent >= mission.target;

    await prisma.$transaction(async (tx) => {
      await tx.mission.update({
        where: { id: missionId },
        data: {
          current: newCurrent,
          isCompleted
        }
      });

      if (isCompleted) {
        await tx.user.update({
          where: { id: req.user!.id },
          data: {
            xp: { increment: mission.xpReward },
            coins: { increment: mission.coinReward }
          }
        });
      }
    });

    res.json({ success: true, isCompleted });
  } catch (error) {
    console.error('Update mission progress error:', error);
    res.status(500).json({ error: 'Failed to update mission progress' });
  }
});

// Generate daily missions
router.post('/daily/generate', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if daily missions already exist for today
    const existingMissions = await prisma.mission.findMany({
      where: {
        userId: req.user!.id,
        type: 'DAILY',
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    if (existingMissions.length > 0) {
      return res.json({ missions: existingMissions });
    }

    // Generate 3 daily missions
    const dailyMissions = [
      {
        title: 'Complete 3 Tasks',
        description: 'Complete any 3 tasks today',
        target: 3,
        xpReward: 15,
        coinReward: 10
      },
      {
        title: 'Stay Focused',
        description: 'Work for 25 minutes without distraction',
        target: 1,
        xpReward: 20,
        coinReward: 15
      },
      {
        title: 'Connect with a Friend',
        description: 'Send a message or complete a shared quest',
        target: 1,
        xpReward: 10,
        coinReward: 5
      }
    ];

    const missions = await Promise.all(
      dailyMissions.map(mission =>
        prisma.mission.create({
          data: {
            ...mission,
            userId: req.user!.id,
            type: 'DAILY',
            dueDate: tomorrow
          }
        })
      )
    );

    res.json({ missions });
  } catch (error) {
    console.error('Generate daily missions error:', error);
    res.status(500).json({ error: 'Failed to generate daily missions' });
  }
});

export default router;