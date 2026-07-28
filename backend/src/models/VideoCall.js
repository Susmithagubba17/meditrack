const mongoose = require('mongoose');

const VideoCallSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomName: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'ended'],
    default: 'waiting'
  },
  startedAt: Date,
  endedAt: Date,
  duration: Number
}, { timestamps: true });

module.exports = mongoose.model('VideoCall', VideoCallSchema);