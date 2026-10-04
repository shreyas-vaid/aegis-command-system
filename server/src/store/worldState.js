/**
 * AEGIS In-Memory World State Store
 * ────────────────────────────────────────────────────────────────────
 * Manages the mutable world state for in-memory mode.
 * When MongoDB is connected, this serves as the runtime cache
 * and will be synced with the database.
 * ────────────────────────────────────────────────────────────────────
 */

import {
  INITIAL_WEATHER,
  INITIAL_RESOURCES,
  INITIAL_ZONES,
  INITIAL_INCIDENTS,
  INITIAL_SIGNALS,
  DEFAULT_HUMAN_PLAN
} from '../seed/seedData.js';

function createFreshState() {
  return {
    incidentId: "027",
    title: "HEAVY RAINFALL + FLASH FLOODING + INFRASTRUCTURE FAILURE",
    time: "14:37:21",
    timeOffset: 0,
    mode: "LIVE",
    weather: { ...INITIAL_WEATHER },
    resources: JSON.parse(JSON.stringify(INITIAL_RESOURCES)),
    zones: JSON.parse(JSON.stringify(INITIAL_ZONES)),
    incidents: JSON.parse(JSON.stringify(INITIAL_INCIDENTS)),
    signals: JSON.parse(JSON.stringify(INITIAL_SIGNALS)),
    chessTurn: 1,
    chessLogs: [
      { turn: 1, text: "Torrential storm cell stalled over River Basin. Flood waters cresting at +3.4m." }
    ],
    humanPlan: JSON.parse(JSON.stringify(DEFAULT_HUMAN_PLAN)),
    zoneEInvestigation: {
      status: "UNKNOWN",
      confidence: 18,
      satellitePassCompleted: false,
      droneDeployed: false,
      fieldScoutDeployed: false,
      telemetryLogs: [
        "Initial status: 88% telecom blackout. 0 emergency calls received. Information gap detected."
      ]
    }
  };
}

let worldState = createFreshState();

export function getWorldState() {
  return worldState;
}

export function resetWorldState() {
  worldState = createFreshState();
  return worldState;
}

export function updateWorldState(partial) {
  Object.assign(worldState, partial);
  return worldState;
}
