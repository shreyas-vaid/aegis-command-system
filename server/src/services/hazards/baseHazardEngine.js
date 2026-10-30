/**
 * AEGIS Base Hazard Assessment Engine
 * ────────────────────────────────────────────────────────────────────
 * Abstract contract and normalized evaluation logic shared by all
 * hazard-specific disaster intelligence modules.
 *
 * Rules:
 * - Deterministic: Given identical inputs, produces identical outputs.
 * - Non-destructive: Missing data produces uncertainty, never zero-risk.
 * - Normalized scale: 0–100 risk score and standardized classification.
 * ────────────────────────────────────────────────────────────────────
 */

export class BaseHazardEngine {
  constructor(hazardType, displayName) {
    this.hazardType = hazardType;
    this.displayName = displayName;
  }

  /**
   * Required data fields for this hazard type.
   */
  getRequiredFields() {
    return ['zones', 'mission'];
  }

  /**
   * Optional data fields for this hazard type.
   */
  getOptionalFields() {
    return ['weather', 'reports', 'telemetry', 'satelliteData'];
  }

  /**
   * Standardized risk level classifier.
   */
  classifyRisk(score) {
    if (score >= 85) return 'CRITICAL';
    if (score >= 70) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Standardized confidence level classifier.
   */
  classifyConfidence(score) {
    if (score >= 80) return 'HIGH';
    if (score >= 45) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Primary assessment entrypoint implemented by specific engines.
   * @param {Object} context
   * @param {Object} context.weather
   * @param {Array} context.reports
   * @param {Array} context.zones
   * @param {Object} context.mission
   * @returns {Object} Normalized risk intelligence assessment
   */
  assessRisk(context) {
    throw new Error(`assessRisk() must be implemented by ${this.constructor.name}`);
  }

  /**
   * Forward projection simulation contract.
   * @param {Object} context
   * @param {number} timeOffset - Minutes forward (0, 15, 30, 45, 60)
   * @param {Array} actions - Resource deployments
   */
  simulateForward(context, timeOffset = 0, actions = []) {
    return {
      timeOffset,
      hazardType: this.hazardType,
      isSupported: false,
      notice: `Forward simulation for ${this.displayName} is currently in operational calibration.`
    };
  }

  /**
   * Generate actionable resource directives tailored to this hazard.
   */
  generateRecommendations(zones, context) {
    return [];
  }
}
