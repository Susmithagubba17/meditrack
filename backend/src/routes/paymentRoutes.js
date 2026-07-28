const express = require('express');
const router = express.Router();
const {
  processPayment,
  getPaymentStatus,
  getPaymentHistory
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// Process payment for an appointment
router.put('/appointments/:appointmentId/pay', processPayment);

// Get payment status for an appointment
router.get('/appointments/:appointmentId/status', getPaymentStatus);

// Get payment history for patient
router.get('/history', getPaymentHistory);

module.exports = router;