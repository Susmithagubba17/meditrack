const Appointment = require('../models/Appointment');
const User = require('../models/User');

// Process payment (simulated)
const processPayment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { paymentMethod, amount } = req.body;

    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name');

    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }

    // Check if patient owns this appointment
    if (appointment.patientId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    // Update payment details
    appointment.paymentStatus = 'paid';
    appointment.paymentMethod = paymentMethod || 'card';
    appointment.amount = amount || 50;
    appointment.paymentDate = new Date();
    appointment.paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        appointmentId: appointment._id,
        paymentStatus: appointment.paymentStatus,
        paymentMethod: appointment.paymentMethod,
        paymentId: appointment.paymentId,
        amount: appointment.amount,
        paymentDate: appointment.paymentDate
      }
    });
  } catch (error) {
    console.error('❌ Payment processing error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Payment processing failed' 
    });
  }
};

// Get payment status
const getPaymentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }

    // Check authorization
    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        paymentStatus: appointment.paymentStatus,
        paymentMethod: appointment.paymentMethod,
        amount: appointment.amount,
        paymentDate: appointment.paymentDate,
        paymentId: appointment.paymentId
      }
    });
  } catch (error) {
    console.error('❌ Get payment status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error' 
    });
  }
};

// Get payment history for patient
const getPaymentHistory = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patientId: req.user._id,
      paymentStatus: 'paid'
    })
    .populate('doctorId', 'name specialty')
    .sort({ paymentDate: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('❌ Get payment history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error' 
    });
  }
};

module.exports = {
  processPayment,
  getPaymentStatus,
  getPaymentHistory
};