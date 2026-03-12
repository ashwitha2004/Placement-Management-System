import express from 'express';
import { verifyToken, authorizeRole } from '../middleware/auth.js';
import upload from '../middleware/multerConfig.js';
import {
  createStudentProfile,
  getStudentProfile,
  updateStudentProfile,
  getAllStudents,
  uploadStudentsCSV,
  getStudentsFromCSV
} from '../controllers/studentController.js';

const router = express.Router();

router.post('/profile', verifyToken, createStudentProfile);
router.get('/profile', verifyToken, getStudentProfile);
router.put('/profile', verifyToken, upload.single('resume'), updateStudentProfile);
router.get('/', verifyToken, authorizeRole('admin', 'recruiter', 'hr', 'staff'), getAllStudents);
router.get('/csv', verifyToken, authorizeRole('admin', 'recruiter', 'hr', 'staff'), getStudentsFromCSV);
router.get('/:id', verifyToken, getStudentProfile);
router.put('/:id', verifyToken, upload.single('resume'), updateStudentProfile);
router.post('/upload-csv', verifyToken, authorizeRole('admin'), upload.single('file'), uploadStudentsCSV);

export default router;
