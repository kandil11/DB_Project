const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    if (req.userType !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    const { role } = req.query;
    let query = {};
    
    if (role) {
      query.userType = parseInt(role);
    }
    
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.userType !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    // Prevent deleting yourself
    if (req.params.id === req.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }
    
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user approval status (admin only)
router.put('/:id/approve', authMiddleware, async (req, res) => {
  try {
    if (req.userType !== 1) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User approved successfully',
      data: user
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
