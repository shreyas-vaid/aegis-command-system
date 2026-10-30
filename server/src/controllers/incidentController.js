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

import { DEMO_MISSIONS } from '../seed/seedData.js';

function generateDemoIncidentsForHazard(missionId, disasterType) {
  const normType = (disasterType || 'FLOOD').toUpperCase();

  if (normType === 'EARTHQUAKE') {
    return [
      { id: 'EQ-01', incidentId: 'EQ-01', missionId, type: 'STRUCTURAL_COLLAPSE', location: 'County Hospital Annex Structural Failure', zoneId: 'D', severity: 'CRITICAL', source: 'USAR Tactical Recon', confidence: 96, status: 'ACTIVE', timestamp: '14:32:05', summary: 'Emergency structural shoring needed to extract 40+ trapped patients.' },
      { id: 'EQ-02', incidentId: 'EQ-02', missionId, type: 'GAS_LINE_RUPTURE', location: 'Sector B Commercial Gas Main Rupture', zoneId: 'B', severity: 'HIGH', source: 'Fire Command 911', confidence: 91, status: 'ACTIVE', timestamp: '14:34:20', summary: 'High explosive gas concentrations; electric grid isolated.' },
      { id: 'EQ-03', incidentId: 'EQ-03', missionId, type: 'VIADUCT_BUCKLING', location: 'West Viaduct Seismic Overpass Compromised', zoneId: 'C', severity: 'HIGH', source: 'Highway Patrol DOT', confidence: 88, status: 'ACTIVE', timestamp: '14:36:12', summary: 'Bridge deck shear displacement halts heavy convoy transit.' }
    ];
  }

  if (normType === 'TORNADO') {
    return [
      { id: 'TOR-01', incidentId: 'TOR-01', missionId, type: 'DIRECT_VORTEX_IMPACT', location: 'Prairie Residential Subdivision Leveled', zoneId: 'D', severity: 'CRITICAL', source: 'Ground Spotter Network', confidence: 98, status: 'ACTIVE', timestamp: '14:32:05', summary: 'Direct EF-4 swath crossing unreinforced residential frame housing.' },
      { id: 'TOR-02', incidentId: 'TOR-02', missionId, type: 'GRID_POWER_SEVERED', location: 'Highway 81 High-Voltage Transmission Tower Sheared', zoneId: 'B', severity: 'HIGH', source: 'Utility Operations Center', confidence: 94, status: 'ACTIVE', timestamp: '14:34:10', summary: 'Live high-voltage conductors blocking primary medical corridor.' },
      { id: 'TOR-03', incidentId: 'TOR-03', missionId, type: 'SHELTER_OVERCROWDING', location: 'District Underground Storm Bunker Overcapacity', zoneId: 'C', severity: 'WARNING', source: 'Emergency Management', confidence: 89, status: 'ACTIVE', timestamp: '14:36:45', summary: 'Overflow redirected to secondary fortified basements.' }
    ];
  }

  if (normType === 'WILDFIRE' || normType === 'FIRE') {
    return [
      { id: 'WF-01', incidentId: 'WF-01', missionId, type: 'CROWN_FIRE_FLASHOVER', location: 'Western Ridge Timberline Crown Flashover', zoneId: 'C', severity: 'CRITICAL', source: 'NASA FIRMS Satellite Telemetry', confidence: 95, status: 'ACTIVE', timestamp: '14:32:05', summary: 'Crown fire flame lengths exceeding 25 meters moving at 4.2 km/h.' },
      { id: 'WF-02', incidentId: 'WF-02', missionId, type: 'EVACUATION_SMOKE_HAZARD', location: 'Canyon Highway Zero-Visibility Smoke Corridor', zoneId: 'D', severity: 'CRITICAL', source: 'State Highway Patrol', confidence: 92, status: 'ACTIVE', timestamp: '14:34:50', summary: 'Heavy pyrocumulus smoke traps civilian vehicular convoy.' },
      { id: 'WF-03', incidentId: 'WF-03', missionId, type: 'EMBER_ATTACK', location: 'Commercial Perimeter Secondary Spot Fire', zoneId: 'B', severity: 'WARNING', source: 'Lookout Tower 4', confidence: 87, status: 'ACTIVE', timestamp: '14:37:10', summary: 'Ember spotting ignited dry brush across defensive firebreak.' }
    ];
  }

  if (normType === 'LANDSLIDE') {
    return [
      { id: 'LS-01', incidentId: 'LS-01', missionId, type: 'ROAD_BURIED', location: 'Mountain Highway Buried by 15,000m³ Flow', zoneId: 'D', severity: 'CRITICAL', source: 'Geotechnical Field Scout', confidence: 96, status: 'ACTIVE', timestamp: '14:32:05', summary: 'Primary clinic transit route blocked by 4-meter colluvial mud wall.' },
      { id: 'LS-02', incidentId: 'LS-02', missionId, type: 'DEBRIS_DAM_BREACH', location: 'River Confluence Colluvial Mud Blockage', zoneId: 'C', severity: 'HIGH', source: 'USGS Hydrologic Sensor', confidence: 90, status: 'ACTIVE', timestamp: '14:35:15', summary: 'Impounded upstream backwater threatens sudden surge break.' }
    ];
  }

  if (normType === 'CYCLONE' || normType === 'STORM') {
    return [
      { id: 'CYC-01', incidentId: 'CYC-01', missionId, type: 'MUNICIPAL_SEAWALL_BREACH', location: 'Biscayne Bay 4.2m Surge Overtopping Seawall', zoneId: 'C', severity: 'CRITICAL', source: 'Coast Guard Harbor Master', confidence: 97, status: 'ACTIVE', timestamp: '14:32:05', summary: 'Harbor docks and coastal promenade completely inundated by seawater surge.' },
      { id: 'CYC-02', incidentId: 'CYC-02', missionId, type: 'HOSPITAL_BASEMENT_SUBMERGED', location: 'Maritime Trauma Wing Auxiliary Power Flooded', zoneId: 'D', severity: 'CRITICAL', source: 'Hospital Facility Command', confidence: 94, status: 'ACTIVE', timestamp: '14:34:40', summary: 'ICU ventilators operating on emergency auxiliary battery pods.' }
    ];
  }

  return [];
}

// GET /api/missions/:missionId/incidents
export async function getIncidentsByMission(req, res) {
  const mId = req.params.missionId;
  const state = getWorldState();

  if (isDBConnected()) {
    try {
      const dbIncidents = await Incident.find({ missionId: mId });
      if (dbIncidents && dbIncidents.length > 0) return res.json(dbIncidents);
    } catch (err) {
      console.warn('[AEGIS-INCIDENT] DB find error:', err.message);
    }
  }

  if (mId === '027' || mId === state.incidentId) {
    return res.json(state.incidents);
  }

  const demoMatch = DEMO_MISSIONS.find(m => m.missionId === mId);
  if (demoMatch) {
    const hazardIncidents = generateDemoIncidentsForHazard(mId, demoMatch.disasterType);
    return res.json(hazardIncidents);
  }

  return res.status(404).json({ error: "Mission not found" });
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
