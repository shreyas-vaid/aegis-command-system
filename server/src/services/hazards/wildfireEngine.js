/**
 * AEGIS Wildfire Assessment Engine
 * ────────────────────────────────────────────────────────────────────
 * Evaluates wildland-urban interface (WUI) fire outbreaks:
 * 1. Thermal hotspot radiance (FIRMS compatibility) & fire weather (0–35 pts)
 * 2. Rapid perimeter spread & containment breach reports (0–30 pts)
 * 3. Dry fuel vegetation & settlement proximity vulnerability (0–25 pts)
 * 4. Smoke plume satellite occlusion & surveillance gaps (0–10 pts)
 * ────────────────────────────────────────────────────────────────────
 */

import { BaseHazardEngine } from './baseHazardEngine.js';

export class WildfireEngine extends BaseHazardEngine {
  constructor() {
    super('WILDFIRE', 'Wildland-Urban Interface Firestorm');
  }

  getRequiredFields() {
    return ['zones', 'mission'];
  }

  getOptionalFields() {
    return ['weather', 'hotspots', 'reports', 'fuelMoisture', 'firePerimeter'];
  }

  assessRisk({ weather, reports = [], zones = [], mission = {}, telemetry = {} }) {
    const why = [];
    const informationGaps = [];

    // ─── 1. THERMAL RADIANCE & FIRE WEATHER MATRIX (0–35 PTS) ──────────
    const windSpeedKmh = Number(weather?.current?.windSpeed ?? telemetry.windSpeedKmh ?? 38);
    const temperature = Number(weather?.current?.temperature ?? telemetry.temperature ?? 36);
    const humidity = Number(weather?.current?.humidity ?? telemetry.humidity ?? 14);
    const hotspotCount = Number(telemetry.hotspotCount ?? 28);
    const frpMw = Number(telemetry.fireRadiativePowerMw ?? 420); // Fire Radiative Power (FRP)

    let fireWeatherPts = 0;
    // Extreme dry, hot, and windy conditions amplify fire spread exponentially
    if (windSpeedKmh >= 40) fireWeatherPts += 12;
    else if (windSpeedKmh >= 25) fireWeatherPts += 8;
    else fireWeatherPts += 4;

    if (temperature >= 35 && humidity <= 20) fireWeatherPts += 10;
    else if (temperature >= 30 && humidity <= 35) fireWeatherPts += 6;
    else fireWeatherPts += 2;

    if (hotspotCount >= 20 || frpMw >= 300) fireWeatherPts += 13;
    else if (hotspotCount >= 8 || frpMw >= 100) fireWeatherPts += 8;
    else fireWeatherPts += 4;

    const fireContribution = Math.min(35, fireWeatherPts);
    const fireImpact = fireContribution >= 22 ? 'HIGH' : fireContribution >= 12 ? 'MEDIUM' : 'LOW';

    why.push({
      factor: 'THERMAL RADIANCE & FIRE WEATHER',
      impact: fireImpact,
      contribution: `${fireContribution}/35 pts`,
      reason: `${hotspotCount} satellite thermal hotspots detected (FRP: ${frpMw}MW). Critical red flag conditions: ${temperature}°C, ${humidity}% humidity, sustained winds of ${windSpeedKmh} km/h.`
    });

    // ─── 2. GROUND OBSERVATIONS & SPREAD REPORTS (0–30 PTS) ─────────────
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
        reportReason = `${criticalReports.length} crown fire & structural ember attack observation(s) confirmed on front line.`;
      } else if (highReports.length > 0 || reportContribution >= 10) {
        reportImpact = 'MEDIUM';
        reportReason = `${highReports.length} containment line breaches and evacuation route smoke hazards cataloged.`;
      } else {
        reportImpact = 'LOW';
        reportReason = `${activeReports.length} minor spot fire observations reported.`;
      }
    } else {
      reportContribution = 0;
      reportImpact = 'NONE';
      reportReason = 'No ground lookout or forward firefighting scout reports recorded.';
      informationGaps.push({
        source: 'REPORTS',
        severity: 'HIGH',
        message: 'ZERO GROUND SCOUT OBSERVATIONS // FIRE PERIMETER ADVANCE RATE UNVERIFIED'
      });
    }

    why.push({
      factor: 'PERIMETER ADVANCE OBSERVATIONS',
      impact: reportImpact,
      contribution: `${reportContribution}/30 pts`,
      reason: reportReason
    });

    // ─── 3. WUI EXPOSURE & FUEL DRYNESS (0–25 PTS) ─────────────────────
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
        zoneReason = `${criticalZones.length} sector(s) in direct path of uncontained high-intensity fire front.`;
      } else if (highRiskZones.length > 0 || zoneContribution >= 10) {
        zoneImpact = 'MEDIUM';
        zoneReason = `${highRiskZones.length} sector(s) threatened by ember spotting and zero-visibility smoke corridors.`;
      } else {
        zoneImpact = 'LOW';
        zoneReason = 'Firebreaks holding; sectors separated by defensible agricultural buffer.';
      }

      if (unknownZones.length > 0) {
        informationGaps.push({
          source: 'ZONES',
          severity: 'HIGH',
          message: `${unknownZones.length} SECTOR(S) IN COMMUNICATIONS BLACKOUT // POSSIBLY OVERRUN BY FLAMES`
        });
      }
    } else {
      zoneContribution = 13;
      zoneImpact = 'MEDIUM';
      zoneReason = 'Standard chaparral/pine fuel index regional baselines applied.';
    }

    why.push({
      factor: 'WUI EXPOSURE & VEGETATION FUEL',
      impact: zoneImpact,
      contribution: `${zoneContribution}/25 pts`,
      reason: zoneReason
    });

    // ─── 4. SMOKE PLUME & VISIBILITY GAPS (0–10 PTS) ───────────────────
    let gapScore = 0;
    if (activeReports.length === 0) gapScore += 4;
    if (unknownZones.length > 0 || zoneCount === 0) gapScore += 3;
    if (!telemetry.aerialSurveyActive) gapScore += 3;

    const uncertaintyContribution = Math.min(10, gapScore);

    if (informationGaps.length > 0) {
      why.push({
        factor: 'AERIAL SURVEILLANCE UNCERTAINTY',
        impact: uncertaintyContribution >= 6 ? 'HIGH' : 'MEDIUM',
        contribution: `${uncertaintyContribution}/10 pts`,
        reason: `${informationGaps.length} blindspot(s). Heavy pyrocumulus smoke obscuring optical satellite tracking.`
      });
    }

    // ─── 5. FINAL SCORE & CLASSIFICATION ───────────────────────────────
    const finalScore = Math.min(100, Math.max(0, fireContribution + reportContribution + zoneContribution + uncertaintyContribution));
    const finalLevel = this.classifyRisk(finalScore);

    // ─── 6. CONFIDENCE CALCULATION ─────────────────────────────────────
    let confidenceScore = 35; // Satellite thermal telemetry
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
        hazardMetric: z.flameFrontDistance || `${((100 - baseRisk) * 0.12).toFixed(1)} km to active fireline`
      };
    });

    return {
      hazardType: 'WILDFIRE',
      hazardDisplayName: this.displayName,
      overallRisk: {
        score: finalScore,
        level: finalLevel,
        hotspots: hotspotCount,
        rateOfSpread: `${Math.round((windSpeedKmh * 0.12) * 10) / 10} km/h`
      },
      breakdown: {
        fireWeather: fireContribution,
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
        thermal: `NASA FIRMS MODIS/VIIRS Satellite Telemetry (${hotspotCount} Hotspots)`,
        reports: `${reports.length} LOOKOUT & SMOKE SCOUT REPORT(S)`,
        zones: `${zoneCount} SECTORS (FIRE PROPAGATION TWIN)`
      },
      fusedAt: new Date().toISOString()
    };
  }

  simulateForward(context, timeOffset = 0, actions = []) {
    return {
      timeOffset,
      hazardType: 'WILDFIRE',
      isSupported: true,
      parameters: {
        estimatedPerimeterHectares: timeOffset === 0 ? 1200 : timeOffset <= 30 ? 2800 : 4900,
        threatenedSettlementDistanceKm: timeOffset === 0 ? 3.4 : timeOffset <= 30 ? 1.6 : 0.4,
        containmentPct: timeOffset >= 30 ? '18%' : '8%'
      }
    };
  }

  generateRecommendations(zones, context) {
    return [
      {
        priority: 'CRITICAL',
        action: 'ORDER MANDATORY CIVILIAN EVACUATION VIA SOUTH FLANK',
        targetSector: 'Zone D',
        rationale: 'Shifting 45 km/h winds pushing high-intensity crown fire directly toward residential edge. Evacuation corridor closing in 30 minutes.'
      },
      {
        priority: 'HIGH',
        action: 'STAGE WATER TANKER CONVOYS & RETARDANT LINE',
        targetSector: 'Zone C',
        rationale: 'Establish defensive fuel break along commercial ridge to halt structural propagation.'
      }
    ];
  }
}
