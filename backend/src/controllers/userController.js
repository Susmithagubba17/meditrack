const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all doctors
// @route   GET /api/users/doctors
// @access  Private
const getDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ 
      role: 'doctor',
      isActive: true 
    }).select('name email phone specialty');
    
    res.status(200).json({ 
      success: true, 
      count: doctors.length, 
      data: doctors 
    });
  } catch (error) {
    console.error('❌ Get doctors error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all patients
// @route   GET /api/users/patients
// @access  Private
const getPatients = async (req, res) => {
  try {
    const patients = await User.find({ 
      role: 'patient',
      isActive: true 
    }).select('name email phone dob allergies');
    
    res.status(200).json({ 
      success: true, 
      count: patients.length, 
      data: patients 
    });
  } catch (error) {
    console.error('❌ Get patients error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ✅ NEW: Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ✅ NEW: Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, specialty, dob, allergies } = req.body;
    
    const updateData = { name, phone };
    
    // Only update role-specific fields
    if (req.user.role === 'doctor') {
      updateData.specialty = specialty;
    }
    if (req.user.role === 'patient') {
      updateData.dob = dob;
      updateData.allergies = allergies || [];
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json({ 
      success: true, 
      message: 'Profile updated successfully', 
      data: user 
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ✅ NEW: Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user._id).select('+password');
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Password changed successfully' 
    });
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { 
  getDoctors, 
  getPatients, 
  getProfile, 
  updateProfile, 
  changePassword 
};