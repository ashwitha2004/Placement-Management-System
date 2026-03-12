import express from 'express';
import { verifyToken, authorizeRole } from '../middleware/auth.js';
import {
  analyzeResume,
  batchAnalyzeResumes,
  getAnalysis
} from '../controllers/resumeAnalysisController.js';

const router = express.Router();

// Analyze single resume
router.post('/analyze', verifyToken, analyzeResume);

// Batch analyze resumes for a job
router.post('/batch-analyze', verifyToken, batchAnalyzeResumes);

// Get analysis for a student
router.get('/:studentId', verifyToken, getAnalysis);

export default router;
