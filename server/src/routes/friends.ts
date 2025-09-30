import express from 'express';
import { prisma } from '../server.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Send friend request
router.post('/request', authenticateToken, async (req, res) => {
  try {
    const { receiverId } = req.body;

    if (receiverId === req.user!.id) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    // Check if request already exists
    const existingRequest = await prisma.friendRequest.findUnique({
      where: {
        requesterId_receiverId: {
          requesterId: req.user!.id,
          receiverId
        }
      }
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'Friend request already sent' });
    }

    const friendRequest = await prisma.friendRequest.create({
      data: {
        requesterId: req.user!.id,
        receiverId
      }
    });

    res.json({ friendRequest });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

// Accept friend request
router.put('/request/:requestId/accept', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;

    const friendRequest = await prisma.friendRequest.findFirst({
      where: {
        id: requestId,
        receiverId: req.user!.id,
        status: 'PENDING'
      }
    });

    if (!friendRequest) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    await prisma.friendRequest.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ error: 'Failed to accept friend request' });
  }
});

// Get friend requests
router.get('/requests', authenticateToken, async (req, res) => {
  try {
    const requests = await prisma.friendRequest.findMany({
      where: {
        receiverId: req.user!.id,
        status: 'PENDING'
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            avatar: true,
            level: true
          }
        }
      }
    });

    res.json({ requests });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ error: 'Failed to get friend requests' });
  }
});

// Get friends list
router.get('/', authenticateToken, async (req, res) => {
  try {
    const friendships = await prisma.friendRequest.findMany({
      where: {
        OR: [
          { requesterId: req.user!.id, status: 'ACCEPTED' },
          { receiverId: req.user!.id, status: 'ACCEPTED' }
        ]
      },
      include: {
        requester: {
          select: {
            id: true,
            username: true,
            avatar: true,
            level: true,
            xp: true,
            streak: true
          }
        },
        receiver: {
          select: {
            id: true,
            username: true,
            avatar: true,
            level: true,
            xp: true,
            streak: true
          }
        }
      }
    });

    const friends = friendships.map(friendship => 
      friendship.requesterId === req.user!.id 
        ? friendship.receiver 
        : friendship.requester
    );

    res.json({ friends });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Failed to get friends list' });
  }
});

export default router;