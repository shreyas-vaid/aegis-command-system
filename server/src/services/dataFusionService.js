import mongoose from 'mongoose';
import Mission from '../models/Mission.js';
import Zone from '../models/Zone.js';
import Report from '../models/Report.js';
import { findMissionById } from '../controllers/missionController.js';
import { getLiveWeather } from './weatherService.js';
import { calculateFusedRisk } from './riskEngine.js';
import { DEMO_REPORTS } from '../controllers/reportController.js';
import { DEMO_ZONES } from '../seed/seedData.js';

/**
 * Fuse multi-source operational telemetries for a given mission.
 * @param {string} missionId
 * @param {Object} options
 * @param {boolean} options.forceWeatherRefresh
 * @returns {Promise<Object>} Unified Fused Intelligence payload
 */
export async function fuseMissionIntelligence(missionId, options = {}) {
  const isDemoMission = missionId === '027';

  // 1. Resolve Mission Record
  let mission = await findMissionById(missionId);
  if (!mission && isDemoMission) {
    mission = {
      missionId: '027',
      name: 'Flash Flood Cascade',
      locationName: 'Chandigarh',
      locationDisplayName: 'Chandigarh, Sector 17',
      latitude: 30.7333,
      longitude: 76.7794,
      disasterType: 'FLOOD',
      status: 'ACTIVE'
    };
  }

  if (!mission) {
    const error = new Error(`Operation #${missionId} not found`);
    error.status = 404;
    throw error;
  }

  const queryMissionId = mission.missionId || missionId;

  // 2. Fetch Live Weather Telemetry (Graceful Degradation if offline)
  let weather = null;
  if (mission.latitude !== undefined && mission.longitude !== undefined) {
    try {
      weather = await getLiveWeather(
        mission.latitude,
        mission.longitude,
        queryMissionId,
        options.forceWeatherRefresh || false
      );
    } catch (weatherErr) {
      console.warn(`[DATA-FUSION] Live weather unavailable for ${missionId}:`, weatherErr.message);
      weather = null;
    }
  }

  // 3. Fetch Operational Field Reports
  let reports = [];
  if (mongoose.connection.readyState === 1) {
    reports = await Report.find({ missionId: queryMissionId }).sort({ createdAt: -1 }).lean();
    if (reports.length === 0 && isDemoMission) {
      reports = DEMO_REPORTS;
    }
  } else {
    reports = DEMO_REPORTS.filter(r => r.missionId === queryMissionId);
  }

  // 4. Fetch Zones / Infrastructure Matrix
  let zones = [];
  if (mongoose.connection.readyState === 1) {
    zones = await Zone.find({ missionId: queryMissionId }).lean();
    if (!zones || zones.length === 0) {
      // Fallback to standard 5-sector matrix
      zones = await Zone.find({ missionId: '027' }).lean();
      if (!zones || zones.length === 0) {
        zones = DEMO_ZONES;
      }
    }
  } else {
    zones = DEMO_ZONES;
  }

  // 5. Deterministic Risk Fusion Engine Calculation
  const fused = calculateFusedRisk({
    weather,
    reports,
    zones,
    mission
  });

  return {
    mission: {
      id: queryMissionId,
      name: mission.name,
      location: mission.locationDisplayName || mission.locationName,
      coordinates: {
        latitude: mission.latitude,
        longitude: mission.longitude
      },
      disasterType: mission.disasterType,
      status: mission.status
    },
    weather: weather ? {
      temperature: weather.current?.temperature ?? null,
      apparentTemperature: weather.current?.apparentTemperature ?? null,
      rainfall: weather.current?.rainfall ?? 0,
      windSpeed: weather.current?.windSpeed ?? null,
      humidity: weather.current?.humidity ?? null,
      condition: weather.current?.condition ?? 'UNKNOWN',
      conditionLabel: weather.current?.conditionLabel ?? 'Unknown',
      source: weather.source || 'Open-Meteo',
      fetchedAt: weather.fetchedAt,
      isCached: weather.isCached ?? false
    } : null,
    reports: fused.reportsSummary,
    zones: fused.zonesSummary,
    overallRisk: fused.overallRisk,
    breakdown: fused.breakdown,
    confidence: fused.confidence,
    informationGap: fused.informationGap,
    why: fused.why,
    zonesIntelligence: fused.zonesIntelligence,
    dataSources: fused.dataSources,
    fusedAt: fused.fusedAt
  };
}
