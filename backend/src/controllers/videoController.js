const VideoCall = require('../models/VideoCall');

// Create a video call room
const createVideoRoom = async (req, res) => {
  try {
    const { appointmentId, patientId, doctorId } = req.body;
    
    // Create a unique room name
    const roomName = `room_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const videoCall = await VideoCall.create({
      appointmentId,
      patientId,
      doctorId,
      roomName,
      status: 'waiting'
    });
    
    res.status(201).json({
      success: true,
      data: videoCall,
      roomUrl: `https://mediTrack.video/${roomName}`
    });
  } catch (error) {
    console.error('Error creating video room:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Get video call details
const getVideoCall = async (req, res) => {
  try {
    const videoCall = await VideoCall.findById(req.params.id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email');
    
    if (!videoCall) {
      return res.status(404).json({ success: false, message: 'Video call not found' });
    }
    
    res.status(200).json({ success: true, data: videoCall });
  } catch (error) {
    console.error('Error getting video call:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { createVideoRoom, getVideoCall };