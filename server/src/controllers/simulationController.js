/**
 * Simulation Controller
 * Handles forward time projection, butterfly effect chain,
 * and simulation result storage.
 */

import { getWorldState } from '../store/worldState.js';
import {
  computeLiveZonesState,
  calculateCityHealth,
  calculateHospitalLoad,
  projectTimeOffset,
  generateButterflyChain
} from '../engine/simulationEngine.js';
import { INITIAL_WEATHER, INITIAL_ZONES } from '../seed/seedData.js';
import Simulation from '../models/Simulation.js';
import { isDBConnected } from '../config/db.js';

let simulationCounter = 0;
const simulationStore = [];

// POST /api/simulations
export async function runSimulation(req, res) {
  const state = getWorldState();
  const {
    missionId = "027",
    timeOffset: reqOffset,
    minutes,
    actions = [],
    applyCustomPlan = false,
    plan = null
  } = req.body || {};

  const timeOffset = parseInt(reqOffset !== undefined ? reqOffset : (minutes !== undefined ? minutes : 30), 10);

  // Update world state
  state.timeOffset = timeOffset;
  state.mode = timeOffset === 0 ? "LIVE" : "SIMULATION";

  // Apply custom plan if provided
  if (applyCustomPlan && plan) {
    state.resources.deployed = JSON.parse(JSON.stringify(plan));
  }

  // Project forward in time
  if (timeOffset === 0) {
    state.weather = { ...INITIAL_WEATHER };
    state.zones = JSON.parse(JSON.stringify(INITIAL_ZONES));
    state.time = "14:37:21";
  } else {
    const projected = projectTimeOffset(INITIAL_ZONES, INITIAL_WEATHER, timeOffset);
    state.zones = projected.zones;
    state.weather = projected.weather;

    const minuteMap = { 15: "14:52:21", 30: "15:07:21", 60: "15:37:21" };
    state.time = minuteMap[timeOffset] || `${14 + Math.floor(timeOffset / 60)}:${String(37 + (timeOffset % 60)).padStart(2, '0')}:21`;
  }

  const calculatedZones = computeLiveZonesState(state.zones, state.weather, state.resources);
  const cityHealth = calculateCityHealth(calculatedZones, state.resources, timeOffset);
  const hospitalLoad = calculateHospitalLoad(state.resources, timeOffset);
  const butterflyChain = generateButterflyChain(timeOffset);

  // Store simulation result
  simulationCounter++;
  const simulationId = `SIM-${Date.now().toString().slice(-4)}-${String(simulationCounter).padStart(3, '0')}`;
  
  const hospitalStatus = hospitalLoad >= 90 ? "CRITICAL_SATURATION" : hospitalLoad >= 70 ? "HIGH_INTAKE_LOAD" : "NORMAL";

  const result = {
    // Explicit prompt fields:
    simulationId,
    timeOffset,
    zones: calculatedZones,
    incidents: state.incidents,
    resources: state.resources,
    hospitalStatus,
    systemStatus: "SIMULATED",

    // Tactical Digital Twin fields:
    missionId: missionId || state.incidentId,
    simulatedTime: state.time,
    cityHealth,
    hospitalLoad,
    weather: state.weather,
    butterflyChain,
    actions,
    status: "COMPLETED",
    createdAt: new Date().toISOString(),
    message: `Deterministic disaster simulation forward projected by +${timeOffset} minutes.`
  };

  simulationStore.push(result);

  // Save to MongoDB if connected
  if (isDBConnected()) {
    try {
      await Simulation.create({
        simulationId,
        missionId: missionId || state.incidentId,
        timeOffset,
        actions,
        result,
        status: "COMPLETED"
      });
    } catch (err) {
      console.warn('[AEGIS-SIMULATION] DB save warning:', err.message);
    }
  }

  res.json({ success: true, ...result });
}

// GET /api/simulations/:id
export async function getSimulation(req, res) {
  const targetId = req.params.id;
  const sim = simulationStore.find(s => s.simulationId === targetId);
  if (sim) {
    return res.json(sim);
  }

  if (isDBConnected()) {
    try {
      const dbSim = await Simulation.findOne({ simulationId: targetId });
      if (dbSim) return res.json(dbSim.result || dbSim);
    } catch (err) {
      console.warn('[AEGIS-SIMULATION] DB find warning:', err.message);
    }
  }

  res.status(404).json({ error: "Simulation not found" });
}

// GET /api/missions/:missionId/simulations
export async function getSimulationsByMission(req, res) {
  const missionId = req.params.missionId;
  const results = simulationStore.filter(s => s.missionId === missionId);

  if (results.length > 0) {
    return res.json(results);
  }

  if (isDBConnected()) {
    try {
      const dbSims = await Simulation.find({ missionId });
      if (dbSims && dbSims.length > 0) {
        return res.json(dbSims.map(s => s.result || s));
      }
    } catch (err) {
      console.warn('[AEGIS-SIMULATION] DB query warning:', err.message);
    }
  }

  res.json(results);
}

// Legacy alias: POST /api/simulate
export { runSimulation as simulate };
