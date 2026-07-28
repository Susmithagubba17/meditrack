const RefillRequest = require('../models/RefillRequest');
const Prescription = require('../models/Prescription');

// @desc    Get all refill requests (filtered by role)
// @route   GET /api/refills
// @access  Private
const getRefillRequests = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      query.doctorId = req.user._id;
      query.status = 'pending';
    }

    const refills = await RefillRequest.find(query)
      .populate('prescriptionId', 'medications prescriptionNumber')
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: refills.length, data: refills });
  } catch (error) {
    console.error('❌ Get refill requests error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create refill request
// @route   POST /api/refills
// @access  Private (Patients only)
const createRefillRequest = async (req, res) => {
  try {
    const { prescriptionId, notes } = req.body;

    if (req.user.role !== 'patient') {
      return res.status(403).json({ 
        success: false, 
        message: 'Only patients can request refills' 
      });
    }

    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      return res.status(404).json({ 
        success: false, 
        message: 'Prescription not found' 
      });
    }

    if (prescription.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not your prescription' 
      });
    }

    if (prescription.refillsRemaining <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No refills remaining' 
      });
    }

    const existingRequest = await RefillRequest.findOne({
      prescriptionId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ 
        success: false, 
        message: 'Pending request already exists' 
      });
    }

    const refillRequest = await RefillRequest.create({
      prescriptionId,
      patientId: req.user._id,
      doctorId: prescription.doctorId,
      notes: notes || ''
    });

    res.status(201).json({ success: true, data: refillRequest });
  } catch (error) {
    console.error('❌ Create refill request error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Approve refill request
// @route   PUT /api/refills/:id/approve
// @access  Private (Doctors only)
const approveRefill = async (req, res) => {
  try {
    const refillRequest = await RefillRequest.findById(req.params.id)
      .populate('prescriptionId');

    if (!refillRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Refill request not found' 
      });
    }

    if (refillRequest.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    if (refillRequest.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Already processed' 
      });
    }

    const prescription = await Prescription.findById(refillRequest.prescriptionId._id);
    if (prescription.refillsRemaining <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No refills available' 
      });
    }

    prescription.refillsRemaining -= 1;
    await prescription.save();

    refillRequest.status = 'approved';
    refillRequest.reviewedDate = new Date();
    refillRequest.reviewedBy = req.user._id;
    await refillRequest.save();

    res.status(200).json({ 
      success: true, 
      message: 'Refill approved', 
      data: { 
        refillRequest, 
        refillsRemaining: prescription.refillsRemaining 
      }
    });
  } catch (error) {
    console.error('❌ Approve refill error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Deny refill request
// @route   PUT /api/refills/:id/deny
// @access  Private (Doctors only)
const denyRefill = async (req, res) => {
  try {
    const { notes } = req.body;
    const refillRequest = await RefillRequest.findById(req.params.id);

    if (!refillRequest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Refill request not found' 
      });
    }

    if (refillRequest.doctorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    if (refillRequest.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Already processed' 
      });
    }

    refillRequest.status = 'denied';
    refillRequest.notes = notes || 'Refill denied by doctor';
    refillRequest.reviewedDate = new Date();
    refillRequest.reviewedBy = req.user._id;
    await refillRequest.save();

    res.status(200).json({ 
      success: true, 
      message: 'Refill denied', 
      data: refillRequest 
    });
  } catch (error) {
    console.error('❌ Deny refill error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get refill history for a patient
// @route   GET /api/refills/history
// @access  Private
const getRefillHistory = async (req, res) => {
  try {
    const refills = await RefillRequest.find({ patientId: req.user._id })
      .populate('prescriptionId', 'medications prescriptionNumber')
      .populate('doctorId', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ 
      success: true, 
      data: refills 
    });
  } catch (error) {
    console.error('❌ Get refill history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server Error' 
    });
  }
};

// ✅ EXPORT ALL FUNCTIONS - ONLY ONCE!
module.exports = {
  getRefillRequests,
  createRefillRequest,
  approveRefill,
  denyRefill,
  getRefillHistory
};