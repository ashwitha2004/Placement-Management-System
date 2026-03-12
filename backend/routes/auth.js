import express from 'express';
import {
	register,
	login,
	getCurrentUser,
	updateProfile,
	updateAvatar,
	logout,
	initiateRegister,
	verifyRegisterOtp,
	forgotPassword,
	resetPassword,
	checkAvailability
} from '../controllers/authControllerWithFallback.js';
import { verifyToken } from '../middleware/auth.js';
import upload from '../middleware/multerConfig.js';

const router = express.Router();

router.post('/register', register);
router.post('/register/initiate', initiateRegister);
router.post('/register/verify-otp', verifyRegisterOtp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/check-availability', checkAvailability);
router.get('/me', verifyToken, getCurrentUser);
router.put('/profile', verifyToken, updateProfile);
router.post('/update-avatar', verifyToken, upload.single('avatar'), updateAvatar);
router.post('/logout', verifyToken, logout);

export default router;
