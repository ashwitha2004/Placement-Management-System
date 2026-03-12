import express from 'express';
import { verifyToken, authorizeRole } from '../middleware/auth.js';
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob
} from '../controllers/jobController.js';

const router = express.Router();

// Public routes
router.get('/', getAllJobs);
router.get('/:id', getJobById);

// Protected routes - require authentication and specific roles
router.post('/', verifyToken, authorizeRole('admin', 'recruiter', 'hr'), createJob);
router.put('/:id', verifyToken, authorizeRole('admin', 'recruiter', 'hr'), updateJob);
router.delete('/:id', verifyToken, authorizeRole('admin', 'recruiter', 'hr'), deleteJob);

export default router;
