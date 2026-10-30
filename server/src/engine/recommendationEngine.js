/**
 * AEGIS Decision Support — Simulated Recommendation Engine
 * ────────────────────────────────────────────────────────────────────
 * AEGIS DECISION SUPPORT — SIMULATED RECOMMENDATION ENGINE
 *
 * This is NOT a trained AI/ML model.
 * It provides rule-based recommendations using disaster state analysis.
 *
 * Structured so a real ML/LLM service can replace this module later
 * by implementing the same function signature.
 * ────────────────────────────────────────────────────────────────────
 */

/**
 * Generate strategic recommendations based on current disaster state.
 * @param {Array} zones - Computed zone states with risk scores
 * @param {Object} weather - Current weather conditions
 * @param {Object} resources - Resource availability and deployment
 * @returns {Object} Structured recommendation
 */
export function generateRecommendations(zones, weather, resources, disasterType = 'FLOOD') {
  const normType = (disasterType || 'FLOOD').toUpperCase();

  if (normType === 'EARTHQUAKE') {
    return {
      _engine: "AEGIS DECISION SUPPORT — SIMULATED RECOMMENDATION ENGINE",
      _notice: "Rule-based analysis. Not a trained ML model.",
      title: "AEGIS Strategic Co-Pilot: Seismic USAR Intervention",
      timestamp: new Date().toLocaleTimeString(),
      assignments: {
        engineering: { D: 3, C: 2, A: 0, B: 0, E: 1 },
        medical:     { D: 4, C: 1, B: 1, A: 0, E: 0 },
        fire:        { B: 3, D: 1, A: 0, C: 0, E: 0 },
        logistics:   { C: 3, D: 2, B: 2, A: 1, E: 0 }
      },
      rationale: [
        {
          target: "Zone D (County Hospital Annex Collapse)",
          primaryFocus: "Medical (4) + Engineering (3)",
          why: "Emergency structural shoring prevents multi-story pancake collapse, securing access for 40+ trapped patients and staff."
        },
        {
          target: "Zone B (Commercial Gas Line Rupture)",
          primaryFocus: "Fire/Hazmat (3) + Logistics (2)",
          why: "Isolates ruptured natural gas main along commercial corridor to halt secondary post-earthquake firestorm ignition."
        },
        {
          target: "Zone C (West Viaduct Seismic Overpass)",
          primaryFocus: "Engineering (2) + Logistics (3)",
          why: "Deploys heavy mobile cranes and clears structural bridge debris to reopen primary USAR heavy convoy transit."
        },
        {
          target: "Zone E (Substation Blackout Recon)",
          primaryFocus: "Engineering (1)",
          why: "Penetrates power transmission blackout to assess auxiliary transformer damage before evening temperature drops."
        }
      ],
      predictedOutcome: {
        riskReductionZoneD: "-38%",
        hospitalLoadStabilization: "Capped at 64% (Avoids Blackout)",
        zoneERescueETA: "18 minutes",
        overallCityHealthDelta: "+21% over unmitigated baseline"
      }
    };
  }

  if (normType === 'TORNADO') {
    return {
      _engine: "AEGIS DECISION SUPPORT — SIMULATED RECOMMENDATION ENGINE",
      _notice: "Rule-based analysis. Not a trained ML model.",
      title: "AEGIS Strategic Co-Pilot: Tornado Swath Debris & Shelter Protocol",
      timestamp: new Date().toLocaleTimeString(),
      assignments: {
        engineering: { D: 3, B: 2, A: 0, C: 0, E: 0 },
        medical:     { D: 3, C: 2, A: 0, B: 0, E: 1 },
        fire:        { B: 2, D: 2, A: 0, C: 0, E: 0 },
        logistics:   { B: 3, C: 2, D: 2, A: 1, E: 0 }
      },
      rationale: [
        {
          target: "Zone D (Direct Swath Impacted Subdivision)",
          primaryFocus: "Medical (3) + Engineering (3)",
          why: "Immediate extraction of residents trapped under structural debris along the active EF-4 ground swath corridor."
        },
        {
          target: "Zone B (Commercial Corridor Highway Blockage)",
          primaryFocus: "Engineering (2) + Logistics (3)",
          why: "Deploys heavy rotary cutting crews to remove sheared high-voltage towers blocking primary ambulance arteries."
        },
        {
          target: "Zone C (Underground Shelter Staging)",
          primaryFocus: "Medical (2) + Logistics (2)",
          why: "Supplies secondary fortified community bunkers with emergency triage and respiratory supplies."
        }
      ],
      predictedOutcome: {
        riskReductionZoneD: "-32%",
        hospitalLoadStabilization: "Capped at 70%",
        zoneERescueETA: "15 minutes",
        overallCityHealthDelta: "+19% over unmitigated baseline"
      }
    };
  }

  if (normType === 'WILDFIRE' || normType === 'FIRE') {
    return {
      _engine: "AEGIS DECISION SUPPORT — SIMULATED RECOMMENDATION ENGINE",
      _notice: "Rule-based analysis. Not a trained ML model.",
      title: "AEGIS Strategic Co-Pilot: Wildfire Perimeter Suppression & Evacuation",
      timestamp: new Date().toLocaleTimeString(),
      assignments: {
        engineering: { C: 3, B: 2, A: 0, D: 0, E: 0 },
        medical:     { D: 3, C: 1, A: 0, B: 0, E: 0 },
        fire:        { C: 4, D: 2, E: 2, A: 0, B: 0 },
        logistics:   { D: 4, B: 2, C: 1, A: 1, E: 0 }
      },
      rationale: [
        {
          target: "Zone D (Canyon Hospital & Residential Interface)",
          primaryFocus: "Medical (3) + Logistics (4)",
          why: "Executes preemptive patient evacuation before smoke zero-visibility completely shuts down the south arterial corridor."
        },
        {
          target: "Zone C (Ridge Fuel Break)",
          primaryFocus: "Fire (4) + Engineering (3)",
          why: "Bulldozes critical 60-meter defensible fuel break and deploys aerial retardant line to contain advancing crown fire front."
        }
      ],
      predictedOutcome: {
        riskReductionZoneD: "-35%",
        hospitalLoadStabilization: "Evacuated & Stabilized at 55%",
        zoneERescueETA: "12 minutes",
        overallCityHealthDelta: "+24% over unmitigated baseline"
      }
    };
  }

  if (normType === 'LANDSLIDE') {
    return {
      _engine: "AEGIS DECISION SUPPORT — SIMULATED RECOMMENDATION ENGINE",
      _notice: "Rule-based analysis. Not a trained ML model.",
      title: "AEGIS Strategic Co-Pilot: Debris Flow Excavation & Slope Shoring",
      timestamp: new Date().toLocaleTimeString(),
      assignments: {
        engineering: { D: 4, C: 2, A: 0, B: 0, E: 0 },
        medical:     { D: 3, C: 1, A: 0, B: 0, E: 0 },
        fire:        { C: 2, D: 1, A: 0, B: 0, E: 0 },
        logistics:   { B: 3, D: 2, C: 1, A: 1, E: 0 }
      },
      rationale: [
        {
          target: "Zone D (Buried Mountain Clinic Arterial)",
          primaryFocus: "Engineering (4) + Medical (3)",
          why: "Mobilizes excavators and front loaders to clear 15,000m³ of saturated rock debris severing medical access."
        },
        {
          target: "Zone C (River Damming Hazard)",
          primaryFocus: "Engineering (2) + Logistics (1)",
          why: "Constructs emergency spillway bypass to relieve impounded debris dam before catastrophic flood burst."
        }
      ],
      predictedOutcome: {
        riskReductionZoneD: "-30%",
        hospitalLoadStabilization: "Capped at 66%",
        zoneERescueETA: "20 minutes",
        overallCityHealthDelta: "+17% over unmitigated baseline"
      }
    };
  }

  if (normType === 'CYCLONE' || normType === 'STORM') {
    return {
      _engine: "AEGIS DECISION SUPPORT — SIMULATED RECOMMENDATION ENGINE",
      _notice: "Rule-based analysis. Not a trained ML model.",
      title: "AEGIS Strategic Co-Pilot: Cyclone Eyewall Surge & Marine Protocol",
      timestamp: new Date().toLocaleTimeString(),
      assignments: {
        engineering: { C: 3, D: 2, A: 0, B: 0, E: 0 },
        medical:     { D: 3, C: 2, A: 0, B: 0, E: 0 },
        fire:        { E: 2, C: 2, A: 0, B: 0, D: 0 },
        logistics:   { B: 4, C: 2, D: 2, A: 1, E: 0 }
      },
      rationale: [
        {
          target: "Zone D (Maritime Hospital Surge Defense)",
          primaryFocus: "Medical (3) + Engineering (2)",
          why: "Deploys auxiliary mobile diesel pumps and barrier bladders to prevent 4.2m seawater surge from drowning ICU electrical core."
        },
        {
          target: "Zone C (Harbor Basin Evacuation)",
          primaryFocus: "Logistics (2) + Engineering (3)",
          why: "Reroutes coastal traffic inland away from overtopped municipal seawall and secures loose shipping containers."
        }
      ],
      predictedOutcome: {
        riskReductionZoneD: "-36%",
        hospitalLoadStabilization: "Capped at 65%",
        zoneERescueETA: "14 minutes",
        overallCityHealthDelta: "+20% over unmitigated baseline"
      }
    };
  }

  // DEFAULT: FLOOD (SCENARIO #027)
  return {
    _engine: "AEGIS DECISION SUPPORT — SIMULATED RECOMMENDATION ENGINE",
    _notice: "Rule-based analysis. Not a trained ML model.",
    title: "AEGIS Strategic Co-Pilot: Critical Point Intervention",
    timestamp: new Date().toLocaleTimeString(),
    assignments: {
      engineering: { C: 2, D: 2, A: 0, B: 0, E: 0 },
      medical:     { D: 3, C: 1, E: 1, A: 0, B: 0 },
      fire:        { E: 2, C: 1, A: 0, B: 0, D: 0 },
      logistics:   { B: 4, C: 2, D: 1, A: 1, E: 0 }
    },
    rationale: [
      {
        target: "Zone D (South General Trauma Center)",
        primaryFocus: "Medical (3) + Engineering (2)",
        why: "Clearing Road 17 eliminates the single bottleneck cutting off 2,900 civilians and relieves 94% hospital overload before triage collapse."
      },
      {
        target: "Zone E (Information Gap)",
        primaryFocus: "Fire/Rescue Amphibious Recon (2) + Medical (1)",
        why: "Proactively penetrates the 88% comms blackout where 140+ vehicle beacons are stalled without 911 calls. Prevents silent catastrophic drowning."
      },
      {
        target: "Zone C (River Basin)",
        primaryFocus: "Engineering (2) + Logistics (2)",
        why: "Fortifies Bridge 17 berm to prevent cascading water overflow from flooding Zone B commercial grid."
      },
      {
        target: "Zone B (Commercial Hub)",
        primaryFocus: "Logistics (4)",
        why: "Enforces emergency perimeter traffic routing, reducing ambulance transit latency by 32 minutes."
      }
    ],
    predictedOutcome: {
      riskReductionZoneD: "-34%",
      hospitalLoadStabilization: "Capped at 68% (Avoids Blackout)",
      zoneERescueETA: "14 minutes",
      overallCityHealthDelta: "+18% over unmitigated baseline"
    }
  };
}

/**
 * Generate zone-specific recommendation.
 */
export function generateZoneRecommendation(zoneId, zones, weather, resources) {
  const targetId = (zoneId || '').toUpperCase();
  const zone = zones.find(z => (z.id || z.zoneId || '').toUpperCase() === targetId);
  if (!zone) return null;

  const recommendations = [];

  if (targetId === 'D') {
    recommendations.push({
      action: "Deploy medical unit",
      reason: "Hospital intake access is critical",
      priority: "HIGH"
    });
    recommendations.push({
      action: "Redirect rescue resources",
      reason: "Road accessibility is severely reduced",
      priority: "HIGH"
    });
  } else if (zone.risk >= 80) {
    recommendations.push({
      action: "Deploy medical unit",
      reason: `Zone ${zoneId} risk at ${zone.risk}% — critical threshold exceeded`,
      priority: "HIGH"
    });
  }

  if (targetId !== 'D' && zone.roads < 30) {
    recommendations.push({
      action: "Redirect rescue resources",
      reason: "Road accessibility is severely reduced",
      priority: "HIGH"
    });
  }

  if (zone.isInformationGap || zone.connectivity < 20) {
    recommendations.push({
      action: "Deploy reconnaissance drone",
      reason: "Information gap detected — zero telemetry from this sector",
      priority: "CRITICAL"
    });
  }

  if (zone.infrastructure < 40 && targetId !== 'D') {
    recommendations.push({
      action: "Redirect logistics resources",
      reason: `Infrastructure integrity at ${zone.infrastructure}% — structural support needed`,
      priority: "HIGH"
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      action: "Maintain passive monitoring",
      reason: "Zone conditions are within acceptable parameters",
      priority: "LOW"
    });
  }

  return {
    _engine: "AEGIS DECISION SUPPORT — SIMULATED RECOMMENDATION ENGINE",
    _notice: "Rule-based analysis. Not a trained ML model.",
    zoneId: targetId,
    zoneName: zone.name,
    currentRisk: zone.risk,
    recommendations
  };
}
