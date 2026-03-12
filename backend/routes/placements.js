import express from 'express';
import { verifyToken, authorizeRole } from '../middleware/auth.js';
import {
  createPlacementResult,
  getPlacements,
  updatePlacementResult,
  deletePlacementResult
} from '../controllers/placementController.js';

const router = express.Router();

router.get('/', verifyToken, getPlacements);
router.post('/', verifyToken, authorizeRole('admin', 'hr', 'staff', 'recruiter'), createPlacementResult);
router.put('/:id', verifyToken, authorizeRole('admin', 'hr', 'staff', 'recruiter'), updatePlacementResult);
router.delete('/:id', verifyToken, authorizeRole('admin', 'hr', 'staff', 'recruiter'), deletePlacementResult);

export default router;
