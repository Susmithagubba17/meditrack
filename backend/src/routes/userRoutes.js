const express = require('express');
const router = express.Router();
const { 
  getDoctors, 
  getPatients, 
  getProfile, 
  updateProfile, 
  changePassword 
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/doctors', protect, getDoctors);
router.get('/patients', protect, getPatients);
router.get('/profile', protect, getProfile);           // ✅ NEW
router.put('/profile', protect, updateProfile);        // ✅ NEW
router.put('/change-password', protect, changePassword); // ✅ NEW

module.exports = router;