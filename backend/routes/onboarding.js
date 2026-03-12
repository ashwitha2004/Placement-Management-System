import express from 'express';
import { verifyToken, authorizeRole } from '../middleware/auth.js';
import {
  createOnboarding,
  getOnboarding,
  updateOnboarding,
  deleteOnboarding
} from '../controllers/onboardingController.js';

const router = express.Router();

router.get('/', verifyToken, authorizeRole('admin', 'hr', 'staff', 'recruiter'), getOnboarding);
router.post('/', verifyToken, authorizeRole('admin', 'hr', 'staff', 'recruiter'), createOnboarding);
router.put('/:id', verifyToken, authorizeRole('admin', 'hr', 'staff', 'recruiter'), updateOnboarding);
router.delete('/:id', verifyToken, authorizeRole('admin', 'hr', 'staff', 'recruiter'), deleteOnboarding);

export default router;
