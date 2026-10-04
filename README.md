# AEGIS — AI Emergency Governance & Intelligence System

> **A living digital twin and decision-support system for crisis response. AEGIS fuses multi-source telemetry, identifies unmonitored information gaps, deterministically models cascading infrastructure failures, provides explainable factor attribution, and empowers incident commanders to formulate and validate tactical dispatch strategies.**

---

## 🏗️ Architecture & Project Structure

The project is structured with clean boundaries between frontend and backend:

```
zenovation/
├── client/                     # Existing React/Vite Frontend
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js          # Centralized API service layer
│   │   ├── components/         # Tactical HUD screens, Digital Twin & controls
│   │   ├── App.jsx             # Mission state machine & HUD orchestrator
│   │   ├── main.jsx
│   │   └── index.css           # Premium HUD aesthetic & design tokens
│   ├── package.json
│   ├── vite.config.js          # Reverse proxy /api to backend
│   └── .env.example
├── server/                     # Lightweight Express & MongoDB Backend
│   ├── src/
│   │   ├── server.js           # Server entry point & CORS configuration
│   │   ├── config/
│   │   │   └── db.js           # MongoDB Atlas connection + in-memory fallback
│   │   ├── models/             # Mongoose schemas
│   │   │   ├── Mission.js
│   │   │   ├── Zone.js
│   │   │   ├── Incident.js
│   │   │   ├── Resource.js
│   │   │   └── Simulation.js
│   │   ├── routes/             # REST route definitions
│   │   │   ├── missionRoutes.js
│   │   │   ├── zoneRoutes.js
│   │   │   ├── incidentRoutes.js
│   │   │   ├── resourceRoutes.js
│   │   │   └── simulationRoutes.js
│   │   ├── controllers/        # Request handlers & response formatting
│   │   │   ├── missionController.js
│   │   │   ├── zoneController.js
│   │   │   ├── incidentController.js
│   │   │   ├── resourceController.js
│   │   │   └── simulationController.js
│   │   ├── engine/             # Deterministic simulation & recommendation engine
│   │   │   ├── simulationEngine.js
│   │   │   └── recommendationEngine.js
│   │   ├── store/
│   │   │   └── worldState.js   # Dual-mode runtime state store
│   │   └── seed/
│   │       └── seedData.js     # Scenario #027 database seed script
│   ├── package.json
│   ├── .env.example
│   └── README.md
├── package.json                # Root convenience scripts
├── CONTRIBUTING.md             # Team development & contribution guidelines
├── .gitignore                  # Security-first ignore rules (never commits secrets)
└── README.md
```

---

## ⚡ Quick Start (Local Development)

### 1. Prerequisites
- **Node.js** v18+ 
- **npm** v9+
- *(Optional)* MongoDB Atlas account or local MongoDB instance (if omitted, server runs with automated In-Memory demo store)

### 2. Clone & Install Dependencies
```bash
# Clone the repository
git clone <repo-url>
cd zenovation

# Install all dependencies (or run in client and server separately)
npm --prefix server install
npm --prefix client install
```

### 3. Configure Environment Variables
Copy `.env.example` in `server/`:
```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
MONGODB_URI=
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```
> *Note: If `MONGODB_URI` is left blank, AEGIS operates automatically in `IN-MEMORY` fallback mode with baseline Scenario #027 loaded. No external database setup is required to run locally.*

### 4. Seed Database (Optional for MongoDB Atlas)
```bash
npm --prefix server run seed
```

### 5. Run the Application
In two separate terminals:

**Terminal 1 — Backend API Server:**
```bash
npm run server
# or: cd server && npm run dev
# Server running on http://localhost:5000
```

**Terminal 2 — Frontend Command Center:**
```bash
npm run client
# or: cd client && npm run dev
# Vite app running on http://localhost:5173
```

---

## 🔌 API Reference

### Health Check
- `GET /api/health`
  - Returns backend health status, service name, mode (`MONGODB` or `IN_MEMORY`), and timestamp.

### Mission API
- `GET /api/missions` — Return available disaster missions (Scenario #027 Flash Flood Cascade).
- `GET /api/missions/:id` — Return complete mission state (zones, weather, resources, city health, alerts).
- `POST /api/missions` — Initialize / create a new disaster mission.
- `PATCH /api/missions/:id` — Update mission status or mode (`LIVE`, `SIMULATION`, `CHESS`).

### Zone API
- `GET /api/missions/:missionId/zones` — Return all sectors with risk, population, health, road access, infrastructure, 911 reports, connectivity, and hospital access.
- `GET /api/zones/:id` — Return detailed zone telemetry.
- `GET /api/zones/:id/explain` — Return explainable risk breakdown with factor attribution:
  ```json
  {
    "risk": 96,
    "factors": [
      { "factor": "Flood exposure", "impact": 32 },
      { "factor": "Road accessibility", "impact": 24 },
      { "factor": "Infrastructure stress", "impact": 21 }
    ],
    "dominantTrigger": "Road 17 culvert washout blocking trauma center access"
  }
  ```

### Incident API
- `GET /api/missions/:missionId/incidents` — Return active incidents and multi-signal causal fusion cluster.
- `POST /api/incidents` — Ingest a new incident into the mission log.
- `PATCH /api/incidents/:id` — Update incident status (`ACTIVE`, `CONTAINED`, `RESOLVED`).

### Resource API
- `GET /api/missions/:missionId/resources` — Return available and deployed fleet units (ambulances, rescue teams, medical units, shelters, vehicles, communication units).
- `POST /api/resources/:id/assign` — Assign a resource to a zone:
  ```json
  { "zoneId": "D" }
  ```

### Simulation API
- `POST /api/simulations` — Run deterministic forward projection:
  ```json
  {
    "missionId": "027",
    "timeOffset": 30,
    "actions": []
  }
  ```
  Returns:
  ```json
  {
    "simulationId": "SIM-...",
    "timeOffset": 30,
    "zones": [...],
    "incidents": [...],
    "resources": [...],
    "hospitalStatus": "CRITICAL_SATURATION",
    "systemStatus": "SIMULATED"
  }
  ```
- `GET /api/simulations/:id` — Retrieve stored simulation run.
- `GET /api/missions/:missionId/simulations` — Retrieve simulation history for a mission.

### AI Decision Support API
- `POST /api/recommend` — Return structured recommendations for a zone or mission:
  ```json
  {
    "missionId": "027",
    "zoneId": "D"
  }
  ```
  Returns:
  ```json
  {
    "_engine": "AEGIS DECISION SUPPORT — SIMULATED RECOMMENDATION ENGINE",
    "recommendations": [
      {
        "action": "Deploy medical unit",
        "reason": "Hospital intake access is critical",
        "priority": "HIGH"
      },
      {
        "action": "Redirect rescue resources",
        "reason": "Road accessibility is severely reduced",
        "priority": "HIGH"
      }
    ]
  }
  ```

---

## 🚀 Public Deployment Guide

### 1. Database: MongoDB Atlas
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Database User under **Database Access**.
3. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) so your cloud hosting provider can connect.
4. Copy the connection string (e.g. `mongodb+srv://<user>:<password>@cluster0.mongodb.net/aegis?retryWrites=true&w=majority`).

### 2. Backend: Render or Railway
1. Push your repository to GitHub.
2. In [Render](https://render.com) or [Railway](https://railway.app), create a new **Web Service** pointing to your repo.
3. Configure the service:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Set Environment Variables:
   - `MONGODB_URI`: your MongoDB Atlas connection string
   - `PORT`: `5000` (or leave default if managed by host)
   - `CLIENT_URL`: `https://your-frontend-app.vercel.app`
   - `NODE_ENV`: `production`
5. Once deployed, run the seed script via the host console or locally with the production `MONGODB_URI`.
6. Verify deployment by visiting `https://your-backend.onrender.com/api/health`.

### 3. Frontend: Vercel
1. In [Vercel](https://vercel.com), import your GitHub repository.
2. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Set Environment Variables:
   - `VITE_API_URL`: `https://your-backend.onrender.com` (leave empty for local dev)
4. Click **Deploy**. Vercel will build and serve the application.

---

## 🔒 Security & Data Hygiene
- Credentials, database passwords, and API keys are **never hardcoded**.
- Root `.gitignore` prevents `.env`, `node_modules/`, and logs from ever being committed.
- Dual-mode architecture ensures the app never crashes if the database connection drops.
- Subtle `OFFLINE / DEMO MODE` HUD indicator informs operators without displaying broken screens.
