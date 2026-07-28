const express = require('express');
const router = express.Router();
const {
  getRefillRequests,
  createRefillRequest,
  approveRefill,
  denyRefill,
  getRefillHistory  // ✅ Import this
} = require('../controllers/refillController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// All routes require authentication
router.use(protect);

// Get all refill requests
router.get('/', getRefillRequests);

// ✅ Get refill history for patient
router.get('/history', getRefillHistory);

// Create refill request (patients only)
router.post('/', authorize('patient'), createRefillRequest);

// Approve refill (doctors only)
router.put('/:id/approve', authorize('doctor'), approveRefill);

// Deny refill (doctors only)
router.put('/:id/deny', authorize('doctor'), denyRefill);

module.exports = router;