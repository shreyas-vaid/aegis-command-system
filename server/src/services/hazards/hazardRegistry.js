/**
 * AEGIS Unified Hazard Registry
 * ────────────────────────────────────────────────────────────────────
 * Manages the registration, normalisation, and resolution of
 * hazard-specific disaster intelligence engines.
 * ────────────────────────────────────────────────────────────────────
 */

import { FloodEngine } from './floodEngine.js';
import { EarthquakeEngine } from './earthquakeEngine.js';
import { TornadoEngine } from './tornadoEngine.js';
import { WildfireEngine } from './wildfireEngine.js';
import { LandslideEngine } from './landslideEngine.js';
import { CycloneEngine } from './cycloneEngine.js';

class HazardRegistry {
  constructor() {
    this.engines = new Map();
    this.aliases = new Map();

    // Register all standard hazard engines
    this.registerEngine(new FloodEngine());
    this.registerEngine(new EarthquakeEngine());
    this.registerEngine(new TornadoEngine());
    this.registerEngine(new WildfireEngine());
    this.registerEngine(new LandslideEngine());
    this.registerEngine(new CycloneEngine());

    // Register aliases for backward compatibility and diverse naming
    this.registerAlias('FLASH_FLOOD', 'FLOOD');
    this.registerAlias('FIRE', 'WILDFIRE');
    this.registerAlias('STORM', 'CYCLONE');
    this.registerAlias('HURRICANE', 'CYCLONE');
    this.registerAlias('TYPHOON', 'CYCLONE');
    this.registerAlias('QUAKE', 'EARTHQUAKE');
    this.registerAlias('SEISMIC', 'EARTHQUAKE');
    this.registerAlias('MUDSLIDE', 'LANDSLIDE');
    this.registerAlias('ROCKFALL', 'LANDSLIDE');
  }

  registerEngine(engine) {
    this.engines.set(engine.hazardType.toUpperCase(), engine);
  }

  registerAlias(alias, targetType) {
    this.aliases.set(alias.toUpperCase(), targetType.toUpperCase());
  }

  normalizeType(disasterType) {
    if (!disasterType || typeof disasterType !== 'string') return 'FLOOD';
    const clean = disasterType.trim().toUpperCase();
    if (this.aliases.has(clean)) {
      return this.aliases.get(clean);
    }
    return clean;
  }

  getEngine(disasterType) {
    const normalized = this.normalizeType(disasterType);
    if (this.engines.has(normalized)) {
      return this.engines.get(normalized);
    }
    // Safe default to FloodEngine for backward compatibility with 027
    return this.engines.get('FLOOD');
  }

  getSupportedHazards() {
    return Array.from(this.engines.values()).map(e => ({
      hazardType: e.hazardType,
      displayName: e.displayName
    }));
  }

  assessRisk(context) {
    const rawType = context?.mission?.disasterType || 'FLOOD';
    const engine = this.getEngine(rawType);
    return engine.assessRisk(context);
  }

  simulateForward(context, timeOffset = 0, actions = []) {
    const rawType = context?.mission?.disasterType || 'FLOOD';
    const engine = this.getEngine(rawType);
    return engine.simulateForward(context, timeOffset, actions);
  }

  generateRecommendations(zones, context) {
    const rawType = context?.mission?.disasterType || 'FLOOD';
    const engine = this.getEngine(rawType);
    return engine.generateRecommendations(zones, context);
  }
}

export const hazardRegistry = new HazardRegistry();
export default hazardRegistry;
