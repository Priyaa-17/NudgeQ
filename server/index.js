const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create Express application
const app = express();

// Get port from environment variable or default to 3000
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// In-memory user storage (replace with database in production)
const users = [];

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));

// Middleware to parse JSON requests
app.use(express.json());

// Basic route - returns a JSON message
app.get('/', (req, res) => {
  res.json({ message: "Server is running" });
});

// Authentication routes
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    // Validate input
    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, password, and username are required' });
    }
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      username,
      xp: 0,
      level: 1,
      streak: 0,
      coins: 100,
      gems: 0,
      isPremium: false,
      createdAt: new Date().toISOString()
    };
    
    users.push(user);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
      token,
      user: userWithoutPassword
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      token,
      user: userWithoutPassword
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Example of how to add more routes:
// 
// app.get('/api/users', (req, res) => {
//   res.json({ users: [] });
// });
//
// app.post('/api/users', (req, res) => {
//   const { name, email } = req.body;
//   res.json({ message: 'User created', user: { name, email } });
// });
//
// app.get('/api/users/:id', (req, res) => {
//   const { id } = req.params;
//   res.json({ message: `Getting user ${id}` });
// });

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Visit: http://localhost:${PORT}`);
});