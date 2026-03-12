import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Get notifications
router.get('/', notificationController.getNotifications);

// Backward-compatible endpoint used by older frontend code
router.get('/my-notifications', notificationController.getNotifications);

// Send notification(s) to users (STAFF/ADMIN ONLY)
router.post('/', notificationController.sendBulkNotification);

// Send direct notification (HR, staff, student)
router.post('/direct', notificationController.sendDirectNotification);

// Mark notification as read
router.put('/:notificationId/read', notificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', notificationController.markAllAsRead);

// Backward-compatible endpoint used by older frontend code
router.put('/all/read', notificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', notificationController.deleteNotification);

export default router;
