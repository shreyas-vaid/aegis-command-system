import express from 'express';
import {
  getMissions,
  getMissionById,
  createMission,
  updateMission,
  deleteMission
} from '../controllers/missionController.js';
import { getMissionWeatherHandler } from '../controllers/weatherController.js';
import {
  getMissionReports,
  createMissionReport,
  getMissionReportById,
  updateMissionReport
} from '../controllers/reportController.js';
import { getMissionIntelligenceHandler } from '../controllers/intelligenceController.js';
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Missions / Operations Endpoints
 * All operations are strictly organization-aware.
 */

// GET /api/missions — List missions for authenticated user's organization
router.get('/', requireAuth, getMissions);

// ─── DATA FUSION INTELLIGENCE & WORLD STATE ──────────────────────────
// GET /api/missions/:id/intelligence — Fused world state, deterministic risk score, and WHY breakdown
router.get('/:id/intelligence', optionalAuth, getMissionIntelligenceHandler);

// GET /api/missions/:id/data/weather — Live meteorological intelligence strictly for operation coordinates
router.get('/:id/data/weather', optionalAuth, getMissionWeatherHandler);

// ─── FIELD REPORTS / HUMAN OBSERVATIONS ──────────────────────────────
// GET /api/missions/:id/reports — Retrieve operational field reports
router.get('/:id/reports', optionalAuth, getMissionReports);

// POST /api/missions/:id/reports — Submit a new field observation
router.post('/:id/reports', requireAuth, createMissionReport);

// GET /api/missions/:id/reports/:reportId — Retrieve single field report detail
router.get('/:id/reports/:reportId', optionalAuth, getMissionReportById);

// PATCH /api/missions/:id/reports/:reportId — Review / resolve / update field report
router.patch('/:id/reports/:reportId', requireAuth, updateMissionReport);

// GET /api/missions/:id — Get details of a single operation (optionalAuth allows demo mission 027)
router.get('/:id', optionalAuth, getMissionById);

// POST /api/missions — Create a new operation (ADMIN, COMMANDER)
router.post('/', requireAuth, requireRole('ADMIN', 'COMMANDER'), createMission);

// PATCH /api/missions/:id — Update operation parameters or status (ADMIN, COMMANDER)
router.patch('/:id', requireAuth, requireRole('ADMIN', 'COMMANDER'), updateMission);

// DELETE /api/missions/:id — Archive operation (ADMIN, COMMANDER)
router.delete('/:id', requireAuth, requireRole('ADMIN', 'COMMANDER'), deleteMission);

export default router;
