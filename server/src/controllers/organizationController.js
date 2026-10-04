import mongoose from 'mongoose';
import Organization from '../models/Organization.js';
import User from '../models/User.js';
import { DEFAULT_DEMO_ORG, getOrCreateDefaultOrg } from '../services/organizationService.js';

// In-memory fallback map for offline / test resilience
const inMemoryOrgs = new Map([
  [DEFAULT_DEMO_ORG._id, { ...DEFAULT_DEMO_ORG, createdAt: new Date().toISOString() }]
]);

const VALID_ORG_TYPES = [
  'GOVERNMENT',
  'EMERGENCY_RESPONSE',
  'NGO',
  'INDUSTRIAL',
  'HEALTHCARE',
  'TRAINING',
  'OTHER'
];

/**
 * POST /api/organizations
 * Create a new organization (ADMIN only)
 */
export async function createOrganization(req, res) {
  try {
    const { name, type = 'EMERGENCY_RESPONSE', location = '', description = '' } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Organization name is required' });
    }

    const normalizedType = type ? type.toUpperCase() : 'EMERGENCY_RESPONSE';
    if (!VALID_ORG_TYPES.includes(normalizedType)) {
      return res.status(400).json({
        error: `Invalid organization type. Allowed: ${VALID_ORG_TYPES.join(', ')}`
      });
    }

    if (mongoose.connection.readyState === 1) {
      const existing = await Organization.findOne({ name: name.trim() });
      if (existing) {
        return res.status(409).json({ error: 'Organization with this name already exists' });
      }

      const org = await Organization.create({
        name: name.trim(),
        type: normalizedType,
        location: location.trim(),
        description: description.trim(),
        createdBy: req.user.id
      });

      // If creator does not have an org yet, bind creator as admin of this organization
      if (!req.user.organizationId) {
        await User.findByIdAndUpdate(req.user.id, { organizationId: org._id });
        req.user.organizationId = org._id.toString();
      }

      return res.status(201).json({
        message: 'Organization created successfully',
        organization: org
      });
    } else {
      // In-memory fallback
      const mockId = 'org_' + Date.now().toString(36);
      const newOrg = {
        _id: mockId,
        id: mockId,
        name: name.trim(),
        type: normalizedType,
        location: location.trim(),
        description: description.trim(),
        createdBy: req.user.id,
        createdAt: new Date().toISOString()
      };
      inMemoryOrgs.set(mockId, newOrg);

      if (!req.user.organizationId) {
        req.user.organizationId = mockId;
      }

      return res.status(201).json({
        message: 'Organization created successfully (in-memory mode)',
        organization: newOrg
      });
    }
  } catch (err) {
    console.error('[AEGIS-ORG] Creation error:', err);
    return res.status(500).json({ error: 'Failed to create organization', details: err.message });
  }
}

/**
 * GET /api/organizations/:id
 * Retrieve organization details (Requires access to this org)
 */
export async function getOrganizationById(req, res) {
  try {
    const orgId = req.params.id;

    if (mongoose.connection.readyState === 1) {
      let org = null;
      if (mongoose.Types.ObjectId.isValid(orgId)) {
        org = await Organization.findById(orgId).lean();
      }
      if (!org) {
        org = await Organization.findOne({
          $or: [{ name: orgId }, { _id: orgId }]
        }).lean();
      }

      // If looking for demo org and not found, create/return it
      if (!org && (orgId === DEFAULT_DEMO_ORG._id || orgId === DEFAULT_DEMO_ORG.name)) {
        org = await getOrCreateDefaultOrg();
      }

      if (!org) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      return res.status(200).json({ organization: org });
    } else {
      const org = inMemoryOrgs.get(orgId) || (orgId === DEFAULT_DEMO_ORG._id ? DEFAULT_DEMO_ORG : null);
      if (!org) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      return res.status(200).json({ organization: org });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch organization', details: err.message });
  }
}

/**
 * PATCH /api/organizations/:id
 * Update organization details (ADMIN of this org only)
 */
export async function updateOrganization(req, res) {
  try {
    const orgId = req.params.id;
    const { name, type, location, description } = req.body || {};

    const updates = {};
    if (name && name.trim()) updates.name = name.trim();
    if (type) {
      const normType = type.toUpperCase();
      if (!VALID_ORG_TYPES.includes(normType)) {
        return res.status(400).json({
          error: `Invalid type. Allowed: ${VALID_ORG_TYPES.join(', ')}`
        });
      }
      updates.type = normType;
    }
    if (typeof location === 'string') updates.location = location.trim();
    if (typeof description === 'string') updates.description = description.trim();

    if (mongoose.connection.readyState === 1) {
      let org = null;
      if (mongoose.Types.ObjectId.isValid(orgId)) {
        org = await Organization.findByIdAndUpdate(orgId, { $set: updates }, { new: true }).lean();
      }
      if (!org) {
        org = await Organization.findOneAndUpdate({ _id: orgId }, { $set: updates }, { new: true }).lean();
      }

      if (!org) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      return res.status(200).json({
        message: 'Organization updated successfully',
        organization: org
      });
    } else {
      const org = inMemoryOrgs.get(orgId);
      if (!org) {
        return res.status(404).json({ error: 'Organization not found' });
      }
      Object.assign(org, updates, { updatedAt: new Date().toISOString() });
      return res.status(200).json({
        message: 'Organization updated successfully',
        organization: org
      });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update organization', details: err.message });
  }
}

/**
 * GET /api/organizations/:id/users
 * Retrieve users in organization (ADMIN of this org only)
 */
export async function getOrganizationUsers(req, res) {
  try {
    const orgId = req.params.id;

    if (mongoose.connection.readyState === 1) {
      const users = await User.find({ organizationId: orgId })
        .select('-passwordHash')
        .lean();
      return res.status(200).json({ users });
    } else {
      return res.status(200).json({
        users: [{
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          organizationId: orgId
        }]
      });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch organization users', details: err.message });
  }
}
