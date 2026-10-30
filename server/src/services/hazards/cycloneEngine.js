/**
 * AEGIS Cyclone & Severe Marine Storm Assessment Engine
 * ────────────────────────────────────────────────────────────────────
 * Evaluates tropical cyclone landfall and gale storm systems:
 * 1. Barometric central pressure, gale velocity & storm surge (0–35 pts)
 * 2. Coastal inundation & eyewall structural reports (0–30 pts)
 * 3. Harbor seawall & low-lying barrier island vulnerability (0–25 pts)
 * 4. Buoy telemetry drops & radar eyewall occultation uncertainty (0–10 pts)
 * ────────────────────────────────────────────────────────────────────
 */

import { BaseHazardEngine } from './baseHazardEngine.js';

export class CycloneEngine extends BaseHazardEngine {
  constructor() {
    super('CYCLONE', 'Tropical Cyclone & Storm Surge Landfall');
  }

  getRequiredFields() {
    return ['zones', 'mission'];
  }

  getOptionalFields() {
    return ['weather', 'reports', 'marineTelemetry', 'barometricPressure', 'stormSurgeMeters'];
  }

  assessRisk({ weather, reports = [], zones = [], mission = {}, telemetry = {} }) {
    const why = [];
    const informationGaps = [];

    // ─── 1. CYCLONE INTENSITY & STORM SURGE (0–35 PTS) ─────────────────
    const windSpeedKmh = Number(weather?.current?.windSpeed ?? telemetry.windSpeedKmh ?? 185);
    const pressureHpa = Number(telemetry.centralPressureHpa ?? 945); // Central Barometric Pressure
    const stormSurgeMeters = Number(telemetry.stormSurgeMeters ?? 4.2);
    const category = mission.category || telemetry.category || (windSpeedKmh >= 210 ? 'CATEGORY 4' : windSpeedKmh >= 178 ? 'CATEGORY 3' : windSpeedKmh >= 154 ? 'CATEGORY 2' : 'CATEGORY 1');

    let cyclonePts = 0;
    if (category === 'CATEGORY 4' || category === 'CATEGORY 5') cyclonePts += 20;
    else if (category === 'CATEGORY 3') cyclonePts += 15;
    else if (category === 'CATEGORY 2') cyclonePts += 10;
    else cyclonePts += 6;

    // Deep central pressure (< 950 hPa) drives severe surge and gale forces
    if (pressureHpa <= 940) cyclonePts += 8;
    else if (pressureHpa <= 965) cyclonePts += 5;
    else cyclonePts += 2;

    if (stormSurgeMeters >= 4.0) cyclonePts += 7;
    else if (stormSurgeMeters >= 2.5) cyclonePts += 4;
    else cyclonePts += 1;

    const cycloneContribution = Math.min(35, cyclonePts);
    const cycloneImpact = cycloneContribution >= 22 ? 'HIGH' : cycloneContribution >= 12 ? 'MEDIUM' : 'LOW';

    why.push({
      factor: 'EYEWALL GALE & STORM SURGE',
      impact: cycloneImpact,
      contribution: `${cycloneContribution}/35 pts`,
      reason: `Intense ${category} cyclone with central barometric pressure of ${pressureHpa} hPa and sustained eyewall gusts of ${windSpeedKmh} km/h (Peak coastal storm surge: ${stormSurgeMeters}m).`
    });

    // ─── 2. COASTAL INUNDATION & STRUCTURAL REPORTS (0–30 PTS) ─────────
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
        reportReason = `${criticalReports.length} seawall overtopping, marine harbor breach & stranded coastal resident reports confirmed.`;
      } else if (highReports.length > 0 || reportContribution >= 10) {
        reportImpact = 'MEDIUM';
        reportReason = `${highReports.length} structural roof detachments and flooded coastal transit arteries cataloged.`;
      } else {
        reportImpact = 'LOW';
        reportReason = `${activeReports.length} minor peripheral maritime wind reports filed.`;
      }
    } else {
      reportContribution = 0;
      reportImpact = 'NONE';
      reportReason = 'No coast guard or forward coastal observer reports received from eyewall quadrant.';
      informationGaps.push({
        source: 'REPORTS',
        severity: 'HIGH',
        message: 'ZERO COASTAL REPORTS // HARBOR SEAWALL OVERTOPPING STATUS UNVERIFIED'
      });
    }

    why.push({
      factor: 'COASTAL INUNDATION OBSERVATIONS',
      impact: reportImpact,
      contribution: `${reportContribution}/30 pts`,
      reason: reportReason
    });

    // ─── 3. SEAWALL & LOW-LYING EXPOSURE (0–25 PTS) ─────────────────────
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
        zoneReason = `${criticalZones.length} low-lying coastal sector(s) submerged by seawater surge with severed evacuation routes.`;
      } else if (highRiskZones.length > 0 || zoneContribution >= 10) {
        zoneImpact = 'MEDIUM';
        zoneReason = `${highRiskZones.length} sector(s) subject to extreme wind load and tidal backflow flooding.`;
      } else {
        zoneImpact = 'LOW';
        zoneReason = 'Inland elevation buffer protective; marine drainage pumps maintaining capacity.';
      }

      if (unknownZones.length > 0) {
        informationGaps.push({
          source: 'ZONES',
          severity: 'HIGH',
          message: `${unknownZones.length} SECTOR(S) IN COMMUNICATIONS BLACKOUT // COASTAL MASTS BLOWN DOWN`
        });
      }
    } else {
      zoneContribution = 12;
      zoneImpact = 'MEDIUM';
      zoneReason = 'Standard coastal elevation storm surge inundation model applied.';
    }

    why.push({
      factor: 'COASTAL INFRASTRUCTURE EXPOSURE',
      impact: zoneImpact,
      contribution: `${zoneContribution}/25 pts`,
      reason: zoneReason
    });

    // ─── 4. MARITIME BUOY & EYEWALL SURVEILLANCE GAPS (0–10 PTS) ─────────
    let gapScore = 0;
    if (activeReports.length === 0) gapScore += 4;
    if (unknownZones.length > 0 || zoneCount === 0) gapScore += 3;
    if (!telemetry.offshoreBuoyArrayActive) gapScore += 3;

    const uncertaintyContribution = Math.min(10, gapScore);

    if (informationGaps.length > 0) {
      why.push({
        factor: 'OFFSHORE BUOY SURVEILLANCE UNCERTAINTY',
        impact: uncertaintyContribution >= 6 ? 'HIGH' : 'MEDIUM',
        contribution: `${uncertaintyContribution}/10 pts`,
        reason: `${informationGaps.length} maritime telemetry blindspot(s). Wave height sensors severed in outer eyewall.`
      });
    }

    // ─── 5. FINAL SCORE & CLASSIFICATION ───────────────────────────────
    const finalScore = Math.min(100, Math.max(0, cycloneContribution + reportContribution + zoneContribution + uncertaintyContribution));
    const finalLevel = this.classifyRisk(finalScore);

    // ─── 6. CONFIDENCE CALCULATION ─────────────────────────────────────
    let confidenceScore = 35; // Satellite and radar cyclone tracking
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
        hazardMetric: z.stormSurge || `${((baseRisk / 100) * 4.5).toFixed(1)}m seawater surge elevation`
      };
    });

    return {
      hazardType: 'CYCLONE',
      hazardDisplayName: this.displayName,
      overallRisk: {
        score: finalScore,
        level: finalLevel,
        category,
        centralPressure: `${pressureHpa} hPa`,
        stormSurge: `${stormSurgeMeters}m`
      },
      breakdown: {
        eyewallSurge: cycloneContribution,
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
        meteorology: `Joint Typhoon / Tropical Cyclone Warning Center (${category}, ${pressureHpa} hPa)`,
        reports: `${reports.length} COAST GUARD & HARBOR MASTER REPORT(S)`,
        zones: `${zoneCount} SECTORS (CYCLONE IMPACT TWIN)`
      },
      fusedAt: new Date().toISOString()
    };
  }

  simulateForward(context, timeOffset = 0, actions = []) {
    return {
      timeOffset,
      hazardType: 'CYCLONE',
      isSupported: true,
      parameters: {
        stormSurgeMeters: timeOffset === 0 ? 4.2 : timeOffset <= 30 ? 5.6 : 6.8,
        inundatedCoastalKm2: timeOffset === 0 ? 18 : timeOffset <= 30 ? 42 : 75,
        submergedDocks: timeOffset >= 30 ? ['Harbor Dock 3', 'East Marina Pier', 'Fisherman Wharf'] : ['Harbor Dock 3']
      }
    };
  }

  generateRecommendations(zones, context) {
    return [
      {
        priority: 'CRITICAL',
        action: 'ORDER IMMEDIATE VERTICAL OR INLAND EVACUATION OF LOW HARBOR SECTOR',
        targetSector: 'Zone D',
        rationale: 'Projected 5.6m storm surge will breach the primary municipal seawall during high tide in 25 minutes.'
      },
      {
        priority: 'HIGH',
        action: 'DISPATCH HIGH-CLEARANCE AMPHIBIOUS RESCUE FLOTILLA',
        targetSector: 'Zone C',
        rationale: 'Seawater inundation cut off hospital perimeter access; deploy diesel generator support to avoid ICU blackout.'
      }
    ];
  }
}
