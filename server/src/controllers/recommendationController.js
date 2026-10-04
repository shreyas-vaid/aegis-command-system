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

// GET /api/recommend
export function getRecommendation(req, res) {
  const state = getWorldState();
  const calculatedZones = computeLiveZonesState(state.zones, state.weather, state.resources);
  const recommendation = generateRecommendations(calculatedZones, state.weather, state.resources);
  res.json(recommendation);
}

// POST /api/recommend
export function postRecommendation(req, res) {
  const { zoneId } = req.body || {};
  const state = getWorldState();
  const calculatedZones = computeLiveZonesState(state.zones, state.weather, state.resources);

  if (zoneId) {
    const zoneRec = generateZoneRecommendation(zoneId, calculatedZones, state.weather, state.resources);
    if (!zoneRec) {
      return res.status(404).json({ error: "Zone not found" });
    }
    return res.json(zoneRec);
  }

  const recommendation = generateRecommendations(calculatedZones, state.weather, state.resources);
  res.json(recommendation);
}
