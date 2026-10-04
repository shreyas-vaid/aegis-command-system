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
import { connectDB } from './config/db.js';

// Mongoose Models
import Mission from './models/Mission.js';
import Zone from './models/Zone.js';
import Incident from './models/Incident.js';
import Resource from './models/Resource.js';
import Simulation from './models/Simulation.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ─── MIDDLEWARE ──────────────────────────────────────────────────────
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));

app.use(express.json());

// ─── 1. HEALTH CHECK ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "AEGIS API",
    version: "1.0.0"
  });
});

// ─── 2. MISSIONS API ─────────────────────────────────────────────────
// GET /api/missions — Return all missions
app.get('/api/missions', async (req, res) => {
  try {
    const missions = await Mission.find().lean();
    res.status(200).json(missions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch missions", details: err.message });
  }
});

// GET /api/missions/:id — Return single mission details
app.get('/api/missions/:id', async (req, res) => {
  try {
    const mission = await Mission.findOne({ missionId: req.params.id }).lean();
    if (!mission) {
      return res.status(404).json({ error: "Mission not found" });
    }
    res.status(200).json(mission);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch mission", details: err.message });
  }
});

// ─── 3. MISSION-SCOPED NESTED ENDPOINTS ──────────────────────────────
// GET /api/missions/:id/zones — Return sectors for this mission
app.get('/api/missions/:id/zones', async (req, res) => {
  try {
    const zones = await Zone.find({ missionId: req.params.id }).lean();
    res.status(200).json(zones);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch zones", details: err.message });
  }
});

// GET /api/missions/:id/incidents — Return incidents for this mission
app.get('/api/missions/:id/incidents', async (req, res) => {
  try {
    const incidents = await Incident.find({ missionId: req.params.id }).lean();
    res.status(200).json(incidents);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch incidents", details: err.message });
  }
});

// GET /api/missions/:id/resources — Return available resources for this mission
app.get('/api/missions/:id/resources', async (req, res) => {
  try {
    const resources = await Resource.find({ missionId: req.params.id }).lean();
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

    // Deterministic simulation rules
    const simulatedZones = zones.map(z => {
      let riskDelta = 0;
      if (timeOffset >= 30 && z.roadAccess < 30) riskDelta += 4;
      if (timeOffset >= 60 && z.infrastructure < 40) riskDelta += 8;

      // Deduction if commander dispatched an action
      const hasAction = actions.some(a => (a.zoneId || a.zone) === z.zoneId);
      if (hasAction) riskDelta -= 12;

      const newRisk = Math.min(99, Math.max(10, z.risk + riskDelta));
      const newRoadAccess = Math.max(5, z.roadAccess - Math.round(timeOffset / 12));
      const newHospitalAccess = z.zoneId === 'D'
        ? Math.max(5, z.hospitalAccess - Math.round(timeOffset / 4))
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
      simulationId,
      missionId,
      timeOffset,
      systemStatus: "SIMULATED FUTURE STATE",
      notice: "SIMULATED FUTURE STATE — Deterministic projection. Not a predictive AI model.",
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
    });

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

    if (targetZone === 'D' || (zone && zone.risk >= 80)) {
      recommendations.push({
        action: "Deploy medical unit",
        reason: "Hospital intake access is critical",
        priority: "HIGH"
      });
      recommendations.push({
        action: "Redirect rescue resources",
        reason: "Road accessibility is severely reduced",
        priority: "HIGH"
      });
    } else if (zone && zone.roadAccess < 30) {
      recommendations.push({
        action: "Deploy engineering unit",
        reason: "Road accessibility is severely reduced",
        priority: "HIGH"
      });
    } else {
      recommendations.push({
        action: "Maintain passive monitoring",
        reason: "Sector parameters are within stable baseline",
        priority: "LOW"
      });
    }

    res.status(200).json({
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
      const server = app.listen(PORT, () => {
        console.log(`AEGIS Server listening on port ${PORT}`);
        console.log(`CORS enabled for: ${CLIENT_URL}`);
        console.log(`Health check: http://localhost:${PORT}/api/health`);
        resolve(server);
      });
    });
  } catch (err) {
    console.error('Server startup halted due to database error.');
    process.exit(1);
  }
}

// Auto-run if executed as main module
if (process.argv[1]?.replace(/\\/g, '/').endsWith('src/server.js')) {
  startServer();
}

export default app;
