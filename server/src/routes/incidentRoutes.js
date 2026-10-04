import { Router } from 'express';
import {
  getIncidents,
  getIncidentsByMission,
  createIncident,
  updateIncident
} from '../controllers/incidentController.js';

const router = Router();

router.get('/',        getIncidents);
router.post('/',       createIncident);
router.patch('/:id',   updateIncident);

export default router;

export { getIncidentsByMission };
