/**
 * Recommendation Controller
 * AEGIS DECISION SUPPORT — SIMULATED RECOMMENDATION ENGINE
 *
 * Wraps the recommendation engine for HTTP access.
 */

import { getWorldState } from '../store/worldState.js';
import { computeLiveZonesState } from '../engine/simulationEngine.js';
import {
  generateRecommendations,
  generateZoneRecommendation
} from '../engine/recommendationEngine.js';

import { findMissionById } from './missionController.js';

// GET /api/recommend
export async function getRecommendation(req, res) {
  const missionId = req.query.missionId || req.params.missionId;
  const targetMission = missionId ? await findMissionById(missionId).catch(() => null) : null;
  const disasterType = req.query.disasterType || targetMission?.disasterType || 'FLOOD';

  const state = getWorldState();
  const calculatedZones = computeLiveZonesState(state.zones, state.weather, state.resources);
  const recommendation = generateRecommendations(calculatedZones, state.weather, state.resources, disasterType);
  res.json(recommendation);
}

// POST /api/recommend
export async function postRecommendation(req, res) {
  const { zoneId, missionId: bodyMissionId, disasterType: bodyDisasterType } = req.body || {};
  const missionId = bodyMissionId || req.query.missionId;
  const targetMission = missionId ? await findMissionById(missionId).catch(() => null) : null;
  const disasterType = bodyDisasterType || req.query.disasterType || targetMission?.disasterType || 'FLOOD';

  const state = getWorldState();
  const calculatedZones = computeLiveZonesState(state.zones, state.weather, state.resources);

  if (zoneId) {
    const zoneRec = generateZoneRecommendation(zoneId, calculatedZones, state.weather, state.resources);
    if (!zoneRec) {
      return res.status(404).json({ error: "Zone not found" });
    }
    return res.json(zoneRec);
  }

  const recommendation = generateRecommendations(calculatedZones, state.weather, state.resources, disasterType);
  res.json(recommendation);
}
