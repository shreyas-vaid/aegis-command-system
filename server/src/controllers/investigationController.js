/**
 * Investigation Controller
 * Handles signal collection, Zone E reconnaissance, and incident fusion.
 */

import { getWorldState } from '../store/worldState.js';

// GET /api/signals
export function getSignals(req, res) {
  const state = getWorldState();
  res.json({
    signals: state.signals,
    collectedCount: state.signals.filter(s => s.collected).length,
    totalCount: state.signals.length,
    canFuse: state.signals.filter(s => s.collected).length >= 3
  });
}

// POST /api/investigate/signal
export function collectSignal(req, res) {
  const state = getWorldState();
  const { signalId } = req.body;
  const sig = state.signals.find(s => s.id === signalId);
  if (sig) {
    sig.collected = true;
  }
  const collectedCount = state.signals.filter(s => s.collected).length;
  res.json({
    success: true,
    signal: sig,
    collectedCount,
    canFuse: collectedCount >= 3
  });
}

// GET /api/investigate/zone-e
export function getZoneEInvestigation(req, res) {
  const state = getWorldState();
  const zE = state.zones.find(z => z.id === "E");
  res.json({
    zoneE: zE,
    investigation: state.zoneEInvestigation,
    confidence: state.zoneEInvestigation?.confidence || (zE?.isUnknown ? 18 : 71)
  });
}

// POST /api/investigate/zone-e
export function investigateZoneE(req, res) {
  const state = getWorldState();
  const act = req.body.actionType || req.body.action || 'drone';
  const isDrone = act === 'drone' || act === 'send_drone';
  const isSat   = act === 'satellite' || act === 'satellite_pass';
  const isField = act === 'field' || act === 'field_scout';

  const inv = state.zoneEInvestigation;

  if (isDrone) {
    inv.droneDeployed = true;
    inv.confidence = Math.max(inv.confidence, 71);
    inv.status = "CRITICAL (140+ TRAPPED POPULATION CONFIRMED)";
    inv.telemetryLogs.unshift(
      "Thermal Recon Drone deployed: Confirmed 140+ civilian vehicles submerged in delta backwater. Zero 911 calls caused by tower collapse, not absence of danger."
    );
  } else if (isSat) {
    inv.satellitePassCompleted = true;
    inv.confidence = Math.max(inv.confidence, 86);
    inv.status = "STRUCTURAL DAMAGE & INUNDATION DETECTED";
    inv.telemetryLogs.unshift(
      "High-res SAR pass executed: Structural damage detected on industrial petrochemical levee. Confidence raised to 86%."
    );
  } else if (isField) {
    inv.fieldScoutDeployed = true;
    inv.confidence = 94;
    inv.status = "AMPHIBIOUS EVACUATION ROUTE CHARTED";
    inv.telemetryLogs.unshift(
      "Amphibious rescue team on perimeter: High-water evacuation route secured. 42 victims pulled to safety."
    );
  }

  // Update zone E in world state
  const zE = state.zones.find(z => z.id === "E");
  if (zE) {
    zE.isUnknown = false;
    zE.status = "CRITICAL";
    zE.confidence = inv.confidence;
    if (isDrone) {
      zE.reports = Math.max(zE.reports, 8);
      zE.connectivity = 48;
      zE.gpsActivity = "ACTIVE_DRONE_MESH";
    } else if (isSat) {
      zE.connectivity = 62;
    } else if (isField) {
      zE.reports = 19;
      zE.connectivity = 75;
      zE.name = "East Delta (Trapped Evacuees Discovered)";
    }
  }

  res.json({
    success: true,
    action: act,
    zoneE: zE,
    investigation: inv,
    message: `Reconnaissance protocol [${act.toUpperCase()}] executed. Zone E unmasked.`
  });
}
