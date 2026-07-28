const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
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
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  medications: [{
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    instructions: { type: String, default: '' }
  }],
  notes: {
    type: String,
    default: ''
  },
  refillsRemaining: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  prescriptionNumber: {
    type: String,
    default: function() {
      return `RX-${Date.now().toString().slice(-6)}`;
    }
  }
}, {
  timestamps: true
});

// ✅ NO pre-save hooks at all!
module.exports = mongoose.model('Prescription', PrescriptionSchema);