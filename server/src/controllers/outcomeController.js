/**
 * Outcome Controller
 * Generates the final Mission After-Action Report.
 */

// POST /api/outcome
export function generateOutcome(req, res) {
  const { chosenPlan = "ai" } = req.body;
  const isAi = chosenPlan === "ai";

  const outcome = {
    missionId: "OPERATION #027",
    disasterType: "FLASH FLOOD & INFRASTRUCTURE CASCADE",
    status: "OPERATION ACCOMPLISHED",
    strategyUsed: isAi ? "AEGIS AI CO-PILOT INTERVENTION" : "HUMAN TACTICAL RESPONSE",
    metrics: {
      cityHealthBefore: 71,
      cityHealthAfter: isAi ? 84 : 78,
      hospitalLoadBefore: 72,
      hospitalLoadAfter: isAi ? 62 : 68,
      criticalZonesBefore: 2,
      criticalZonesAfter: 0,
      informationGapsBefore: 1,
      informationGapsAfter: 0,
      livesSavedEstimate: isAi ? 1840 : 1420
    },
    whatWorked: [
      "Road 17 engineering intervention successfully restored ambulance transit into South General Hospital.",
      "Reconnaissance drone penetrated Zone E blackout, saving 140+ stranded motorists before delta levee collapsed.",
      "Logistics traffic diversion prevented severe secondary gridlock in Commercial Hub (Zone B)."
    ],
    whatFailed: [
      "Bridge 17 foundation sustained moderate scouring deflection (14cm), requiring long-term structural overhaul.",
      "South General auxiliary generator experienced 12-minute voltage sag before emergency power stabilized."
    ],
    aiLearning: [
      "Uncertainty-first prioritization reduced mortality risk by 42% compared to reactive 911 dispatching.",
      "Proactive drone probe of silence zones proved critical: absence of telemetry must never be classified as safe."
    ]
  };

  res.json(outcome);
}
