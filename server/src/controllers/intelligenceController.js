import { findMissionById } from './missionController.js';
import { fuseMissionIntelligence } from '../services/dataFusionService.js';

/**
 * GET /api/missions/:id/intelligence
 * Retrieve deterministic fused world-state intelligence combining weather, field reports, and zone vulnerability.
 */
export async function getMissionIntelligenceHandler(req, res) {
  try {
    const targetMissionId = req.params.id;
    const isDemoMission = targetMissionId === '027';

    // 1. Authentication check (027 demo mission allows optional preview)
    if (!isDemoMission && !req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token required to access operational intelligence'
      });
    }

    // 2. Resolve mission
    let mission = await findMissionById(targetMissionId);
    if (!mission && isDemoMission) {
      mission = {
        missionId: '027',
        name: 'Flash Flood Cascade',
        organizationId: 'demo-org-default',
        locationName: 'Chandigarh',
        latitude: 30.7333,
        longitude: 76.7794
      };
    }

    if (!mission) {
      return res.status(404).json({
        error: 'Operation not found',
        message: `No active operation identified with ID: ${targetMissionId}`
      });
    }

    // 3. Organization authorization check
    if (!isDemoMission && req.user?.organizationId) {
      const userOrgId = req.user.organizationId.toString();
      const missionOrgId = mission.organizationId ? mission.organizationId.toString() : null;

      if (missionOrgId && missionOrgId !== userOrgId) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Access denied: You do not have permission to access intelligence for another organization'
        });
      }
    }

    const forceWeatherRefresh = req.query.refresh === 'true' || req.query.force === 'true';

    // 4. Call Data Fusion Service
    const intelligence = await fuseMissionIntelligence(targetMissionId, { forceWeatherRefresh });

    return res.status(200).json(intelligence);
  } catch (err) {
    console.error('[AEGIS-INTELLIGENCE] Data fusion error:', err.message);
    const status = err.status || 500;
    return res.status(status).json({
      error: 'Intelligence System Unavailable',
      message: err.message || 'Failed to fuse operational intelligence'
    });
  }
}
