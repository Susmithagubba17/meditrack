const express = require('express');
const router = express.Router();
const {
  getMedicalHistory,
  updateMedicalHistory,
  addVisitNote,
  getVisitNotes
} = require('../controllers/patientController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// All routes require authentication and doctor role
router.use(protect);
router.use(authorize('doctor'));

// Medical History
router.get('/:id/medical-history', getMedicalHistory);
router.put('/:id/medical-history', updateMedicalHistory);

// Visit Notes
router.get('/:id/visit-notes', getVisitNotes);
router.post('/:id/visit-notes', addVisitNote);

module.exports = router;