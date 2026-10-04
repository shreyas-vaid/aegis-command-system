import mongoose from 'mongoose';
import Mission from '../models/Mission.js';
import { findMissionById } from './missionController.js';
import { getLiveWeather } from '../services/weatherService.js';

/**
 * GET /api/missions/:id/data/weather
 * Retrieve live normalized meteorological data strictly for the mission's stored coordinates.
 */
export async function getMissionWeatherHandler(req, res) {
  try {
    const targetId = req.params.id;
    const isDemoMission = targetId === '027';

    // 1. Authentication check (027 demo mission allows optional preview)
    if (!isDemoMission && !req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token required to access operational weather telemetry'
      });
    }

    // 2. Resolve Mission from database or in-memory repository
    let mission = null;
    try {
      mission = await findMissionById(targetId);
    } catch (err) {
      console.warn(`[AEGIS-WEATHER] findMissionById error for ${targetId}:`, err.message);
    }

    // Seed/demo fallback for Scenario 027
    if (isDemoMission) {
      if (mission) {
        if (mission.latitude === undefined || isNaN(mission.latitude)) mission.latitude = 30.7333;
        if (mission.longitude === undefined || isNaN(mission.longitude)) mission.longitude = 76.7794;
        if (!mission.locationName) mission.locationName = 'Chandigarh';
      } else {
        mission = {
          missionId: '027',
          name: 'Flash Flood Cascade',
          locationName: 'Chandigarh',
          locationDisplayName: 'Chandigarh, Sector 17',
          latitude: 30.7333,
          longitude: 76.7794
        };
      }
    }

    if (!mission) {
      return res.status(404).json({
        error: 'Operation not found',
        message: `No active operation identified with ID: ${targetId}`
      });
    }

    // 3. Strict Organization Authorization Check
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

    // 4. Coordinates extraction strictly from the stored mission (NEVER from query or body)
    const latitude = mission.latitude;
    const longitude = mission.longitude;

    if (latitude === undefined || longitude === undefined || isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        error: 'Missing Coordinates',
        message: 'Operation does not possess valid geographical coordinates for weather lookups'
      });
    }

    const forceRefresh = req.query.refresh === 'true' || req.query.force === 'true';

    // 5. Query Open-Meteo via Weather Service
    try {
      const weather = await getLiveWeather(
        latitude, 
        longitude, 
        mission.missionId || targetId, 
        forceRefresh
      );

      return res.status(200).json({
        missionId: mission.missionId || targetId,
        locationName: mission.locationName,
        locationDisplayName: mission.locationDisplayName || mission.locationName,
        ...weather
      });
    } catch (err) {
      console.error('[AEGIS-WEATHER] Error retrieving weather from provider:', err.message);

      if (isDemoMission) {
        // Honest fallback for demo mode if external provider is offline
        return res.status(200).json({
          missionId: '027',
          locationName: mission.locationName || 'Chandigarh',
          locationDisplayName: mission.locationDisplayName || 'Chandigarh, Sector 17',
          location: { latitude: 30.7333, longitude: 76.7794 },
          current: {
            temperature: 28,
            apparentTemperature: 31,
            rainfall: 8.2,
            precipitation: 8.2,
            windSpeed: 21,
            humidity: 84,
            weatherCode: 65,
            condition: 'HEAVY_RAIN',
            conditionLabel: 'Heavy Torrential Rain',
            category: 'HEAVY_RAIN'
          },
          forecast: [
            { time: '14:00', temperature: 28, rainfall: 7.2, precipitationProbability: 72, condition: 'RAIN', conditionLabel: 'Rain' },
            { time: '15:00', temperature: 27, rainfall: 8.1, precipitationProbability: 81, condition: 'RAIN', conditionLabel: 'Rain' },
            { time: '16:00', temperature: 26, rainfall: 8.6, precipitationProbability: 86, condition: 'HEAVY_RAIN', conditionLabel: 'Heavy Rain' }
          ],
          source: 'DEMO DATA (PROVIDER OFFLINE)',
          isDemoFallback: true,
          isCached: false,
          fetchedAt: new Date().toISOString()
        });
      }

      return res.status(503).json({
        error: 'Weather Data Unavailable',
        message: 'Weather provider temporarily unavailable',
        details: err.message
      });
    }

  } catch (err) {
    console.error('[AEGIS-WEATHER] Unexpected handler error:', err.message);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process meteorological telemetry request',
      details: err.message
    });
  }
}
