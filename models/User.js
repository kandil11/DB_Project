const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  address: {
    type: String,
    trim: true
  },
  userType: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4, 5], // 1: Admin, 2: Pharmacist, 3: Customer, 4: Supplier, 5: Deliverer
    default: 3
  },
  isApproved: {
    type: Boolean,
    default: function() {
      // Admins and Customers are auto-approved, others need admin approval
      return this.userType === 1 || this.userType === 3;
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving (using 8 rounds for faster hashing)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, 8);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get user type name
userSchema.methods.getUserTypeName = function() {
  const types = {
    1: 'Admin',
    2: 'Pharmacist',
    3: 'Customer',
    4: 'Supplier',
    5: 'Deliverer'
  };
  return types[this.userType] || 'Unknown';
};

// Create index for userType (email and phone already have indexes from schema)
userSchema.index({ userType: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
