import mongoose from 'mongoose';
import Mission from '../models/Mission.js';
import { getOrCreateDefaultOrg, DEFAULT_DEMO_ORG } from '../services/organizationService.js';
import { DEMO_MISSION } from '../seed/seedData.js';

// In-memory fallback map for offline / test resilience
const inMemoryMissions = new Map([
  ["027", { ...DEMO_MISSION, organizationId: DEFAULT_DEMO_ORG._id }]
]);

const VALID_STATUSES = ['PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED'];
const VALID_DISASTER_TYPES = [
  'FLOOD',
  'FLASH_FLOOD',
  'FIRE',
  'EARTHQUAKE',
  'STORM',
  'INDUSTRIAL',
  'LANDSLIDE',
  'HEATWAVE',
  'OTHER'
];

/**
 * Helper to resolve a mission by either ObjectId or missionId string
 */
async function findMissionById(id) {
  if (mongoose.connection.readyState === 1) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const byMongoId = await Mission.findById(id);
      if (byMongoId) return byMongoId;
    }
    return await Mission.findOne({ missionId: id });
  } else {
    for (const [key, val] of inMemoryMissions.entries()) {
      if (key === id || val._id === id || val.id === id) {
        return val;
      }
    }
    return null;
  }
}

/**
 * GET /api/missions
 * Retrieve missions belonging strictly to the authenticated operator's organization.
 * In DEMO MODE or if unauthenticated query is made to health/demo, gracefully return demo mission.
 */
export async function getMissions(req, res) {
  try {
    const userOrgId = req.user?.organizationId ? req.user.organizationId.toString() : null;
    const includeArchived = req.query.includeArchived === 'true';

    if (mongoose.connection.readyState === 1) {
      const filter = {};
      if (userOrgId) {
        const orgIds = [userOrgId];
        if (mongoose.Types.ObjectId.isValid(userOrgId)) {
          orgIds.push(new mongoose.Types.ObjectId(userOrgId));
        }
        filter.organizationId = { $in: orgIds };
      }
      if (!includeArchived) {
        filter.status = { $ne: 'ARCHIVED' };
      }

      let missions = await Mission.find(filter).sort({ createdAt: -1 }).lean();

      // If user belongs to default demo org and no mission exists yet, seed 027
      if (missions.length === 0 && (!userOrgId || userOrgId === DEFAULT_DEMO_ORG._id)) {
        const demoOrg = await getOrCreateDefaultOrg();
        let demoM = await Mission.findOne({ missionId: "027" }).lean();
        if (!demoM) {
          demoM = await Mission.create({
            ...DEMO_MISSION,
            organizationId: demoOrg._id
          });
        }
        missions = [demoM];
      }

      return res.status(200).json(missions);
    } else {
      // In-memory fallback
      const list = Array.from(inMemoryMissions.values()).filter(m => {
        if (!includeArchived && m.status === 'ARCHIVED') return false;
        if (userOrgId && m.organizationId && m.organizationId.toString() !== userOrgId) return false;
        return true;
      });
      return res.status(200).json(list);
    }
  } catch (err) {
    console.error('[AEGIS-MISSION] Fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch operations', details: err.message });
  }
}

/**
 * GET /api/missions/:id
 * Retrieve a single operation by ID with organization-level access isolation.
 */
export async function getMissionById(req, res) {
  try {
    const targetId = req.params.id;
    const mission = await findMissionById(targetId);

    if (!mission) {
      return res.status(404).json({ error: 'Operation not found' });
    }

    const isDemoMission = targetId === '027' || mission.missionId === '027';

    // Non-demo missions require authentication
    if (!isDemoMission && !req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token required to access this operation'
      });
    }

    // Organization data isolation check for authenticated users
    if (!isDemoMission && req.user && req.user.organizationId) {
      const userOrgId = req.user.organizationId.toString();
      const missionOrgId = mission.organizationId ? mission.organizationId.toString() : null;

      if (missionOrgId && missionOrgId !== userOrgId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied: You do not have permission to view operations from another organization'
        });
      }
    }

    return res.status(200).json(mission);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch operation', details: err.message });
  }
}

/**
 * POST /api/missions
 * Create a new operational mission for the user's organization (ADMIN, COMMANDER)
 */
export async function createMission(req, res) {
  try {
    const {
      name,
      description = '',
      disasterType,
      locationName,
      latitude,
      longitude,
      severity = 'HIGH',
      status = 'PLANNING'
    } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Operation name is required' });
    }
    if (!disasterType) {
      return res.status(400).json({ error: 'Disaster type is required' });
    }

    const normType = disasterType.toUpperCase();
    if (!VALID_DISASTER_TYPES.includes(normType)) {
      return res.status(400).json({
        error: `Invalid disaster type. Allowed: ${VALID_DISASTER_TYPES.join(', ')}`
      });
    }

    if (!locationName || !locationName.trim()) {
      return res.status(400).json({ error: 'Location name is required' });
    }

    const numLat = Number(latitude);
    const numLng = Number(longitude);
    if (isNaN(numLat) || numLat < -90 || numLat > 90) {
      return res.status(400).json({ error: 'Valid latitude between -90 and 90 is required' });
    }
    if (isNaN(numLng) || numLng < -180 || numLng > 180) {
      return res.status(400).json({ error: 'Valid longitude between -180 and 180 is required' });
    }

    const normStatus = status ? status.toUpperCase() : 'PLANNING';
    if (!VALID_STATUSES.includes(normStatus)) {
      return res.status(400).json({
        error: `Invalid status. Allowed: ${VALID_STATUSES.join(', ')}`
      });
    }

    // MUST use organizationId from authenticated user
    const organizationId = req.user.organizationId;
    if (!organizationId) {
      return res.status(400).json({ error: 'User does not belong to an active organization' });
    }

    const generatedMissionId = `OPS-${Date.now().toString().slice(-4)}`;

    if (mongoose.connection.readyState === 1) {
      const newMission = await Mission.create({
        missionId: generatedMissionId,
        organizationId,
        name: name.trim(),
        description: description.trim(),
        disasterType: normType,
        locationName: locationName.trim(),
        latitude: numLat,
        longitude: numLng,
        severity: severity.toUpperCase(),
        status: normStatus,
        createdBy: req.user.id
      });

      return res.status(201).json({
        message: 'Operation created successfully',
        mission: newMission
      });
    } else {
      // In-memory fallback
      const mockMission = {
        _id: 'm_' + Date.now().toString(36),
        id: generatedMissionId,
        missionId: generatedMissionId,
        organizationId: organizationId.toString(),
        name: name.trim(),
        description: description.trim(),
        disasterType: normType,
        locationName: locationName.trim(),
        latitude: numLat,
        longitude: numLng,
        severity: severity.toUpperCase(),
        status: normStatus,
        createdBy: req.user.id,
        createdAt: new Date().toISOString()
      };
      inMemoryMissions.set(generatedMissionId, mockMission);

      return res.status(201).json({
        message: 'Operation created successfully (in-memory mode)',
        mission: mockMission
      });
    }
  } catch (err) {
    console.error('[AEGIS-MISSION] Creation error:', err);
    return res.status(500).json({ error: 'Failed to create operation', details: err.message });
  }
}

/**
 * PATCH /api/missions/:id
 * Update an operation (ADMIN, COMMANDER)
 */
export async function updateMission(req, res) {
  try {
    const targetId = req.params.id;
    const mission = await findMissionById(targetId);

    if (!mission) {
      return res.status(404).json({ error: 'Operation not found' });
    }

    // Organization data isolation check
    if (req.user && req.user.organizationId) {
      const userOrgId = req.user.organizationId.toString();
      const missionOrgId = mission.organizationId ? mission.organizationId.toString() : null;

      if (missionOrgId && missionOrgId !== userOrgId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied: You cannot modify operations from another organization'
        });
      }
    }

    const {
      name,
      description,
      disasterType,
      locationName,
      latitude,
      longitude,
      severity,
      status
    } = req.body || {};

    const updates = {};
    if (name && name.trim()) updates.name = name.trim();
    if (typeof description === 'string') updates.description = description.trim();
    if (locationName && locationName.trim()) updates.locationName = locationName.trim();
    if (latitude !== undefined) {
      const lat = Number(latitude);
      if (!isNaN(lat) && lat >= -90 && lat <= 90) updates.latitude = lat;
    }
    if (longitude !== undefined) {
      const lng = Number(longitude);
      if (!isNaN(lng) && lng >= -180 && lng <= 180) updates.longitude = lng;
    }
    if (disasterType) {
      const normType = disasterType.toUpperCase();
      if (VALID_DISASTER_TYPES.includes(normType)) updates.disasterType = normType;
    }
    if (severity) updates.severity = severity.toUpperCase();
    if (status) {
      const normStatus = status.toUpperCase();
      if (!VALID_STATUSES.includes(normStatus)) {
        return res.status(400).json({
          error: `Invalid status. Allowed: ${VALID_STATUSES.join(', ')}`
        });
      }
      updates.status = normStatus;
    }

    if (mongoose.connection.readyState === 1) {
      const updated = await Mission.findByIdAndUpdate(mission._id, { $set: updates }, { new: true }).lean();
      return res.status(200).json({
        message: 'Operation updated successfully',
        mission: updated
      });
    } else {
      Object.assign(mission, updates, { updatedAt: new Date().toISOString() });
      return res.status(200).json({
        message: 'Operation updated successfully',
        mission
      });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update operation', details: err.message });
  }
}

/**
 * DELETE /api/missions/:id
 * Safe archive of an operation (ADMIN, COMMANDER)
 */
export async function deleteMission(req, res) {
  try {
    const targetId = req.params.id;
    const mission = await findMissionById(targetId);

    if (!mission) {
      return res.status(404).json({ error: 'Operation not found' });
    }

    // Organization data isolation check
    if (req.user && req.user.organizationId) {
      const userOrgId = req.user.organizationId.toString();
      const missionOrgId = mission.organizationId ? mission.organizationId.toString() : null;

      if (missionOrgId && missionOrgId !== userOrgId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied: You cannot archive operations from another organization'
        });
      }
    }

    // Soft archive rather than hard delete
    if (mongoose.connection.readyState === 1) {
      const archived = await Mission.findByIdAndUpdate(
        mission._id,
        { $set: { status: 'ARCHIVED' } },
        { new: true }
      ).lean();
      return res.status(200).json({
        message: 'Operation archived successfully',
        mission: archived
      });
    } else {
      mission.status = 'ARCHIVED';
      mission.updatedAt = new Date().toISOString();
      return res.status(200).json({
        message: 'Operation archived successfully',
        mission
      });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to archive operation', details: err.message });
  }
}
