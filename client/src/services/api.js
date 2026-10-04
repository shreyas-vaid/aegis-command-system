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

const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
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

export function assignResource(resourceType, zoneId) {
  return request(`/api/resources/${resourceType}/assign`, {
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
