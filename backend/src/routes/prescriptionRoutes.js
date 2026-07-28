const express = require('express');
const router = express.Router();
const {
  getPrescriptions,
  getPrescription,
  createPrescription,
  deactivatePrescription
} = require('../controllers/prescriptionController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

router.use(protect);

router.get('/', getPrescriptions);
router.get('/:id', getPrescription);
router.post('/', authorize('doctor'), createPrescription);
router.put('/:id/deactivate', authorize('doctor'), deactivatePrescription);


// Add this after the other routes
router.get('/:id/pdf', protect, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patientId')
      .populate('doctorId');
    
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }
    
    const { generatePrescriptionPDF } = require('../services/pdfService');
    const pdfPath = await generatePrescriptionPDF(
      prescription,
      prescription.patientId,
      prescription.doctorId
    );
    
    res.download(pdfPath);
  } catch (error) {
    console.error('❌ PDF download error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});
module.exports = router;