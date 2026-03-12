import express from 'express';
import { verifyOAuthOtp } from '../controllers/otpController.js';

const router = express.Router();

// POST /api/oauth/verify-otp
router.post('/verify-otp', verifyOAuthOtp);

export default router;
