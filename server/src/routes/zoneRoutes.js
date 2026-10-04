import { Router } from 'express';
import {
  getZones,
  getZonesByMission,
  getZone,
  getZoneExplanation
} from '../controllers/zoneController.js';

const router = Router();

router.get('/',              getZones);
router.get('/:id',           getZone);
router.get('/:id/explain',   getZoneExplanation);

export default router;

// Export mission-scoped handler
export { getZonesByMission };
