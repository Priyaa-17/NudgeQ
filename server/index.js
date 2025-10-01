const express = require('express');

// Create Express application
const app = express();

// Get port from environment variable or default to 3000
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Basic route - returns a JSON message
app.get('/', (req, res) => {
  res.json({ message: "Server is running" });
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