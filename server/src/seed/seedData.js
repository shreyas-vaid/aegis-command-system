/**
 * AEGIS Seed Data — Phase 2: MongoDB Data Layer
 * ────────────────────────────────────────────────────────────────────
 * DISCLAIMER:
 * All records in this file represent SIMULATED / DEMO values for
 * crisis response prototyping and scenario validation.
 * These do NOT represent real-world physical disaster measurements.
 * ────────────────────────────────────────────────────────────────────
 */

import 'dotenv/config';
import { connectDB, closeDB } from '../config/db.js';
import Mission from '../models/Mission.js';
import Zone from '../models/Zone.js';
import Incident from '../models/Incident.js';
import Resource from '../models/Resource.js';
import Organization from '../models/Organization.js';
import { getOrCreateDefaultOrg, DEFAULT_DEMO_ORG } from '../services/organizationService.js';

export const DEMO_MISSION = {
  missionId: "027",
  name: "Flash Flood Cascade",
  description: "Torrential storm cell stalled over River Basin. Flood waters cresting at +3.4m, threatening urban sectors.",
  disasterType: "FLOOD",
  locationName: "Chandigarh",
  latitude: 30.7333,
  longitude: 76.7794,
  severity: "CRITICAL",
  status: "ACTIVE"
};

export const DEMO_ZONES = [
  {
    zoneId: "A",
    missionId: "027",
    name: "North Uplands",
    risk: 18,
    population: 4100,
    health: 82,
    roadAccess: 88,
    infrastructure: 92,
    reports: 2,
    connectivity: 98,
    hospitalAccess: 95,
    status: "STABLE"
  },
  {
    zoneId: "B",
    missionId: "027",
    name: "Commercial District",
    risk: 48,
    population: 8400,
    health: 52,
    roadAccess: 64,
    infrastructure: 74,
    reports: 6,
    connectivity: 89,
    hospitalAccess: 70,
    status: "WARNING"
  },
  {
    zoneId: "C",
    missionId: "027",
    name: "River Basin & Bridge 17",
    risk: 74,
    population: 3600,
    health: 26,
    roadAccess: 38,
    infrastructure: 45,
    reports: 11,
    connectivity: 68,
    hospitalAccess: 40,
    status: "HIGH_RISK"
  },
  {
    zoneId: "D",
    missionId: "027",
    name: "South Sector & Hospital",
    risk: 96,
    population: 2900,
    health: 4,
    roadAccess: 22,
    infrastructure: 39,
    reports: 14,
    connectivity: 42,
    hospitalAccess: 18,
    status: "CRITICAL"
  },
  {
    zoneId: "E",
    missionId: "027",
    name: "East Industrial Delta",
    risk: 78,
    population: 1850,
    health: 22,
    roadAccess: 25,
    infrastructure: 30,
    reports: 0,
    connectivity: 12,
    hospitalAccess: 10,
    status: "UNKNOWN"
  }
];

export const DEMO_INCIDENTS = [
  {
    missionId: "027",
    type: "FLASH_FLOODING",
    location: "River Basin / Road 17 Arterial",
    severity: "CRITICAL",
    source: "Emergency Dispatch 911",
    confidence: 96,
    status: "ACTIVE",
    timestamp: "14:32:05"
  },
  {
    missionId: "027",
    type: "HOSPITAL_ACCESS_FAILURE",
    location: "South General Trauma Corridor",
    severity: "CRITICAL",
    source: "EMS Radio Feed Unit #12",
    confidence: 98,
    status: "ACTIVE",
    timestamp: "14:34:18"
  },
  {
    missionId: "027",
    type: "INFRASTRUCTURE_STRESS",
    location: "Bridge 17 Western Abutment",
    severity: "HIGH",
    source: "SAR Satellite Radar (Sentinel-1)",
    confidence: 91,
    status: "ACTIVE",
    timestamp: "14:35:40"
  },
  {
    missionId: "027",
    type: "COMMUNICATION_BLACKOUT",
    location: "East Industrial Delta Grid",
    severity: "HIGH",
    source: "Telecom Sensor Network",
    confidence: 99,
    status: "ACTIVE",
    timestamp: "14:36:02"
  },
  {
    missionId: "027",
    type: "EXTREME_HYDRO_METEOROLOGY",
    location: "North-West Drainage Basin",
    severity: "SEVERE",
    source: "Doppler Weather Radar",
    confidence: 95,
    status: "ACTIVE",
    timestamp: "14:36:50"
  }
];

export const DEMO_RESOURCES = [
  {
    missionId: "027",
    type: "AMBULANCE",
    name: "ALS Mobile Field Units & Ambulances",
    status: "AVAILABLE",
    currentZone: "A",
    capacity: 5
  },
  {
    missionId: "027",
    type: "RESCUE_TEAM",
    name: "Amphibious Swiftwater Rescue Teams",
    status: "AVAILABLE",
    currentZone: "A",
    capacity: 3
  },
  {
    missionId: "027",
    type: "MEDICAL_UNIT",
    name: "Trauma Core Mobile Response Units",
    status: "AVAILABLE",
    currentZone: "A",
    capacity: 5
  },
  {
    missionId: "027",
    type: "SHELTER",
    name: "High-Ground Emergency Shelter Facilities",
    status: "AVAILABLE",
    currentZone: "A",
    capacity: 4
  },
  {
    missionId: "027",
    type: "COMMUNICATION_UNIT",
    name: "Mobile Satellite Mesh & Drone Relays",
    status: "AVAILABLE",
    currentZone: "A",
    capacity: 4
  }
];

export async function seedDatabase() {
  console.log('Connecting to MongoDB for seeding...');
  await connectDB();

  // Ensure default demo organization exists
  const demoOrg = await getOrCreateDefaultOrg();
  DEMO_MISSION.organizationId = demoOrg._id;

  // 1. Clear existing AEGIS seed data
  await Promise.all([
    Mission.deleteMany({ missionId: "027" }),
    Zone.deleteMany({ missionId: "027" }),
    Incident.deleteMany({ missionId: "027" }),
    Resource.deleteMany({ missionId: "027" })
  ]);

  // 2. Insert Demo Mission
  const mission = await Mission.create(DEMO_MISSION);

  // 3. Insert Zones
  const zones = await Zone.insertMany(DEMO_ZONES);

  // 4. Insert Incidents
  const incidents = await Incident.insertMany(DEMO_INCIDENTS);

  // 5. Insert Resources
  const resources = await Resource.insertMany(DEMO_RESOURCES);

  // 6. Close database connection
  await closeDB();

  // 7. Success message format
  console.log('');
  console.log('AEGIS DATABASE');
  console.log('---------------');
  console.log(`Mission seeded: ${mission.missionId}`);
  console.log(`Zones seeded: ${zones.length}`);
  console.log(`Incidents seeded: ${incidents.length}`);
  console.log(`Resources seeded: ${resources.length}`);
  console.log('');
  console.log('DATABASE SEED COMPLETE');
  console.log('');

  return {
    missionCount: 1,
    zoneCount: zones.length,
    incidentCount: incidents.length,
    resourceCount: resources.length
  };
}

// Auto-run when executed directly via CLI: `node src/seed/seedData.js` or `npm run seed`
if (process.argv[1]?.replace(/\\/g, '/').endsWith('seedData.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed process failed:', err.message);
      process.exit(1);
    });
}
