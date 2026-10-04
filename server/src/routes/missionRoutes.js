import express from 'express';
import {
  getMissions,
  getMissionById,
  createMission,
  updateMission,
  deleteMission
} from '../controllers/missionController.js';
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Missions / Operations Endpoints
 * All operations are strictly organization-aware.
 */

// GET /api/missions — List missions for authenticated user's organization
router.get('/', requireAuth, getMissions);

// GET /api/missions/:id — Get details of a single operation (optionalAuth allows demo mission 027)
router.get('/:id', optionalAuth, getMissionById);

// POST /api/missions — Create a new operation (ADMIN, COMMANDER)
router.post('/', requireAuth, requireRole('ADMIN', 'COMMANDER'), createMission);

// PATCH /api/missions/:id — Update operation parameters or status (ADMIN, COMMANDER)
router.patch('/:id', requireAuth, requireRole('ADMIN', 'COMMANDER'), updateMission);

// DELETE /api/missions/:id — Archive operation (ADMIN, COMMANDER)
router.delete('/:id', requireAuth, requireRole('ADMIN', 'COMMANDER'), deleteMission);

export default router;
