/**
 * AEGIS Tornado Assessment Engine
 * ────────────────────────────────────────────────────────────────────
 * Evaluates violent convective storms and tornadic vortex corridors:
 * 1. Rotational velocity, Enhanced Fujita rating & radar warnings (0–35 pts)
 * 2. Swath damage & debris field reports (0–30 pts)
 * 3. Mobile home & light-frame structural vulnerability (0–25 pts)
 * 4. Radar beam occultation & warning lead time uncertainty (0–10 pts)
 * ────────────────────────────────────────────────────────────────────
 */

import { BaseHazardEngine } from './baseHazardEngine.js';

export class TornadoEngine extends BaseHazardEngine {
  constructor() {
    super('TORNADO', 'Tornadic Vortex & Severe Convective Storm');
  }

  getRequiredFields() {
    return ['zones', 'mission'];
  }

  getOptionalFields() {
    return ['weather', 'dopplerRadar', 'reports', 'warningLeadTime'];
  }

  assessRisk({ weather, reports = [], zones = [], mission = {}, telemetry = {} }) {
    const why = [];
    const informationGaps = [];

    // ─── 1. VORTEX INTENSITY & DOPPLER WARNINGS (0–35 PTS) ─────────────
    const windSpeedKmh = Number(weather?.current?.windSpeed ?? telemetry.windSpeedKmh ?? 260);
    const efRating = mission.efRating || telemetry.efRating || (windSpeedKmh >= 322 ? 'EF-5' : windSpeedKmh >= 267 ? 'EF-4' : windSpeedKmh >= 218 ? 'EF-3' : windSpeedKmh >= 178 ? 'EF-2' : 'EF-1');
    const warningLeadMinutes = Number(telemetry.warningLeadMinutes ?? 18);

    let vortexPts = 0;
    if (efRating === 'EF-5' || efRating === 'EF-4') vortexPts += 22;
    else if (efRating === 'EF-3') vortexPts += 17;
    else if (efRating === 'EF-2') vortexPts += 12;
    else vortexPts += 7;

    // Severe weather warning status
    const warningStatus = telemetry.warningStatus || 'TORNADO_WARNING_ACTIVE';
    if (warningStatus === 'TORNADO_EMERGENCY') vortexPts += 8;
    else if (warningStatus === 'TORNADO_WARNING_ACTIVE') vortexPts += 6;
    else vortexPts += 2;

    // Warning lead time factor: short lead times (< 10 min) severely compound civilian exposure
    if (warningLeadMinutes < 10) vortexPts += 5;
    else if (warningLeadMinutes < 20) vortexPts += 3;
    else vortexPts += 1;

    const vortexContribution = Math.min(35, vortexPts);
    const vortexImpact = vortexContribution >= 22 ? 'HIGH' : vortexContribution >= 12 ? 'MEDIUM' : 'LOW';

    why.push({
      factor: 'ROTATIONAL WIND SHEAR & VORTEX',
      impact: vortexImpact,
      contribution: `${vortexContribution}/35 pts`,
      reason: `Violent convective supercell rated ${efRating} with rotational wind shear peaking at ${windSpeedKmh} km/h (Warning lead time: ${warningLeadMinutes}m).`
    });

    // ─── 2. GROUND SWATH & DEBRIS FIELD OBSERVATIONS (0–30 PTS) ────────
    let reportContribution = 0;
    let reportImpact = 'LOW';
    let reportReason = '';

    const activeReports = reports.filter(r => r.status !== 'DISMISSED');
    const criticalReports = activeReports.filter(r => r.severity === 'CRITICAL');
    const highReports = activeReports.filter(r => r.severity === 'HIGH');

    if (activeReports.length > 0) {
      let repScore = 0;
      activeReports.forEach(r => {
        let weight = 1;
        if (r.severity === 'CRITICAL') weight = 10;
        else if (r.severity === 'HIGH') weight = 6;
        else if (r.severity === 'MEDIUM') weight = 3;
        else weight = 1;

        if (r.status === 'RESOLVED') weight *= 0.3;
        repScore += weight;
      });

      reportContribution = Math.min(30, Math.round(repScore));

      if (criticalReports.length > 0 || reportContribution >= 20) {
        reportImpact = 'HIGH';
        reportReason = `${criticalReports.length} direct funnel ground contact and debris scattering reports verified.`;
      } else if (highReports.length > 0 || reportContribution >= 10) {
        reportImpact = 'MEDIUM';
        reportReason = `${highReports.length} severe roof shearing, downed powerlines and blocked arterial routes reported.`;
      } else {
        reportImpact = 'LOW';
        reportReason = `${activeReports.length} peripheral wind/hail observations reported.`;
      }
    } else {
      reportContribution = 0;
      reportImpact = 'NONE';
      reportReason = 'No ground spotter or emergency field reports received from projected swath path.';
      informationGaps.push({
        source: 'REPORTS',
        severity: 'HIGH',
        message: 'NO GROUND SPOTTER TELEMETRY // FUNNEL TOUCHDOWN LOCATION UNCONFIRMED'
      });
    }

    why.push({
      factor: 'DEBRIS FIELD OBSERVATIONS',
      impact: reportImpact,
      contribution: `${reportContribution}/30 pts`,
      reason: reportReason
    });

    // ─── 3. STRUCTURE VULNERABILITY & TRAJECTORY EXPOSURE (0–25 PTS) ─────
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
        zoneReason = `${criticalZones.length} sector(s) squarely aligned with active tornadic swath trajectory.`;
      } else if (highRiskZones.length > 0 || zoneContribution >= 10) {
        zoneImpact = 'MEDIUM';
        zoneReason = `${highRiskZones.length} sector(s) in peripheral hook echo with high concentration of vulnerable roofs.`;
      } else {
        zoneImpact = 'LOW';
        zoneReason = 'Reinforced shelter corridors available; sectors outside primary trajectory envelope.';
      }

      if (unknownZones.length > 0) {
        informationGaps.push({
          source: 'ZONES',
          severity: 'HIGH',
          message: `${unknownZones.length} SECTOR(S) IN COMMUNICATIONS BLACKOUT // CELL TOWERS FLATTENED`
        });
      }
    } else {
      zoneContribution = 12;
      zoneImpact = 'MEDIUM';
      zoneReason = 'Standard trailer/frame construction regional vulnerability model applied.';
    }

    why.push({
      factor: 'SWATH TRAJECTORY & EXPOSURE',
      impact: zoneImpact,
      contribution: `${zoneContribution}/25 pts`,
      reason: zoneReason
    });

    // ─── 4. UNCERTAINTY & RADAR BLINDSPOTS (0–10 PTS) ───────────────────
    let gapScore = 0;
    if (activeReports.length === 0) gapScore += 4;
    if (unknownZones.length > 0 || zoneCount === 0) gapScore += 3;
    if (!telemetry.dopplerRadialScan) gapScore += 3;

    const uncertaintyContribution = Math.min(10, gapScore);

    if (informationGaps.length > 0) {
      why.push({
        factor: 'RADAR SURVEILLANCE UNCERTAINTY',
        impact: uncertaintyContribution >= 6 ? 'HIGH' : 'MEDIUM',
        contribution: `${uncertaintyContribution}/10 pts`,
        reason: `${informationGaps.length} intelligence blindspot(s). Low-level vortex cyclogenesis unverified on radar scan.`
      });
    }

    // ─── 5. FINAL SCORE & CLASSIFICATION ───────────────────────────────
    const finalScore = Math.min(100, Math.max(0, vortexContribution + reportContribution + zoneContribution + uncertaintyContribution));
    const finalLevel = this.classifyRisk(finalScore);

    // ─── 6. CONFIDENCE CALCULATION ─────────────────────────────────────
    let confidenceScore = 35; // Doppler telemetry
    if (activeReports.length > 0) confidenceScore += 35;
    if (zoneCount > 0 && unknownZones.length === 0) confidenceScore += 30;
    else if (zoneCount > 0) confidenceScore += 15;

    const confidenceLevel = this.classifyConfidence(confidenceScore);

    // ─── 7. FUSED ZONE INTELLIGENCE ────────────────────────────────────
    const zonesIntelligence = zones.map(z => {
      const zid = z.zoneId || z.id;
      const baseRisk = Number(z.risk) || 0;
      const zLevel = this.classifyRisk(baseRisk);

      return {
        id: zid,
        name: z.name || `Sector ${zid}`,
        score: baseRisk,
        level: zLevel,
        status: z.status || (zLevel === 'CRITICAL' ? 'CRITICAL' : 'STABLE'),
        population: z.population || 0,
        roadAccess: z.roadAccess !== undefined ? z.roadAccess : 100,
        health: z.health !== undefined ? z.health : 100,
        hazardMetric: z.swathProximity || `${Math.round((baseRisk / 100) * 320)} km/h vortex gust potential`
      };
    });

    return {
      hazardType: 'TORNADO',
      hazardDisplayName: this.displayName,
      overallRisk: {
        score: finalScore,
        level: finalLevel,
        efRating,
        windVelocity: `${windSpeedKmh} km/h`
      },
      breakdown: {
        vortex: vortexContribution,
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
        radar: `NEXRAD Doppler Radar Network (${efRating}, ${windSpeedKmh} km/h)`,
        reports: `${reports.length} SPOTTER & GROUND SIGHTING(S)`,
        zones: `${zoneCount} SECTORS (SWATH IMPACT TWIN)`
      },
      fusedAt: new Date().toISOString()
    };
  }

  simulateForward(context, timeOffset = 0, actions = []) {
    return {
      timeOffset,
      hazardType: 'TORNADO',
      isSupported: true,
      parameters: {
        estimatedSwathLengthKm: timeOffset === 0 ? 4.2 : timeOffset <= 30 ? 14.8 : 26.5,
        projectedTouchdownZones: timeOffset >= 30 ? ['Zone B', 'Zone C', 'Zone D'] : ['Zone D'],
        debrisObstructionIndex: timeOffset >= 30 ? 'EXTREME' : 'MODERATE'
      }
    };
  }

  generateRecommendations(zones, context) {
    return [
      {
        priority: 'CRITICAL',
        action: 'EXECUTE IMMEDIATE MASS UNDERGROUND SHELTER ALERTS',
        targetSector: 'Zone D',
        rationale: 'Projected EF-4 ground swath corridor passes directly over unreinforced residential housing within 12 minutes.'
      },
      {
        priority: 'HIGH',
        action: 'STAGE DEBRIS CLEARANCE & HEAVY ROTARY CONVOYS',
        targetSector: 'Zone B',
        rationale: 'High probability of downed high-voltage lines severing ambulance access along major commercial arterials.'
      }
    ];
  }
}
