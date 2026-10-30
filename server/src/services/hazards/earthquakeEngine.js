/**
 * AEGIS Earthquake Assessment Engine
 * ────────────────────────────────────────────────────────────────────
 * Deterministic seismic impact intelligence.
 * Evaluates:
 * 1. Seismic magnitude, focal depth, and ground shaking (0–35 pts)
 * 2. Structural collapse & damage field reports (0–30 pts)
 * 3. Building vulnerability & critical lifeline integrity (0–25 pts)
 * 4. Seismic telemetry gaps & aftershock uncertainty (0–10 pts)
 * ────────────────────────────────────────────────────────────────────
 */

import { BaseHazardEngine } from './baseHazardEngine.js';

export class EarthquakeEngine extends BaseHazardEngine {
  constructor() {
    super('EARTHQUAKE', 'Seismic Rupture & Structural Collapse');
  }

  getRequiredFields() {
    return ['zones', 'mission'];
  }

  getOptionalFields() {
    return ['seismicData', 'reports', 'structuralVulnerability', 'aftershocks'];
  }

  assessRisk({ weather, reports = [], zones = [], mission = {}, telemetry = {} }) {
    const why = [];
    const informationGaps = [];

    // ─── 1. SEISMIC GROUND SHAKING (0–35 PTS) ──────────────────────────
    // Derive from mission metadata or seismic parameters
    const magnitude = Number(mission.magnitude || telemetry.magnitude || 6.8);
    const depthKm = Number(mission.focalDepthKm || telemetry.focalDepthKm || 12);
    const pgaG = Number(mission.peakGroundAcceleration || telemetry.peakGroundAcceleration || 0.42); // in g

    let seismicPts = 0;
    if (magnitude >= 7.5) seismicPts += 22;
    else if (magnitude >= 6.5) seismicPts += 18;
    else if (magnitude >= 5.5) seismicPts += 12;
    else if (magnitude >= 4.5) seismicPts += 6;
    else seismicPts += 3;

    // Shallow earthquakes (< 20km) cause significantly greater surface destruction
    if (depthKm <= 15) seismicPts += 8;
    else if (depthKm <= 35) seismicPts += 4;
    else seismicPts += 1;

    // Peak Ground Acceleration (PGA) contribution
    if (pgaG >= 0.35) seismicPts += 5;
    else if (pgaG >= 0.20) seismicPts += 3;
    else if (pgaG >= 0.10) seismicPts += 1;

    const seismicContribution = Math.min(35, seismicPts);
    const seismicImpact = seismicContribution >= 22 ? 'HIGH' : seismicContribution >= 12 ? 'MEDIUM' : 'LOW';

    why.push({
      factor: 'SEISMIC GROUND ACCELERATION',
      impact: seismicImpact,
      contribution: `${seismicContribution}/35 pts`,
      reason: `Magnitude Mw ${magnitude} at shallow focal depth of ${depthKm}km producing PGA of ${pgaG}g.`
    });

    // ─── 2. STRUCTURAL DAMAGE REPORTS (0–30 PTS) ───────────────────────
    let reportContribution = 0;
    let reportImpact = 'LOW';
    let reportReason = '';

    const activeReports = reports.filter(r => r.status !== 'DISMISSED');
    const criticalReports = activeReports.filter(r => r.severity === 'CRITICAL');
    const highReports = activeReports.filter(r => r.severity === 'HIGH');
    const mediumReports = activeReports.filter(r => r.severity === 'MEDIUM');

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
        reportReason = `${criticalReports.length} structural collapse & trapped occupant observation(s) confirmed.`;
      } else if (highReports.length > 0 || reportContribution >= 10) {
        reportImpact = 'MEDIUM';
        reportReason = `${highReports.length} major masonry fractures and gas/water lifeline ruptures cataloged.`;
      } else {
        reportImpact = 'LOW';
        reportReason = `${activeReports.length} minor non-structural damage observation(s) reported.`;
      }
    } else {
      reportContribution = 0;
      reportImpact = 'NONE';
      reportReason = 'No human field reconnaissance or USAR collapse reports received yet.';
      informationGaps.push({
        source: 'REPORTS',
        severity: 'HIGH',
        message: 'ZERO USAR FIELD REPORTS // COLLAPSE PATTERN UNVERIFIED ACROSS SECTORS'
      });
    }

    why.push({
      factor: 'STRUCTURAL COLLAPSE OBSERVATIONS',
      impact: reportImpact,
      contribution: `${reportContribution}/30 pts`,
      reason: reportReason
    });

    // ─── 3. INFRASTRUCTURE & VULNERABILITY (0–25 PTS) ───────────────────
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
        zoneReason = `${criticalZones.length} sector(s) experiencing catastrophic bridge, hospital or electrical failure.`;
      } else if (highRiskZones.length > 0 || zoneContribution >= 10) {
        zoneImpact = 'MEDIUM';
        zoneReason = `${highRiskZones.length} sector(s) under high structural compromise and debris road blockages.`;
      } else {
        zoneImpact = 'LOW';
        zoneReason = 'Seismic retrofitting holding; lifelines operating with minor localized interruptions.';
      }

      if (unknownZones.length > 0) {
        informationGaps.push({
          source: 'ZONES',
          severity: 'HIGH',
          message: `${unknownZones.length} SECTOR(S) IN COMMUNICATIONS BLACKOUT // POSSIBLY COLLAPSED REPEATER TOWERS`
        });
      }
    } else {
      zoneContribution = 14;
      zoneImpact = 'MEDIUM';
      zoneReason = 'Standard unreinforced masonry regional baselines applied.';
      informationGaps.push({
        source: 'ZONES',
        severity: 'MEDIUM',
        message: 'SECTOR BUILDING INVENTORY INCOMPLETE // USING REGIONAL BASELINE'
      });
    }

    why.push({
      factor: 'STRUCTURAL INTEGRITY & ROADS',
      impact: zoneImpact,
      contribution: `${zoneContribution}/25 pts`,
      reason: zoneReason
    });

    // ─── 4. UNCERTAINTY & AFTERSHOCK SURVEILLANCE GAPS (0–10 PTS) ────────
    let gapScore = 0;
    if (activeReports.length === 0) gapScore += 4;
    if (unknownZones.length > 0 || zoneCount === 0) gapScore += 3;
    if (!telemetry.aftershockSensorArray) gapScore += 3;

    const uncertaintyContribution = Math.min(10, gapScore);

    if (informationGaps.length > 0) {
      why.push({
        factor: 'AFTERSHOCK SURVEILLANCE UNCERTAINTY',
        impact: uncertaintyContribution >= 6 ? 'HIGH' : 'MEDIUM',
        contribution: `${uncertaintyContribution}/10 pts`,
        reason: `${informationGaps.length} critical sensor/report blindspot(s). Structural fatigue from aftershocks unmeasured.`
      });
    }

    // ─── 5. FINAL SCORE & LEVEL ────────────────────────────────────────
    const finalScore = Math.min(100, Math.max(0, seismicContribution + reportContribution + zoneContribution + uncertaintyContribution));
    const finalLevel = this.classifyRisk(finalScore);

    // ─── 6. CONFIDENCE CALCULATION ─────────────────────────────────────
    let confidenceScore = 30; // Baseline seismic telemetry
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
        hazardMetric: z.structuralCollapse || `${Math.round((baseRisk / 100) * 45)}% structural compromise`
      };
    });

    return {
      hazardType: 'EARTHQUAKE',
      hazardDisplayName: this.displayName,
      overallRisk: {
        score: finalScore,
        level: finalLevel,
        magnitude: `Mw ${magnitude}`,
        focalDepth: `${depthKm} km`
      },
      breakdown: {
        seismic: seismicContribution,
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
        seismic: `Global Seismographic Network (Mw ${magnitude}, Depth ${depthKm}km)`,
        reports: `${reports.length} USAR FIELD RECON OBSERVATION(S)`,
        zones: `${zoneCount} SECTORS (STRUCTURAL TWIN MATRIX)`
      },
      fusedAt: new Date().toISOString()
    };
  }

  simulateForward(context, timeOffset = 0, actions = []) {
    return {
      timeOffset,
      hazardType: 'EARTHQUAKE',
      isSupported: true,
      parameters: {
        aftershockProbability: timeOffset === 0 ? '78%' : timeOffset <= 30 ? '88%' : '94%',
        secondaryCollapseRisk: timeOffset >= 30 ? 'CRITICAL' : 'ELEVATED',
        compromisedBridges: timeOffset >= 30 ? ['Span 4 Overpass', 'West Viaduct'] : ['West Viaduct']
      }
    };
  }

  generateRecommendations(zones, context) {
    return [
      {
        priority: 'CRITICAL',
        action: 'DEPLOY HEAVY URBAN SEARCH & RESCUE (USAR)',
        targetSector: 'Zone D',
        rationale: 'Trapped occupants reported in collapsed multi-story hospital annex. Acoustic listening and shoring equipment urgently needed.'
      },
      {
        priority: 'HIGH',
        action: 'DISPATCH MOBILE STRUCTURAL INSPECTION CREWS',
        targetSector: 'Zone C',
        rationale: 'High concentration of unreinforced masonry structures threatened by imminent Mw 5.2+ aftershock sequence.'
      }
    ];
  }
}
