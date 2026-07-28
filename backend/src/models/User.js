const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'receptionist'],
    default: 'patient'
  },
  phone: {
    type: String,
    required: true
  },
  dob: Date,
  allergies: [String],
  medicalHistory: String,
  specialty: {
    type: String,
    default: 'General'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Add to the UserSchema
bloodGroup: {
  type: String,
  enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
  default: 'Unknown'
},
emergencyContact: {
  name: String,
  relation: String,
  phone: String
},
visitNotes: [{
  date: Date,
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  doctorName: String,
  note: String,
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  }
}],
bloodGroup: { type: String, default: 'Unknown' }
},
 {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema);