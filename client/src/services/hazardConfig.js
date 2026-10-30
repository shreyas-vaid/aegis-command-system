/**
 * AEGIS Multi-Hazard Frontend Configuration
 * ────────────────────────────────────────────────────────────────────
 * Unified metadata, KPI card mappings, and telemetry formatting
 * for all supported disaster categories.
 * ────────────────────────────────────────────────────────────────────
 */

export const HAZARDS = {
  FLOOD: {
    id: 'FLOOD',
    name: 'Flood & Inundation Surge',
    badge: 'HYDROLOGIC',
    badgeColor: '#00F0FF',
    accentColor: '#00F0FF',
    primaryMetricLabel: 'PEAK WATER CREST',
    defaultCenter: [30.7333, 76.7794],
    kpiCards: [
      { id: 'affected', label: 'INUNDATED SECTORS', helper: 'CRITICAL INUNDATION' },
      { id: 'waterLevel', label: 'RIVER CREST LEVEL', helper: 'ABOVE DATUM' },
      { id: 'resources', label: 'SWIFTWATER TEAMS', helper: 'AMPHIBIOUS FLEET' },
      { id: 'reports', label: 'FIELD FLOOD REPORTS', helper: 'UNVERIFIED OBSERVATIONS' }
    ],
    simulationSupported: true,
    simulationTitle: 'HYDROLOGIC RIVER INUNDATION CASCADE'
  },
  EARTHQUAKE: {
    id: 'EARTHQUAKE',
    name: 'Seismic Rupture & Structural Collapse',
    badge: 'SEISMIC',
    badgeColor: '#EF4444',
    accentColor: '#EF4444',
    primaryMetricLabel: 'MOMENT MAGNITUDE',
    defaultCenter: [34.2805, -118.4390],
    kpiCards: [
      { id: 'affected', label: 'COLLAPSED SECTORS', helper: 'HEAVY STRUCTURAL DAMAGE' },
      { id: 'magnitude', label: 'SEISMIC MAGNITUDE', helper: 'SHALLOW CRUSTAL FOCAL' },
      { id: 'resources', label: 'HEAVY USAR TEAMS', helper: 'SEARCH & RESCUE' },
      { id: 'reports', label: 'COLLAPSE REPORTS', helper: 'UNVERIFIED SIGHTINGS' }
    ],
    simulationSupported: true,
    simulationTitle: 'SEISMIC AFTERSHOCK & STRUCTURAL FATIGUE PROJECTION'
  },
  TORNADO: {
    id: 'TORNADO',
    name: 'Tornadic Vortex & Convective Storm',
    badge: 'CONVECTIVE',
    badgeColor: '#F59E0B',
    accentColor: '#F59E0B',
    primaryMetricLabel: 'VORTEX GALE VELOCITY',
    defaultCenter: [35.3395, -97.4867],
    kpiCards: [
      { id: 'affected', label: 'SWATH SECTORS', helper: 'GROUND TOUCHDOWN PATH' },
      { id: 'windSpeed', label: 'ROTATIONAL WIND', helper: 'ENHANCED FUJITA RATING' },
      { id: 'resources', label: 'SHELTER & DEBRIS UNITS', helper: 'EMERGENCY CORRIDOR' },
      { id: 'reports', label: 'RADAR SPOTTER REPORTS', helper: 'FUNNEL OBSERVATIONS' }
    ],
    simulationSupported: true,
    simulationTitle: 'TORNADIC GROUND SWATH TRAJECTORY PROJECTION'
  },
  WILDFIRE: {
    id: 'WILDFIRE',
    name: 'Wildland-Urban Interface Firestorm',
    badge: 'THERMAL',
    badgeColor: '#EA580C',
    accentColor: '#EA580C',
    primaryMetricLabel: 'THERMAL HOTSPOT RADIANCE',
    defaultCenter: [38.5025, -122.5833],
    kpiCards: [
      { id: 'affected', label: 'THREATENED SECTORS', helper: 'UNCONTAINED FLAME LINE' },
      { id: 'hotspots', label: 'SATELLITE HOTSPOTS', helper: 'NASA FIRMS VIIRS/MODIS' },
      { id: 'resources', label: 'WATER TANKERS & CREWS', helper: 'PERIMETER SUPPRESSION' },
      { id: 'reports', label: 'LOOKOUT SMOKE REPORTS', helper: 'FRONT ADVANCE SCOUTS' }
    ],
    simulationSupported: true,
    simulationTitle: 'WUI FLAME FRONT PROPAGATION & EMBER SPREAD'
  },
  LANDSLIDE: {
    id: 'LANDSLIDE',
    name: 'Geotechnical Slope Failure & Debris Flow',
    badge: 'GEOTECHNICAL',
    badgeColor: '#84CC16',
    accentColor: '#84CC16',
    primaryMetricLabel: 'PORE WATER SATURATION',
    defaultCenter: [48.2758, -121.9211],
    kpiCards: [
      { id: 'affected', label: 'UNSTABLE MOUNTAIN SECTORS', helper: 'SHEAR FAILURE SLOPES' },
      { id: 'saturation', label: 'SOIL PORE PRESSURE', helper: '72H ANTECEDENT SATURATION' },
      { id: 'resources', label: 'EXCAVATION CONVOYS', helper: 'BOULDER CLEARING' },
      { id: 'reports', label: 'FISSURE & SLIDE REPORTS', helper: 'GROUND TOE READINGS' }
    ],
    simulationSupported: true,
    simulationTitle: 'COLLUVIAL DEBRIS FLOW & RUNOUT DISPLACEMENT'
  },
  CYCLONE: {
    id: 'CYCLONE',
    name: 'Tropical Cyclone & Storm Surge',
    badge: 'METEOROLOGICAL',
    badgeColor: '#38BDF8',
    accentColor: '#38BDF8',
    primaryMetricLabel: 'COASTAL STORM SURGE',
    defaultCenter: [25.7617, -80.1918],
    kpiCards: [
      { id: 'affected', label: 'SUBMERGED HARBOR SECTORS', helper: 'SEAWALL OVERTOPPED' },
      { id: 'stormSurge', label: 'STORM SURGE HEIGHT', helper: 'PEAK TIDAL ELEVATION' },
      { id: 'resources', label: 'AMPHIBIOUS FLOTILLAS', helper: 'COASTAL EVACUATION' },
      { id: 'reports', label: 'COAST GUARD REPORTS', helper: 'MARITIME BUOY DATA' }
    ],
    simulationSupported: true,
    simulationTitle: 'CYCLONE EYEWALL LANDFALL & SEAWATER SURGE'
  }
};

export function getHazardConfig(disasterType) {
  if (!disasterType || typeof disasterType !== 'string') return HAZARDS.FLOOD;
  const clean = disasterType.trim().toUpperCase();

  if (clean === 'FLASH_FLOOD' || clean === 'FLOOD') return HAZARDS.FLOOD;
  if (clean === 'FIRE' || clean === 'WILDFIRE') return HAZARDS.WILDFIRE;
  if (clean === 'STORM' || clean === 'CYCLONE' || clean === 'HURRICANE' || clean === 'TYPHOON') return HAZARDS.CYCLONE;
  if (clean === 'EARTHQUAKE' || clean === 'SEISMIC' || clean === 'QUAKE') return HAZARDS.EARTHQUAKE;
  if (clean === 'TORNADO') return HAZARDS.TORNADO;
  if (clean === 'LANDSLIDE' || clean === 'MUDSLIDE') return HAZARDS.LANDSLIDE;

  return HAZARDS[clean] || HAZARDS.FLOOD;
}
