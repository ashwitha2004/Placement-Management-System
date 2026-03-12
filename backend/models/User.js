import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'hr', 'staff', 'student', 'recruiter'],
    default: 'student'
  },
  avatar: String,
  phone: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true,
    default: ''
  },
  studentRollNumber: {
    type: String,
    trim: true,
    default: ''
  },
  employeeId: {
    type: String,
    trim: true,
    default: ''
  },
  // OTP fields for verification
  otp: {
    type: String,
    select: false
  },
  otpPurpose: {
    type: String,
    enum: ['oauth-login', 'register', 'reset-password', null],
    default: null,
    select: false
  },
  otpExpiry: Date,
  otpVerified: {
    type: Boolean,
    default: false
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  termsAcceptedAt: {
    type: Date,
    default: null
  },
  oauthProviders: {
    type: Object,
    default: {}
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from response
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
