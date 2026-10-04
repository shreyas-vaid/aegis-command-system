/**
 * AEGIS API Service Layer
 * ────────────────────────────────────────────────────────────────────
 * Centralized backend communication for the AEGIS frontend.
 * All fetch() calls to the backend should go through this module.
 *
 * In development, requests are proxied by Vite to the backend.
 * In production, set VITE_API_URL to point to the deployed backend.
 * ────────────────────────────────────────────────────────────────────
 */

// Configurable API base URL supporting VITE_API_URL
// Examples:
// Development: VITE_API_URL=http://localhost:5000/api
// Production:  VITE_API_URL=https://YOUR-RENDER-API-URL/api
const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const normalizedBase = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl.slice(0, -4) : rawApiUrl)
  : (import.meta.env.DEV ? 'http://localhost:5000' : '');

// Token storage key
const TOKEN_KEY = 'aegis_auth_token';

export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (err) {
    console.warn('[AEGIS-AUTH] Storage error:', err);
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.warn('[AEGIS-AUTH] Storage clear error:', err);
  }
}

async function request(path, options = {}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${normalizedBase}${normalizedPath}`;
  const token = getAuthToken();

  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const res = await fetch(url, {
      ...options,
      headers
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[AEGIS-API] Request failed: ${path}`, err.message);
    throw err;
  }
}

// ─── AUTHENTICATION ──────────────────────────────────────────────────
export function registerUser(userData) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
}

export function loginUser(credentials) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
}

export function logoutUser() {
  return request('/api/auth/logout', {
    method: 'POST'
  }).finally(() => {
    clearAuthToken();
  });
}

export function getMe() {
  return request('/api/auth/me');
}

export function getUsersMe() {
  return request('/api/users/me');
}

// ─── ORGANIZATIONS ───────────────────────────────────────────────────
export function getOrganization(id) {
  return request(`/api/organizations/${id}`);
}

export function createOrganization(data) {
  return request('/api/organizations', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export function updateOrganization(id, data) {
  return request(`/api/organizations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

export function getOrganizationUsers(id) {
  return request(`/api/organizations/${id}/users`);
}

// ─── HEALTH ──────────────────────────────────────────────────────────
export function getHealth() {
  return request('/api/health');
}

// ─── MISSIONS ────────────────────────────────────────────────────────
export function getMissions() {
  return request('/api/missions');
}

export function getMission(id) {
  return request(`/api/missions/${id}`);
}

export function createMission(data) {
  return request('/api/missions', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export function updateMission(id, data) {
  return request(`/api/missions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

// ─── STATE (Legacy) ──────────────────────────────────────────────────
export function getState() {
  return request('/api/state');
}

export function resetState() {
  return request('/api/reset', { method: 'POST' });
}

// ─── ZONES ───────────────────────────────────────────────────────────
export function getZones(missionId) {
  if (missionId) return request(`/api/missions/${missionId}/zones`);
  return request('/api/zones');
}

export function getZone(id) {
  return request(`/api/zones/${id}`);
}

export function getZoneExplanation(id) {
  return request(`/api/zones/${id}/explain`);
}

// ─── INCIDENTS ───────────────────────────────────────────────────────
export function getIncidents(missionId) {
  if (missionId) return request(`/api/missions/${missionId}/incidents`);
  return request('/api/incidents');
}

export function createIncident(data) {
  return request('/api/incidents', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export function updateIncident(id, data) {
  return request(`/api/incidents/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

// ─── RESOURCES ───────────────────────────────────────────────────────
export function getResources(missionId) {
  if (missionId) return request(`/api/missions/${missionId}/resources`);
  return request('/api/resources');
}

export function assignResource(resourceId, zoneId) {
  return request(`/api/resources/${resourceId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ zoneId })
  });
}

export function deployAction(plan) {
  return request('/api/action', {
    method: 'POST',
    body: JSON.stringify({ plan })
  });
}

// ─── SIMULATION ──────────────────────────────────────────────────────
export function runSimulation(data) {
  return request('/api/simulations', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export function simulateLegacy(data) {
  return request('/api/simulate', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export function getSimulation(id) {
  return request(`/api/simulations/${id}`);
}

export function getSimulationsByMission(missionId) {
  return request(`/api/missions/${missionId}/simulations`);
}

// ─── INVESTIGATION ───────────────────────────────────────────────────
export function getSignals() {
  return request('/api/signals');
}

export function collectSignal(signalId) {
  return request('/api/investigate/signal', {
    method: 'POST',
    body: JSON.stringify({ signalId })
  });
}

export function getZoneEInvestigation() {
  return request('/api/investigate/zone-e');
}

export function investigateZoneE(actionType) {
  return request('/api/investigate/zone-e', {
    method: 'POST',
    body: JSON.stringify({ actionType })
  });
}

// ─── RECOMMENDATIONS ────────────────────────────────────────────────
export function getRecommendations(data) {
  if (data) {
    return request('/api/recommend', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  return request('/api/recommend');
}

// ─── CHESS ───────────────────────────────────────────────────────────
export function chessAction(actionName, targetZone) {
  return request('/api/chess/action', {
    method: 'POST',
    body: JSON.stringify({ actionName, targetZone })
  });
}

// ─── OUTCOME ─────────────────────────────────────────────────────────
export function generateOutcome(chosenPlan) {
  return request('/api/outcome', {
    method: 'POST',
    body: JSON.stringify({ chosenPlan })
  });
}
