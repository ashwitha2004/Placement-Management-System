import express from 'express';
import { verifyToken, authorizeRole } from '../middleware/auth.js';
import {
  saveDetailedApplicationForm,
  getMyDetailedApplicationForm,
  getDetailedApplicationFormByStudent,
  getAllDetailedApplicationForms
} from '../controllers/detailedApplicationController.js';

const router = express.Router();

// Student routes
router.post('/', verifyToken, saveDetailedApplicationForm);
router.get('/my-form', verifyToken, getMyDetailedApplicationForm);

// Staff/HR/Admin routes
router.get('/all', verifyToken, authorizeRole('admin', 'hr', 'recruiter', 'staff'), getAllDetailedApplicationForms);
router.get('/:studentId', verifyToken, authorizeRole('admin', 'hr', 'recruiter', 'staff'), getDetailedApplicationFormByStudent);

export default router;
