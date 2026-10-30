# AEGIS Client — Frontend Command Center

React + Vite frontend for the AEGIS (AI Emergency Governance & Intelligence System) Tactical Operations Platform.

---

## 🚀 Environment Configuration

### Local Development
In local development, the frontend automatically proxies API requests to `http://localhost:5000` or uses `http://localhost:5000/api` as fallback.

To explicitly set a custom API target, create a `.env` file in `/client`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🌐 Production Vercel Deployment

When deploying the AEGIS frontend on **Vercel**:

### 1. Environment Variable
Add the following Environment Variable in your Vercel Project Settings (**Settings → Environment Variables**):

| Key | Example Value | Description |
|-----|---------------|-------------|
| `VITE_API_URL` | `https://YOUR-RENDER-API-URL/api` | The public base URL of your deployed Render backend API |

### 2. ⚠️ Security Notice — No Secrets in Frontend
- All variables starting with `VITE_` are embedded directly into the client-side JavaScript bundle during the build step and are **publicly readable in the browser**.
- **DO NOT** put any secrets, database credentials (such as `MONGODB_URI`), or private API keys in the frontend `.env` or Vercel frontend environment variables.
- All database connections and private secrets must remain exclusively on the backend (e.g. Render environment variables).

---

## 🛠️ Scripts

- `npm run dev` — Start Vite development server on port 5173
- `npm run build` — Build production bundle to `/dist`
- `npm run preview` — Preview the production build locally
