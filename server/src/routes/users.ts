import express from 'express';

const router = express.Router();

// Mock middleware for authentication
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  // Mock user for development
  req.user = { id: '1', email: 'test@example.com' };
  next();
};

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // Mock user data
    const user = {
      id: '1',
      email: 'test@example.com',
      username: 'testuser',
      avatar: null,
      xp: 150,
      level: 2,
      streak: 5,
      coins: 250,
      gems: 10,
      isPremium: false,
      profile: {
        interests: ['Productivity', 'Fitness'],
        bio: 'Quest enthusiast!',
        locationEnabled: false,
        discoveryEnabled: true,
        discoveryRadius: 50
      },
      badges: [],
      activeMissions: []
    };

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

export default router;