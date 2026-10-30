/**
 * Zone Controller
 * Handles zone queries and explainable risk breakdowns.
 */

import { getWorldState } from '../store/worldState.js';
import { computeLiveZonesState } from '../engine/simulationEngine.js';
import Zone from '../models/Zone.js';
import { isDBConnected } from '../config/db.js';

function formatZone(z) {
  const zoneId = z.zoneId || z.id;
  const roadAccess = z.roadAccess !== undefined ? z.roadAccess : (z.roads !== undefined ? z.roads : 100);
  const hospitalAccess = z.hospitalAccess !== undefined ? z.hospitalAccess : (zoneId === 'D' ? 18 : 85);

  return {
    ...z,
    zoneId,
    id: zoneId,
    roadAccess,
    roads: roadAccess,
    hospitalAccess,
    risk: z.risk !== undefined ? z.risk : (zoneId === 'D' ? 96 : 40),
    health: z.health !== undefined ? z.health : (100 - (z.risk || 40)),
    status: z.status || (z.risk >= 80 ? 'CRITICAL' : 'STABLE')
  };
}

// GET /api/zones
export async function getZones(req, res) {
  const state = getWorldState();
  const calculatedZones = computeLiveZonesState(state.zones, state.weather, state.resources);
  const formatted = calculatedZones.map(formatZone);
  res.json(formatted);
}

import { DEMO_MISSIONS } from '../seed/seedData.js';

function generateDemoZonesForHazard(missionId, disasterType, missionName) {
  const normType = (disasterType || 'FLOOD').toUpperCase();

  const hazardLabels = {
    EARTHQUAKE: {
      A: 'Uptown Base Staging',
      B: 'Commercial Masonry Core',
      C: 'Fault Epicenter Corridor',
      D: 'County Trauma Center Annex',
      E: 'Substation Grid Blackout'
    },
    TORNADO: {
      A: 'Prairie Command Depot',
      B: 'Highway 81 Intercept',
      C: 'Underground Shelter Staging',
      D: 'Direct Swath Subdivision',
      E: 'Downed Repeater Perimeter'
    },
    WILDFIRE: {
      A: 'Valley Base Fire Depot',
      B: 'Agricultural Defensible Buffer',
      C: 'Timber Ridge Fuel Line',
      D: 'Canyon Hospital Interface',
      E: 'Active Crown Flame Front'
    },
    LANDSLIDE: {
      A: 'Valley Base Staging',
      B: 'River Confluence Highway',
      C: 'Escarpment Wall Fissure',
      D: 'Mountain Clinic Access Road',
      E: 'Colluvial Debris Apex'
    },
    CYCLONE: {
      A: 'Inland High Ground Depot',
      B: 'Commercial Promenade',
      C: 'Harbor Basin & Fisher Pier',
      D: 'Maritime Hospital Surge Wing',
      E: 'Barrier Island Eye Impact'
    }
  };

  const labels = hazardLabels[normType] || {
    A: 'North Uplands / Depot',
    B: 'Commercial District',
    C: 'River Basin Corridor',
    D: 'South General Trauma Center',
    E: 'East Delta Blackout'
  };

  return [
    { zoneId: 'A', missionId, name: labels.A, risk: 18, population: 3800, health: 82, roadAccess: 88, infrastructure: 92, reports: 2, connectivity: 98, hospitalAccess: 95, status: 'STABLE' },
    { zoneId: 'B', missionId, name: labels.B, risk: 48, population: 7600, health: 52, roadAccess: 64, infrastructure: 74, reports: 6, connectivity: 89, hospitalAccess: 70, status: 'WARNING' },
    { zoneId: 'C', missionId, name: labels.C, risk: 74, population: 4200, health: 26, roadAccess: 38, infrastructure: 45, reports: 11, connectivity: 68, hospitalAccess: 40, status: 'HIGH_RISK' },
    { zoneId: 'D', missionId, name: labels.D, risk: 96, population: 3100, health: 4, roadAccess: 22, infrastructure: 39, reports: 14, connectivity: 42, hospitalAccess: 18, status: 'CRITICAL' },
    { zoneId: 'E', missionId, name: labels.E, risk: 78, population: 1900, health: 22, roadAccess: 25, infrastructure: 30, reports: 0, connectivity: 12, hospitalAccess: 10, status: 'UNKNOWN' }
  ];
}

// GET /api/missions/:missionId/zones
export async function getZonesByMission(req, res) {
  const mId = req.params.missionId;
  const state = getWorldState();

  if (isDBConnected()) {
    try {
      const dbZones = await Zone.find({ missionId: mId });
      if (dbZones && dbZones.length > 0) {
        return res.json(dbZones.map(z => formatZone(z.toObject())));
      }
    } catch (err) {
      console.warn('[AEGIS-ZONE] DB query error:', err.message);
    }
  }

  if (mId === '027' || mId === state.incidentId) {
    return getZones(req, res);
  }

  const demoMatch = DEMO_MISSIONS.find(m => m.missionId === mId);
  if (demoMatch) {
    const hazardZones = generateDemoZonesForHazard(mId, demoMatch.disasterType, demoMatch.name);
    return res.json(hazardZones.map(formatZone));
  }

  return res.status(404).json({ error: "Mission not found" });
}

// GET /api/zones/:id
export async function getZone(req, res) {
  const state = getWorldState();
  const calculatedZones = computeLiveZonesState(state.zones, state.weather, state.resources);
  const targetId = req.params.id.toUpperCase();
  const zone = calculatedZones.find(z => (z.id || z.zoneId || '').toUpperCase() === targetId);

  if (!zone) {
    if (isDBConnected()) {
      try {
        const dbZone = await Zone.findOne({ zoneId: targetId });
        if (dbZone) return res.json(formatZone(dbZone.toObject()));
      } catch (err) {
        console.warn('[AEGIS-ZONE] DB query error:', err.message);
      }
    }
    return res.status(404).json({ error: "Zone not found" });
  }

  res.json(formatZone(zone));
}

// GET /api/zones/:id/explain
export function getZoneExplanation(req, res) {
  const state = getWorldState();
  const calculatedZones = computeLiveZonesState(state.zones, state.weather, state.resources);
  const targetId = req.params.id.toUpperCase();
  const zone = calculatedZones.find(z => (z.id || z.zoneId || '').toUpperCase() === targetId);

  if (!zone) {
    return res.status(404).json({ error: "Zone not found" });
  }

  const breakdown = zone.breakdown || {};
  const formatted = formatZone(zone);

  const explanation = {
    // Exact schema requested in prompt
    risk: formatted.risk,
    simulated: true,
    notice: "AEGIS DECISION SUPPORT — SIMULATED DEMO RISK BREAKDOWN. Not real-world prediction.",
    factors: [
      {
        factor: "Flood exposure",
        impact: breakdown.weatherFactor || (formatted.zoneId === 'D' ? 32 : 18)
      },
      {
        factor: "Road accessibility",
        impact: breakdown.roadFactor || (formatted.zoneId === 'D' ? 24 : 12)
      },
      {
        factor: "Infrastructure stress",
        impact: breakdown.infraFactor || (formatted.zoneId === 'D' ? 21 : 14)
      }
    ],
    // Extended fields for the existing XAI React screen
    zoneId: formatted.zoneId,
    zoneName: formatted.name,
    currentRisk: formatted.risk,
    previousRisk: formatted.previousRisk || 0,
    riskDelta: formatted.risk - (formatted.previousRisk || 0),
    dominantTrigger: "",
    factorBreakdown: [
      { name: "Heavy rainfall impact",           points: breakdown.weatherFactor || 31, category: "Environmental" },
      { name: "Road accessibility degradation",   points: breakdown.roadFactor || 24,    category: "Mobility" },
      { name: "Population exposure index",         points: breakdown.popFactor || 19,     category: "Vulnerability" },
      { name: "Infrastructure stress & breaches",  points: breakdown.infraFactor || 14,   category: "Structural" },
      { name: "Emergency 911 report density",      points: breakdown.reportFactor || 8,   category: "Signals" },
      { name: "Communication & telemetry loss",    points: breakdown.commsFactor || 10,   category: "Comms" }
    ],
    mitigationCredits: breakdown.mitigation || 0,
    countermeasureSensitivity: []
  };

  if (formatted.zoneId === "D") {
    explanation.dominantTrigger = "Road 17 became completely inaccessible due to culvert washout; primary emergency ambulance access to South General Hospital severed.";
    explanation.countermeasureSensitivity = [
      { action: "Deploy Engineering Unit to Bridge 17 / Road 17", impact: "-24 Risk Points", timeToEffect: "18 minutes" },
      { action: "Deploy Mobile Field Triage (Medical Unit)",      impact: "-16 Risk Points", timeToEffect: "10 minutes" },
      { action: "Traffic Diversion via Zone B (Logistics)",       impact: "-8 Risk Points",  timeToEffect: "25 minutes" }
    ];
  } else if (formatted.zoneId === "C") {
    explanation.dominantTrigger = "River Basin crest (+3.4m) threatening Bridge 17 structural pylons; rapid water expansion approaching electrical substation.";
    explanation.countermeasureSensitivity = [
      { action: "Deploy Engineering (Mobile Berm Reinforcement)", impact: "-28 Risk Points", timeToEffect: "15 minutes" },
      { action: "Deploy Fire/Rescue Amphibious Unit",            impact: "-14 Risk Points", timeToEffect: "12 minutes" }
    ];
  } else if (formatted.zoneId === "E") {
    explanation.dominantTrigger = "Information Gap: Zero emergency calls due to 88% telecom blackout, but satellite/GPS signals detect 140+ stalled vehicles and petrochemical hazards.";
    explanation.probabilityUnreportedIncident = "78% Probability of severe unmonitored flooding & trapped casualties";
    explanation.countermeasureSensitivity = [
      { action: "Deploy Reconnaissance Drone / Comms Relay (Fire/Rescue)", impact: "Resolves Gap & Reveals Reality",          timeToEffect: "8 minutes" },
      { action: "Dispatch Amphibious Evacuation Unit",                     impact: "Secures 140+ trapped motorists",          timeToEffect: "20 minutes" }
    ];
  } else {
    explanation.dominantTrigger = `Moderate environmental stress from persistent rainfall (${state.weather.rainfall} mm/h) and road slowdowns.`;
    explanation.countermeasureSensitivity = [
      { action: "Maintain passive logistics monitoring", impact: "Prevents spillover congestion", timeToEffect: "Immediate" }
    ];
  }

  res.json(explanation);
}
