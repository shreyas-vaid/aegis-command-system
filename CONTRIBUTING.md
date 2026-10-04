# Contributing to AEGIS

## Project Structure

```
zenovation/
├── client/          # React/Vite frontend
├── server/          # Node.js/Express backend
├── package.json     # Root scripts
└── README.md
```

## Getting Started

```bash
# 1. Clone the repository
git clone <repo-url>
cd zenovation

# 2. Install all dependencies
npm run install:all

# 3. Configure environment
cp server/.env.example server/.env
# Edit server/.env if needed

# 4. Start development
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm run client
```

## Development Workflow

- **Frontend code** goes in `client/src/`
- **Backend code** goes in `server/src/`
- Frontend runs on `http://localhost:5173`
- Backend runs on `http://localhost:5000`
- Vite proxies `/api` requests to the backend

## Code Conventions

- ES Modules (`import`/`export`)
- Functional React components with hooks
- Express route → controller → engine pattern
- All API calls in frontend go through `client/src/services/api.js`

## What NOT to Commit

- `.env` files (use `.env.example` as template)
- `node_modules/`
- MongoDB credentials
- API keys

## Architecture

The backend uses an in-memory state store by default. Set `MONGODB_URI` in `.env` to enable MongoDB persistence.

The simulation engine and recommendation engine are modular — they can be replaced with ML models by implementing the same function signatures.
