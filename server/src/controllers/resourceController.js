/**
 * Resource Controller
 * Handles resource queries, deployment actions, and assignment.
 */

import { getWorldState } from '../store/worldState.js';
import {
  computeLiveZonesState,
  calculateCityHealth,
  calculateHospitalLoad
} from '../engine/simulationEngine.js';

// GET /api/missions/:missionId/resources
// and GET /api/resources
export function getResources(req, res) {
  const state = getWorldState();

  const availableResources = {};
  ['medical', 'fire', 'logistics', 'engineering'].forEach(type => {
    availableResources[type] = state.resources[type] -
      Object.values(state.resources.deployed[type]).reduce((a, b) => a + b, 0);
  });

  res.json({
    // Explicit prompt fields:
    ambulances: availableResources.medical ?? 5,
    rescueTeams: availableResources.fire ?? 3,
    medicalUnits: availableResources.medical ?? 5,
    shelters: 4,
    vehicles: availableResources.logistics ?? 8,
    communicationUnits: 4,

    // Fleet structures for existing React UI
    total: {
      medical: state.resources.medical,
      fire: state.resources.fire,
      logistics: state.resources.logistics,
      engineering: state.resources.engineering
    },
    available: availableResources,
    deployed: state.resources.deployed
  });
}

// POST /api/resources/:id/assign
export function assignResource(req, res) {
  const state = getWorldState();
  const rawId = req.params.id || req.params.type || '';
  const { zoneId } = req.body;

  // Map any resource ID / naming convention to the tactical resource pool
  const typeMap = {
    medical: 'medical',
    ambulance: 'medical',
    ambulances: 'medical',
    fire: 'fire',
    rescue: 'fire',
    'rescue-team': 'fire',
    logistics: 'logistics',
    vehicle: 'logistics',
    vehicles: 'logistics',
    engineering: 'engineering',
    shelter: 'engineering',
    shelters: 'engineering'
  };

  const resourceType = typeMap[rawId.toLowerCase()] || rawId.toLowerCase();

  if (!['medical', 'fire', 'logistics', 'engineering'].includes(resourceType)) {
    return res.status(400).json({ error: `Invalid resource type or identifier '${rawId}'. Valid: medical, fire, logistics, engineering` });
  }

  if (!zoneId || !['A', 'B', 'C', 'D', 'E'].includes(zoneId.toUpperCase())) {
    return res.status(400).json({ error: "Invalid zoneId. Must be one of A, B, C, D, E." });
  }

  const zone = zoneId.toUpperCase();
  const totalDeployed = Object.values(state.resources.deployed[resourceType]).reduce((a, b) => a + b, 0);

  if (totalDeployed >= state.resources[resourceType]) {
    return res.status(400).json({ error: `No available ${resourceType} units remaining in fleet reserve.` });
  }

  state.resources.deployed[resourceType][zone] = (state.resources.deployed[resourceType][zone] || 0) + 1;

  const calculatedZones = computeLiveZonesState(state.zones, state.weather, state.resources);
  const cityHealth = calculateCityHealth(calculatedZones, state.resources, state.timeOffset);
  const hospitalLoad = calculateHospitalLoad(state.resources, state.timeOffset);

  const availableResources = {};
  ['medical', 'fire', 'logistics', 'engineering'].forEach(type => {
    availableResources[type] = state.resources[type] -
      Object.values(state.resources.deployed[type]).reduce((a, b) => a + b, 0);
  });

  res.json({
    success: true,
    message: `${resourceType.toUpperCase()} unit dispatched to Zone ${zone}.`,
    assignedResource: {
      id: rawId,
      type: resourceType,
      currentZone: zone,
      status: "DEPLOYED"
    },
    resources: {
      ambulances: availableResources.medical,
      rescueTeams: availableResources.fire,
      medicalUnits: availableResources.medical,
      shelters: 4,
      vehicles: availableResources.logistics,
      communicationUnits: 4,
      total: state.resources,
      available: availableResources,
      deployed: state.resources.deployed
    },
    cityHealth,
    hospitalLoad
  });
}

// POST /api/action — Bulk deploy a full response plan
export function deployAction(req, res) {
  const state = getWorldState();
  const { plan } = req.body;

  if (!plan) {
    return res.status(400).json({ error: "Missing response plan" });
  }

  // Validate limits
  let totalMed = 0, totalFire = 0, totalLog = 0, totalEng = 0;
  ['A', 'B', 'C', 'D', 'E'].forEach(z => {
    totalMed  += plan.medical?.[z] || 0;
    totalFire += plan.fire?.[z] || 0;
    totalLog  += plan.logistics?.[z] || 0;
    totalEng  += plan.engineering?.[z] || 0;
  });

  if (totalMed > state.resources.medical ||
      totalFire > state.resources.fire ||
      totalLog > state.resources.logistics ||
      totalEng > state.resources.engineering) {
    return res.status(400).json({ error: "Assigned resources exceed available fleet capacity." });
  }

  state.resources.deployed = {
    medical:     { ...plan.medical },
    fire:        { ...plan.fire },
    logistics:   { ...plan.logistics },
    engineering: { ...plan.engineering }
  };

  const calculatedZones = computeLiveZonesState(state.zones, state.weather, state.resources);
  const cityHealth = calculateCityHealth(calculatedZones, state.resources, state.timeOffset);
  const hospitalLoad = calculateHospitalLoad(state.resources, state.timeOffset);

  res.json({
    success: true,
    message: "Human Command Strategy deployed into digital twin.",
    cityHealth,
    hospitalLoad,
    resources: state.resources,
    zones: calculatedZones
  });
}
