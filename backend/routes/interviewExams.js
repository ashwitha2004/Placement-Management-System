import express from 'express';
import { verifyToken, authorizeRole } from '../middleware/auth.js';
import * as interviewExamController from '../controllers/interviewExamController.js';

const router = express.Router();

// CRUD for Interview Exams
router.post('/', verifyToken, authorizeRole('admin', 'hr', 'staff'), interviewExamController.createExam);
router.get('/', verifyToken, interviewExamController.getAllExams);
router.get('/:id', verifyToken, interviewExamController.getExamById);
router.put('/:id', verifyToken, authorizeRole('admin', 'hr', 'staff'), interviewExamController.updateExam);
router.delete('/:id', verifyToken, authorizeRole('admin', 'hr', 'staff'), interviewExamController.deleteExam);

// Assign exam to candidate
router.post('/:id/assign', verifyToken, authorizeRole('admin', 'hr', 'staff'), interviewExamController.assignExamToCandidate);

// Student submits exam
router.post('/:id/submit', verifyToken, authorizeRole('student'), interviewExamController.submitExam);

export default router;
