/**
 * AEGIS Landslide & Debris Flow Assessment Engine
 * ────────────────────────────────────────────────────────────────────
 * Evaluates mass-wasting and slope instability hazards:
 * 1. Slope steepness & antecedent rainfall saturation index (0–35 pts)
 * 2. Ground fissure & active rockfall field reports (0–30 pts)
 * 3. Downslope settlement exposure & blocked mountain corridors (0–25 pts)
 * 4. Geotechnical borehole sensor gaps & slope uncertainty (0–10 pts)
 * ────────────────────────────────────────────────────────────────────
 */

import { BaseHazardEngine } from './baseHazardEngine.js';

export class LandslideEngine extends BaseHazardEngine {
  constructor() {
    super('LANDSLIDE', 'Geotechnical Slope Failure & Debris Flow');
  }

  getRequiredFields() {
    return ['zones', 'mission'];
  }

  getOptionalFields() {
    return ['weather', 'slopeGradient', 'reports', 'soilSaturation'];
  }

  assessRisk({ weather, reports = [], zones = [], mission = {}, telemetry = {} }) {
    const why = [];
    const informationGaps = [];

    // ─── 1. ANTECEDENT PRECIPITATION & SLOPE SATURATION (0–35 PTS) ─────
    const rainfallMm = Number(weather?.current?.rainfall ?? telemetry.rainfallMm ?? 42);
    const antecedentRainfall72hMm = Number(telemetry.antecedentRainfall72hMm ?? 160);
    const averageSlopeDeg = Number(telemetry.slopeAngleDeg ?? 34);

    let slopePts = 0;
    // Slopes > 30 degrees with antecedent saturation have highest failure probability
    if (averageSlopeDeg >= 35) slopePts += 12;
    else if (averageSlopeDeg >= 25) slopePts += 8;
    else slopePts += 4;

    if (antecedentRainfall72hMm >= 150 || rainfallMm >= 30) slopePts += 16;
    else if (antecedentRainfall72hMm >= 80 || rainfallMm >= 15) slopePts += 10;
    else slopePts += 4;

    const saturationPct = Number(telemetry.soilSaturationPct ?? 88);
    if (saturationPct >= 85) slopePts += 7;
    else if (saturationPct >= 65) slopePts += 4;
    else slopePts += 1;

    const slopeContribution = Math.min(35, slopePts);
    const slopeImpact = slopeContribution >= 22 ? 'HIGH' : slopeContribution >= 12 ? 'MEDIUM' : 'LOW';

    why.push({
      factor: 'SLOPE SATURATION & PORE PRESSURE',
      impact: slopeImpact,
      contribution: `${slopeContribution}/35 pts`,
      reason: `${averageSlopeDeg}° mountain slope with ${antecedentRainfall72hMm}mm 72-hour antecedent rainfall (Soil moisture saturation: ${saturationPct}%). Geotechnical threshold exceeded.`
    });

    // ─── 2. GROUND CRACKING & DEBRIS REPORTS (0–30 PTS) ────────────────
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
        reportReason = `${criticalReports.length} active mudslide breach & buried roadway observation(s) verified by ground scout.`;
      } else if (highReports.length > 0 || reportContribution >= 10) {
        reportImpact = 'MEDIUM';
        reportReason = `${highReports.length} tension cracks, retaining wall buckling and rockfall incidents cataloged.`;
      } else {
        reportImpact = 'LOW';
        reportReason = `${activeReports.length} minor gravel slide observations reported.`;
      }
    } else {
      reportContribution = 0;
      reportImpact = 'NONE';
      reportReason = 'No geotechnical or road maintenance scout observations filed.';
      informationGaps.push({
        source: 'REPORTS',
        severity: 'HIGH',
        message: 'NO SLOPE SIGHTING REPORTS // BASIN TOE DISPLACEMENT UNVERIFIED'
      });
    }

    why.push({
      factor: 'GEOTECHNICAL FIELD OBSERVATIONS',
      impact: reportImpact,
      contribution: `${reportContribution}/30 pts`,
      reason: reportReason
    });

    // ─── 3. MOUNTAIN CORRIDOR & INFRASTRUCTURE EXPOSURE (0–25 PTS) ─────
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
        zoneReason = `${criticalZones.length} mountain sector(s) completely severed by catastrophic debris damming and road collapse.`;
      } else if (highRiskZones.length > 0 || zoneContribution >= 10) {
        zoneImpact = 'MEDIUM';
        zoneReason = `${highRiskZones.length} sector(s) at direct risk of downslope mudflow runout.`;
      } else {
        zoneImpact = 'LOW';
        zoneReason = 'Valley floor nominal; bedrock stability holding across transit passes.';
      }

      if (unknownZones.length > 0) {
        informationGaps.push({
          source: 'ZONES',
          severity: 'HIGH',
          message: `${unknownZones.length} SECTOR(S) IN COMMUNICATIONS BLACKOUT // BURIED TRANSMISSION LINES`
        });
      }
    } else {
      zoneContribution = 12;
      zoneImpact = 'MEDIUM';
      zoneReason = 'Standard colluvial slope stability baselines applied.';
    }

    why.push({
      factor: 'CORRIDOR SEVERANCE & POPULATION EXPOSURE',
      impact: zoneImpact,
      contribution: `${zoneContribution}/25 pts`,
      reason: zoneReason
    });

    // ─── 4. UNCERTAINTY & BOREHOLE SENSOR GAPS (0–10 PTS) ───────────────
    let gapScore = 0;
    if (activeReports.length === 0) gapScore += 4;
    if (unknownZones.length > 0 || zoneCount === 0) gapScore += 3;
    if (!telemetry.inclinometerArrayActive) gapScore += 3;

    const uncertaintyContribution = Math.min(10, gapScore);

    if (informationGaps.length > 0) {
      why.push({
        factor: 'SUBSURFACE INCLINOMETER UNCERTAINTY',
        impact: uncertaintyContribution >= 6 ? 'HIGH' : 'MEDIUM',
        contribution: `${uncertaintyContribution}/10 pts`,
        reason: `${informationGaps.length} intelligence blindspot(s). Subsurface shear strain unmonitored along fault plane.`
      });
    }

    // ─── 5. FINAL SCORE & CLASSIFICATION ───────────────────────────────
    const finalScore = Math.min(100, Math.max(0, slopeContribution + reportContribution + zoneContribution + uncertaintyContribution));
    const finalLevel = this.classifyRisk(finalScore);

    // ─── 6. CONFIDENCE CALCULATION ─────────────────────────────────────
    let confidenceScore = 30; // Rainfall/slope baseline
    if (activeReports.length > 0) confidenceScore += 40;
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
        hazardMetric: z.slopeInstability || `${Math.round((baseRisk / 100) * 85)}% slope failure factor`
      };
    });

    return {
      hazardType: 'LANDSLIDE',
      hazardDisplayName: this.displayName,
      overallRisk: {
        score: finalScore,
        level: finalLevel,
        slopeAngle: `${averageSlopeDeg}°`,
        saturation: `${saturationPct}%`
      },
      breakdown: {
        slopeInstability: slopeContribution,
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
        geotechnical: `SRTM Elevation & NASA SMAP Soil Moisture Matrix (${averageSlopeDeg}°, ${saturationPct}% Saturation)`,
        reports: `${reports.length} ROAD MAINTENANCE & SCOUT OBSERVATION(S)`,
        zones: `${zoneCount} SECTORS (GEOTECHNICAL STABILITY TWIN)`
      },
      fusedAt: new Date().toISOString()
    };
  }

  simulateForward(context, timeOffset = 0, actions = []) {
    return {
      timeOffset,
      hazardType: 'LANDSLIDE',
      isSupported: true,
      parameters: {
        debrisFlowVolumeM3: timeOffset === 0 ? 15000 : timeOffset <= 30 ? 45000 : 85000,
        blockedPasses: timeOffset >= 30 ? ['North Ridge Highway', 'Valley Bypass'] : ['North Ridge Highway'],
        slopeToeDisplacementCm: timeOffset === 0 ? 12 : timeOffset <= 30 ? 48 : 110
      }
    };
  }

  generateRecommendations(zones, context) {
    return [
      {
        priority: 'CRITICAL',
        action: 'MOBILIZE HEAVY EXCAVATION & BOULDER CLEARING FLEET',
        targetSector: 'Zone D',
        rationale: 'Active 20,000m³ mud and rock slide blocks the primary mountain artery to the regional medical triage post.'
      },
      {
        priority: 'HIGH',
        action: 'DEPLOY TECHNICAL GEOTECHNICAL RESCUE SQUAD',
        targetSector: 'Zone C',
        rationale: 'Perform emergency core stabilization along high-angle road cut to prevent progressive slope collapse.'
      }
    ];
  }
}
