const express = require('express');
const router = express.Router();
const {
  exportAppointmentsCSV,
  exportPrescriptionsCSV,
  exportPatientsCSV,
  exportPrescriptionPDF
} = require('../controllers/exportController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// All routes require authentication
router.use(protect);

// CSV Exports
router.get('/appointments', exportAppointmentsCSV);
router.get('/prescriptions', exportPrescriptionsCSV);
router.get('/patients', authorize('receptionist'), exportPatientsCSV);

// PDF Export
router.get('/prescription/:id/pdf', exportPrescriptionPDF);

module.exports = router;