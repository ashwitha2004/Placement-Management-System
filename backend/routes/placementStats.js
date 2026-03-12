import express from 'express';
import {
  getAllPlacementStats,
  getCompanyStats,
  getTopCompaniesStats,
  getBranchStats,
  loadKaggleData
} from '../controllers/placementStatsController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes (need better structure for production)
router.get('/all', getAllPlacementStats);
router.get('/company/:company', getCompanyStats);
router.get('/top-companies', getTopCompaniesStats);
router.get('/branch-stats', getBranchStats);

// Protected routes
router.post('/load-kaggle', verifyToken, loadKaggleData);

export default router;
