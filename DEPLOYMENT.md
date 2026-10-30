# AEGIS — Cloud Deployment & Database Setup Guide

This guide details the exact steps to deploy the AEGIS Express/Node.js backend to **Render (Free Tier)** connected to **MongoDB Atlas (Free M0 Tier)** for hackathon operation.

---

## 📋 Architectural Overview

- **Backend Platform**: Render Web Service (Free Tier)
- **Database**: MongoDB Atlas M0 Free Cluster (512 MB storage)
- **Runtime**: Node.js (ES Modules)
- **Database Driver / ODM**: Mongoose 9.x
- **Frontend Target**: Vercel (or local development)

---

## 🗄️ Part 1: MongoDB Atlas M0 Setup Checklist

Follow these manual steps in the [MongoDB Atlas Dashboard](https://cloud.mongodb.com/):

### Step 1: Create or Select an Atlas Project
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Create a new project (e.g., `AEGIS-Hackathon`) or select your existing project.

### Step 2: Deploy a Free M0 Cluster
1. Click **Create** / **Build a Database**.
2. Select the **M0 (Free)** tier.
3. Choose a Cloud Provider (AWS, Google Cloud, or Azure) and select a region close to your Render deployment region (e.g., `us-east-1` or `frankfurt`).
4. Set Cluster Name to `aegis-cluster` (or default `Cluster0`).
5. Click **Create Deployment**.

### Step 3: Create a Database User
1. In the left navigation, navigate to **Security** → **Database Access**.
2. Click **Add New Database User**.
3. Authentication Method: **Password**.
4. Set Username: e.g. `aegis_admin`.
5. Set Password: Click **Autogenerate Secure Password** or enter a strong alphanumeric password without URL-reserved symbols (`@`, `:`, `/`, `%`, `?`). *(Copy this password securely).*
6. Under **Database User Privileges**, select **Read and write to any database** (or Atlas Admin).
7. Click **Add User**.

### Step 4: Configure Network Access (IP Whitelist)
Render free instances use dynamic outbound IP addresses, requiring broad network access:
1. In the left navigation, navigate to **Security** → **Network Access**.
2. Click **Add IP Address**.
3. Click **Allow Access from Anywhere** (`0.0.0.0/0`).
4. Enter Description: `Render Free Instance Outbound Access`.
5. Click **Confirm**. (Wait ~1 minute until status is *Active*).

### Step 5: Copy the Connection String
1. In the left navigation, navigate to **Deployment** → **Database**.
2. Click **Connect** next to your cluster.
3. Select **Drivers** (Driver: `Node.js`, Version: `6.7 or later`).
4. Copy the connection string format:
   ```text
   mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/?retryWrites=true&w=majority
   ```
5. Modify it for the AEGIS database:
   - Replace `<username>` with your database user (e.g., `aegis_admin`).
   - Replace `<password>` with your database user password.
   - Insert `/aegis` before the query parameters (`?retryWrites=true&w=majority`):
   ```text
   mongodb+srv://aegis_admin:YOUR_PASSWORD@cluster0.abcde.mongodb.net/aegis?retryWrites=true&w=majority
   ```

---

## ☁️ Part 2: Render Free Instance Configuration

You can deploy using either the Render Dashboard or the included `render.yaml` blueprint.

### Option A: Manual Render Dashboard Setup
1. Log in to [Render](https://dashboard.render.com/).
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository: `https://github.com/shreyas-vaid/aegis-command-system`.
4. Configure service parameters:
   - **Name**: `aegis-api`
   - **Branch**: `development` (or your target branch)
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Instance Type**: `Free`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Expand **Advanced** and set:
   - **Health Check Path**: `/api/health`
   - **Auto-Deploy**: `Yes`
6. Add the following **Environment Variables**:

| Variable Name | Value | Required | Purpose |
|---|---|---|---|
| `NODE_ENV` | `production` | Yes | Enforces production security, database checks, and CORS |
| `MONGODB_URI` | `mongodb+srv://...` | Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | `(32+ random characters)` | Yes | Secret key used to sign and verify JWT authentication tokens |
| `CLIENT_URL` | `https://your-app.vercel.app` | Yes | Allowed frontend origin for CORS (comma-separated if multiple) |
| `PORT` | `5000` | Optional | Render assigns `PORT` automatically; Express defaults to 5000 if unset |

7. Click **Create Web Service**.

### Option B: Deploy via Render Blueprint
The repository includes a ready-to-use `render.yaml` at the root. In Render, select **New +** → **Blueprint**, select your repository, and input the required secret environment variables (`MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL`).

---

## ⚡ Part 3: Database Seeding (Scenario #027)

Once your MongoDB Atlas cluster is reachable, initialize the baseline tactical state:
- Operation #027 (Flash Flood Cascade)
- Sectors A through E
- 5 Baseline Incidents
- 5 Baseline Resource Fleets

### Seeding Option 1: From Local Terminal (Recommended)
You can run the seed script locally against your Atlas database before or right after deploying:
```bash
cd server
# Run one-off seed against your Atlas cluster:
MONGODB_URI="mongodb+srv://<user>:<password>@cluster0.abcde.mongodb.net/aegis?retryWrites=true&w=majority" npm run seed
```

### Seeding Option 2: Render Shell
In the Render Dashboard:
1. Navigate to your `aegis-api` service.
2. Open the **Shell** tab.
3. Run:
   ```bash
   npm run seed
   ```

Expected output:
```text
Connecting to MongoDB for seeding...
AEGIS DATABASE CONNECTED: cluster0.../aegis

AEGIS DATABASE
---------------
Mission seeded: 027
Zones seeded: 5
Incidents seeded: 5
Resources seeded: 5

DATABASE SEED COMPLETE
```

---

## 🔍 Part 4: Verification & Deployment Health Diagnostics

### 1. Health Endpoint Check
Visit `https://<your-render-app>.onrender.com/api/health` in your browser or run:
```bash
curl -i https://<your-render-app>.onrender.com/api/health
```

Expected response when MongoDB is connected (**HTTP 200**):
```json
{
  "status": "ok",
  "service": "AEGIS API",
  "version": "1.0.0",
  "database": "connected",
  "mode": "LIVE"
}
```

### 2. Degraded Mode & Health Failure (Fail-Fast Verification)
- If `MONGODB_URI` is missing or the database is unreachable in production (`NODE_ENV=production`):
  - Server startup logs a fatal error and terminates with exit code `1`.
  - Render marks the deployment failed and prevents serving broken writes.
  - If the database drops while the server is running, `GET /api/health` immediately returns **HTTP 503 (Degraded)**:
    ```json
    {
      "status": "degraded",
      "service": "AEGIS API",
      "version": "1.0.0",
      "database": "disconnected",
      "mode": "DEMO_FALLBACK"
    }
    ```
- Write operations (`POST /api/auth/register`, `POST /api/missions`, `POST /api/missions/:id/reports`, etc.) return **HTTP 503 Service Unavailable** rather than falsely pretending data was saved.

---

## 🔒 Part 5: Security Reminders

1. **Never commit `.env` files**: `.gitignore` strictly excludes `.env` and `.env.*` (except `.env.example`).
2. **Never expose `MONGODB_URI` or `JWT_SECRET` in frontend code**: These variables belong solely on Render. Frontend (Vercel) only requires `VITE_API_URL=https://<your-render-app>.onrender.com`.
3. **URL Encode password special characters**: If your MongoDB Atlas password contains symbols like `@`, `#`, or `/`, URL-encode them (e.g., `@` becomes `%40`) in `MONGODB_URI`.
