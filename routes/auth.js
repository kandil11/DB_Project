const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const JWT_SECRET = 'pharmacy_secret_key_2024';

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { fullName, name, email, phone, password, address, usertype, userType } = req.body;
    
    // Use fullName or name
    const userName = fullName || name;
    // Use usertype or userType (convert to number)
    const type = parseInt(usertype || userType || 3);
    
    // Validation
    if (!userName || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, and password are required'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this phone number already exists'
      });
    }
    
    // Create new user
    const user = new User({
      name: userName,
      email: email || undefined,
      phone,
      password,
      address: address || undefined,
      userType: type
    });
    
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          userType: user.userType,
          userTypeName: user.getUserTypeName(),
          isApproved: user.isApproved
        }
      }
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A user with this phone number already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    
    // Allow login with either email or phone
    const loginField = email || phone;
    
    if (!loginField || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/Phone and password are required'
      });
    }
    
    // Find user by email or phone
    const user = await User.findOne({
      $or: [
        { email: loginField },
        { phone: loginField }
      ]
    });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if user is approved (for non-customers)
    if (!user.isApproved && user.userType !== 3) {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval'
      });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          userType: user.userType,
          userTypeName: user.getUserTypeName(),
          isApproved: user.isApproved
        }
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Get current user (protected route)
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          userType: user.userType,
          userTypeName: user.getUserTypeName(),
          isApproved: user.isApproved
        }
      }
    });
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
