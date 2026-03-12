import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import { sendEmail } from '../utils/emailService.js';

// Helper function to create or find user
const getOrCreateUser = async (email, name, provider, providerId) => {
  try {
    // Try to find existing user
    let user = await User.findOne({ email });
    
    if (user) {
      // Update provider info if not already set
      if (!user.oauthProviders) {
        user.oauthProviders = {};
      }
      user.oauthProviders[provider] = providerId;
      await user.save();
      return user;
    }

    // Create new user
    user = await User.create({
      name,
      email,
      password: `oauth_${provider}_${providerId}`,
      role: 'student',
      oauthProviders: {
        [provider]: providerId
      }
    });

    // Create student profile
    await Student.create({
      user: user._id,
      rollNumber: `AUTO-${user._id.toString().slice(-6)}`,
      branch: 'CSE',
      cgpa: 0,
      phoneNumber: '',
      skills: [],
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    });

    return user;
  } catch (error) {
    throw error;
  }
};

// Helper to generate OTP
function generateOTP(length = 6) {
  return Math.floor(100000 + Math.random() * 900000).toString().substring(0, length);
}

// Google OAuth Handler with OTP
export const googleOAuth = async (req, res) => {
  try {
    const { email, name, googleId } = req.body;

    if (!email || !name || !googleId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, name, googleId'
      });
    }

    const user = await getOrCreateUser(email, name, 'google', googleId);

    // Generate OTP and set expiry (5 min)
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    user.otpVerified = false;
    await user.save();

    // Send OTP via email
    await sendEmail({
      to: user.email,
      subject: 'Your OTP for Login',
      html: `<p>Your OTP for login is: <b>${otp}</b>. It is valid for 5 minutes.</p>`
    });

    res.status(200).json({
      success: true,
      message: 'OTP sent to email. Please verify to complete login.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      otpRequired: true
    });
  } catch (error) {
    console.error('Google OAuth Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Google OAuth failed'
    });
  }
};

// LinkedIn OAuth Handler with OTP
export const linkedinOAuth = async (req, res) => {
  try {
    const { email, name, linkedinId, profilePhoto } = req.body;

    if (!email || !name || !linkedinId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, name, linkedinId'
      });
    }

    const user = await getOrCreateUser(email, name, 'linkedin', linkedinId);

    // Update avatar if provided
    if (profilePhoto) {
      user.avatar = profilePhoto;
    }

    // Generate OTP and set expiry (5 min)
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    user.otpVerified = false;
    await user.save();

    // Send OTP via email
    await sendEmail({
      to: user.email,
      subject: 'Your OTP for Login',
      html: `<p>Your OTP for login is: <b>${otp}</b>. It is valid for 5 minutes.</p>`
    });

    res.status(200).json({
      success: true,
      message: 'OTP sent to email. Please verify to complete login.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      otpRequired: true
    });
  } catch (error) {
    console.error('LinkedIn OAuth Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'LinkedIn OAuth failed'
    });
  }
};

// GitHub OAuth Handler with OTP
export const githubOAuth = async (req, res) => {
  try {
    const { email, name, githubId, profilePhoto, username } = req.body;

    if (!email && !githubId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email or githubId, name, githubId'
      });
    }

    // Use username as fallback for email if not provided
    const userEmail = email || `${username}@github.com`;
    const displayName = name || username || 'GitHub User';

    const user = await getOrCreateUser(userEmail, displayName, 'github', githubId);

    // Update avatar if provided
    if (profilePhoto) {
      user.avatar = profilePhoto;
    }

    // Generate OTP and set expiry (5 min)
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;
    user.otpVerified = false;
    await user.save();

    // Send OTP via email
    await sendEmail({
      to: user.email,
      subject: 'Your OTP for Login',
      html: `<p>Your OTP for login is: <b>${otp}</b>. It is valid for 5 minutes.</p>`
    });

    res.status(200).json({
      success: true,
      message: 'OTP sent to email. Please verify to complete login.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      otpRequired: true
    });
  } catch (error) {
    console.error('GitHub OAuth Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'GitHub OAuth failed'
    });
  }
};
