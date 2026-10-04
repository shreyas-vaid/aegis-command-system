import express from 'express';
import {
  createOrganization,
  getOrganizationById,
  updateOrganization,
  getOrganizationUsers
} from '../controllers/organizationController.js';
import { requireAuth, requireRole, requireOrganizationAccess } from '../middleware/auth.js';

const router = express.Router();

/**
 * Organization Endpoints
 */

// POST /api/organizations — Create new organization (ADMIN only)
router.post('/', requireAuth, requireRole('ADMIN'), createOrganization);

// GET /api/organizations/:id — View organization (must belong to this organization)
router.get('/:id', requireAuth, requireOrganizationAccess('id'), getOrganizationById);

// PATCH /api/organizations/:id — Update organization (ADMIN of this organization)
router.patch('/:id', requireAuth, requireRole('ADMIN'), requireOrganizationAccess('id'), updateOrganization);

// GET /api/organizations/:id/users — List organization users (ADMIN of this organization)
router.get('/:id/users', requireAuth, requireRole('ADMIN'), requireOrganizationAccess('id'), getOrganizationUsers);

export default router;
