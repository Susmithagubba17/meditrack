const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
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
  dateTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    default: 30
  },
  status: {
    type: String,
    enum: ['scheduled', 'arrived', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  reason: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // ✅ PAYMENT FIELDS (ADD THESE)
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cash', 'upi', 'bank_transfer', 'wallet'],
    default: 'card'
  },
  paymentId: {
    type: String
  },
  amount: {
    type: Number,
    default: 50
  },
  paymentDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', AppointmentSchema);