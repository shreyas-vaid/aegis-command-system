# AEGIS API Server

Backend for the AEGIS AI Emergency Governance & Intelligence System.

## Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB (via Mongoose) — optional, falls back to in-memory
- **Auth**: None (hackathon prototype)

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start development server (with auto-reload)
npm run dev

# Start production server
npm start
```

## Environment Variables

| Variable      | Description                | Default                   |
|---------------|----------------------------|---------------------------|
| `PORT`        | Server port                | `5000`                    |
| `CLIENT_URL`  | Frontend URL (CORS)        | `http://localhost:5173`   |
| `MONGODB_URI` | MongoDB connection string  | _(in-memory if empty)_    |
| `NODE_ENV`    | Environment                | `development`             |

## API Endpoints

### Health
| Method | Path             | Description           |
|--------|------------------|-----------------------|
| GET    | `/api/health`    | Server health check   |

### Missions
| Method | Path                  | Description             |
|--------|-----------------------|-------------------------|
| GET    | `/api/missions`       | List all missions       |
| GET    | `/api/missions/:id`   | Get mission details     |
| POST   | `/api/missions`       | Create new mission      |
| PATCH  | `/api/missions/:id`   | Update mission status   |

### Zones
| Method | Path                              | Description                |
|--------|-----------------------------------|----------------------------|
| GET    | `/api/zones`                      | List all zones             |
| GET    | `/api/zones/:id`                  | Get zone details           |
| GET    | `/api/zones/:id/explain`          | Explainable risk breakdown |
| GET    | `/api/missions/:id/zones`         | Zones by mission           |

### Incidents
| Method | Path                              | Description              |
|--------|------------------------------------|--------------------------|
| GET    | `/api/incidents`                   | List incidents           |
| POST   | `/api/incidents`                   | Create incident          |
| PATCH  | `/api/incidents/:id`               | Update incident          |
| GET    | `/api/missions/:id/incidents`      | Incidents by mission     |

### Resources
| Method | Path                              | Description              |
|--------|------------------------------------|--------------------------|
| GET    | `/api/resources`                   | List resources           |
| POST   | `/api/resources/:type/assign`      | Assign resource to zone  |
| POST   | `/api/action`                      | Deploy full response plan|
| GET    | `/api/missions/:id/resources`      | Resources by mission     |

### Simulation
| Method | Path                              | Description              |
|--------|------------------------------------|--------------------------|
| POST   | `/api/simulations`                 | Run forward simulation   |
| GET    | `/api/simulations/:id`             | Get simulation result    |
| GET    | `/api/missions/:id/simulations`    | Simulations by mission   |

### Investigation
| Method | Path                       | Description                    |
|--------|----------------------------|--------------------------------|
| GET    | `/api/signals`             | List investigation signals     |
| POST   | `/api/investigate/signal`  | Collect a signal               |
| GET    | `/api/investigate/zone-e`  | Zone E investigation state     |
| POST   | `/api/investigate/zone-e`  | Execute recon on Zone E        |

### Recommendation Engine
| Method | Path              | Description                          |
|--------|-------------------|--------------------------------------|
| GET    | `/api/recommend`  | Get strategic recommendations        |
| POST   | `/api/recommend`  | Get zone-specific recommendations    |

### Disaster Chess
| Method | Path                 | Description            |
|--------|----------------------|------------------------|
| POST   | `/api/chess/action`  | Execute chess turn     |

### Outcome
| Method | Path             | Description                   |
|--------|------------------|-------------------------------|
| POST   | `/api/outcome`   | Generate after-action report  |

## Architecture

```
server/
├── server.js                          # Entry point
├── src/
│   ├── config/
│   │   └── db.js                      # Database connection
│   ├── controllers/
│   │   ├── missionController.js
│   │   ├── zoneController.js
│   │   ├── incidentController.js
│   │   ├── resourceController.js
│   │   ├── simulationController.js
│   │   ├── investigationController.js
│   │   ├── recommendationController.js
│   │   ├── chessController.js
│   │   └── outcomeController.js
│   ├── engine/
│   │   ├── simulationEngine.js        # Deterministic projection
│   │   └── recommendationEngine.js    # Rule-based decisions
│   ├── models/
│   │   ├── Mission.js
│   │   ├── Zone.js
│   │   ├── Incident.js
│   │   ├── Resource.js
│   │   └── Simulation.js
│   ├── routes/
│   │   ├── missionRoutes.js
│   │   ├── zoneRoutes.js
│   │   ├── incidentRoutes.js
│   │   ├── resourceRoutes.js
│   │   └── simulationRoutes.js
│   ├── seed/
│   │   └── seedData.js                # Demo scenario #027
│   └── store/
│       └── worldState.js              # In-memory state manager
├── .env.example
├── .gitignore
└── package.json
```

## Deployment

- **Backend**: Render / Railway
- **Database**: MongoDB Atlas
- **Frontend**: Vercel

Set `MONGODB_URI` and `CLIENT_URL` in your deployment environment.
