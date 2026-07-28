const Prescription = require('../models/Prescription');
const User = require('../models/User');
const { sendPrescriptionEmail } = require('../services/emailService');
const { generatePrescriptionPDF } = require('../services/pdfService');
const getPrescriptions = async (req, res) => {
  try {
    let query = { isActive: true };

    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctorId = req.user._id;
    }

    const prescriptions = await Prescription.find(query)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email specialty')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: prescriptions.length, data: prescriptions });
  } catch (error) {
    console.error('❌ Get prescriptions error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getPrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email specialty');

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    if (req.user.role === 'patient' && prescription.patientId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (req.user.role === 'doctor' && prescription.doctorId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: prescription });
  } catch (error) {
    console.error('❌ Get prescription error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const createPrescription = async (req, res) => {
  try {
    console.log('📨 Creating prescription with data:', req.body);

    const { patientId, appointmentId, medications, notes, refillsRemaining } = req.body;

    if (req.user.role !== 'doctor') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only doctors can create prescriptions' 
      });
    }

    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    if (patient.role !== 'patient') {
      return res.status(400).json({ success: false, message: 'Selected user is not a patient' });
    }

    if (!medications || medications.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one medication is required' });
    }

    for (let med of medications) {
      if (!med.name || !med.dosage || !med.frequency || !med.duration) {
        return res.status(400).json({ 
          success: false, 
          message: 'Each medication must have name, dosage, frequency, and duration' 
        });
      }
    }

    const prescription = await Prescription.create({
      patientId,
      doctorId: req.user._id,
      appointmentId: appointmentId || null,
      medications,
      notes: notes || '',
      refillsRemaining: refillsRemaining || 0
    });

    // ✅ Populate patient and doctor for email
    const populatedPrescription = await Prescription.findById(prescription._id)
      .populate('patientId')
      .populate('doctorId');

    // ✅ Send prescription email
    try {
      await sendPrescriptionEmail(
        patient.email,
        patient.name,
        medications,
        prescription.prescriptionNumber
      );
      console.log('📧 Prescription email sent to:', patient.email);
    } catch (emailError) {
      console.error('❌ Email error (prescription created anyway):', emailError);
    }

    // ✅ Generate PDF (optional - you can download later)
    try {
      const pdfPath = await generatePrescriptionPDF(
        prescription,
        patient,
        req.user
      );
      console.log('📄 PDF generated at:', pdfPath);
    } catch (pdfError) {
      console.error('❌ PDF generation error:', pdfError);
    }

    console.log('✅ Prescription created:', prescription._id);

    res.status(201).json({ 
      success: true, 
      data: prescription,
      message: 'Prescription created successfully!' 
    });
  } catch (error) {
    console.error('❌ Create prescription error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server Error'
    });
  }
};

    
      

const deactivatePrescription = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    if (prescription.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    prescription.isActive = false;
    await prescription.save();

    res.status(200).json({ success: true, message: 'Prescription deactivated' });
  } catch (error) {
    console.error('❌ Deactivate prescription error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getPrescriptions,
  getPrescription,
  createPrescription,
  deactivatePrescription
};