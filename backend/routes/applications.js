import express from 'express';
import { verifyToken, authorizeRole } from '../middleware/auth.js';
import {
  applyForJob,
  getMyApplications,
  getJobApplications,
  getAllApplications,
  updateApplicationStatus,
  updateMyApplication,
  withdrawMyApplication
} from '../controllers/applicationController.js';

const router = express.Router();

router.post('/', verifyToken, applyForJob);
router.get('/', verifyToken, authorizeRole('admin', 'hr', 'recruiter', 'staff'), getAllApplications);
router.get('/my-applications', verifyToken, getMyApplications);
router.put('/my-applications/:id', verifyToken, updateMyApplication);
router.patch('/my-applications/:id/withdraw', verifyToken, withdrawMyApplication);
router.get('/job/:jobId', verifyToken, authorizeRole('admin', 'recruiter', 'hr', 'staff'), getJobApplications);
router.put('/:id', verifyToken, authorizeRole('admin', 'recruiter', 'hr', 'staff'), updateApplicationStatus);

export default router;
