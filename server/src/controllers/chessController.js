/**
 * Chess Controller
 * Disaster Chess — turn-based strategic simulation mode.
 */

import { getWorldState } from '../store/worldState.js';
import {
  computeLiveZonesState,
  calculateCityHealth,
  calculateHospitalLoad
} from '../engine/simulationEngine.js';

// POST /api/chess/action
export function chessAction(req, res) {
  const state = getWorldState();
  const { actionName, targetZone } = req.body;
  state.chessTurn += 1;

  let turnEvent = "";
  if (state.chessTurn === 2) {
    turnEvent = "TURN 2: River Basin crests +4.1m. Road 17 inundated; Bridge 17 traffic blocked.";
    const zD = state.zones.find(z => z.id === "D");
    if (zD) zD.roads = Math.max(5, zD.roads - 12);
  } else if (state.chessTurn === 3) {
    turnEvent = "TURN 3: South General Hospital auxiliary power tripping; trauma unit intake backed up.";
    const zD = state.zones.find(z => z.id === "D");
    if (zD) zD.infrastructure = Math.max(10, zD.infrastructure - 15);
  } else if (state.chessTurn === 4) {
    turnEvent = "TURN 4: Zone E delta industrial berm breaches silently; trapped vehicular beacons trigger emergency beacon.";
    const zE = state.zones.find(z => z.id === "E");
    if (zE) zE.floodLevel = 4.5;
  } else {
    turnEvent = `TURN ${state.chessTurn}: Regional weather begins stabilization; outcome dictated by deployed countermeasures.`;
  }

  const logEntry = {
    turn: state.chessTurn,
    playerAction: `Operator executed [${actionName || 'Strategic Reallocation'}] on Zone ${targetZone || 'D'}`,
    disasterEvolution: turnEvent
  };

  state.chessLogs.unshift(logEntry);

  const calculatedZones = computeLiveZonesState(state.zones, state.weather, state.resources);
  res.json({
    chessTurn: state.chessTurn,
    logs: state.chessLogs,
    zones: calculatedZones,
    cityHealth: calculateCityHealth(calculatedZones, state.resources),
    hospitalLoad: calculateHospitalLoad(state.resources, state.chessTurn * 10)
  });
}
