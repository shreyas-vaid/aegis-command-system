# AEGIS Server — Phase 2: MongoDB Data Layer

Lightweight Express backend for the AEGIS system with MongoDB persistence.

---

## 🛠️ Tech Stack
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB (via Mongoose)
- **Middleware**: CORS
- **Environment**: dotenv
- **Development Tool**: nodemon

---

## 📁 Directory Structure
```
server/
├── src/
│   ├── server.js                        # Express server entry point & DB startup guard
│   ├── config/
│   │   └── db.js                        # Reusable MongoDB connection & error handling
│   ├── models/                          # Mongoose Schemas & Models
│   │   ├── Mission.js                   # Mission schema
│   │   ├── Zone.js                      # Tactical Sector schema
│   │   ├── Incident.js                  # Incident signal schema
│   │   ├── Resource.js                  # Fleet asset schema
│   │   └── Simulation.js                # Flexible simulation run schema
│   ├── routes/
│   │   └── healthRoutes.js              # Health check router
│   ├── controllers/
│   │   └── healthController.js          # Health check handler
│   └── seed/
│       └── seedData.js                  # Database seed script
├── package.json                         # Scripts & dependencies
├── .env.example                         # Environment template
├── .gitignore                           # Security ignore file
└── README.md
```

---

## 🚀 Setup & Installation

### 1. MongoDB Atlas Setup
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Database Access**, create a database user with read/write privileges.
3. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) or your IP address.
4. Go to **Clusters** → **Connect** → **Drivers** and copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/aegis?retryWrites=true&w=majority
   ```

### 2. Configure Environment (.env)
Create `server/.env` by copying `.env.example`:
```bash
cp .env.example .env
```

Set your configuration values (do **never** commit `.env`):
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/aegis?retryWrites=true&w=majority
```
*(For local MongoDB installations, you can use `mongodb://127.0.0.1:27017/aegis`)*

### 3. Install Dependencies
```bash
npm install
```

### 4. Seed the Database
Seed the baseline Mission #027, Sectors A-E, incidents, and fleet assets:
```bash
npm run seed
```
Output:
```
AEGIS DATABASE
---------------
Mission seeded: 027
Zones seeded: 5
Incidents seeded: 5
Resources seeded: 5

DATABASE SEED COMPLETE
```

### 5. Start Development Server
```bash
npm run dev
```
Starts `nodemon src/server.js` with auto-reload. Express starts only after the MongoDB connection succeeds.

### 6. Start Production Server
```bash
npm start
```

---

## 🔌 API Endpoints

### Health Check
- **Route**: `GET /api/health`
- **Status**: `200 OK`
- **Response**:
```json
{
  "status": "ok",
  "service": "AEGIS API",
  "version": "1.0.0"
}
```

---

## ☁️ Render Deployment & Vercel Integration

### 1. Render Deployment
1. Connect your GitHub repository to [Render](https://render.com).
2. Create a new **Web Service** using the repo.
3. Configure the service:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Set Environment Variables in Render:
   - `PORT`: `5000` (or Render default)
   - `CLIENT_URL`: `https://YOUR-VERCEL-FRONTEND-URL`
   - `MONGODB_URI`: `<Your MongoDB Atlas connection string>`
   - `NODE_ENV`: `production`

### 2. Vercel Frontend Configuration
The Vercel frontend must be configured with:
- **Environment Variable**: `VITE_API_URL`
- **Value**: `https://YOUR-RENDER-API-URL/api`

⚠️ **Security Note**: Never expose database credentials or secrets in `VITE_` frontend variables. All secrets belong exclusively in the Render backend environment.

---

## ⚠️ Simulated Data Notice
All mission telemetry, sector risk ratings, incident details, and fleet capacity figures are **simulated / demo data** for prototype validation and crisis response simulation.

