import express from 'express';
import { verifyToken, authorizeRole } from '../middleware/auth.js';
import {
  createExam,
  getExams,
  getExamById,
  submitExam,
  getMySubmissions,
  getSubmissions,
  reviewSubmission
} from '../controllers/examController.js';

const router = express.Router();

router.get('/', verifyToken, getExams);
router.get('/:id', verifyToken, getExamById);
router.post('/', verifyToken, authorizeRole('hr', 'admin', 'staff'), createExam);
router.post('/:id/submit', verifyToken, authorizeRole('student'), submitExam);
router.get('/submissions/my', verifyToken, authorizeRole('student'), getMySubmissions);
router.get('/submissions/all', verifyToken, authorizeRole('hr', 'staff', 'admin'), getSubmissions);
router.patch('/submissions/:id/review', verifyToken, authorizeRole('hr'), reviewSubmission);

export default router;
