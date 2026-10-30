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
/**
 * Apply time-based environmental changes to zones and weather.
 * Returns mutated copies — does not modify originals.
 */
export function projectTimeOffset(zones, weather, timeOffset, disasterType = 'FLOOD') {
  const projectedZones = JSON.parse(JSON.stringify(zones));
  const projectedWeather = { ...weather };
  const normType = (disasterType || 'FLOOD').toUpperCase();

  if (timeOffset === 0) return { zones: projectedZones, weather: projectedWeather };

  if (normType === 'EARTHQUAKE') {
    if (timeOffset >= 15) {
      const zD = projectedZones.find(z => (z.id || z.zoneId) === "D");
      if (zD) { zD.roads = 18; zD.infrastructure = 30; zD.reports = (zD.reports || 0) + 12; }
      const zC = projectedZones.find(z => (z.id || z.zoneId) === "C");
      if (zC) { zC.roads = 32; zC.infrastructure = 45; zC.reports = (zC.reports || 0) + 8; }
    }
    if (timeOffset >= 30) {
      const zD = projectedZones.find(z => (z.id || z.zoneId) === "D");
      if (zD) { zD.roads = 10; zD.infrastructure = 20; zD.reports = (zD.reports || 0) + 24; }
      const zB = projectedZones.find(z => (z.id || z.zoneId) === "B");
      if (zB) { zB.roads = 40; zB.infrastructure = 55; }
    }
    if (timeOffset >= 60) {
      const zD = projectedZones.find(z => (z.id || z.zoneId) === "D");
      if (zD) { zD.roads = 5; zD.infrastructure = 12; zD.reports = (zD.reports || 0) + 38; }
      const zE = projectedZones.find(z => (z.id || z.zoneId) === "E");
      if (zE) { zE.connectivity = 0; zE.infrastructure = 15; }
    }
    return { zones: projectedZones, weather: projectedWeather };
  }

  if (normType === 'TORNADO') {
    if (timeOffset >= 15) {
      projectedWeather.wind = 280;
      const zD = projectedZones.find(z => (z.id || z.zoneId) === "D");
      if (zD) { zD.roads = 14; zD.infrastructure = 25; zD.reports = (zD.reports || 0) + 18; }
    }
    if (timeOffset >= 30) {
      projectedWeather.wind = 320;
      const zC = projectedZones.find(z => (z.id || z.zoneId) === "C");
      if (zC) { zC.roads = 20; zC.infrastructure = 35; }
      const zD = projectedZones.find(z => (z.id || z.zoneId) === "D");
      if (zD) { zD.roads = 6; zD.infrastructure = 15; }
    }
    if (timeOffset >= 60) {
      const zB = projectedZones.find(z => (z.id || z.zoneId) === "B");
      if (zB) { zB.roads = 25; zB.infrastructure = 40; }
    }
    return { zones: projectedZones, weather: projectedWeather };
  }

  if (normType === 'WILDFIRE' || normType === 'FIRE') {
    if (timeOffset >= 15) {
      projectedWeather.temperature = 39;
      projectedWeather.wind = 52;
      const zD = projectedZones.find(z => (z.id || z.zoneId) === "D");
      if (zD) { zD.roads = 15; zD.reports = (zD.reports || 0) + 14; }
    }
    if (timeOffset >= 30) {
      const zC = projectedZones.find(z => (z.id || z.zoneId) === "C");
      if (zC) { zC.roads = 22; zC.infrastructure = 40; }
      const zD = projectedZones.find(z => (z.id || z.zoneId) === "D");
      if (zD) { zD.roads = 5; zD.infrastructure = 18; }
    }
    if (timeOffset >= 60) {
      const zE = projectedZones.find(z => (z.id || z.zoneId) === "E");
      if (zE) { zE.connectivity = 0; }
    }
    return { zones: projectedZones, weather: projectedWeather };
  }

  if (normType === 'LANDSLIDE') {
    if (timeOffset >= 15) {
      const zD = projectedZones.find(z => (z.id || z.zoneId) === "D");
      if (zD) { zD.roads = 18; zD.reports = (zD.reports || 0) + 10; }
    }
    if (timeOffset >= 30) {
      const zC = projectedZones.find(z => (z.id || z.zoneId) === "C");
      if (zC) { zC.roads = 25; zC.infrastructure = 42; }
      const zD = projectedZones.find(z => (z.id || z.zoneId) === "D");
      if (zD) { zD.roads = 8; zD.infrastructure = 22; }
    }
    if (timeOffset >= 60) {
      const zD = projectedZones.find(z => (z.id || z.zoneId) === "D");
      if (zD) { zD.roads = 2; zD.infrastructure = 14; }
    }
    return { zones: projectedZones, weather: projectedWeather };
  }

  if (normType === 'CYCLONE' || normType === 'STORM') {
    if (timeOffset >= 15) {
      projectedWeather.wind = 195;
      projectedWeather.rainfall = 75;
      const zD = projectedZones.find(z => (z.id || z.zoneId) === "D");
      if (zD) { zD.roads = 14; zD.infrastructure = 28; zD.reports = (zD.reports || 0) + 16; }
    }
    if (timeOffset >= 30) {
      projectedWeather.wind = 225;
      projectedWeather.rainfall = 110;
      const zC = projectedZones.find(z => (z.id || z.zoneId) === "C");
      if (zC) { zC.roads = 18; zC.floodLevel = 4.8; }
      const zD = projectedZones.find(z => (z.id || z.zoneId) === "D");
      if (zD) { zD.roads = 6; zD.infrastructure = 18; }
    }
    if (timeOffset >= 60) {
      const zE = projectedZones.find(z => (z.id || z.zoneId) === "E");
      if (zE) { zE.connectivity = 0; }
    }
    return { zones: projectedZones, weather: projectedWeather };
  }

  // DEFAULT: FLOOD
  if (timeOffset >= 15) {
    projectedWeather.rainfall = 54;
    projectedWeather.wind = 74;
    projectedWeather.riverCrestMeters = 3.9;

    const zD = projectedZones.find(z => (z.id || z.zoneId) === "D");
    if (zD) { zD.roads = 16; zD.infrastructure = 32; zD.reports = 22; }
    const zC = projectedZones.find(z => (z.id || z.zoneId) === "C");
    if (zC) { zC.roads = 28; zC.floodLevel = 3.9; zC.reports = 18; }
    const zB = projectedZones.find(z => (z.id || z.zoneId) === "B");
    if (zB) { zB.roads = 52; zB.reports = 12; }
  }

  if (timeOffset >= 30) {
    projectedWeather.rainfall = 68;
    projectedWeather.wind = 82;
    projectedWeather.riverCrestMeters = 4.4;

    const zD = projectedZones.find(z => (z.id || z.zoneId) === "D");
    if (zD) { zD.roads = 8; zD.infrastructure = 24; zD.reports = 36; }
    const zC = projectedZones.find(z => (z.id || z.zoneId) === "C");
    if (zC) { zC.roads = 18; zC.floodLevel = 4.4; zC.reports = 27; }
    const zB = projectedZones.find(z => (z.id || z.zoneId) === "B");
    if (zB) { zB.roads = 38; zB.infrastructure = 61; zB.reports = 19; }
    const zE = projectedZones.find(z => (z.id || z.zoneId) === "E");
    if (zE) { zE.floodLevel = 4.2; zE.infrastructure = 18; }
  }

  if (timeOffset >= 60) {
    projectedWeather.rainfall = 92;
    projectedWeather.wind = 95;
    projectedWeather.riverCrestMeters = 5.2;

    const zD = projectedZones.find(z => (z.id || z.zoneId) === "D");
    if (zD) { zD.roads = 4; zD.infrastructure = 15; zD.reports = 52; }
    const zC = projectedZones.find(z => (z.id || z.zoneId) === "C");
    if (zC) { zC.roads = 8; zC.floodLevel = 5.2; zC.reports = 40; }
    const zB = projectedZones.find(z => (z.id || z.zoneId) === "B");
    if (zB) { zB.roads = 22; zB.infrastructure = 48; zB.reports = 31; }
    const zE = projectedZones.find(z => (z.id || z.zoneId) === "E");
    if (zE) { zE.floodLevel = 5.0; zE.connectivity = 4; }
  }

  return { zones: projectedZones, weather: projectedWeather };
}

// ─── BUTTERFLY CHAIN ─────────────────────────────────────────────────
export function generateButterflyChain(timeOffset, disasterType = 'FLOOD') {
  const normType = (disasterType || 'FLOOD').toUpperCase();

  if (normType === 'EARTHQUAKE') {
    return [
      { title: "Ridge Fault Rupture (Mw 6.8)", status: "Triggered", consequence: "Violent surface acceleration across sectors" },
      { title: "Secondary Gas Main Rupture in Commercial Core", status: timeOffset >= 15 ? "Active" : "Pending", consequence: "High ignition hazard (+40m response delay)" },
      { title: "West Viaduct Overpass Buckling", status: timeOffset >= 30 ? "Critical" : "Partial", consequence: "Heavy USAR transport delayed by 38 minutes" },
      { title: "County Trauma Center Generator Compromised", status: timeOffset >= 30 ? "Severe (92%)" : "Guarded (70%)", consequence: "Surgical array switched to auxiliary battery pods" },
      { title: "Mw 5.4 Major Aftershock Cluster", status: timeOffset >= 60 ? "Catastrophic" : "High Probability", consequence: "Progressive collapse of unreinforced masonry" }
    ];
  }

  if (normType === 'TORNADO') {
    return [
      { title: "Funnel Touchdown Confirmed by Ground Spotters", status: "Triggered", consequence: "Direct EF-4 ground swath corridor verified" },
      { title: "High-Voltage Transmission Lines Severed", status: timeOffset >= 15 ? "Active" : "Pending", consequence: "Commercial grid collapse & live wire hazards" },
      { title: "Arterial Highway Impassable from Debris Swath", status: timeOffset >= 30 ? "Critical" : "Partial", consequence: "Emergency medical transit latency quadrupled" },
      { title: "District Underground Shelter Overcrowding", status: timeOffset >= 30 ? "Severe (95%)" : "Guarded (72%)", consequence: "Overflow diverted to secondary storm bunkers" },
      { title: "Tornadic Vortex Wedge Crossing Sector D", status: timeOffset >= 60 ? "Catastrophic" : "Impending Path", consequence: "Widespread structural leveling across path" }
    ];
  }

  if (normType === 'WILDFIRE' || normType === 'FIRE') {
    return [
      { title: "Chaparral Crown Fire Flashover", status: "Triggered", consequence: "Rapid front propagation into timber ridge" },
      { title: "Pyrocumulus Smoke Zero-Visibility along Valley Route", status: timeOffset >= 15 ? "Active" : "Pending", consequence: "Primary mountain evacuation artery closed" },
      { title: "Secondary Ember Spotting 1.5km Ahead of Front", status: timeOffset >= 30 ? "Critical" : "Partial", consequence: "Defensive bulldozer containment line breached" },
      { title: "Canyon Trauma Hospital Mandatory Evacuation", status: timeOffset >= 30 ? "Severe (94%)" : "Guarded (72%)", consequence: "Critical ICU patients transferred to mobile convoys" },
      { title: "Flame Front Reaches Western Urban Edge", status: timeOffset >= 60 ? "Catastrophic" : "Approaching", consequence: "Direct structure-to-structure firestorm ignition" }
    ];
  }

  if (normType === 'LANDSLIDE') {
    return [
      { title: "Headscarp Tension Cracks Exceed Geotechnical Limit", status: "Triggered", consequence: "Saturated colluvial mass begins shear descent" },
      { title: "Mountain Highway Blocked by 15,000m³ Initial Flow", status: timeOffset >= 15 ? "Active" : "Pending", consequence: "Valley bypass gridlock (+50m delay)" },
      { title: "River Confluence Impounded by Mud Debris", status: timeOffset >= 30 ? "Critical" : "Partial", consequence: "Dangerous upstream backwater damming" },
      { title: "Mountain Clinic Medical Access Severed", status: timeOffset >= 30 ? "Severe (91%)" : "Guarded (68%)", consequence: "Medevac air bridge required for patient transport" },
      { title: "Catastrophic 85,000m³ Escarpment Wall Collapse", status: timeOffset >= 60 ? "Catastrophic" : "Imminent", consequence: "Complete burial of secondary lifeline arteries" }
    ];
  }

  if (normType === 'CYCLONE' || normType === 'STORM') {
    return [
      { title: "Eyewall Landfall: 185 km/h Sustained Gale", status: "Triggered", consequence: "Immediate structural roof detachment & marine destruction" },
      { title: "Biscayne Seawall Overtopped by 4.2m Surge", status: timeOffset >= 15 ? "Active" : "Pending", consequence: "Harbor docks and coastal promenade submerged" },
      { title: "Coastal Boulevard Impassable from Seawater", status: timeOffset >= 30 ? "Critical" : "Partial", consequence: "Ground ambulance access to maritime district severed" },
      { title: "Maritime Hospital Basement Power Submerged", status: timeOffset >= 30 ? "Severe (96%)" : "Guarded (74%)", consequence: "ICU array operating on emergency roof batteries" },
      { title: "Peak High Tide Storm Surge Wave Front (5.6m)", status: timeOffset >= 60 ? "Catastrophic" : "Surging", consequence: "Catastrophic seawater penetration across barrier sectors" }
    ];
  }

  // DEFAULT: FLOOD (SCENARIO #027)
  return [
    { title: "Bridge 17 Compromised", status: timeOffset >= 15 ? "Triggered" : "Pending", consequence: "Heavy vehicle diversion" },
    { title: "Traffic Diverted to Residential Arterials", status: timeOffset >= 15 ? "Active" : "Pending", consequence: "Zone B gridlock (+45m delay)" },
    { title: "Road 17 Inaccessible to Ambulances", status: timeOffset >= 30 ? "Critical" : "Partial", consequence: "EMS response times tripled" },
    { title: "South General Hospital Overloaded", status: timeOffset >= 30 ? "Severe (94%)" : "Guarded (72%)", consequence: "Trauma queue overflow" },
    { title: "East Delta Zone E Unmonitored Breach", status: timeOffset >= 60 ? "Catastrophic" : "Unmonitored Gap", consequence: "Chemical & civilian isolation" }
  ];
}
