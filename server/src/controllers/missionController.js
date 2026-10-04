/**
 * Mission Controller
 * Handles mission CRUD and full state retrieval.
 */

import { getWorldState, resetWorldState } from '../store/worldState.js';
import {
  computeLiveZonesState,
  calculateCityHealth,
  calculateHospitalLoad
} from '../engine/simulationEngine.js';

// GET /api/missions
export function getMissions(req, res) {
  const state = getWorldState();
  res.json([{
    id: state.incidentId,
    name: "Flash Flood Cascade",
    status: state.mode === "LIVE" ? "ACTIVE" : state.mode,
    severity: "CRITICAL",
    disasterType: "FLASH_FLOOD_CASCADE",
    time: state.time
  }]);
}

// GET /api/missions/:id
export function getMission(req, res) {
  const state = getWorldState();
  if (req.params.id !== state.incidentId) {
    return res.status(404).json({ error: "Mission not found" });
  }

  const calculatedZones = computeLiveZonesState(state.zones, state.weather, state.resources);
  const cityHealth = calculateCityHealth(calculatedZones, state.resources, state.timeOffset);
  const hospitalLoad = calculateHospitalLoad(state.resources, state.timeOffset);
  const unknownCount = calculatedZones.filter(z => z.status === "UNKNOWN").length;
  const activeAlerts = 7 + (state.timeOffset > 0 ? Math.floor(state.timeOffset / 10) : 0);

  const availableResources = {};
  ['medical', 'fire', 'logistics', 'engineering'].forEach(type => {
    availableResources[type] = state.resources[type] -
      Object.values(state.resources.deployed[type]).reduce((a, b) => a + b, 0);
  });

  res.json({
    id: state.incidentId,
    missionId: state.incidentId,
    name: "Flash Flood Cascade",
    status: state.mode === "LIVE" ? "ACTIVE" : state.mode,
    severity: "CRITICAL",
    disasterType: "FLASH_FLOOD_CASCADE",
    incidentId: state.incidentId,
    title: state.title,
    time: state.time,
    timeOffset: state.timeOffset,
    mode: state.mode,
    cityHealth,
    activeAlerts,
    unknownZones: unknownCount,
    hospitalLoad,
    weather: state.weather,
    resources: {
      total: {
        medical: state.resources.medical,
        fire: state.resources.fire,
        logistics: state.resources.logistics,
        engineering: state.resources.engineering
      },
      available: availableResources,
      deployed: state.resources.deployed
    },
    zones: calculatedZones,
    incidents: state.incidents,
    chess: {
      turn: state.chessTurn,
      logs: state.chessLogs
    }
  });
}

// POST /api/missions
export function createMission(req, res) {
  // For the hackathon prototype, reset to a fresh scenario
  const state = resetWorldState();
  res.status(201).json({
    success: true,
    message: "New mission initialized (Scenario #027).",
    id: state.incidentId
  });
}

// PATCH /api/missions/:id
export function updateMission(req, res) {
  const state = getWorldState();
  if (req.params.id !== state.incidentId) {
    return res.status(404).json({ error: "Mission not found" });
  }

  const { status, mode } = req.body;
  if (status) state.mode = status;
  if (mode) state.mode = mode;

  res.json({ success: true, mode: state.mode });
}

// ─── LEGACY COMPAT: GET /api/state ───────────────────────────────────
// The frontend currently calls /api/state — keep it working.
export function getState(req, res) {
  req.params = { id: getWorldState().incidentId };
  return getMission(req, res);
}

// POST /api/reset
export function resetMission(req, res) {
  const state = resetWorldState();
  const calculatedZones = computeLiveZonesState(state.zones, state.weather, state.resources);

  res.json({
    success: true,
    message: "World state restored to pristine Incident #027 baseline.",
    state: {
      incidentId: state.incidentId,
      time: state.time,
      timeOffset: 0,
      cityHealth: calculateCityHealth(calculatedZones, state.resources, 0),
      hospitalLoad: calculateHospitalLoad(state.resources, 0),
      zones: calculatedZones,
      resources: state.resources
    }
  });
}
