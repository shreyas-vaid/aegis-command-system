/**
 * AEGIS API Server — Complete Backend Foundation
 * ────────────────────────────────────────────────────────────────────
 * Express + MongoDB Atlas + Mongoose
 * ────────────────────────────────────────────────────────────────────
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';

// Mongoose Models
import Mission from './models/Mission.js';
import Zone from './models/Zone.js';
import Incident from './models/Incident.js';
import Resource from './models/Resource.js';
import Simulation from './models/Simulation.js';
import User from './models/User.js';
import Organization from './models/Organization.js';

// Routes & Middleware
import authRoutes from './routes/authRoutes.js';
import organizationRoutes from './routes/organizationRoutes.js';
import missionRoutes from './routes/missionRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import { requireAuth } from './middleware/auth.js';
import { getMe } from './controllers/authController.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ─── CORS CONFIGURATION ──────────────────────────────────────────────
const rawOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(url => url.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([
  ...rawOrigins,
  ...rawOrigins.map(url => url.replace(/\/+$/, '')),
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
])).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Render health checks, curl, server-to-server)
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.replace(/\/+$/, '');
    if (allowedOrigins.includes(origin) || allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true
}));

app.use(express.json());

// ─── AUTHENTICATION & IDENTITY ROUTES ─────────────────────────────────
app.use('/api/auth', authRoutes);
app.get('/api/users/me', requireAuth, getMe);

// ─── ORGANIZATION ROUTES ──────────────────────────────────────────────
app.use('/api/organizations', organizationRoutes);


// ─── 1. HEALTH CHECK ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "AEGIS API",
    version: "1.0.0"
  });
});

// ─── 2. MISSIONS / OPERATIONS API ────────────────────────────────────
app.use('/api/missions', missionRoutes);

// ─── LOCATION INTELLIGENCE API ──────────────────────────────────────
app.use('/api/locations', locationRoutes);

// ─── 3. MISSION-SCOPED NESTED ENDPOINTS ──────────────────────────────
// GET /api/missions/:id/zones — Return sectors for this mission
app.get('/api/missions/:id/zones', async (req, res) => {
  try {
    let zones = await Zone.find({ missionId: req.params.id }).lean();
    if (!zones || zones.length === 0) {
      // Fallback to standard sector layout if newly created operation
      zones = await Zone.find({ missionId: "027" }).lean();
    }
    res.status(200).json(zones);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch zones", details: err.message });
  }
});

// GET /api/missions/:id/incidents — Return incidents for this mission
app.get('/api/missions/:id/incidents', async (req, res) => {
  try {
    let incidents = await Incident.find({ missionId: req.params.id }).lean();
    if (!incidents || incidents.length === 0) {
      incidents = await Incident.find({ missionId: "027" }).lean();
    }
    res.status(200).json(incidents);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch incidents", details: err.message });
  }
});

// GET /api/missions/:id/resources — Return available resources for this mission
app.get('/api/missions/:id/resources', async (req, res) => {
  try {
    let resources = await Resource.find({ missionId: req.params.id }).lean();
    if (!resources || resources.length === 0) {
      resources = await Resource.find({ missionId: "027" }).lean();
    }
    res.status(200).json(resources);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch resources", details: err.message });
  }
});

// ─── 4. ZONE TELEMETRY & XAI EXPLAINABILITY ──────────────────────────
// GET /api/zones/:id — Detailed zone information
app.get('/api/zones/:id', async (req, res) => {
  try {
    const targetId = req.params.id.toUpperCase();
    const zone = await Zone.findOne({ zoneId: targetId }).lean();
    if (!zone) {
      return res.status(404).json({ error: "Zone not found" });
    }
    res.status(200).json(zone);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch zone", details: err.message });
  }
});

// GET /api/zones/:id/explain — Explainable risk breakdown
app.get('/api/zones/:id/explain', async (req, res) => {
  try {
    const targetId = req.params.id.toUpperCase();
    const zone = await Zone.findOne({ zoneId: targetId }).lean();
    if (!zone) {
      return res.status(404).json({ error: "Zone not found" });
    }

    // Deterministic factor breakdown labeled as simulated demo values
    const weatherImpact = Math.min(35, Math.round(((zone.risk || 50) / 100) * 32));
    const roadImpact = Math.min(30, Math.round(((100 - (zone.roadAccess || 50)) / 100) * 28));
    const infraImpact = Math.min(25, Math.round(((100 - (zone.infrastructure || 50)) / 100) * 24));

    const dominantTrigger = targetId === "D"
      ? "Road 17 culvert washout completely severed ambulance transit corridor to South General Hospital."
      : targetId === "C"
      ? "River Basin crest (+3.4m) threatening Bridge 17 structural pylons."
      : targetId === "E"
      ? "88% telecom blackout obscuring 140+ stalled vehicles in industrial delta."
      : `Atmospheric precipitation and local infrastructure pressure on Sector ${targetId}.`;

    res.status(200).json({
      zoneId: zone.zoneId,
      name: zone.name,
      risk: zone.risk,
      label: "AEGIS SIMULATED RISK BREAKDOWN",
      notice: "SIMULATED DEMO VALUES — Not real physical disaster measurements.",
      factors: [
        { factor: "Flood exposure", impact: targetId === "D" ? 32 : weatherImpact },
        { factor: "Road accessibility", impact: targetId === "D" ? 24 : roadImpact },
        { factor: "Infrastructure stress", impact: targetId === "D" ? 21 : infraImpact }
      ],
      factorBreakdown: [
        { name: "Heavy rainfall impact", points: targetId === "D" ? 31 : weatherImpact },
        { name: "Road accessibility degradation", points: targetId === "D" ? 24 : roadImpact },
        { name: "Infrastructure stress & breaches", points: targetId === "D" ? 21 : infraImpact }
      ],
      dominantTrigger
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate risk breakdown", details: err.message });
  }
});

// ─── 5. RESOURCE ASSIGNMENT ──────────────────────────────────────────
// POST /api/resources/:id/assign — Assign resource to a sector
app.post('/api/resources/:id/assign', async (req, res) => {
  try {
    const rawId = req.params.id;
    const { zoneId } = req.body;

    if (!zoneId) {
      return res.status(400).json({ error: "Missing zoneId in request body" });
    }

    const targetZone = zoneId.toUpperCase();

    // Find resource by ObjectId or type/name
    let resource = null;
    if (mongoose.Types.ObjectId.isValid(rawId)) {
      resource = await Resource.findByIdAndUpdate(
        rawId,
        { currentZone: targetZone, status: "DEPLOYED" },
        { new: true }
      );
    }
    if (!resource) {
      resource = await Resource.findOneAndUpdate(
        { type: rawId.toUpperCase() },
        { currentZone: targetZone, status: "DEPLOYED" },
        { new: true }
      );
    }
    if (!resource) {
      resource = await Resource.findOneAndUpdate(
        { name: new RegExp(rawId, 'i') },
        { currentZone: targetZone, status: "DEPLOYED" },
        { new: true }
      );
    }

    if (!resource) {
      return res.status(404).json({ error: "Resource not found" });
    }

    res.status(200).json({
      success: true,
      message: `Resource assigned to Zone ${targetZone}`,
      resource
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to assign resource", details: err.message });
  }
});

// ─── 6. SIMULATION ENGINE ────────────────────────────────────────────
// POST /api/simulations — Deterministic forward projection
app.post('/api/simulations', async (req, res) => {
  try {
    const { missionId = "027", timeOffset = 30, actions = [] } = req.body || {};

    const zones = await Zone.find({ missionId }).lean();
    const incidents = await Incident.find({ missionId }).lean();
    const resources = await Resource.find({ missionId }).lean();

    // Deterministic simulation rules:
    // Higher risk + poor infrastructure + poor road access -> increased future risk
    // Assigned rescue/medical resources -> reduce selected risk factors
    const simulatedZones = zones.map(z => {
      let riskDelta = 0;
      if (z.roadAccess < 35) riskDelta += Math.round(timeOffset / 8);
      if (z.infrastructure < 45) riskDelta += Math.round(timeOffset / 10);
      if (z.risk > 70) riskDelta += Math.round(timeOffset / 12);

      // Deduction if commander dispatched an action
      const hasAction = actions.some(a => (a.zoneId || a.zone) === z.zoneId);
      if (hasAction) riskDelta -= 14;

      const newRisk = Math.min(99, Math.max(10, z.risk + riskDelta));
      const newRoadAccess = Math.max(0, z.roadAccess - Math.round(timeOffset / 10));
      const newHospitalAccess = z.zoneId === 'D'
        ? Math.max(0, z.hospitalAccess - Math.round(timeOffset / 3))
        : z.hospitalAccess;

      return {
        ...z,
        risk: newRisk,
        roadAccess: newRoadAccess,
        hospitalAccess: newHospitalAccess,
        health: Math.max(1, 100 - newRisk),
        status: newRisk >= 80 ? 'CRITICAL' : newRisk >= 60 ? 'HIGH_RISK' : 'STABLE'
      };
    });

    const simulationId = `SIM-${Date.now().toString().slice(-4)}`;
    const simResult = {
      status: "SIMULATED",
      simulationId,
      missionId,
      timeOffset,
      systemStatus: "SIMULATED PROJECTION",
      notice: "SIMULATED PROJECTION — Deterministic projection. Not a predictive AI model.",
      hospitalStatus: timeOffset >= 30 ? "CRITICAL_LOAD (94%)" : "ELEVATED_LOAD (72%)",
      zones: simulatedZones,
      incidents,
      resources,
      createdAt: new Date().toISOString()
    };

    // Store in Simulation collection
    await Simulation.create({
      missionId,
      timeOffset,
      actions,
      result: simResult
    }).catch(() => null);

    res.status(200).json(simResult);
  } catch (err) {
    res.status(500).json({ error: "Simulation failed", details: err.message });
  }
});

// ─── 7. AI DECISION SUPPORT RECOMMENDATION ────────────────────────────
// POST /api/recommend — Structured decision-support recommendations
app.post('/api/recommend', async (req, res) => {
  try {
    const { missionId = "027", zoneId = "D" } = req.body || {};
    const targetZone = (zoneId || 'D').toUpperCase();

    const zone = await Zone.findOne({ zoneId: targetZone }).lean();

    const recommendations = [];

    // Simple rule-based explainable decision support:
    // 1. If hospitalAccess is critical -> recommend medical resource
    if (targetZone === 'D' || (zone && zone.hospitalAccess < 30)) {
      recommendations.push({
        action: "Deploy medical resource",
        reason: "Hospital intake access is critical (traffic severed)",
        priority: "HIGH"
      });
    }

    // 2. If roadAccess is low -> recommend rescue/route support
    if (targetZone === 'D' || (zone && zone.roadAccess < 30)) {
      recommendations.push({
        action: "Deploy rescue & route support",
        reason: "Road accessibility is severely reduced (<30%)",
        priority: "HIGH"
      });
    }

    // 3. If risk > 80 -> recommend immediate intervention
    if (targetZone === 'D' || (zone && zone.risk > 80)) {
      recommendations.push({
        action: "Immediate emergency intervention",
        reason: "Composite sector disaster risk exceeds 80 critical threshold",
        priority: "CRITICAL"
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        action: "Maintain tactical monitoring",
        reason: "Sector parameters within baseline limits",
        priority: "LOW"
      });
    }

    res.status(200).json({
      status: "SIMULATED",
      engine: "AEGIS DECISION SUPPORT",
      system: "SIMULATED RECOMMENDATION ENGINE",
      notice: "Rule-based decision support. Not a trained AI model.",
      missionId,
      zoneId: targetZone,
      recommendations
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate recommendations", details: err.message });
  }
});

// Also support GET /api/recommend for frontend planner
app.get('/api/recommend', async (req, res) => {
  res.status(200).json({
    engine: "AEGIS DECISION SUPPORT",
    system: "SIMULATED RECOMMENDATION ENGINE",
    notice: "Rule-based decision support. Not a trained AI model.",
    title: "AEGIS Strategic Co-Pilot: Critical Point Intervention",
    assignments: {
      engineering: { C: 2, D: 2, A: 0, B: 0, E: 0 },
      medical:     { D: 3, C: 1, E: 1, A: 0, B: 0 },
      fire:        { E: 2, C: 1, A: 0, B: 0, D: 0 },
      logistics:   { B: 4, C: 2, D: 1, A: 1, E: 0 }
    },
    recommendations: [
      {
        action: "Deploy medical unit",
        reason: "Hospital intake access is critical",
        priority: "HIGH"
      },
      {
        action: "Redirect rescue resources",
        reason: "Road accessibility is severely reduced",
        priority: "HIGH"
      }
    ]
  });
});

// ─── 8. FRONTEND COMPATIBILITY ROUTES ────────────────────────────────
// GET /api/state — Full digital twin state for React frontend
app.get('/api/state', async (req, res) => {
  try {
    const mission = await Mission.findOne({ missionId: "027" }).lean() || {};
    const zones = await Zone.find({ missionId: "027" }).lean();
    const incidents = await Incident.find({ missionId: "027" }).lean();
    const resourcesList = await Resource.find({ missionId: "027" }).lean();

    res.status(200).json({
      incidentId: "027",
      title: "Flash Flood Cascade",
      cityHealth: 70,
      activeAlerts: 7,
      unknownZones: 1,
      hospitalLoad: 72,
      zones: zones.map(z => ({
        ...z,
        id: z.zoneId,
        roads: z.roadAccess
      })),
      incidents,
      resources: {
        total: { medical: 5, fire: 3, logistics: 8, engineering: 4 },
        available: { medical: 5, fire: 3, logistics: 8, engineering: 4 },
        deployed: {
          medical: { A: 0, B: 0, C: 0, D: 0, E: 0 },
          fire: { A: 0, B: 0, C: 0, D: 0, E: 0 },
          logistics: { A: 0, B: 0, C: 0, D: 0, E: 0 },
          engineering: { A: 0, B: 0, C: 0, D: 0, E: 0 }
        }
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load state", details: err.message });
  }
});

// ─── START SERVER ────────────────────────────────────────────────────
export async function startServer() {
  try {
    await connectDB();

    return new Promise((resolve) => {
      const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`AEGIS Server listening on 0.0.0.0:${PORT}`);
        console.log(`CORS enabled for: ${CLIENT_URL}`);
        console.log(`Health check: http://0.0.0.0:${PORT}/api/health`);
        resolve(server);
      });
    });
  } catch (err) {
    console.error('Server startup halted due to database error.');
    process.exit(1);
  }
}

// Auto-run if executed as main module
const currentFilePath = fileURLToPath(import.meta.url);
const isDirectRun = process.argv[1] && (
  path.resolve(process.argv[1]) === path.resolve(currentFilePath) ||
  process.argv[1].replace(/\\/g, '/').endsWith('src/server.js')
);

if (isDirectRun) {
  startServer();
}

export default app;
