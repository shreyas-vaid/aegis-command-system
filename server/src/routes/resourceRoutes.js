import { Router } from 'express';
import {
  getResources,
  assignResource,
  deployAction
} from '../controllers/resourceController.js';

const router = Router();

router.get('/',            getResources);
router.post('/:id/assign', assignResource);

export default router;

export { getResources as getResourcesByMission, deployAction };
