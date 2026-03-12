import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getStudentStats,
  getStudentInsights,
  getAdminStats,
  getHRStats,
  getHRSettings,
  getStaffStats,
  getSkills,
  getCertifications,
  getApplications,
  getInterviews,
  getProfile,
  updateProfile,
  getClasses,
  getCompanies,
  getAnalytics
  ,
  updateHRSettings
} from '../controllers/statsController.js';

const router = express.Router();

// Protected routes - require authentication
router.get('/student/stats', verifyToken, getStudentStats);
router.get('/student/insights', verifyToken, getStudentInsights);
router.get('/admin/stats', verifyToken, getAdminStats);
router.get('/hr/stats', verifyToken, getHRStats);
router.get('/hr/settings', verifyToken, getHRSettings);
router.put('/hr/settings', verifyToken, updateHRSettings);
router.get('/staff/stats', verifyToken, getStaffStats);
router.get('/skills', verifyToken, getSkills);
router.get('/certifications', verifyToken, getCertifications);
router.get('/applications', verifyToken, getApplications);
router.get('/interviews', verifyToken, getInterviews);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.get('/classes', verifyToken, getClasses);
router.get('/companies', verifyToken, getCompanies);
router.get('/analytics', verifyToken, getAnalytics);

// Public routes
router.get('/health', (req, res) => {
  res.json({ status: 'Stats API is running' });
});

export default router;
