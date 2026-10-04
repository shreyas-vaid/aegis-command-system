import { Router } from 'express';
import {
  runSimulation,
  getSimulation,
  getSimulationsByMission
} from '../controllers/simulationController.js';

const router = Router();

router.post('/',       runSimulation);
router.get('/:id',     getSimulation);

export default router;

export { getSimulationsByMission };
