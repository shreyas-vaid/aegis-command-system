import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  HeartHandshake, 
  Send, 
  Flame, 
  Activity, 
  Radio, 
  Truck, 
  ShieldAlert, 
  AlertTriangle,
  Layers,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Compass,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  X,
  Crosshair,
  Wrench,
  Package,
  ShieldCheck,
  AlertOctagon,
  Eye,
  Info,
  Satellite,
  Mountain,
  Map
} from 'lucide-react';
import { AegisAnimatedNumber } from './aegis-interactive';
import { 
  getResources, 
  getIncidents, 
  getZones, 
  assignResource, 
  getMissionIntelligence 
} from '../services/api';

// Basemap Tile Providers for Phase 1 Geospatial Intelligence
export const BASEMAP_PROVIDERS = {
  dark: {
    id: 'dark',
    name: 'DARK TACTICAL',
    providerName: 'CartoDB Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    options: {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>'
    },
    badge: 'DEFAULT'
  },
  satellite: {
    id: 'satellite',
    name: 'SATELLITE ORTHO',
    providerName: 'Esri World Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 19,
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, GIS Community'
    },
    badge: 'OPTICAL'
  },
  topo: {
    id: 'topo',
    name: 'TOPOGRAPHY RELIEF',
    providerName: 'OpenTopoMap',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 17,
      subdomains: 'abc',
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>, SRTM | Style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
    },
    badge: 'ELEVATION'
  },
  streets: {
    id: 'streets',
    name: 'STREET MATRIX',
    providerName: 'OpenStreetMap Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 19,
      subdomains: 'abc',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
    },
    badge: 'OSM'
  }
};

// Tactical Theater Sectors for Geographic Selection
export const THEATER_SECTORS = [
  { id: 'ALL', name: 'THEATER OVERVIEW', short: 'ALL SECTORS', offsetLat: 0, offsetLng: 0, zoom: 13, desc: 'Complete 360 operational grid' },
  { id: 'A', name: 'SECTOR A · INDUSTRIAL RIDGE', short: 'SEC-A', offsetLat: 0.016, offsetLng: -0.012, zoom: 15, desc: 'Chemical runoff hazard zone' },
  { id: 'B', name: 'SECTOR B · RESIDENTIAL NORTH', short: 'SEC-B', offsetLat: 0.004, offsetLng: 0.008, zoom: 15, desc: 'High-density civilian sector' },
  { id: 'C', name: 'SECTOR C · COMMERCIAL CORE', short: 'SEC-C', offsetLat: 0.009, offsetLng: -0.018, zoom: 15, desc: 'Urban transit and power grid' },
  { id: 'D', name: 'SECTOR D · MEDICAL CORRIDOR', short: 'SEC-D', offsetLat: -0.012, offsetLng: 0.004, zoom: 15, desc: 'Hospital triage & dispatch hub' },
  { id: 'E', name: 'SECTOR E · BLACKOUT PERIMETER', short: 'SEC-E', offsetLat: 0.018, offsetLng: 0.022, zoom: 15, desc: 'Telemetry dark recon zone' }
];

// Fix Leaflet's default marker icon paths in Vite bundles
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function LiveOperationsScreen({
  activeMission = null,
  currentUser = null,
  onResourceAssigned = null,
  onNavigateStage = null,
  showToast = () => {}
}) {
  const missionId = activeMission?.missionId || '027';
  const centerLat = activeMission?.latitude || 30.7333;
  const centerLng = activeMission?.longitude || 76.7794;

  // Map reference
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const activeTileLayerRef = useRef(null);
  const layersGroupRef = useRef({
    zones: null,
    incidents: null,
    resources: null,
    routes: null
  });

  // Geospatial Map Foundation State (Phase 1)
  const [isMapReady, setIsMapReady] = useState(false);
  const [activeBasemap, setActiveBasemap] = useState('dark');
  const [mapTileLoading, setMapTileLoading] = useState(false);
  const [mapTileError, setMapTileError] = useState(null);
  const [activeSector, setActiveSector] = useState('ALL');

  // State
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null); // { type: 'INCIDENT'|'RESOURCE'|'ZONE', data: ... }
  const [resourceFilterCategory, setResourceFilterCategory] = useState('ALL');
  const [resourceFilterStatus, setResourceFilterStatus] = useState('ALL');
  const [incidentFilterSeverity, setIncidentFilterSeverity] = useState('ALL');
  
  // Active map layers
  const [layerVisibility, setLayerVisibility] = useState({
    zones: true,
    incidents: true,
    resources: true,
    routes: true
  });

  // Deployment modal / drawer workflow state
  const [deployTargetZone, setDeployTargetZone] = useState('D');
  const [selectedResourceToDeploy, setSelectedResourceToDeploy] = useState(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentSuccess, setDeploymentSuccess] = useState(null);
  const [deploymentError, setDeploymentError] = useState(null);

  // Raw & processed data
  const [zonesList, setZonesList] = useState([]);
  const [incidentsList, setIncidentsList] = useState([]);
  const [resourcesList, setResourcesList] = useState([]);
  const [intelligence, setIntelligence] = useState(null);

  // Master baseline data for Demo Scenario #027
  const defaultZones = useMemo(() => [
    {
      id: 'A',
      name: 'North Uplands / Sector 01',
      lat: centerLat + 0.016,
      lng: centerLng - 0.012,
      risk: 18,
      status: 'STABLE',
      color: '#10B981',
      floodLevel: '0.2m',
      roadAccess: '88%',
      population: 4100,
      bounds: [
        [centerLat + 0.009, centerLng - 0.025],
        [centerLat + 0.024, centerLng - 0.022],
        [centerLat + 0.022, centerLng - 0.002],
        [centerLat + 0.008, centerLng - 0.005]
      ]
    },
    {
      id: 'B',
      name: 'Commercial Core / Sector 17',
      lat: centerLat + 0.004,
      lng: centerLng + 0.008,
      risk: 48,
      status: 'WARNING',
      color: '#F59E0B',
      floodLevel: '1.1m',
      roadAccess: '64%',
      population: 8400,
      bounds: [
        [centerLat - 0.004, centerLng - 0.005],
        [centerLat + 0.012, centerLng - 0.004],
        [centerLat + 0.014, centerLng + 0.018],
        [centerLat - 0.002, centerLng + 0.016]
      ]
    },
    {
      id: 'C',
      name: 'River Basin Corridor / Sector 22',
      lat: centerLat + 0.009,
      lng: centerLng - 0.018,
      risk: 74,
      status: 'ELEVATED',
      color: '#D97706',
      floodLevel: '3.4m',
      roadAccess: '38%',
      population: 3600,
      bounds: [
        [centerLat + 0.001, centerLng - 0.032],
        [centerLat + 0.016, centerLng - 0.028],
        [centerLat + 0.011, centerLng - 0.012],
        [centerLat - 0.004, centerLng - 0.016]
      ]
    },
    {
      id: 'D',
      name: 'South Trauma Center / Sector 32',
      lat: centerLat - 0.012,
      lng: centerLng + 0.004,
      risk: 96,
      status: 'CRITICAL',
      color: '#EF4444',
      floodLevel: '2.9m',
      roadAccess: '22%',
      population: 2900,
      bounds: [
        [centerLat - 0.022, centerLng - 0.008],
        [centerLat - 0.005, centerLng - 0.006],
        [centerLat - 0.003, centerLng + 0.019],
        [centerLat - 0.021, centerLng + 0.016]
      ]
    },
    {
      id: 'E',
      name: 'East Delta Blackout / Sector 26',
      lat: centerLat + 0.018,
      lng: centerLng + 0.022,
      risk: 78,
      status: 'UNKNOWN',
      color: '#8B7FA8',
      floodLevel: '2.1m (EST)',
      roadAccess: '25%',
      population: 1850,
      bounds: [
        [centerLat + 0.008, centerLng + 0.015],
        [centerLat + 0.026, centerLng + 0.016],
        [centerLat + 0.025, centerLng + 0.034],
        [centerLat + 0.007, centerLng + 0.031]
      ]
    }
  ], [centerLat, centerLng]);

  const defaultIncidents = useMemo(() => [
    {
      id: 'INC-01',
      name: 'Arterial Road 17 Submerged',
      severity: 'CRITICAL',
      zoneId: 'D',
      location: 'South General Access Corridor (Road 17)',
      lat: centerLat - 0.010,
      lng: centerLng + 0.002,
      status: 'ACTIVE',
      assignedResources: ['AMBULANCE 02'],
      recommendedResponse: 'Deploy high-clearance swift water transport & mobile surgical pod to relieve emergency triage.',
      timestamp: '09:14 UTC',
      reportsCount: 14,
      details: 'Culvert structural failure has trapped 40+ civilian passenger vehicles. Water cresting at 2.9m depth.'
    },
    {
      id: 'INC-02',
      name: 'South Trauma Center Emergency Triage Isolation',
      severity: 'CRITICAL',
      zoneId: 'D',
      location: 'South General Hospital ICU Perimeter',
      lat: centerLat - 0.015,
      lng: centerLng + 0.009,
      status: 'ACTIVE',
      assignedResources: [],
      recommendedResponse: 'Dispatch medical teams with portable power units to maintain ventilator array.',
      timestamp: '09:22 UTC',
      reportsCount: 8,
      details: 'Hospital basement electrical transformer flooded. Emergency generator reserve down to 42 minutes.'
    },
    {
      id: 'INC-03',
      name: 'Bridge 17 River Berm Overflow',
      severity: 'WARNING',
      zoneId: 'C',
      location: 'River Basin Berm Milepost 4',
      lat: centerLat + 0.008,
      lng: centerLng - 0.019,
      status: 'ACTIVE',
      assignedResources: ['RESCUE SQUAD 04'],
      recommendedResponse: 'Deploy engineering convoys with rapid sandbagging barrier systems.',
      timestamp: '09:05 UTC',
      reportsCount: 11,
      details: 'Peak basin water velocity exceeds 420 m³/s. Secondary embankment showing 12-meter fissure.'
    },
    {
      id: 'INC-04',
      name: 'Commercial Grid Electrical Transformer Explosion',
      severity: 'WARNING',
      zoneId: 'B',
      location: 'Sector 17 Central Plaza',
      lat: centerLat + 0.004,
      lng: centerLng + 0.009,
      status: 'CONTAINED',
      assignedResources: ['CONVOY HEAVY 03'],
      recommendedResponse: 'Establish emergency traffic perimeter to reroute ambulance transit.',
      timestamp: '08:48 UTC',
      reportsCount: 6,
      details: 'Power severed across 6 commercial blocks. Fire service on-scene; secondary arcing halted.'
    },
    {
      id: 'INC-05',
      name: 'Sector E Sensor Array RF Blackout',
      severity: 'CRITICAL',
      zoneId: 'E',
      location: 'East Delta Industrial Sub-basin',
      lat: centerLat + 0.018,
      lng: centerLng + 0.024,
      status: 'UNOBSERVED',
      assignedResources: [],
      recommendedResponse: 'Immediate dispatch of thermal reconnaissance drone & amphibious scout team.',
      timestamp: '09:30 UTC',
      reportsCount: 0,
      details: 'Cellular tower 04 battery depleted. 140+ stalled vehicle transponders with zero 911 phone link.'
    }
  ], [centerLat, centerLng]);

  const defaultResources = useMemo(() => [
    {
      id: 'RES-01',
      callsign: 'AMBULANCE 02',
      name: 'Advanced Life Support Ambulance Wing',
      category: 'MEDICAL',
      type: 'Medical Teams',
      status: 'AVAILABLE',
      location: 'Sector A Base Staging',
      lat: centerLat + 0.014,
      lng: centerLng - 0.009,
      count: 4,
      speed: '75 KM/H',
      eta: '12 MIN',
      assignedIncident: null,
      assignedZone: 'A',
      history: ['Dispatched to North Sector (08:15)', 'Returned to Base Staging (08:50)'],
      color: '#10B981',
      icon: HeartHandshake
    },
    {
      id: 'RES-02',
      callsign: 'DRONE WING 01',
      name: 'Aerial Thermal Reconnaissance Squad',
      category: 'EQUIPMENT',
      type: 'Rescue Equipment',
      status: 'AVAILABLE',
      location: 'Central Command Helipad',
      lat: centerLat + 0.006,
      lng: centerLng - 0.004,
      count: 2,
      speed: '120 KM/H',
      eta: '4 MIN',
      assignedIncident: null,
      assignedZone: 'A',
      history: ['Scanned Sector C River Berm (08:30)'],
      color: '#00F0FF',
      icon: Send
    },
    {
      id: 'RES-03',
      callsign: 'RESCUE SQUAD 04',
      name: 'Swift Water Amphibious Rescue',
      category: 'VEHICLE',
      type: 'Rescue Vehicles',
      status: 'STAGED',
      location: 'Bridge 17 North Gate',
      lat: centerLat + 0.011,
      lng: centerLng - 0.014,
      count: 3,
      speed: '45 KM/H',
      eta: '8 MIN',
      assignedIncident: 'INC-03',
      assignedZone: 'C',
      history: ['Evacuated 14 civilians from Milepost 2 (08:40)'],
      color: '#F59E0B',
      icon: Flame
    },
    {
      id: 'RES-04',
      callsign: 'MEDIC POD ALPHA',
      name: 'Mobile Surgical Trauma Hospital Pod',
      category: 'MEDICAL',
      type: 'Medical Teams',
      status: 'DEPLOYED',
      location: 'Zone D South Arterial Bypass',
      lat: centerLat - 0.008,
      lng: centerLng + 0.003,
      count: 1,
      speed: '40 KM/H',
      eta: 'ON-SITE',
      assignedIncident: 'INC-01',
      assignedZone: 'D',
      history: ['Deployed to South Trauma Center bypass (09:15)'],
      color: '#38BDF8',
      icon: Activity
    },
    {
      id: 'RES-05',
      callsign: 'SAT RELAY ECHO',
      name: 'Mobile Satellite Telemetry Rig',
      category: 'EQUIPMENT',
      type: 'Rescue Equipment',
      status: 'STANDBY',
      location: 'East Delta Perimeter Guardpost',
      lat: centerLat + 0.014,
      lng: centerLng + 0.016,
      count: 2,
      speed: '60 KM/H',
      eta: '6 MIN',
      assignedIncident: null,
      assignedZone: 'E',
      history: ['Calibrated mesh telemetry with drone wing (08:00)'],
      color: '#C8B99D',
      icon: Radio
    },
    {
      id: 'RES-06',
      callsign: 'CONVOY HEAVY 03',
      name: 'Engineering Barrier & Sandbagging Truck',
      category: 'SUPPLIES',
      type: 'Emergency Supplies',
      status: 'AVAILABLE',
      location: 'Municipal Supply Depot',
      lat: centerLat + 0.003,
      lng: centerLng + 0.012,
      count: 2,
      speed: '50 KM/H',
      eta: '20 MIN',
      assignedIncident: null,
      assignedZone: 'B',
      history: ['Restocked 2,400 polymer sandbags (07:30)'],
      color: '#10B981',
      icon: Truck
    }
  ], [centerLat, centerLng]);

  // Load backend telemetries with graceful fallback
  const fetchTelemetry = useCallback(async () => {
    setLoading(true);
    try {
      const [backendZones, backendIncidents, backendResources, backendIntel] = await Promise.all([
        getZones(missionId).catch(() => null),
        getIncidents(missionId).catch(() => null),
        getResources(missionId).catch(() => null),
        getMissionIntelligence(missionId).catch(() => null)
      ]);

      setZonesList(Array.isArray(backendZones) && backendZones.length > 0 ? backendZones : defaultZones);
      setIncidentsList(Array.isArray(backendIncidents) && backendIncidents.length > 0 ? backendIncidents : defaultIncidents);
      setResourcesList(Array.isArray(backendResources) && backendResources.length > 0 ? backendResources : defaultResources);
      if (backendIntel) setIntelligence(backendIntel);
    } catch (err) {
      console.warn('[LIVE-OPS] Data loading fallback:', err.message);
      setZonesList(defaultZones);
      setIncidentsList(defaultIncidents);
      setResourcesList(defaultResources);
    } finally {
      setLoading(false);
    }
  }, [missionId, defaultZones, defaultIncidents, defaultResources]);

  useEffect(() => {
    fetchTelemetry();
  }, [fetchTelemetry]);

  // KPI Calculations
  const kpiData = useMemo(() => {
    const total = resourcesList.reduce((acc, r) => acc + (r.count || 1), 0);
    const deployed = resourcesList
      .filter(r => r.status === 'DEPLOYED' || r.status === 'STAGED')
      .reduce((acc, r) => acc + (r.count || 1), 0);
    const available = resourcesList
      .filter(r => r.status === 'AVAILABLE' || r.status === 'STANDBY')
      .reduce((acc, r) => acc + (r.count || 1), 0);
    const critical = incidentsList.filter(i => i.severity === 'CRITICAL').length;

    return { total, deployed, available, critical };
  }, [resourcesList, incidentsList]);

  // Geographic sector focus handler
  const handleSelectSector = useCallback((sectorId) => {
    setActiveSector(sectorId);
    if (!mapInstanceRef.current) return;
    const sector = THEATER_SECTORS.find(s => s.id === sectorId);
    if (!sector) return;

    mapInstanceRef.current.flyTo(
      [centerLat + sector.offsetLat, centerLng + sector.offsetLng],
      sector.zoom,
      { duration: 1.2, easeLinearity: 0.25 }
    );

    if (sectorId !== 'ALL') {
      const matchedZone = zonesList.find(z => z.id === sectorId);
      if (matchedZone) {
        setSelectedItem({ type: 'ZONE', data: matchedZone });
        setDeployTargetZone(matchedZone.id);
      }
    }
  }, [centerLat, centerLng, zonesList]);

  // 1. Initialize Leaflet Map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 13,
      zoomControl: true,
      attributionControl: true
    });

    if (map.attributionControl) {
      map.attributionControl.setPrefix('AEGIS GEOSPATIAL INTELLIGENCE');
    }

    // Initialize layer groups
    layersGroupRef.current.zones = L.layerGroup().addTo(map);
    layersGroupRef.current.routes = L.layerGroup().addTo(map);
    layersGroupRef.current.incidents = L.layerGroup().addTo(map);
    layersGroupRef.current.resources = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    setIsMapReady(true);

    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(resizeTimer);
      map.remove();
      mapInstanceRef.current = null;
      setIsMapReady(false);
    };
  }, [centerLat, centerLng]);

  // 2. Basemap tile swapping with loading and error tracking
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const provider = BASEMAP_PROVIDERS[activeBasemap] || BASEMAP_PROVIDERS.dark;

    // Remove current tile layer if present
    if (activeTileLayerRef.current) {
      try {
        map.removeLayer(activeTileLayerRef.current);
      } catch (e) {
        // Safe cleanup
      }
      activeTileLayerRef.current = null;
    }

    setMapTileLoading(true);
    setMapTileError(null);

    const tileLayer = L.tileLayer(provider.url, {
      ...provider.options
    });

    tileLayer.on('loading', () => {
      setMapTileLoading(true);
    });

    tileLayer.on('load', () => {
      setMapTileLoading(false);
      setMapTileError(null);
    });

    tileLayer.on('tileerror', () => {
      setMapTileLoading(false);
      setMapTileError(`Tile stream delay on ${provider.providerName}`);
    });

    tileLayer.addTo(map);
    if (tileLayer.bringToBack) {
      tileLayer.bringToBack();
    }
    activeTileLayerRef.current = tileLayer;
  }, [isMapReady, activeBasemap]);

  // 3. Render disaster zones, routes, incidents and resources into their layer groups
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return;
    const { zones: zonesGroup, incidents: incidentsGroup, resources: resourcesGroup, routes: routesGroup } = layersGroupRef.current;
    if (!zonesGroup || !incidentsGroup || !resourcesGroup || !routesGroup) return;

    // Clear current layers
    zonesGroup.clearLayers();
    incidentsGroup.clearLayers();
    resourcesGroup.clearLayers();
    routesGroup.clearLayers();

    // ────────────────────────────────────────────────────────────────
    // RENDER DISASTER ZONES
    // ────────────────────────────────────────────────────────────────
    if (layerVisibility.zones) {
      zonesList.forEach((zone) => {
        const polygonCoords = zone.bounds || [
          [zone.lat + 0.008, zone.lng - 0.012],
          [zone.lat + 0.008, zone.lng + 0.012],
          [zone.lat - 0.008, zone.lng + 0.012],
          [zone.lat - 0.008, zone.lng - 0.012]
        ];

        const isCritical = zone.status === 'CRITICAL' || zone.risk >= 80;
        const isUnknown = zone.status === 'UNKNOWN' || zone.id === 'E';
        const color = isCritical ? '#EF4444' : isUnknown ? '#8B7FA8' : zone.risk >= 50 ? '#F59E0B' : '#10B981';

        const polygon = L.polygon(polygonCoords, {
          color: color,
          weight: 2,
          opacity: 0.85,
          dashArray: isUnknown ? '6, 6' : undefined,
          fillColor: color,
          fillOpacity: isCritical ? 0.24 : isUnknown ? 0.16 : 0.14
        });

        polygon.on('click', () => {
          setSelectedItem({ type: 'ZONE', data: zone });
          setDeployTargetZone(zone.id);
        });

        polygon.bindTooltip(`
          <div style="font-family: var(--font-hud); font-weight: 700; color: #fff;">
            SECTOR ${zone.id}: ${zone.name}<br/>
            <span style="color: ${color}; font-size: 11px;">RISK: ${zone.risk}% · ${zone.status}</span>
          </div>
        `, { sticky: true, className: 'leaflet-tactical-tooltip' });

        zonesGroup.addLayer(polygon);
      });
    }

    // ────────────────────────────────────────────────────────────────
    // RENDER DEPLOYMENT ROUTES
    // ────────────────────────────────────────────────────────────────
    if (layerVisibility.routes) {
      const baseStaging = [centerLat + 0.014, centerLng - 0.009];
      const targetHospital = [centerLat - 0.010, centerLng + 0.002];
      const targetDelta = [centerLat + 0.018, centerLng + 0.024];

      // Primary transit artery to Hospital
      const routeHospital = L.polyline([
        baseStaging,
        [centerLat + 0.004, centerLng - 0.004],
        [centerLat - 0.002, centerLng + 0.001],
        targetHospital
      ], {
        color: '#00F0FF',
        weight: 3,
        dashArray: '8, 8',
        opacity: 0.8
      });
      routeHospital.bindTooltip("ROAD 12 BYPASS DISPATCH TRANSIT ROUTE", { sticky: true });
      routesGroup.addLayer(routeHospital);

      // Secondary reconnaissance route to Sector E
      const routeRecon = L.polyline([
        baseStaging,
        [centerLat + 0.012, centerLng + 0.006],
        targetDelta
      ], {
        color: '#A855F7',
        weight: 2,
        dashArray: '5, 8',
        opacity: 0.65
      });
      routesGroup.addLayer(routeRecon);
    }

    // ────────────────────────────────────────────────────────────────
    // RENDER INCIDENT MARKERS
    // ────────────────────────────────────────────────────────────────
    if (layerVisibility.incidents) {
      const filteredIncidents = incidentsList.filter(inc => {
        if (incidentFilterSeverity === 'ALL') return true;
        return inc.severity === incidentFilterSeverity;
      });

      filteredIncidents.forEach((inc) => {
        const isCritical = inc.severity === 'CRITICAL';
        const markerColor = isCritical ? '#EF4444' : '#F59E0B';

        // Custom DivIcon with radar pulse ring
        const incidentIcon = L.divIcon({
          className: 'tactical-incident-marker',
          html: `
            <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
              <span style="position: absolute; width: 28px; height: 28px; border-radius: 50%; border: 2px solid ${markerColor}; opacity: 0.7; animation: pulse 1.6s infinite ease-out;"></span>
              <div style="width: 22px; height: 22px; border-radius: 50%; background: ${markerColor}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px ${markerColor}; border: 2px solid #FFFFFF;">
                <span style="font-size: 11px; font-weight: 800; color: #000; font-family: monospace;">!</span>
              </div>
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 17]
        });

        const marker = L.marker([inc.lat, inc.lng], { icon: incidentIcon });
        marker.on('click', () => {
          setSelectedItem({ type: 'INCIDENT', data: inc });
          setDeployTargetZone(inc.zoneId);
        });

        marker.bindTooltip(`
          <div style="font-family: var(--font-hud);">
            <div style="font-weight: 800; color: ${markerColor};">[${inc.severity}] ${inc.name}</div>
            <div style="font-size: 11px; color: #94A3B8;">Zone ${inc.zoneId} · ${inc.location}</div>
          </div>
        `, { offset: [0, -10] });

        incidentsGroup.addLayer(marker);
      });
    }

    // ────────────────────────────────────────────────────────────────
    // RENDER RESOURCE LOCATION MARKERS
    // ────────────────────────────────────────────────────────────────
    if (layerVisibility.resources) {
      const filteredResources = resourcesList.filter(res => {
        if (resourceFilterCategory !== 'ALL' && res.category !== resourceFilterCategory) return false;
        if (resourceFilterStatus !== 'ALL' && res.status !== resourceFilterStatus) return false;
        return true;
      });

      filteredResources.forEach((res) => {
        const isDeployed = res.status === 'DEPLOYED';
        const isAvailable = res.status === 'AVAILABLE';
        const statusColor = isAvailable ? '#10B981' : isDeployed ? '#00F0FF' : '#F59E0B';

        const resourceIcon = L.divIcon({
          className: 'tactical-resource-marker',
          html: `
            <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
              <div style="width: 26px; height: 26px; border-radius: 4px; background: rgba(14, 21, 36, 0.95); border: 1.5px solid ${statusColor}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.6);">
                <span style="font-size: 10px; font-weight: 800; color: ${statusColor}; font-family: monospace;">${res.callsign.slice(0, 3)}</span>
              </div>
              <span style="position: absolute; bottom: 0; right: 0; width: 8px; height: 8px; border-radius: 50%; background: ${statusColor}; border: 1px solid #000;"></span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([res.lat, res.lng], { icon: resourceIcon });
        marker.on('click', () => {
          setSelectedItem({ type: 'RESOURCE', data: res });
          setSelectedResourceToDeploy(res);
        });

        marker.bindTooltip(`
          <div style="font-family: var(--font-hud);">
            <div style="font-weight: 800; color: #FFFFFF;">${res.callsign} (${res.name})</div>
            <div style="font-size: 11px; color: ${statusColor};">STATUS: ${res.status} · ${res.count} UNITS</div>
          </div>
        `, { offset: [0, -10] });

        resourcesGroup.addLayer(marker);
      });
    }

  }, [
    isMapReady,
    centerLat, 
    centerLng, 
    zonesList, 
    incidentsList, 
    resourcesList, 
    layerVisibility, 
    incidentFilterSeverity, 
    resourceFilterCategory, 
    resourceFilterStatus
  ]);

  // Handle actual backend resource deployment execution
  const handleExecuteDeployment = async () => {
    if (!selectedResourceToDeploy) return;
    setIsDeploying(true);
    setDeploymentError(null);
    setDeploymentSuccess(null);

    const resourceId = selectedResourceToDeploy.name || selectedResourceToDeploy.callsign || selectedResourceToDeploy.id;

    try {
      // 1. Call real backend API
      const result = await assignResource(resourceId, deployTargetZone);

      // 2. Update local resource state
      setResourcesList(prev => prev.map(r => {
        if (r.id === selectedResourceToDeploy.id || r.callsign === selectedResourceToDeploy.callsign) {
          return {
            ...r,
            status: 'DEPLOYED',
            assignedZone: deployTargetZone,
            history: [`Deployed to Zone ${deployTargetZone} (${new Date().toLocaleTimeString()})`, ...(r.history || [])]
          };
        }
        return r;
      }));

      // 3. Notify parent app state
      if (onResourceAssigned) {
        onResourceAssigned(selectedResourceToDeploy, deployTargetZone);
      }

      setDeploymentSuccess(`CONFIRMED: ${selectedResourceToDeploy.callsign} deployed to Zone ${deployTargetZone}`);
      showToast(`DISPATCH CONFIRMED: ${selectedResourceToDeploy.callsign} -> Zone ${deployTargetZone}`, 'success');

      setTimeout(() => {
        setIsDeploying(false);
      }, 600);
    } catch (err) {
      console.error('[DEPLOYMENT-FAIL]', err);
      setDeploymentError(`DEPLOYMENT FAILED: ${err.message || 'Network error'}. State preserved.`);
      showToast(`DEPLOYMENT FAILED: ${err.message}`, 'error');
      setIsDeploying(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      position: 'relative'
    }}>
      
      {/* ──────────────────────────────────────────────────────────────────
          A. OPERATIONAL SUMMARY KPI CARDS (TOP STRIP)
      ────────────────────────────────────────────────────────────────── */}
      <section style={{
        padding: '14px 20px',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '12px',
        alignItems: 'center'
      }}>
        {/* KPI 1: Total Resources */}
        <div style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '5px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span className="aegis-data-label">TOTAL FLEET RESOURCES</span>
            <div className="font-hud tabular-nums" style={{ fontSize: '26px', fontWeight: '800', color: 'var(--color-cyan)', lineHeight: 1 }}>
              <AegisAnimatedNumber value={kpiData.total} />
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>ALL ACTIVE THEATER ASSETS</span>
          </div>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '4px',
            background: 'rgba(0, 240, 255, 0.1)',
            border: '1px solid rgba(0, 240, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-cyan)'
          }}>
            <Truck size={18} />
          </div>
        </div>

        {/* KPI 2: Deployed Resources */}
        <div style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '5px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span className="aegis-data-label">DEPLOYED IN FIELD</span>
            <div className="font-hud tabular-nums" style={{ fontSize: '26px', fontWeight: '800', color: '#F59E0B', lineHeight: 1 }}>
              <AegisAnimatedNumber value={kpiData.deployed} />
            </div>
            <span style={{ fontSize: '10px', color: '#F59E0B' }}>
              {Math.round((kpiData.deployed / (kpiData.total || 1)) * 100)}% UTILIZATION
            </span>
          </div>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '4px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F59E0B'
          }}>
            <Flame size={18} />
          </div>
        </div>

        {/* KPI 3: Available Resources */}
        <div style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '5px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span className="aegis-data-label">AVAILABLE FOR DISPATCH</span>
            <div className="font-hud tabular-nums" style={{ fontSize: '26px', fontWeight: '800', color: '#10B981', lineHeight: 1 }}>
              <AegisAnimatedNumber value={kpiData.available} />
            </div>
            <span style={{ fontSize: '10px', color: '#10B981' }}>STANDBY IN STAGING BASES</span>
          </div>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '4px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10B981'
          }}>
            <ShieldCheck size={18} />
          </div>
        </div>

        {/* KPI 4: Critical Incidents */}
        <div style={{
          background: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '5px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <span className="aegis-data-label">CRITICAL INCIDENTS</span>
            <div className="font-hud tabular-nums" style={{ fontSize: '26px', fontWeight: '800', color: '#EF4444', lineHeight: 1 }}>
              <AegisAnimatedNumber value={kpiData.critical} />
            </div>
            <span style={{ fontSize: '10px', color: '#EF4444' }}>ACTIVE CRISIS ZONES</span>
          </div>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '4px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#EF4444'
          }}>
            <AlertOctagon size={18} />
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          GEOSPATIAL & LAYER CONTROL TOOLBAR (PHASE 1)
      ────────────────────────────────────────────────────────────────── */}
      <div style={{
        padding: '10px 20px',
        background: 'rgba(14, 21, 36, 0.94)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {/* ROW 1: BASEMAP PROVIDER SELECTION & THEATER FOCUS */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Basemap Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--color-cyan)', fontWeight: '800', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Layers size={13} />
              BASEMAP:
            </span>
            {Object.values(BASEMAP_PROVIDERS).map((bm) => {
              const isActive = activeBasemap === bm.id;
              return (
                <button
                  key={bm.id}
                  onClick={() => setActiveBasemap(bm.id)}
                  className={`aegis-filter-pill ${isActive ? 'active' : ''}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    borderColor: isActive ? 'var(--color-cyan)' : undefined
                  }}
                  title={`Switch basemap to ${bm.providerName}`}
                >
                  {bm.id === 'dark' && <ShieldCheck size={11} />}
                  {bm.id === 'satellite' && <Satellite size={11} />}
                  {bm.id === 'topo' && <Mountain size={11} />}
                  {bm.id === 'streets' && <Map size={11} />}
                  <span>{bm.name}</span>
                  <span style={{
                    fontSize: '9px',
                    opacity: 0.75,
                    padding: '1px 4px',
                    borderRadius: '2px',
                    background: isActive ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)'
                  }}>
                    {bm.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Theater Quick Jump */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Compass size={12} />
              THEATER FOCUS:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
              {THEATER_SECTORS.map((sec) => {
                const isCurrent = activeSector === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => handleSelectSector(sec.id)}
                    className={`aegis-filter-pill ${isCurrent ? 'active' : ''}`}
                    style={{
                      padding: '3px 8px',
                      fontSize: '9.5px',
                      background: isCurrent ? 'rgba(0, 240, 255, 0.16)' : undefined,
                      borderColor: isCurrent ? 'var(--color-cyan)' : undefined,
                      color: isCurrent ? 'var(--color-cyan)' : undefined
                    }}
                    title={sec.desc}
                  >
                    {sec.short}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ROW 2: TACTICAL LAYER TOGGLES & INCIDENT/RESOURCE FILTERS */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          paddingTop: '8px',
          borderTop: '1px dashed rgba(255, 255, 255, 0.08)'
        }}>
          {/* Layer Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700' }}>
              MAP LAYERS:
            </span>
            <button
              onClick={() => setLayerVisibility(p => ({ ...p, zones: !p.zones }))}
              className={`aegis-filter-pill ${layerVisibility.zones ? 'active' : ''}`}
            >
              DISASTER ZONES
            </button>
            <button
              onClick={() => setLayerVisibility(p => ({ ...p, incidents: !p.incidents }))}
              className={`aegis-filter-pill ${layerVisibility.incidents ? 'active' : ''}`}
            >
              INCIDENT MARKERS
            </button>
            <button
              onClick={() => setLayerVisibility(p => ({ ...p, resources: !p.resources }))}
              className={`aegis-filter-pill ${layerVisibility.resources ? 'active' : ''}`}
            >
              FLEET POSITIONS
            </button>
            <button
              onClick={() => setLayerVisibility(p => ({ ...p, routes: !p.routes }))}
              className={`aegis-filter-pill ${layerVisibility.routes ? 'active' : ''}`}
            >
              TRANSIT ARTERIES
            </button>
          </div>

          {/* Severity & Resource Category Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700' }}>
              FILTERS:
            </span>
            <select
              value={incidentFilterSeverity}
              onChange={(e) => setIncidentFilterSeverity(e.target.value)}
              className="aegis-select"
              title="Filter incidents by severity"
            >
              <option value="ALL">ALL SEVERITIES</option>
              <option value="CRITICAL">CRITICAL ONLY</option>
              <option value="WARNING">WARNING ONLY</option>
            </select>

            <select
              value={resourceFilterCategory}
              onChange={(e) => setResourceFilterCategory(e.target.value)}
              className="aegis-select"
              title="Filter resources by category"
            >
              <option value="ALL">ALL CATEGORIES</option>
              <option value="MEDICAL">MEDICAL TEAMS</option>
              <option value="VEHICLE">RESCUE VEHICLES</option>
              <option value="EQUIPMENT">EQUIPMENT</option>
              <option value="SUPPLIES">SUPPLIES</option>
            </select>

            <select
              value={resourceFilterStatus}
              onChange={(e) => setResourceFilterStatus(e.target.value)}
              className="aegis-select"
              title="Filter resources by status"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="AVAILABLE">AVAILABLE ONLY</option>
              <option value="DEPLOYED">DEPLOYED ONLY</option>
              <option value="STAGED">STAGED ONLY</option>
            </select>

            <button
              onClick={() => fetchTelemetry()}
              className="aegis-btn aegis-btn-secondary"
              style={{ padding: '5px 8px', fontSize: '11px' }}
              title="Refresh telemetries"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          MAIN WORKSPACE: INTERACTIVE MAP + CONTEXTUAL RIGHT PANEL
      ────────────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        flex: 1,
        position: 'relative',
        minHeight: '620px'
      }}>
        {/* LEAFLET MAP CONTAINER */}
        <div style={{ flex: 1, position: 'relative', minHeight: '520px' }}>
          <div 
            ref={mapContainerRef} 
            style={{ width: '100%', height: '100%', minHeight: '560px', position: 'absolute', inset: 0 }}
          />

          {/* Tile Status & Tactical HUD Overlay */}
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {mapTileLoading && (
              <div style={{
                background: 'rgba(9, 14, 23, 0.94)',
                border: '1px solid var(--color-cyan)',
                borderRadius: '4px',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 0 14px rgba(0, 240, 255, 0.3)',
                color: 'var(--color-cyan)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: '700'
              }}>
                <RefreshCw size={12} className="animate-spin" />
                <span>STREAMING TILES [{BASEMAP_PROVIDERS[activeBasemap]?.providerName}]</span>
              </div>
            )}

            {mapTileError && (
              <button
                onClick={() => setActiveBasemap('dark')}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid #EF4444',
                  borderRadius: '4px',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 0 14px rgba(239, 68, 68, 0.4)',
                  color: '#FCA5A5',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
                title="Click to fallback to Dark Tactical basemap"
              >
                <AlertTriangle size={12} color="#EF4444" />
                <span>{mapTileError} // CLICK TO FALLBACK</span>
              </button>
            )}

            {!mapTileLoading && !mapTileError && (
              <div style={{
                background: 'rgba(9, 14, 23, 0.88)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '5px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backdropFilter: 'blur(8px)',
                color: '#94A3B8',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                <span>GEOSPATIAL FEED: {BASEMAP_PROVIDERS[activeBasemap]?.name} ({BASEMAP_PROVIDERS[activeBasemap]?.providerName})</span>
              </div>
            )}
          </div>

          {/* Floating Map Legend */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            background: 'rgba(9, 14, 23, 0.92)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '4px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            zIndex: 1000,
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
            flexWrap: 'wrap'
          }}>
            <span className="font-mono" style={{ fontSize: '9px', fontWeight: '700', color: 'var(--text-secondary)' }}>
              TACTICAL LEGEND:
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#EF4444' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }} />
              CRITICAL INCIDENT
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#F59E0B' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
              WARNING / ELEVATED
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#10B981' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
              AVAILABLE ASSET
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: 'var(--color-cyan)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--color-cyan)' }} />
              ACTIVE DEPLOYED
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#8B7FA8' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '2px', border: '1px dashed #8B7FA8' }} />
              BLACKOUT PERIMETER
            </span>
          </div>
        </div>

        {/* ──────────────────────────────────────────────────────────────────
            E. RIGHT-SIDE CONTEXTUAL INFORMATION PANEL
        ────────────────────────────────────────────────────────────────── */}
        <aside style={{
          width: '380px',
          maxWidth: '100%',
          background: 'var(--bg-deep-navy)',
          borderLeft: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          overflowY: 'auto',
          boxShadow: '-6px 0 24px rgba(0,0,0,0.45)'
        }}>
          {selectedItem ? (
            <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <div>
                  <span className="aegis-badge badge-sand" style={{ fontSize: '9px', marginBottom: '4px' }}>
                    {selectedItem.type} INSPECTION
                  </span>
                  <h3 className="font-hud" style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                    {selectedItem.data.name || selectedItem.data.callsign}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px'
                  }}
                  title="Close inspector"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Specific Content for INCIDENT */}
              {selectedItem.type === 'INCIDENT' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span className={`aegis-badge ${selectedItem.data.severity === 'CRITICAL' ? 'badge-critical' : 'badge-warning'}`}>
                      <span className="aegis-badge-dot" />
                      {selectedItem.data.severity}
                    </span>
                    <span className="aegis-badge badge-sand">
                      SECTOR {selectedItem.data.zoneId}
                    </span>
                    <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      ID: {selectedItem.data.id}
                    </span>
                  </div>

                  <div style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                    <span className="aegis-data-label">LOCATION &amp; TOPOGRAPHY</span>
                    <div style={{ fontSize: '12px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={13} color="var(--color-cyan)" />
                      <span>{selectedItem.data.location}</span>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-surface)', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                    <span className="aegis-data-label">INCIDENT SUMMARY &amp; IMPACT</span>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                      {selectedItem.data.details || selectedItem.data.name}
                    </p>
                  </div>

                  <div style={{ background: 'rgba(0, 240, 255, 0.06)', border: '1px solid var(--border-accent)', padding: '10px 12px', borderRadius: '4px' }}>
                    <span className="aegis-data-label" style={{ color: 'var(--color-cyan)' }}>RECOMMENDED RESPONSE</span>
                    <p style={{ fontSize: '11.5px', color: 'var(--text-primary)', lineHeight: 1.4, margin: '2px 0 0 0' }}>
                      {selectedItem.data.recommendedResponse}
                    </p>
                  </div>

                  {/* Staged & Assigned Resources */}
                  <div>
                    <span className="aegis-data-label">ASSIGNED OPERATIONAL UNITS</span>
                    {selectedItem.data.assignedResources && selectedItem.data.assignedResources.length > 0 ? (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                        {selectedItem.data.assignedResources.map((unitName, uIdx) => (
                          <span key={uIdx} className="aegis-badge badge-normal" style={{ fontSize: '10px' }}>
                            <ShieldCheck size={11} /> {unitName}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="font-mono" style={{ fontSize: '11px', color: '#EF4444' }}>
                        ● NO UNITS CURRENTLY ON-SCENE
                      </span>
                    )}
                  </div>

                  {/* Immediate Action: Open Deployment Workflow */}
                  <button
                    onClick={() => {
                      setDeployTargetZone(selectedItem.data.zoneId);
                      setSelectedResourceToDeploy(resourcesList.find(r => r.status === 'AVAILABLE') || resourcesList[0]);
                    }}
                    className="aegis-btn aegis-btn-primary"
                    style={{ width: '100%', marginTop: '6px' }}
                  >
                    <span>DEPLOY RESOURCE TO THIS INCIDENT</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* Specific Content for RESOURCE */}
              {selectedItem.type === 'RESOURCE' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span className={`aegis-badge ${selectedItem.data.status === 'AVAILABLE' ? 'badge-normal' : selectedItem.data.status === 'DEPLOYED' ? 'badge-sand' : 'badge-warning'}`}>
                      <span className="aegis-badge-dot" />
                      {selectedItem.data.status}
                    </span>
                    <span className="aegis-badge badge-sand">
                      {selectedItem.data.type || selectedItem.data.category}
                    </span>
                    <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      ID: {selectedItem.data.id}
                    </span>
                  </div>

                  <table className="aegis-table">
                    <tbody>
                      <tr>
                        <td style={{ color: 'var(--text-secondary)' }}>UNIT FLEET COUNT</td>
                        <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--color-cyan)' }}>
                          ×{selectedItem.data.count || 1} UNITS
                        </td>
                      </tr>
                      <tr>
                        <td style={{ color: 'var(--text-secondary)' }}>TRANSIT VELOCITY</td>
                        <td style={{ textAlign: 'right' }}>{selectedItem.data.speed || '65 KM/H'}</td>
                      </tr>
                      <tr>
                        <td style={{ color: 'var(--text-secondary)' }}>ESTIMATED ETA</td>
                        <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--color-sand)' }}>{selectedItem.data.eta || '10 MIN'}</td>
                      </tr>
                      <tr>
                        <td style={{ color: 'var(--text-secondary)' }}>ASSIGNED SECTOR</td>
                        <td style={{ textAlign: 'right' }}>ZONE {selectedItem.data.assignedZone || 'A'}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Deployment History */}
                  <div>
                    <span className="aegis-data-label">DEPLOYMENT LOG &amp; AUDIT TRAIL</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                      {(selectedItem.data.history || ['Staged at Base (08:00)']).map((h, hIdx) => (
                        <div key={hIdx} style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={11} color="var(--text-muted)" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dispatch Action */}
                  <button
                    onClick={() => setSelectedResourceToDeploy(selectedItem.data)}
                    className="aegis-btn aegis-btn-primary"
                    style={{ width: '100%', marginTop: '6px' }}
                  >
                    <span>STAGE FOR DEPLOYMENT</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* Specific Content for ZONE */}
              {selectedItem.type === 'ZONE' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="aegis-badge badge-critical">
                      RISK: {selectedItem.data.risk}%
                    </span>
                    <span className="aegis-badge badge-sand">
                      STATUS: {selectedItem.data.status}
                    </span>
                  </div>

                  <table className="aegis-table">
                    <tbody>
                      <tr>
                        <td style={{ color: 'var(--text-secondary)' }}>POPULATION AT RISK</td>
                        <td style={{ textAlign: 'right', fontWeight: '700' }}>
                          {selectedItem.data.population?.toLocaleString() || '3,400'} CIVILIANS
                        </td>
                      </tr>
                      <tr>
                        <td style={{ color: 'var(--text-secondary)' }}>WATER INUNDATION</td>
                        <td style={{ textAlign: 'right', color: '#38BDF8' }}>{selectedItem.data.floodLevel}</td>
                      </tr>
                      <tr>
                        <td style={{ color: 'var(--text-secondary)' }}>ROAD INGRESS PASSABILITY</td>
                        <td style={{ textAlign: 'right', color: parseInt(selectedItem.data.roadAccess) < 40 ? '#EF4444' : '#10B981' }}>
                          {selectedItem.data.roadAccess} ACCESSIBLE
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <button
                    onClick={() => {
                      setDeployTargetZone(selectedItem.data.id);
                      setSelectedResourceToDeploy(resourcesList.find(r => r.status === 'AVAILABLE') || resourcesList[0]);
                    }}
                    className="aegis-btn aegis-btn-primary"
                    style={{ width: '100%', marginTop: '6px' }}
                  >
                    <span>DEPLOY FLEET TO SECTOR {selectedItem.data.id}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}

            </div>
          ) : (
            <div style={{
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              color: 'var(--text-muted)',
              gap: '12px'
            }}>
              <Crosshair size={32} color="var(--color-cyan)" style={{ opacity: 0.6 }} />
              <div>
                <h4 className="font-hud" style={{ fontSize: '16px', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                  TACTICAL INSPECTOR IDLE
                </h4>
                <p style={{ fontSize: '11px', lineHeight: 1.4, margin: 0 }}>
                  Click any Incident marker, Resource marker, or Disaster Zone boundary on the map to inspect live telemetries.
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          C & D. INTEGRATED RESOURCE MANAGEMENT & DEPLOYMENT DOCK
      ────────────────────────────────────────────────────────────────── */}
      <section style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={17} color="var(--color-cyan)" />
            <h3 className="font-hud" style={{ fontSize: '15px', fontWeight: '800', letterSpacing: '0.08em', margin: 0 }}>
              RESOURCE STAGING &amp; DISPATCH WORKFLOW
            </h3>
            <span className="aegis-badge badge-sand" style={{ fontSize: '9px' }}>
              REAL-TIME DISPATCH ENGINE
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              TARGET SECTOR:
            </span>
            <select
              value={deployTargetZone}
              onChange={(e) => setDeployTargetZone(e.target.value)}
              className="aegis-select"
            >
              <option value="D">ZONE D (CRITICAL - SOUTH HOSPITAL)</option>
              <option value="C">ZONE C (RIVER BASIN BERM)</option>
              <option value="E">ZONE E (BLACKOUT PROBE)</option>
              <option value="B">ZONE B (COMMERCIAL HUB)</option>
              <option value="A">ZONE A (BASE STAGING)</option>
            </select>
          </div>
        </div>

        {/* Resources Fleet Cards Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '10px'
        }}>
          {resourcesList.map((res) => {
            const isSelected = selectedResourceToDeploy?.id === res.id;
            const isAvailable = res.status === 'AVAILABLE';
            const statusColor = isAvailable ? '#10B981' : res.status === 'DEPLOYED' ? '#00F0FF' : '#F59E0B';

            return (
              <div
                key={res.id}
                onClick={() => {
                  setSelectedResourceToDeploy(res);
                  setSelectedItem({ type: 'RESOURCE', data: res });
                }}
                style={{
                  background: isSelected ? 'var(--bg-surface-hover)' : 'var(--bg-surface-elevated)',
                  border: isSelected ? '1px solid var(--color-cyan)' : '1px solid var(--border-subtle)',
                  borderRadius: '5px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  boxShadow: isSelected ? '0 0 14px rgba(0, 240, 255, 0.2)' : 'none',
                  transition: 'all 0.16s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="font-hud" style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF' }}>
                    {res.callsign}
                  </span>
                  <span className="font-mono tabular-nums" style={{ fontSize: '12px', fontWeight: '800', color: statusColor }}>
                    ×{res.count} UNITS
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {res.name}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '6px',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)'
                }}>
                  <span style={{ color: statusColor, fontWeight: '700' }}>
                    ● {res.status}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    ZONE {res.assignedZone || 'A'} · {res.eta || '10M'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Deployment Confirmation & Execution Action Bar */}
        {selectedResourceToDeploy && (
          <div style={{
            background: 'rgba(0, 240, 255, 0.06)',
            border: '1px solid var(--border-accent)',
            borderRadius: '5px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                background: 'rgba(0, 240, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-cyan)'
              }}>
                <Send size={16} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#FFFFFF' }}>
                  DEPLOYMENT STAGED: {selectedResourceToDeploy.callsign} → SECTOR {deployTargetZone}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Transit route calculated · ETA: {selectedResourceToDeploy.eta || '12 MIN'} · Fleet capacity: {selectedResourceToDeploy.count} Units
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {deploymentSuccess && (
                <span className="font-mono" style={{ fontSize: '11px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={13} /> {deploymentSuccess}
                </span>
              )}
              {deploymentError && (
                <span className="font-mono" style={{ fontSize: '11px', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <XCircle size={13} /> {deploymentError}
                </span>
              )}

              <button
                onClick={() => setSelectedResourceToDeploy(null)}
                className="aegis-btn aegis-btn-outline"
                style={{ fontSize: '11px', padding: '6px 12px' }}
                disabled={isDeploying}
              >
                CANCEL
              </button>

              <button
                onClick={handleExecuteDeployment}
                className="aegis-btn aegis-btn-primary"
                style={{ fontSize: '11px', padding: '6px 16px' }}
                disabled={isDeploying}
              >
                {isDeploying ? (
                  <span>COMMITTING DISPATCH...</span>
                ) : (
                  <>
                    <span>CONFIRM &amp; DISPATCH FLEET</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
