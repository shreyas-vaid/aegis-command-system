import express from 'express';
import { searchLocationsHandler } from '../controllers/locationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Location Intelligence Endpoints
 */

// GET /api/locations/search?q=<query> — Search locations (authenticated)
router.get('/search', requireAuth, searchLocationsHandler);

export default router;
