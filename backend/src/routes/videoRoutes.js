const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Create a video room
router.post('/create-room', protect, async (req, res) => {
  try {
    const { appointmentId } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: 'Appointment ID is required'
      });
    }

    // Generate unique room ID using Jitsi Meet (free, no API key needed)
    const roomId = `mediTrack_${appointmentId}_${Date.now()}`;
    
    // Using Jitsi Meet - free and open source video conferencing
    const roomUrl = `https://meet.jit.si/${roomId}`;

    res.json({
      success: true,
      data: {
        roomId,
        roomUrl,
        appointmentId
      }
    });
  } catch (error) {
    console.error('Error creating video room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create video room'
    });
  }
});

module.exports = router;