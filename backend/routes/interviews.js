import express from 'express';
import { verifyToken, authorizeRole } from '../middleware/auth.js';
import {
  scheduleInterview,
  getMyInterviews,
  updateInterviewResult,
  getJobInterviews,
  getAllInterviews,
  updateInterviewRoom
} from '../controllers/interviewController.js';

const router = express.Router();

router.post('/', verifyToken, authorizeRole('admin', 'recruiter'), scheduleInterview);
router.get('/', verifyToken, getAllInterviews);
router.get('/my-interviews', verifyToken, getMyInterviews);
router.get('/student/:studentId', verifyToken, getMyInterviews);
router.get('/job/:jobId', verifyToken, authorizeRole('admin', 'recruiter'), getJobInterviews);
router.put('/:id', verifyToken, authorizeRole('admin', 'recruiter'), updateInterviewResult);
// router.patch('/:id/meeting', ...) removed
router.patch('/:id/room', verifyToken, authorizeRole('admin', 'hr', 'staff', 'recruiter'), updateInterviewRoom);

export default router;
