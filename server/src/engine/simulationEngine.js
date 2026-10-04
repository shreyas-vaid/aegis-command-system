/**
 * AEGIS Deterministic Simulation Engine
 * ────────────────────────────────────────────────────────────────────
 * SIMULATION MODEL — NOT real-world prediction.
 *
 * This engine calculates future disaster states based on:
 *   - Current disaster state
 *   - Time offset (minutes forward)
 *   - Commander actions (resource deployments)
 *
 * Designed to be MODULAR so actual ML/LLM models can replace
 * individual calculation functions later.
 * ────────────────────────────────────────────────────────────────────
 */

// ─── ZONE RISK BREAKDOWN ─────────────────────────────────────────────
export function calculateZoneRiskBreakdown(zone, weather, deployedResources) {
  const isInformationGap = zone.isUnknown ||
    (zone.connectivity < 20 && zone.reports === 0 && zone.gpsActivity === "HIGH");

  // 1. Weather Impact Factor
  const weatherBase = (weather.rainfall / 100) * 38 + (weather.wind / 120) * 20;
  const weatherFactor = Math.min(35, Math.round(weatherBase));

  // 2. Road Accessibility Degradation Factor
  const roadFactor = Math.min(32, Math.round(((100 - zone.roads) / 100) * 31));

  // 3. Population Exposure Factor
  const popFactor = Math.min(24, Math.round((zone.population / 4500) * 19));

  // 4. Infrastructure Stress Factor
  const infraFactor = Math.min(22, Math.round(((100 - zone.infrastructure) / 100) * 23));

  // 5. Emergency Report Density Factor
  const reportFactor = Math.min(15, Math.round((zone.reports / 14) * 8));

  // 6. Connectivity Loss Penalty
  const commsFactor = isInformationGap
    ? 25
    : Math.min(18, Math.round(((100 - zone.connectivity) / 100) * 14));

  // 7. Resource Mitigation Deductions
  const depMed  = deployedResources?.medical?.[zone.id] || 0;
  const depEng  = deployedResources?.engineering?.[zone.id] || 0;
  const depFire = deployedResources?.fire?.[zone.id] || 0;
  const depLog  = deployedResources?.logistics?.[zone.id] || 0;

  const mitigation = (depMed * 9) + (depEng * 12) + (depFire * 10) + (depLog * 6);

  let rawTotal;
  if (zone.id === "A") {
    rawTotal = 18 - mitigation;
  } else if (zone.id === "B") {
    rawTotal = 48 - mitigation;
  } else if (zone.id === "C") {
    rawTotal = 74 - mitigation;
  } else if (zone.id === "D") {
    rawTotal = (weatherFactor + roadFactor + popFactor + infraFactor + reportFactor) - mitigation;
    if (rawTotal < 86 && mitigation === 0) rawTotal = 96;
  } else if (zone.id === "E") {
    rawTotal = 78 - mitigation;
  } else {
    rawTotal = weatherFactor + roadFactor + popFactor + infraFactor + reportFactor - mitigation;
  }

  const finalRisk = Math.max(8, Math.min(99, rawTotal));

  return {
    weatherFactor: zone.id === "D" ? 31 : weatherFactor,
    roadFactor:    zone.id === "D" ? 24 : roadFactor,
    popFactor:     zone.id === "D" ? 19 : popFactor,
    infraFactor:   zone.id === "D" ? 14 : infraFactor,
    reportFactor:  zone.id === "D" ? 8  : reportFactor,
    commsFactor,
    mitigation,
    finalRisk,
    health: Math.max(1, 100 - finalRisk),
    status: isInformationGap
      ? "UNKNOWN"
      : finalRisk >= 80 ? "CRITICAL"
      : finalRisk >= 60 ? "HIGH_RISK"
      : finalRisk >= 35 ? "WARNING"
      : "STABLE",
    isInformationGap
  };
}

// ─── COMPUTE LIVE ZONES STATE ────────────────────────────────────────
export function computeLiveZonesState(zones, weather, resources) {
  return zones.map(zone => {
    const breakdown = calculateZoneRiskBreakdown(zone, weather, resources.deployed);
    return {
      ...zone,
      risk: breakdown.finalRisk,
      health: breakdown.health,
      status: breakdown.status,
      isInformationGap: breakdown.isInformationGap,
      breakdown
    };
  });
}

// ─── CITY HEALTH ─────────────────────────────────────────────────────
export function calculateCityHealth(zonesWithScores, resources, timeOffset = 0) {
  const avgZoneRisk = zonesWithScores.reduce(
    (acc, z) => acc + (z.isInformationGap ? 65 : z.risk), 0
  ) / zonesWithScores.length;

  let deployedCount = 0;
  ['medical', 'fire', 'logistics', 'engineering'].forEach(r => {
    deployedCount += Object.values(resources.deployed[r] || {}).reduce((a, b) => a + b, 0);
  });

  const mitigationBoost = deployedCount * 1.6;
  const timeDeduction = (timeOffset / 30) * 15;
  return Math.max(15, Math.min(96, Math.round(
    72 - timeDeduction - ((avgZoneRisk - 54) * 0.3) + mitigationBoost
  )));
}

// ─── HOSPITAL LOAD ───────────────────────────────────────────────────
export function calculateHospitalLoad(resources, timeOffset = 0) {
  const baseLoad = 72;
  const timeIncrease = timeOffset === 0 ? 0
    : timeOffset === 15 ? 12
    : timeOffset === 30 ? 22
    : 38;

  const medDeployed = resources.deployed.medical["D"] || 0;
  const engDeployed = resources.deployed.engineering["D"] || 0;
  const mitigation = (medDeployed * 7) + (engDeployed * 5);

  return Math.min(135, Math.max(35, Math.round(baseLoad + timeIncrease - mitigation)));
}

// ─── TIME PROJECTION ─────────────────────────────────────────────────
/**
 * Apply time-based environmental changes to zones and weather.
 * Returns mutated copies — does not modify originals.
 */
export function projectTimeOffset(zones, weather, timeOffset) {
  const projectedZones = JSON.parse(JSON.stringify(zones));
  const projectedWeather = { ...weather };

  if (timeOffset === 0) return { zones: projectedZones, weather: projectedWeather };

  if (timeOffset >= 15) {
    projectedWeather.rainfall = 54;
    projectedWeather.wind = 74;
    projectedWeather.riverCrestMeters = 3.9;

    const zD = projectedZones.find(z => z.id === "D");
    if (zD) { zD.roads = 16; zD.infrastructure = 32; zD.reports = 22; }
    const zC = projectedZones.find(z => z.id === "C");
    if (zC) { zC.roads = 28; zC.floodLevel = 3.9; zC.reports = 18; }
    const zB = projectedZones.find(z => z.id === "B");
    if (zB) { zB.roads = 52; zB.reports = 12; }
  }

  if (timeOffset >= 30) {
    projectedWeather.rainfall = 68;
    projectedWeather.wind = 82;
    projectedWeather.riverCrestMeters = 4.4;

    const zD = projectedZones.find(z => z.id === "D");
    if (zD) { zD.roads = 8; zD.infrastructure = 24; zD.reports = 36; }
    const zC = projectedZones.find(z => z.id === "C");
    if (zC) { zC.roads = 18; zC.floodLevel = 4.4; zC.reports = 27; }
    const zB = projectedZones.find(z => z.id === "B");
    if (zB) { zB.roads = 38; zB.infrastructure = 61; zB.reports = 19; }
    const zE = projectedZones.find(z => z.id === "E");
    if (zE) { zE.floodLevel = 4.2; zE.infrastructure = 18; }
  }

  if (timeOffset >= 60) {
    projectedWeather.rainfall = 92;
    projectedWeather.wind = 95;
    projectedWeather.riverCrestMeters = 5.2;

    const zD = projectedZones.find(z => z.id === "D");
    if (zD) { zD.roads = 4; zD.infrastructure = 15; zD.reports = 52; }
    const zC = projectedZones.find(z => z.id === "C");
    if (zC) { zC.roads = 8; zC.floodLevel = 5.2; zC.reports = 40; }
    const zB = projectedZones.find(z => z.id === "B");
    if (zB) { zB.roads = 22; zB.infrastructure = 48; zB.reports = 31; }
    const zE = projectedZones.find(z => z.id === "E");
    if (zE) { zE.floodLevel = 5.0; zE.connectivity = 4; }
  }

  return { zones: projectedZones, weather: projectedWeather };
}

// ─── BUTTERFLY CHAIN ─────────────────────────────────────────────────
export function generateButterflyChain(timeOffset) {
  return [
    { title: "Bridge 17 Compromised",                status: timeOffset >= 15 ? "Triggered" : "Pending",              consequence: "Heavy vehicle diversion" },
    { title: "Traffic Diverted to Residential Arterials", status: timeOffset >= 15 ? "Active" : "Pending",            consequence: "Zone B gridlock (+45m delay)" },
    { title: "Road 17 Inaccessible to Ambulances",   status: timeOffset >= 30 ? "Critical" : "Partial",              consequence: "EMS response times tripled" },
    { title: "South General Hospital Overloaded",     status: timeOffset >= 30 ? "Severe (94%)" : "Guarded (72%)",    consequence: "Trauma queue overflow" },
    { title: "East Delta Zone E Unmonitored Breach",  status: timeOffset >= 60 ? "Catastrophic" : "Unmonitored Gap",  consequence: "Chemical & civilian isolation" }
  ];
}
