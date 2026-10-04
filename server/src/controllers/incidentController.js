/**
 * Incident Controller
 * Handles incident CRUD and the AI Incident Fusion cluster.
 */

import { getWorldState } from '../store/worldState.js';
import Incident from '../models/Incident.js';
import { isDBConnected } from '../config/db.js';

// GET /api/incidents
export async function getIncidents(req, res) {
  const state = getWorldState();
  res.json({
    activeCount: state.incidents.length,
    incidents: state.incidents,
    rawSignals: state.incidents,
    fusedCluster: {
      clusterId: "027",
      title: "South Hospital Corridor Isolation & Cascading Trauma Failure",
      confidence: 94,
      correlationFactor: 0.91,
      flow: [
        { step: 1, title: "Heavy Rainfall (42 mm/h)",              icon: "CloudRain",     detail: "Atmospheric saturation causing unabsorbed run-off into River Basin." },
        { step: 2, title: "Water Expansion (+3.4m Crest)",          icon: "Waves",         detail: "River crest breaches natural levees into industrial and transit sectors." },
        { step: 3, title: "Road 17 & Bridge Blockage",             icon: "AlertTriangle", detail: "Culvert washout on Road 17 and structural pylon deflection on Bridge 17." },
        { step: 4, title: "Hospital Access Failure",               icon: "ShieldAlert",   detail: "South General Hospital isolated; emergency ambulances cannot reach Level 1 trauma bays." },
        { step: 5, title: "Trauma Care Collapse Risk",             icon: "Activity",      detail: "72% hospital load accelerating towards 120% saturation without intervention." }
      ],
      detectedAt: "14:36:50"
    }
  });
}

// GET /api/missions/:missionId/incidents
export async function getIncidentsByMission(req, res) {
  const state = getWorldState();
  if (req.params.missionId !== state.incidentId) {
    if (isDBConnected()) {
      try {
        const dbIncidents = await Incident.find({ missionId: req.params.missionId });
        if (dbIncidents && dbIncidents.length > 0) return res.json(dbIncidents);
      } catch (err) {
        console.warn('[AEGIS-INCIDENT] DB find error:', err.message);
      }
    }
    return res.status(404).json({ error: "Mission not found" });
  }

  res.json(state.incidents);
}

// POST /api/incidents
export async function createIncident(req, res) {
  const state = getWorldState();
  const { type, location, severity, source, confidence, timestamp, status, zone, summary } = req.body;

  const newId = Math.max(...state.incidents.map(i => i.id || i.incidentId || 0), 200) + 1;
  const newIncident = {
    id: newId,
    incidentId: newId,
    missionId: state.incidentId,
    type: type || "Disaster Anomaly",
    location: location || "Sector Grid",
    zone: zone || "Regional",
    severity: severity || "MODERATE",
    source: source || "Field Telemetry",
    confidence: confidence !== undefined ? confidence : 85,
    timestamp: timestamp || new Date().toLocaleTimeString('en-US', { hour12: false }),
    status: status || "ACTIVE",
    summary: summary || ""
  };

  state.incidents.push(newIncident);

  if (isDBConnected()) {
    try {
      await Incident.create(newIncident);
    } catch (err) {
      console.warn('[AEGIS-INCIDENT] DB save error:', err.message);
    }
  }

  res.status(201).json({ success: true, incident: newIncident });
}

// PATCH /api/incidents/:id
export async function updateIncident(req, res) {
  const state = getWorldState();
  const targetId = parseInt(req.params.id, 10);
  const incident = state.incidents.find(i => (i.id === targetId || i.incidentId === targetId));

  if (!incident) {
    return res.status(404).json({ error: "Incident not found" });
  }

  const { status, severity, confidence, location } = req.body;
  if (status) incident.status = status;
  if (severity) incident.severity = severity;
  if (confidence !== undefined) incident.confidence = confidence;
  if (location) incident.location = location;

  if (isDBConnected()) {
    try {
      await Incident.updateOne({ incidentId: targetId }, { $set: req.body });
    } catch (err) {
      console.warn('[AEGIS-INCIDENT] DB update error:', err.message);
    }
  }

  res.json({ success: true, incident });
}
