import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// POST /api/oauth/verify-otp
export const verifyOAuthOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required.'
      });
    }

    const user = await User.findOne({ email }).select('+otp +otpExpiry +otpVerified');
    if (!user || !user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found. Please initiate login again.'
      });
    }

    if (user.otpVerified) {
      return res.status(400).json({
        success: false,
        message: 'OTP already verified.'
      });
    }

    if (user.otp !== otp) {
      return res.status(401).json({
        success: false,
        message: 'Invalid OTP.'
      });
    }

    if (Date.now() > user.otpExpiry) {
      return res.status(401).json({
        success: false,
        message: 'OTP expired. Please request a new one.'
      });
    }

    user.otpVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    // Issue JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'OTP verified. Login successful.',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'OTP verification failed.'
    });
  }
};
