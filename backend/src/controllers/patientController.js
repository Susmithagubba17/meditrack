const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');

// @desc    Get patient medical history
// @route   GET /api/patients/:id/medical-history
// @access  Private (Doctor only)
const getMedicalHistory = async (req, res) => {
  try {
    const patientId = req.params.id;

    // Verify patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    // Get all appointments
    const appointments = await Appointment.find({ patientId })
      .populate('doctorId', 'name specialty')
      .sort({ dateTime: -1 });

    // Get all prescriptions
    const prescriptions = await Prescription.find({ patientId })
      .populate('doctorId', 'name specialty')
      .sort({ createdAt: -1 });

    // Get upcoming appointments
    const upcomingAppointments = appointments.filter(
      apt => apt.status === 'scheduled' || apt.status === 'arrived'
    );

    // Get past appointments
    const pastAppointments = appointments.filter(
      apt => apt.status === 'completed' || apt.status === 'cancelled'
    );

    res.status(200).json({
      success: true,
      data: {
        patient: {
          _id: patient._id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          dob: patient.dob,
          allergies: patient.allergies || [],
          medicalHistory: patient.medicalHistory || '',
          bloodGroup: patient.bloodGroup || 'Unknown',
          emergencyContact: patient.emergencyContact || ''
        },
        statistics: {
          totalAppointments: appointments.length,
          upcomingAppointments: upcomingAppointments.length,
          totalPrescriptions: prescriptions.length,
          activePrescriptions: prescriptions.filter(p => p.isActive).length
        },
        appointments: {
          upcoming: upcomingAppointments,
          past: pastAppointments
        },
        prescriptions: prescriptions
      }
    });
  } catch (error) {
    console.error('❌ Get medical history error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Update patient medical history
// @route   PUT /api/patients/:id/medical-history
// @access  Private (Doctor only)
const updateMedicalHistory = async (req, res) => {
  try {
    const patientId = req.params.id;
    const { medicalHistory, allergies, bloodGroup, emergencyContact } = req.body;

    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    // Update only provided fields
    if (medicalHistory !== undefined) patient.medicalHistory = medicalHistory;
    if (allergies !== undefined) patient.allergies = allergies;
    if (bloodGroup !== undefined) patient.bloodGroup = bloodGroup;
    if (emergencyContact !== undefined) patient.emergencyContact = emergencyContact;

    await patient.save();

    res.status(200).json({
      success: true,
      message: 'Medical history updated successfully',
      data: patient
    });
  } catch (error) {
    console.error('❌ Update medical history error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Add visit note
// @route   POST /api/patients/:id/visit-notes
// @access  Private (Doctor only)
const addVisitNote = async (req, res) => {
  try {
    const patientId = req.params.id;
    const { note, appointmentId } = req.body;

    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    // Initialize visitNotes array if it doesn't exist
    if (!patient.visitNotes) {
      patient.visitNotes = [];
    }

    // Add new visit note
    patient.visitNotes.push({
      date: new Date(),
      doctorId: req.user._id,
      doctorName: req.user.name,
      note: note,
      appointmentId: appointmentId || null
    });

    await patient.save();

    res.status(201).json({
      success: true,
      message: 'Visit note added successfully',
      data: patient.visitNotes
    });
  } catch (error) {
    console.error('❌ Add visit note error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get patient visit notes
// @route   GET /api/patients/:id/visit-notes
// @access  Private (Doctor only)
const getVisitNotes = async (req, res) => {
  try {
    const patientId = req.params.id;

    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: patient.visitNotes || []
    });
  } catch (error) {
    console.error('❌ Get visit notes error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getMedicalHistory,
  updateMedicalHistory,
  addVisitNote,
  getVisitNotes
};