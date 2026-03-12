import express from 'express';
import * as emailController from '../controllers/emailController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Send email
router.post('/send', emailController.sendEmail);

// Send email to individual student
router.post('/send-to-student', emailController.sendEmailToStudent);

// Send bulk email to multiple students
router.post('/send-bulk', emailController.sendBulkEmail);

// Get all students for email selection
router.get('/students/all', emailController.getAllStudents);

// Get inbox
router.get('/inbox', emailController.getInbox);

// Get sent emails
router.get('/sent', emailController.getSentEmails);

// Mark email as read
router.put('/:emailId/read', emailController.markAsRead);

export default router;
