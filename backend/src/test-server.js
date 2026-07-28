const express = require('express');
const app = express();
const port = 5005; // Using a different port to avoid conflicts

// ✅ CRITICAL: JSON middleware
app.use(express.json());

// Simple test route
app.post('/api/test', (req, res) => {
  console.log('📨 Received body:', req.body);
  res.json({
    success: true,
    message: 'Test server is working!',
    received: req.body
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Test server is running' });
});

app.listen(port, () => {
  console.log(`🚀 Test server running on http://localhost:${port}`);
  console.log(`📋 Test endpoint: POST http://localhost:${port}/api/test`);
});