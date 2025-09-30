import express from 'express';
import { z } from 'zod';
import { prisma } from '../server.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

const updateLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  city: z.string().optional(),
  country: z.string().optional()
});

const swipeSchema = z.object({
  targetUserId: z.string(),
  direction: z.enum(['LEFT', 'RIGHT'])
});

// Calculate distance between two coordinates in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Update user location
router.put('/location', authenticateToken, async (req, res) => {
  try {
    const { latitude, longitude, city, country } = updateLocationSchema.parse(req.body);

    await prisma.userProfile.upsert({
      where: { userId: req.user!.id },
      update: {
        latitude,
        longitude,
        city,
        country,
        locationEnabled: true
      },
      create: {
        userId: req.user!.id,
        latitude,
        longitude,
        city,
        country,
        locationEnabled: true,
        interests: []
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Get potential matches
router.get('/potential-matches', authenticateToken, async (req, res) => {
  try {
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: req.user!.id }
    });

    if (!userProfile || !userProfile.locationEnabled || !userProfile.latitude || !userProfile.longitude) {
      return res.json({ users: [] });
    }

    // Get all users with location enabled
    const potentialMatches = await prisma.user.findMany({
      where: {
        id: { not: req.user!.id },
        profile: {
          locationEnabled: true,
          discoveryEnabled: true,
          latitude: { not: null },
          longitude: { not: null }
        }
      },
      include: {
        profile: true,
        badges: {
          include: { badge: true }
        }
      }
    });

    // Get already swiped users
    const swipedUsers = await prisma.swipe.findMany({
      where: { swiperId: req.user!.id },
      select: { swipedId: true }
    });
    const swipedUserIds = new Set(swipedUsers.map(s => s.swipedId));

    // Filter by distance and interests
    const matches = potentialMatches
      .filter(user => {
        if (swipedUserIds.has(user.id)) return false;
        
        const distance = calculateDistance(
          userProfile.latitude!,
          userProfile.longitude!,
          user.profile!.latitude!,
          user.profile!.longitude!
        );

        if (distance > userProfile.discoveryRadius) return false;

        // Check for overlapping interests
        const commonInterests = userProfile.interests.filter(interest =>
          user.profile!.interests.includes(interest)
        );

        return commonInterests.length > 0 || userProfile.interests.length === 0;
      })
      .map(user => ({
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        level: user.level,
        xp: user.xp,
        bio: user.profile?.bio,
        interests: user.profile?.interests || [],
        badgeCount: user.badges.length,
        distance: Math.round(calculateDistance(
          userProfile.latitude!,
          userProfile.longitude!,
          user.profile!.latitude!,
          user.profile!.longitude!
        ))
      }))
      .slice(0, 10); // Limit to 10 potential matches

    res.json({ users: matches });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to get potential matches' });
  }
});

// Record swipe
router.post('/swipe', authenticateToken, async (req, res) => {
  try {
    const { targetUserId, direction } = swipeSchema.parse(req.body);

    // Record the swipe
    await prisma.swipe.create({
      data: {
        swiperId: req.user!.id,
        swipedId: targetUserId,
        direction
      }
    });

    let isMatch = false;

    // If it's a right swipe, check for mutual match
    if (direction === 'RIGHT') {
      const mutualSwipe = await prisma.swipe.findUnique({
        where: {
          swiperId_swipedId: {
            swiperId: targetUserId,
            swipedId: req.user!.id
          }
        }
      });

      if (mutualSwipe && mutualSwipe.direction === 'RIGHT') {
        // Create match
        await prisma.match.create({
          data: {
            user1Id: req.user!.id,
            user2Id: targetUserId
          }
        });

        // Create friend requests for both users
        await prisma.friendRequest.create({
          data: {
            requesterId: req.user!.id,
            receiverId: targetUserId,
            status: 'ACCEPTED'
          }
        });

        isMatch = true;
      }
    }

    res.json({ success: true, isMatch });
  } catch (error) {
    console.error('Swipe error:', error);
    res.status(500).json({ error: 'Failed to record swipe' });
  }
});

// Get matches
router.get('/matches', authenticateToken, async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { user1Id: req.user!.id },
          { user2Id: req.user!.id }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            avatar: true,
            level: true
          }
        },
        user2: {
          select: {
            id: true,
            username: true,
            avatar: true,
            level: true
          }
        }
      }
    });

    const formattedMatches = matches.map(match => ({
      id: match.id,
      user: match.user1Id === req.user!.id ? match.user2 : match.user1,
      createdAt: match.createdAt
    }));

    res.json({ matches: formattedMatches });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ error: 'Failed to get matches' });
  }
});

export default router;