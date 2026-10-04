import { Router } from 'express';
import {
  getMissions,
  getMission,
  createMission,
  updateMission,
  getState,
  resetMission
} from '../controllers/missionController.js';

const router = Router();

router.get('/',        getMissions);
router.get('/:id',     getMission);
router.post('/',       createMission);
router.patch('/:id',   updateMission);

export default router;

// Export legacy handlers for direct mounting
export { getState, resetMission };
