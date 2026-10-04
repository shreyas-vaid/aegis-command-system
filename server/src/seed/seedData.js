/**
 * AEGIS Seed Data — Scenario #027: Flash Flood Cascade
 *
 * This module contains the baseline data model for the demo scenario.
 * All values are SIMULATED / DEMO and clearly marked as such.
 * Structure is designed so real sensor feeds can replace this data later.
 */

// ─── WEATHER BASELINE ────────────────────────────────────────────────
export const INITIAL_WEATHER = {
  rainfall: 42,              // mm/h
  wind: 68,                  // km/h
  visibility: 4.8,           // km
  barometricPressure: 988,   // hPa
  riverCrestMeters: 3.4,
  floodStage: "Stage 3 - Major Inundation"
};

// ─── RESOURCE POOL ───────────────────────────────────────────────────
export const INITIAL_RESOURCES = {
  medical: 5,
  fire: 3,
  logistics: 8,
  engineering: 4,
  deployed: {
    medical:      { A: 0, B: 0, C: 0, D: 0, E: 0 },
    fire:         { A: 0, B: 0, C: 0, D: 0, E: 0 },
    logistics:    { A: 0, B: 0, C: 0, D: 0, E: 0 },
    engineering:  { A: 0, B: 0, C: 0, D: 0, E: 0 }
  }
};

// ─── ZONE DEFINITIONS ────────────────────────────────────────────────
export const INITIAL_ZONES = [
  {
    id: "A",
    name: "North Uplands",
    type: "Residential / Staging",
    population: 4100,
    roads: 88,
    infrastructure: 92,
    reports: 2,
    connectivity: 98,
    isUnknown: false,
    gpsActivity: "NORMAL",
    imageryAge: "12m ago",
    floodLevel: 0.2,
    keyAsset: "Reservoir Intake & High-Ground Staging Area",
    coordinates: { x: 22, y: 20 },
    previousRisk: 14
  },
  {
    id: "B",
    name: "Commercial District",
    type: "Transit & Commercial Hub",
    population: 8400,
    roads: 64,
    infrastructure: 74,
    reports: 6,
    connectivity: 89,
    isUnknown: false,
    gpsActivity: "CONGESTED",
    imageryAge: "18m ago",
    floodLevel: 0.8,
    keyAsset: "Central Transit Interchange & Power Substation #1",
    coordinates: { x: 50, y: 32 },
    previousRisk: 42
  },
  {
    id: "C",
    name: "River Basin & Bridge 17",
    type: "Industrial Waterfront",
    population: 3600,
    roads: 38,
    infrastructure: 45,
    reports: 11,
    connectivity: 68,
    isUnknown: false,
    gpsActivity: "STALLED",
    imageryAge: "8m ago",
    floodLevel: 3.4,
    keyAsset: "Bridge 17 (Sole Heavy Arterial Crossing) & Flood Berm",
    coordinates: { x: 42, y: 62 },
    previousRisk: 61
  },
  {
    id: "D",
    name: "South Sector & Hospital",
    type: "Dense Urban / Trauma Center",
    population: 2900,
    roads: 22,
    infrastructure: 39,
    reports: 14,
    connectivity: 42,
    isUnknown: false,
    gpsActivity: "CRITICAL_GRIDLOCK",
    imageryAge: "6m ago",
    floodLevel: 2.9,
    keyAsset: "South General Hospital (Regional Level-1 Trauma Center)",
    coordinates: { x: 74, y: 72 },
    previousRisk: 61
  },
  {
    id: "E",
    name: "East Industrial Delta",
    type: "Lowland Delta & Storage",
    population: 1850,
    roads: 25,
    infrastructure: 30,
    reports: 0,
    connectivity: 12,
    isUnknown: true,
    gpsActivity: "HIGH",
    imageryAge: "3.5h ago (Cloud Obscured)",
    floodLevel: 3.2,
    keyAsset: "Petrochemical Terminal & Rail Yard",
    coordinates: { x: 80, y: 28 },
    previousRisk: 0
  }
];

// ─── INCIDENTS ───────────────────────────────────────────────────────
export const INITIAL_INCIDENTS = [
  {
    id: 182,
    type: "Flash Flooding",
    zone: "C",
    location: "River Basin / Road 17 Arterial",
    source: "Emergency Dispatch 911",
    severity: "CRITICAL",
    confidence: 96,
    summary: "Rapid water expansion cresting banks by +3.4m. Inundating primary dual-carriageway.",
    timestamp: "14:32:05",
    status: "ACTIVE"
  },
  {
    id: 189,
    type: "Hospital Access Failure",
    zone: "D",
    location: "South General Trauma Corridor",
    source: "EMS Radio Feed Unit #12",
    severity: "CRITICAL",
    confidence: 98,
    summary: "Road 17 culvert collapse completely blocks EMS access to South General Hospital.",
    timestamp: "14:34:18",
    status: "ACTIVE"
  },
  {
    id: 194,
    type: "Infrastructure Stress",
    zone: "C",
    location: "Bridge 17 Western Abutment",
    source: "SAR Satellite Radar (Sentinel-1)",
    severity: "HIGH",
    confidence: 91,
    summary: "Structural deflection of 14cm detected on main pylon; imminent scouring risk.",
    timestamp: "14:35:40",
    status: "ACTIVE"
  },
  {
    id: 201,
    type: "Communication Blackout",
    zone: "E",
    location: "East Industrial Delta Grid",
    source: "Telecom Sensor Network",
    severity: "HIGH",
    confidence: 99,
    summary: "Cell towers 4-A and 4-B down. Zero 911 telemetry. 140 transponders active but silent.",
    timestamp: "14:36:02",
    status: "ACTIVE"
  },
  {
    id: 205,
    type: "Extreme Hydro-Meteorology",
    zone: "Regional",
    location: "North-West Drainage Basin",
    source: "Doppler Weather Radar",
    severity: "SEVERE",
    confidence: 95,
    summary: "Localized rain bomb dumping 42mm/h, sustained wind gusts 68 km/h.",
    timestamp: "14:36:50",
    status: "ACTIVE"
  }
];

// ─── INVESTIGATION SIGNALS ──────────────────────────────────────────
export const INITIAL_SIGNALS = [
  {
    id: "weather",
    name: "WEATHER RADAR & HYDRO-METAR",
    category: "Atmospheric",
    headline: "HEAVY RAINFALL CELL",
    value: "42 mm/hr",
    confidence: 94,
    impact: "+31 RISK",
    source: "Doppler Hydro-Met Net",
    details: "Severe localized rain bomb stalled over North-West catchment basin. Soil saturation 99%.",
    collected: false
  },
  {
    id: "satellite",
    name: "SATELLITE SAR RADAR",
    category: "Orbital",
    headline: "BRIDGE 17 PYLON DEFLECTION",
    value: "14 cm lateral shift",
    confidence: 91,
    impact: "+22 RISK",
    source: "Sentinel-1 Synthetic Aperture",
    details: "Structural deflection detected on main western pier. Imminent foundation scouring under hydrodynamic load.",
    collected: false
  },
  {
    id: "calls",
    name: "EMERGENCY 911 CALL DISPATCH",
    category: "Civilian",
    headline: "ZONE D CASUALTY CLUSTER",
    value: "14 Calls / 0 in Zone E",
    confidence: 98,
    impact: "+18 RISK",
    source: "E-911 Emergency Dispatch",
    details: "Severe distress calls along South General trauma corridor. Complete silence from Zone E suggests total telecom blackout.",
    collected: false
  },
  {
    id: "roads",
    name: "ROADWAY INDUCTIVE SENSORS",
    category: "Traffic / Transit",
    headline: "ROAD 17 CULVERT WASHOUT",
    value: "Flow Dropped 98%",
    confidence: 97,
    impact: "+24 RISK",
    source: "DOT Loop Sensors #418",
    details: "Culvert washout on Road 17 completely blocks primary ambulance artery into South General Hospital.",
    collected: false
  },
  {
    id: "hospital",
    name: "HOSPITAL CAPACITY TELEMETRY",
    category: "Healthcare",
    headline: "TRAUMA INTAKE SATURATION",
    value: "72% Load & Rising",
    confidence: 99,
    impact: "+26 RISK",
    source: "South General Trauma Core",
    details: "Level-1 emergency bay at 72% capacity. Ambulance queue stalled on flooded access road.",
    collected: false
  },
  {
    id: "gps",
    name: "VEHICULAR GPS TELEMETRY",
    category: "Mobile Beacons",
    headline: "140+ STALLED VEHICLES IN DELTA",
    value: "Zero Velocity Cluster",
    confidence: 96,
    impact: "+19 RISK",
    source: "Fleet Transponder Network",
    details: "140+ transponders concentrated along East Delta industrial siding without movement for 45 minutes.",
    collected: false
  },
  {
    id: "infrastructure",
    name: "INFRASTRUCTURE SENSORS",
    category: "Structural",
    headline: "RIVER CREST AT +3.4M",
    value: "Stage 3 Inundation",
    confidence: 95,
    impact: "+20 RISK",
    source: "Basin IoT Piezometers",
    details: "Water level +3.4m over crest. Natural levee berm #2 experiencing high hydraulic pressure.",
    collected: false
  }
];

// ─── DEFAULT HUMAN PLAN ─────────────────────────────────────────────
export const DEFAULT_HUMAN_PLAN = {
  medical:     { A: 0, B: 0, C: 1, D: 3, E: 1 },
  engineering: { A: 0, B: 0, C: 2, D: 2, E: 0 },
  logistics:   { A: 1, B: 4, C: 2, D: 1, E: 0 },
  fire:        { A: 0, B: 0, C: 1, D: 0, E: 2 }
};

// ─── DATABASE SEED RUNNER ───────────────────────────────────────────
import mongoose from 'mongoose';
import 'dotenv/config';
import Mission from '../models/Mission.js';
import Zone from '../models/Zone.js';
import Incident from '../models/Incident.js';
import Resource from '../models/Resource.js';

export async function seedDatabase(customUri) {
  const uri = customUri || process.env.MONGODB_URI;

  if (!uri || uri.trim() === '') {
    console.log('[AEGIS-SEED] No MONGODB_URI configured in environment.');
    console.log('[AEGIS-SEED] The in-memory data store is loaded with baseline scenario #027.');
    console.log('[AEGIS-SEED] To seed MongoDB Atlas, add MONGODB_URI to server/.env and re-run.');
    return { success: true, mode: 'IN_MEMORY_READY' };
  }

  try {
    console.log('[AEGIS-SEED] Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('[AEGIS-SEED] Connected successfully.');

    // 1. Clear existing collections
    console.log('[AEGIS-SEED] Purging previous disaster records...');
    await Promise.all([
      Mission.deleteMany({}),
      Zone.deleteMany({}),
      Incident.deleteMany({}),
      Resource.deleteMany({})
    ]);

    // 2. Seed Mission #027
    console.log('[AEGIS-SEED] Inserting Mission #027 (Flash Flood Cascade)...');
    await Mission.create({
      missionId: "027",
      name: "Flash Flood Cascade",
      title: "HEAVY RAINFALL + FLASH FLOODING + INFRASTRUCTURE FAILURE",
      disasterType: "FLASH_FLOOD_CASCADE",
      severity: "CRITICAL",
      status: "ACTIVE",
      time: "14:37:21",
      weather: INITIAL_WEATHER
    });

    // 3. Seed Zones (A through E)
    console.log('[AEGIS-SEED] Inserting Sectors A through E...');
    const zonesToInsert = INITIAL_ZONES.map(z => ({
      zoneId: z.id,
      missionId: "027",
      name: z.name,
      risk: z.id === "D" ? 96 : z.id === "C" ? 74 : z.id === "E" ? 78 : z.id === "B" ? 48 : 18,
      population: z.population,
      health: z.id === "D" ? 4 : z.id === "C" ? 26 : z.id === "E" ? 22 : z.id === "B" ? 52 : 82,
      roadAccess: z.roads,
      roads: z.roads,
      infrastructure: z.infrastructure,
      reports: z.reports,
      connectivity: z.connectivity,
      hospitalAccess: z.id === "D" ? 18 : z.id === "C" ? 40 : z.id === "E" ? 10 : z.id === "B" ? 70 : 95,
      status: z.id === "D" ? "CRITICAL" : z.id === "C" ? "HIGH_RISK" : z.id === "E" ? "UNKNOWN" : z.id === "B" ? "WARNING" : "STABLE",
      type: z.type,
      isUnknown: z.isUnknown,
      gpsActivity: z.gpsActivity,
      imageryAge: z.imageryAge,
      floodLevel: z.floodLevel,
      keyAsset: z.keyAsset,
      coordinates: z.coordinates,
      previousRisk: z.previousRisk
    }));
    await Zone.insertMany(zonesToInsert);

    // 4. Seed Incidents
    console.log('[AEGIS-SEED] Inserting active incident logs...');
    const incidentsToInsert = INITIAL_INCIDENTS.map(i => ({
      incidentId: i.id,
      missionId: "027",
      type: i.type,
      location: i.location,
      zone: i.zone,
      source: i.source,
      severity: i.severity,
      confidence: i.confidence,
      summary: i.summary,
      timestamp: i.timestamp,
      status: "ACTIVE"
    }));
    await Incident.insertMany(incidentsToInsert);

    // 5. Seed Resources & Hospital State
    console.log('[AEGIS-SEED] Inserting tactical fleet resources...');
    const resourcesToInsert = [
      {
        missionId: "027",
        type: "medical",
        name: "ALS Mobile Field Units & Ambulances",
        status: "AVAILABLE",
        currentZone: "A",
        capacity: 5,
        total: INITIAL_RESOURCES.medical,
        deployed: INITIAL_RESOURCES.deployed.medical
      },
      {
        missionId: "027",
        type: "fire",
        name: "Amphibious Swiftwater Rescue Teams",
        status: "AVAILABLE",
        currentZone: "A",
        capacity: 3,
        total: INITIAL_RESOURCES.fire,
        deployed: INITIAL_RESOURCES.deployed.fire
      },
      {
        missionId: "027",
        type: "logistics",
        name: "Perimeter Routing & Supply Vehicles",
        status: "AVAILABLE",
        currentZone: "A",
        capacity: 8,
        total: INITIAL_RESOURCES.logistics,
        deployed: INITIAL_RESOURCES.deployed.logistics
      },
      {
        missionId: "027",
        type: "engineering",
        name: "Hydraulic Berm & Bridge Reinforcement Units",
        status: "AVAILABLE",
        currentZone: "A",
        capacity: 4,
        total: INITIAL_RESOURCES.engineering,
        deployed: INITIAL_RESOURCES.deployed.engineering
      }
    ];
    await Resource.insertMany(resourcesToInsert);

    console.log('────────────────────────────────────────────────────────');
    console.log('✅ [AEGIS-SEED] DATABASE SEEDED SUCCESSFULLY');
    console.log('   - 1 Active Mission (#027 Flash Flood Cascade)');
    console.log('   - 5 Zones (A, B, C, D, E) with complete telemetry');
    console.log('   - 5 Real-time Incidents (Road 17, Bridge 17, Delta Blackout)');
    console.log('   - 20 Fleet Units (Medical, Fire, Logistics, Engineering)');
    console.log('────────────────────────────────────────────────────────');

    return { success: true, mode: 'MONGODB_SEEDED' };
  } catch (err) {
    console.error('[AEGIS-SEED] Seeding error:', err.message);
    throw err;
  }
}

// Execute if run directly via CLI
if (process.argv[1]?.replace(/\\/g, '/').endsWith('seedData.js')) {
  seedDatabase()
    .then(() => {
      mongoose.disconnect();
      process.exit(0);
    })
    .catch(() => {
      mongoose.disconnect();
      process.exit(1);
    });
}

