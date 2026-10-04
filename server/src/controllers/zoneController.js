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

// GET /api/missions/:missionId/zones
export async function getZonesByMission(req, res) {
  const state = getWorldState();
  if (req.params.missionId !== state.incidentId) {
    // If not matching default, check if in MongoDB
    if (isDBConnected()) {
      try {
        const dbZones = await Zone.find({ missionId: req.params.missionId });
        if (dbZones && dbZones.length > 0) {
          return res.json(dbZones.map(z => formatZone(z.toObject())));
        }
      } catch (err) {
        console.warn('[AEGIS-ZONE] DB query error:', err.message);
      }
    }
    return res.status(404).json({ error: "Mission not found" });
  }
  return getZones(req, res);
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
