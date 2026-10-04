/**
 * AEGIS API Server
 * ────────────────────────────────────────────────────────────────────
 * AI Emergency Governance & Intelligence System
 * Backend entry point — modular Express server.
 * ────────────────────────────────────────────────────────────────────
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { connectDB, isUsingInMemory, isDBConnected } from './config/db.js';

// Routes
import missionRoutes, { getState, resetMission } from './routes/missionRoutes.js';
import zoneRoutes, { getZonesByMission }          from './routes/zoneRoutes.js';
import incidentRoutes, { getIncidentsByMission }   from './routes/incidentRoutes.js';
import resourceRoutes, { getResourcesByMission, deployAction } from './routes/resourceRoutes.js';
import simulationRoutes, { getSimulationsByMission } from './routes/simulationRoutes.js';

// Controllers (direct mount for tactical & legacy endpoints)
import { getSignals, collectSignal, getZoneEInvestigation, investigateZoneE } from './controllers/investigationController.js';
import { getRecommendation, postRecommendation } from './controllers/recommendationController.js';
import { chessAction } from './controllers/chessController.js';
import { generateOutcome } from './controllers/outcomeController.js';
import { simulate } from './controllers/simulationController.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS CONFIGURATION ──────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    callback(new Error('Blocked by CORS policy'));
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// ─── HEALTH CHECK ────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: "ok",
    service: "AEGIS API",
    version: "2.5.0",
    mode: isDBConnected() ? "MONGODB" : "IN_MEMORY",
    database: isDBConnected() ? "CONNECTED" : "IN_MEMORY_FALLBACK",
    timestamp: new Date().toISOString()
  });
});

// ─── REST API ROUTES ─────────────────────────────────────────────────
app.use('/api/missions',     missionRoutes);
app.use('/api/zones',        zoneRoutes);
app.use('/api/incidents',    incidentRoutes);
app.use('/api/resources',    resourceRoutes);
app.use('/api/simulations',  simulationRoutes);

// ─── MISSION-SCOPED NESTED ROUTES ────────────────────────────────────
app.get('/api/missions/:missionId/zones',        getZonesByMission);
app.get('/api/missions/:missionId/incidents',     getIncidentsByMission);
app.get('/api/missions/:missionId/resources',     getResourcesByMission);
app.get('/api/missions/:missionId/simulations',   getSimulationsByMission);

// ─── AI RECOMMENDATION ENGINE ────────────────────────────────────────
app.get('/api/recommend',    getRecommendation);
app.post('/api/recommend',   postRecommendation);

// ─── LEGACY COMPATIBILITY ENDPOINTS ──────────────────────────────────
// Ensures existing digital twin and mission flow features remain 100% operational
app.get('/api/state',          getState);
app.post('/api/reset',         resetMission);
app.post('/api/simulate',      simulate);
app.post('/api/action',        deployAction);

// ─── INVESTIGATION & SIGNALS ─────────────────────────────────────────
app.get('/api/signals',                getSignals);
app.post('/api/investigate/signal',    collectSignal);
app.get('/api/investigate/zone-e',     getZoneEInvestigation);
app.post('/api/investigate/zone-e',    investigateZoneE);

// ─── DISASTER CHESS ──────────────────────────────────────────────────
app.post('/api/chess/action', chessAction);

// ─── OUTCOME / AFTER-ACTION REPORT ──────────────────────────────────
app.post('/api/outcome',     generateOutcome);

// ─── ERROR HANDLING MIDDLEWARE ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[AEGIS-ERROR]', err.message);
  res.status(500).json({
    error: 'Internal AEGIS System Error',
    message: err.message
  });
});

// ─── START SERVER ────────────────────────────────────────────────────
export async function startServer() {
  await connectDB();

  return new Promise((resolve) => {
    const server = app.listen(PORT, () => {
      console.log('');
      console.log('╔══════════════════════════════════════════════════════════╗');
      console.log('║  AEGIS API — AI Emergency Governance & Intelligence     ║');
      console.log(`║  Server running on http://localhost:${PORT}                ║`);
      console.log(`║  Mode: ${isDBConnected() ? 'MONGODB CONNECTED' : 'IN-MEMORY (no MongoDB)'}                       ║`);
      console.log('║  Health: /api/health                                    ║');
      console.log('╚══════════════════════════════════════════════════════════╝');
      console.log('');
      resolve(server);
    });
  });
}

// Auto-run if executed directly
if (process.argv[1]?.replace(/\\/g, '/').endsWith('src/server.js') || process.argv[1]?.replace(/\\/g, '/').endsWith('server/server.js')) {
  startServer().catch(err => {
    console.error('[AEGIS-SERVER] Fatal startup error:', err);
    process.exit(1);
  });
}

export default app;
