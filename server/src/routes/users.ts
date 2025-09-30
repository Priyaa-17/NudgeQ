import express from 'express';
import { z } from 'zod';
import { prisma } from '../server.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const updateProfileSchema = z.object({
  interests: z.array(z.string()).optional(),
  bio: z.string().max(500).optional(),
  discoveryEnabled: z.boolean().optional(),
  discoveryRadius: z.number().min(1).max(100).optional()
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        profile: true,
        badges: {
          include: { badge: true }
        },
        missions: {
          where: { isCompleted: false },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
      coins: user.coins,
      gems: user.gems,
      isPremium: user.isPremium,
      profile: user.profile,
      badges: user.badges.map(ub => ub.badge),
      activeMissions: user.missions
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const data = updateProfileSchema.parse(req.body);

    await prisma.userProfile.upsert({
      where: { userId: req.user!.id },
      update: data,
      create: {
        userId: req.user!.id,
        interests: data.interests || [],
        ...data
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get leaderboard
router.get('/leaderboard', authenticateToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        avatar: true,
        xp: true,
        level: true,
        streak: true
      },
      orderBy: { xp: 'desc' },
      take: 50
    });

    res.json({ users });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

export default router;