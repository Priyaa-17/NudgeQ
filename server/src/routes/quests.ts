import express from 'express';
import { prisma } from '../server.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get available quests
router.get('/', authenticateToken, async (req, res) => {
  try {
    const quests = await prisma.quest.findMany({
      where: { isActive: true },
      include: {
        missions: {
          where: { userId: req.user!.id },
          select: { id: true, status: true }
        }
      }
    });

    res.json({ quests });
  } catch (error) {
    console.error('Get quests error:', error);
    res.status(500).json({ error: 'Failed to get quests' });
  }
});

// Start a quest
router.post('/:questId/start', authenticateToken, async (req, res) => {
  try {
    const { questId } = req.params;

    // Check if user already has this quest
    const existingQuest = await prisma.userQuest.findUnique({
      where: {
        userId_questId: {
          userId: req.user!.id,
          questId
        }
      }
    });

    if (existingQuest) {
      return res.status(400).json({ error: 'Quest already started' });
    }

    const userQuest = await prisma.userQuest.create({
      data: {
        userId: req.user!.id,
        questId
      }
    });

    res.json({ userQuest });
  } catch (error) {
    console.error('Start quest error:', error);
    res.status(500).json({ error: 'Failed to start quest' });
  }
});

// Get user's active quests
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const userQuests = await prisma.userQuest.findMany({
      where: { 
        userId: req.user!.id,
        status: 'ACTIVE'
      },
      include: {
        quest: true
      }
    });

    res.json({ quests: userQuests });
  } catch (error) {
    console.error('Get active quests error:', error);
    res.status(500).json({ error: 'Failed to get active quests' });
  }
});

// Complete a quest
router.post('/:questId/complete', authenticateToken, async (req, res) => {
  try {
    const { questId } = req.params;

    const userQuest = await prisma.userQuest.findUnique({
      where: {
        userId_questId: {
          userId: req.user!.id,
          questId
        }
      },
      include: { quest: true }
    });

    if (!userQuest || userQuest.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Quest not active' });
    }

    // Update quest status and user stats
    await prisma.$transaction(async (tx) => {
      await tx.userQuest.update({
        where: { id: userQuest.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          progress: 100
        }
      });

      await tx.user.update({
        where: { id: req.user!.id },
        data: {
          xp: { increment: userQuest.quest.xpReward },
          coins: { increment: userQuest.quest.coinReward },
          level: { increment: Math.floor(userQuest.quest.xpReward / 100) }
        }
      });
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Complete quest error:', error);
    res.status(500).json({ error: 'Failed to complete quest' });
  }
});

export default router;