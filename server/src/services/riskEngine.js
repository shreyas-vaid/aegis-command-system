/**
 * AEGIS 2.0 Deterministic Risk Fusion Engine
 * ────────────────────────────────────────────────────────────────────
 * Computes explainable, deterministic multi-source risk scores by fusing:
 * 1. Live Weather Telemetry (0–35 pts)
 * 2. Field Intelligence Reports (0–30 pts)
 * 3. Sector Infrastructure Vulnerability (0–25 pts)
 * 4. Information Uncertainty & Surveillance Gaps (0–10 pts)
 *
 * Strict Determinism: Given identical inputs, produces identical outputs.
 * No external AI, no LLM hallucinations, no random numbers.
 * ────────────────────────────────────────────────────────────────────
 */

export function calculateFusedRisk({ weather, reports = [], zones = [], mission = {} }) {
  const why = [];
  const informationGaps = [];

  // ─── 1. WEATHER SIGNAL (0–35 PTS) ──────────────────────────────────
  let weatherContribution = 0;
  let weatherAvailable = false;
  let weatherStatus = 'AVAILABLE';
  let weatherReason = '';
  let weatherImpact = 'LOW';

  if (weather && weather.current && weather.current.temperature !== null) {
    weatherAvailable = true;
    const current = weather.current;
    const rainfall = Number(current.rainfall ?? current.precipitation ?? 0);
    const windSpeed = Number(current.windSpeed ?? 0);
    const condition = current.condition || 'UNKNOWN';

    let rainPts = 0;
    if (rainfall >= 15) rainPts = 22;
    else if (rainfall >= 8) rainPts = 18;
    else if (rainfall >= 4) rainPts = 12;
    else if (rainfall >= 1) rainPts = 6;
    else if (rainfall > 0) rainPts = 3;

    let condPts = 0;
    if (condition === 'THUNDERSTORM') condPts = 10;
    else if (condition === 'HEAVY_RAIN') condPts = 9;
    else if (condition === 'RAIN' || condition === 'FREEZING_RAIN') condPts = 6;
    else if (condition === 'DRIZZLE') condPts = 3;
    else if (condition === 'FOG' || condition === 'CLOUDY') condPts = 1;

    let windPts = 0;
    if (windSpeed >= 45) windPts = 5;
    else if (windSpeed >= 25) windPts = 3;
    else if (windSpeed >= 12) windPts = 1;

    weatherContribution = Math.min(35, rainPts + condPts + windPts);

    if (weatherContribution >= 22) {
      weatherImpact = 'HIGH';
      weatherReason = `Severe precipitation (${rainfall}mm) and ${current.conditionLabel || condition} elevate regional flood hazard.`;
    } else if (weatherContribution >= 10) {
      weatherImpact = 'MEDIUM';
      weatherReason = `Moderate precipitation (${rainfall}mm) with sustained winds of ${windSpeed} km/h.`;
    } else {
      weatherImpact = 'LOW';
      weatherReason = `Atmospheric conditions are stable (${current.conditionLabel || condition}, ${Math.round(current.temperature)}°C).`;
    }
  } else {
    weatherAvailable = false;
    weatherStatus = 'UNAVAILABLE';
    weatherContribution = null; // Stored as UNKNOWN
    weatherImpact = 'UNKNOWN';
    weatherReason = 'Live meteorological telemetry link is temporarily offline or unresolvable.';
    informationGaps.push({
      source: 'WEATHER',
      severity: 'MEDIUM',
      message: 'WEATHER SIGNAL UNAVAILABLE // SATELLITE/STATION TELEMETRY GAP'
    });
  }

  why.push({
    factor: 'METEOROLOGICAL CONDITIONS',
    impact: weatherImpact,
    contribution: weatherContribution !== null ? `${weatherContribution}/35 pts` : 'UNKNOWN',
    reason: weatherReason
  });

  // ─── 2. FIELD REPORTS SIGNAL (0–30 PTS) ─────────────────────────────
  let reportContribution = 0;
  let reportImpact = 'LOW';
  let reportReason = '';

  const activeReports = reports.filter(r => r.status !== 'DISMISSED');
  const criticalReports = activeReports.filter(r => r.severity === 'CRITICAL');
  const highReports = activeReports.filter(r => r.severity === 'HIGH');
  const mediumReports = activeReports.filter(r => r.severity === 'MEDIUM');
  const lowReports = activeReports.filter(r => r.severity === 'LOW');

  if (activeReports.length > 0) {
    let repScore = 0;
    activeReports.forEach(r => {
      let weight = 1;
      if (r.severity === 'CRITICAL') weight = 10;
      else if (r.severity === 'HIGH') weight = 6;
      else if (r.severity === 'MEDIUM') weight = 3;
      else if (r.severity === 'LOW') weight = 1;

      // Resolved reports have reduced impact
      if (r.status === 'RESOLVED') {
        weight *= 0.3;
      }
      repScore += weight;
    });

    reportContribution = Math.min(30, Math.round(repScore));

    if (criticalReports.length > 0 || reportContribution >= 20) {
      reportImpact = 'HIGH';
      reportReason = `${criticalReports.length} Critical and ${highReports.length} High severity human field observations verified in theater.`;
    } else if (highReports.length > 0 || reportContribution >= 10) {
      reportImpact = 'MEDIUM';
      reportReason = `${highReports.length} High and ${mediumReports.length} Medium severity incident reports cataloged.`;
    } else {
      reportImpact = 'LOW';
      reportReason = `${activeReports.length} minor operational observations reported.`;
    }
  } else {
    reportContribution = 0;
    reportImpact = 'NONE';
    reportReason = 'No active field intelligence reports recorded for this operation.';
    informationGaps.push({
      source: 'REPORTS',
      severity: 'HIGH',
      message: 'NO FIELD REPORTS AVAILABLE // INFORMATION GAP ACROSS THEATER'
    });
  }

  why.push({
    factor: 'HUMAN FIELD INTELLIGENCE',
    impact: reportImpact,
    contribution: `${reportContribution}/30 pts`,
    reason: reportReason
  });

  // ─── 3. ZONE INFRASTRUCTURE VULNERABILITY (0–25 PTS) ───────────────
  let zoneContribution = 0;
  let zoneImpact = 'LOW';
  let zoneReason = '';

  const zoneCount = zones.length;
  let criticalZones = [];
  let highRiskZones = [];
  let unknownZones = [];

  if (zoneCount > 0) {
    criticalZones = zones.filter(z => (z.risk >= 85 || z.status === 'CRITICAL'));
    highRiskZones = zones.filter(z => (z.risk >= 65 && z.risk < 85) || z.status === 'HIGH_RISK');
    unknownZones = zones.filter(z => z.status === 'UNKNOWN' || z.connectivity <= 20);

    const totalZoneRisk = zones.reduce((acc, z) => acc + (Number(z.risk) || 0), 0);
    const avgRisk = totalZoneRisk / zoneCount;

    zoneContribution = Math.min(25, Math.round((avgRisk / 100) * 25));

    if (criticalZones.length > 0 || zoneContribution >= 18) {
      zoneImpact = 'HIGH';
      zoneReason = `${criticalZones.length} sector(s) experiencing critical infrastructure/access failure.`;
    } else if (highRiskZones.length > 0 || zoneContribution >= 10) {
      zoneImpact = 'MEDIUM';
      zoneReason = `${highRiskZones.length} sector(s) flagged under high systemic flood and logistics risk.`;
    } else {
      zoneImpact = 'LOW';
      zoneReason = `Regional infrastructure operating within nominal stability parameters.`;
    }

    if (unknownZones.length > 0) {
      informationGaps.push({
        source: 'ZONES',
        severity: 'HIGH',
        message: `${unknownZones.length} SECTOR(S) IN COMMUNICATIONS BLACKOUT // TELEMETRY GAP (ZONE ${unknownZones.map(z => z.zoneId || z.id).join(', ')})`
      });
    }
  } else {
    // Default baseline when zones not yet provisioned
    zoneContribution = 12;
    zoneImpact = 'MEDIUM';
    zoneReason = 'Standard sector topological baselines applied.';
    informationGaps.push({
      source: 'ZONES',
      severity: 'MEDIUM',
      message: 'ZONE DATA INCOMPLETE // USING REGIONAL TOPOLOGICAL BASELINE'
    });
  }

  why.push({
    factor: 'INFRASTRUCTURE EXPOSURE',
    impact: zoneImpact,
    contribution: `${zoneContribution}/25 pts`,
    reason: zoneReason
  });

  // ─── 4. INFORMATION UNCERTAINTY & GAPS (0–10 PTS) ────────────────────
  let gapScore = 0;
  if (!weatherAvailable) gapScore += 4;
  if (activeReports.length === 0) gapScore += 3;
  if (unknownZones.length > 0 || zoneCount === 0) gapScore += 3;

  const uncertaintyContribution = Math.min(10, gapScore);

  if (informationGaps.length > 0) {
    why.push({
      factor: 'SURVEILLANCE UNCERTAINTY',
      impact: uncertaintyContribution >= 6 ? 'HIGH' : 'MEDIUM',
      contribution: `${uncertaintyContribution}/10 pts`,
      reason: `${informationGaps.length} critical intelligence gap(s) identified (Uncertainty penalty applied).`
    });
  }

  // ─── 5. COMPUTE OVERALL RISK SCORE & LEVEL ─────────────────────────
  let finalScore = 0;
  if (weatherAvailable) {
    finalScore = Math.min(100, Math.max(0, weatherContribution + reportContribution + zoneContribution + uncertaintyContribution));
  } else {
    // When weather is unavailable, normalize non-weather total (max 65 pts) to 100-point scale
    const partialTotal = reportContribution + zoneContribution + uncertaintyContribution;
    finalScore = Math.min(100, Math.round((partialTotal / 65) * 85));
  }

  let finalLevel = 'LOW';
  if (finalScore >= 85) finalLevel = 'CRITICAL';
  else if (finalScore >= 70) finalLevel = 'HIGH';
  else if (finalScore >= 40) finalLevel = 'MEDIUM';
  else finalLevel = 'LOW';

  // ─── 6. CONFIDENCE CALCULATION ──────────────────────────────────────
  let confidenceScore = 0;
  if (weatherAvailable) confidenceScore += 35;
  if (activeReports.length > 0) confidenceScore += 35;
  if (zoneCount > 0 && unknownZones.length === 0) confidenceScore += 30;
  else if (zoneCount > 0) confidenceScore += 15;

  let confidenceLevel = 'LOW';
  if (confidenceScore >= 80) confidenceLevel = 'HIGH';
  else if (confidenceScore >= 45) confidenceLevel = 'MEDIUM';
  else confidenceLevel = 'LOW';

  // ─── 7. FUSED ZONE INTELLIGENCE ─────────────────────────────────────
  const zonesIntelligence = zones.map(z => {
    const zid = z.zoneId || z.id;
    const baseRisk = Number(z.risk) || 0;

    let zLevel = 'LOW';
    if (baseRisk >= 85) zLevel = 'CRITICAL';
    else if (baseRisk >= 65) zLevel = 'HIGH';
    else if (baseRisk >= 35) zLevel = 'MEDIUM';

    return {
      id: zid,
      name: z.name || `Sector ${zid}`,
      score: baseRisk,
      level: zLevel,
      status: z.status || (zLevel === 'CRITICAL' ? 'CRITICAL' : 'STABLE'),
      population: z.population || 0,
      roadAccess: z.roadAccess !== undefined ? z.roadAccess : 100,
      health: z.health !== undefined ? z.health : 100
    };
  });

  return {
    overallRisk: {
      score: finalScore,
      level: finalLevel,
      weatherStatus,
      isWeatherAvailable: weatherAvailable
    },
    breakdown: {
      weather: weatherContribution,
      reports: reportContribution,
      zones: zoneContribution,
      uncertainty: uncertaintyContribution
    },
    confidence: {
      level: confidenceLevel,
      score: confidenceScore
    },
    informationGap: {
      level: informationGaps.length >= 2 ? 'HIGH' : informationGaps.length === 1 ? 'MEDIUM' : 'LOW',
      count: informationGaps.length,
      gaps: informationGaps
    },
    reportsSummary: {
      total: reports.length,
      active: activeReports.length,
      critical: criticalReports.length,
      high: highReports.length,
      medium: mediumReports.length,
      low: lowReports.length
    },
    zonesSummary: {
      total: zoneCount,
      critical: criticalZones.length,
      highRisk: highRiskZones.length,
      unknown: unknownZones.length
    },
    zonesIntelligence,
    why,
    dataSources: {
      weather: weatherAvailable ? `Open-Meteo (${weather.source || 'Live Satellite/Radar'})` : 'UNAVAILABLE',
      reports: `${reports.length} FIELD OBSERVATION(S)`,
      zones: `${zoneCount} SECTORS (DIGITAL TWIN MATRIX)`
    },
    fusedAt: new Date().toISOString()
  };
}
