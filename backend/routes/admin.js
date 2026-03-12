import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getSystemStatus,
  getAnalytics,
  getAuditLogs,
  getAlerts,
  updateConfig,
  getControlCenter,
  updateRolePermissions,
  upsertTemplate,
  deleteTemplate,
  updateFeatureToggles,
  resolveApproval,
  createApproval,
  triggerBackup,
  sendBroadcastNotification
} from '../controllers/adminController.js';

const router = express.Router();

// Admin middleware to ensure only admins can access these routes
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

// User management routes
router.get('/users', verifyToken, adminOnly, getAllUsers);
router.post('/users', verifyToken, adminOnly, createUser);
router.put('/users/:id', verifyToken, adminOnly, updateUser);
router.delete('/users/:id', verifyToken, adminOnly, deleteUser);

// System monitoring routes
router.get('/system-status', verifyToken, adminOnly, getSystemStatus);
router.get('/analytics', verifyToken, adminOnly, getAnalytics);
router.get('/audit-logs', verifyToken, adminOnly, getAuditLogs);
router.get('/alerts', verifyToken, adminOnly, getAlerts);

// Configuration routes
router.put('/config', verifyToken, adminOnly, updateConfig);

// Admin Control Center routes
router.get('/control-center', verifyToken, adminOnly, getControlCenter);
router.put('/role-permissions', verifyToken, adminOnly, updateRolePermissions);
router.post('/approvals', verifyToken, adminOnly, createApproval);
router.patch('/approvals/:id', verifyToken, adminOnly, resolveApproval);
router.put('/feature-toggles', verifyToken, adminOnly, updateFeatureToggles);
router.post('/templates', verifyToken, adminOnly, upsertTemplate);
router.delete('/templates/:key', verifyToken, adminOnly, deleteTemplate);
router.post('/backup/trigger', verifyToken, adminOnly, triggerBackup);
router.post('/notifications/broadcast', verifyToken, adminOnly, sendBroadcastNotification);

export default router;
