const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { sendAppointmentConfirmation } = require('../services/emailService');
const getAppointments = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'doctor') {
      query.doctorId = req.user._id;
    } else if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email specialty')
      .sort({ dateTime: 1 });

    res.status(200).json({ success: true, count: appointments.length, data: appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email specialty');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (req.user.role === 'patient' && appointment.patientId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (req.user.role === 'doctor' && appointment.doctorId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, dateTime, duration, reason } = req.body;

    let finalPatientId = patientId;
    if (req.user.role === 'patient') {
      finalPatientId = req.user._id;
    }

    const patient = await User.findById(finalPatientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const existingAppointment = await Appointment.findOne({
      doctorId,
      dateTime,
      status: { $nin: ['cancelled'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ success: false, message: 'Doctor already booked at this time' });
    }

    const appointment = await Appointment.create({
      patientId: finalPatientId,
      doctorId,
      dateTime,
      duration: duration || 30,
      reason,
      createdBy: req.user._id
    });

    // ✅ Send email confirmation
    try {
      await sendAppointmentConfirmation(
        patient.email,
        patient.name,
        doctor.name,
        dateTime,
        reason
      );
      console.log('📧 Confirmation email sent to:', patient.email);
    } catch (emailError) {
      console.error('❌ Email error (appointment created anyway):', emailError);
    }

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

  
    

const updateAppointment = async (req, res) => {
  try {
    const { status, dateTime, reason, duration } = req.body;

    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (req.user.role === 'patient' && appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (req.user.role === 'doctor' && appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, dateTime, reason, duration },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (req.user.role === 'patient' && appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (req.user.role === 'doctor' && appointment.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({ success: true, message: 'Appointment cancelled', data: {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment
};