import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  HeartHandshake, 
  Send, 
  Flame, 
  Activity, 
  Radio, 
  Truck, 
  ShieldAlert, 
  AlertTriangle,
  ChevronRight,
  Target,
  Compass,
  Check,
  MapPin,
  Clock,
  Eye,
  RefreshCw,
  Layers,
  HelpCircle,
  FileText,
  CloudRain,
  Wind,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { AegisPrimaryCommand } from './aegis-controls';
import { AegisAnimatedNumber } from './aegis-interactive';
import { 
  assignResource, 
  getMissionIntelligence, 
  getRecommendations, 
  getMissionWeather,
  getMissionReports 
} from '../services/api';
import DigitalTwinMap from './DigitalTwinMap';
import AegisWeatherWidget from './AegisWeatherWidget';
import AegisFieldReports from './AegisFieldReports';
import { getHazardConfig } from '../services/hazardConfig';

export default function CommandCenterScreen({
  onCreatePlan,
  onResourceAssigned,
  currentOrg = null,
  currentUser = null,
  activeMission = null,
  worldState = null,
  zones: propZones = [],
  incidents: propIncidents = [],
  resources: propResources = [],
  onNavigateStage = null,
  onSelectZone = null
}) {
  // Staged resource selection
  const [selectedUnit, setSelectedUnit] = useState(0);
  const [isAssigning, setIsAssigning] = useState(false);
  const [targetZone, setTargetZone] = useState('D');

  // Interactive selected zone on map
  const [mapSelectedZoneId, setMapSelectedZoneId] = useState('D');

  // Secondary views tab: 'NONE' | 'REPORTS' | 'WEATHER' | 'FLEET'
  const [secondaryTab, setSecondaryTab] = useState('FLEET');

  // Live operational data
  const [intelligence, setIntelligence] = useState(null);
  const [recommendationsData, setRecommendationsData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [reportsCount, setReportsCount] = useState(null);
  const [loadingIntel, setLoadingIntel] = useState(false);
  const [intelError, setIntelError] = useState(null);

  const missionId = activeMission?.missionId || '027';
  const hazardConfig = getHazardConfig(activeMission?.disasterType || 'FLOOD');
  const operationalDirective = activeMission?.description || intelligence?.summary || (activeMission?.missionId === '027' ? "Secure emergency vehicle transit to South General Hospital (Zone D) & penetrate communication blackout in Sector E." : "Coordinate perimeter evacuation, stabilize critical sectors, and maintain operational telemetry.");

  // Fetch operational intelligence and recommendations
  const loadOperationalData = useCallback(async (isRefresh = false) => {
    setLoadingIntel(true);
    setIntelError(null);
    try {
      const [intelRes, recRes, weatherRes, reportsRes] = await Promise.all([
        getMissionIntelligence(missionId, isRefresh).catch(err => {
          console.warn('[AEGIS-COMMAND] Intel fetch fallback:', err.message);
          return null;
        }),
        getRecommendations().catch(err => {
          console.warn('[AEGIS-COMMAND] Recommendations fetch fallback:', err.message);
          return null;
        }),
        getMissionWeather(missionId, isRefresh).catch(err => {
          console.warn('[AEGIS-COMMAND] Weather fetch fallback:', err.message);
          return null;
        }),
        getMissionReports(missionId).catch(err => {
          console.warn('[AEGIS-COMMAND] Reports fetch fallback:', err.message);
          return null;
        })
      ]);

      if (intelRes) setIntelligence(intelRes);
      if (recRes) setRecommendationsData(recRes);
      if (weatherRes) setWeatherData(weatherRes);
      if (Array.isArray(reportsRes)) setReportsCount(reportsRes.length);
    } catch (err) {
      setIntelError('Operational telemetries offline. Using local sensor baseline.');
    } finally {
      setLoadingIntel(false);
    }
  }, [missionId]);

  useEffect(() => {
    loadOperationalData();
  }, [loadOperationalData]);

  // Operational Resources list
  const resources = [
    { callsign: "AMBULANCE 02", name: "AMBULANCE", count: 4, icon: HeartHandshake, color: "#4ADE80", range: "14 KM", eta: "12 MIN", status: "AVAILABLE", desc: "Emergency medical triage & patient extraction" },
    { callsign: "DRONE WING 01", name: "DRONE", count: 2, icon: Send, color: "#8B7FA8", range: "28 KM", eta: "4 MIN", status: "AVAILABLE", desc: "Thermal aerial reconnaissance & damage scanning" },
    { callsign: "RESCUE SQUAD 04", name: "RESCUE TEAM", count: 3, icon: Flame, color: "#C93B3B", range: "9 KM", eta: "8 MIN", status: "STAGED", desc: "High-water swift rescue & perimeter evacuation" },
    { callsign: "MEDIC POD ALPHA", name: "MOBILE MEDICAL UNIT", count: 1, icon: Activity, color: "#348A64", range: "6 KM", eta: "15 MIN", status: "AVAILABLE", desc: "On-site surgical field hospital pod" },
    { callsign: "SAT RELAY ECHO", name: "COMMUNICATION UNIT", count: 2, icon: Radio, color: "#C8B99D", range: "35 KM", eta: "6 MIN", status: "STANDBY", desc: "Tactical satellite comms relay & portable tower" },
    { callsign: "CONVOY HEAVY 03", name: "SUPPLY CONVOY", count: 2, icon: Truck, color: "#C98A2C", range: "18 KM", eta: "20 MIN", status: "AVAILABLE", desc: "Sandbagging barricades & high-capacity generators" }
  ];

  const handleUnitSelect = async (idx, res) => {
    setSelectedUnit(idx);
    setIsAssigning(true);
    try {
      const resourceId = res.name || res.callsign;
      await assignResource(resourceId, targetZone);
      if (onResourceAssigned) {
        onResourceAssigned(res, targetZone);
      }
    } catch (err) {
      console.warn('[AEGIS-API] Resource assignment fallback:', err.message);
    } finally {
      setTimeout(() => setIsAssigning(false), 300);
    }
  };

  // Safe zones resolution
  const zonesList = useMemo(() => {
    if (propZones && propZones.length > 0) return propZones;
    if (worldState?.zones && worldState.zones.length > 0) return worldState.zones;
    return [
      { id: 'A', name: 'Zone A - Base Staging', risk: 18, status: 'STABLE', roads: 88, floodLevel: 0.2 },
      { id: 'B', name: 'Zone B - Commercial Core', risk: 48, status: 'WARNING', roads: 64, floodLevel: 1.1 },
      { id: 'C', name: 'Zone C - River Basin Corridor', risk: 74, status: 'HIGH_RISK', roads: 38, floodLevel: 3.4 },
      { id: 'D', name: 'Zone D - South Trauma Hospital', risk: 96, status: 'CRITICAL', roads: 22, floodLevel: 2.9 },
      { id: 'E', name: 'Zone E - Silent Blackout Sector', risk: 78, status: 'UNKNOWN', isUnknown: true, roads: 25, floodLevel: 2.1 }
    ];
  }, [propZones, worldState]);

  // Derived metrics from real data
  const criticalZonesCount = useMemo(() => {
    return zonesList.filter(z => z.status === 'CRITICAL' || z.risk >= 80).length;
  }, [zonesList]);

  const activeIncidentsCount = useMemo(() => {
    if (propIncidents && propIncidents.length > 0) return propIncidents.length;
    if (worldState?.incidents && worldState.incidents.length > 0) return worldState.incidents.length;
    if (worldState?.activeAlerts !== undefined) return worldState.activeAlerts;
    return 7;
  }, [propIncidents, worldState]);

  const totalAvailableResources = useMemo(() => {
    const list = propResources?.length > 0 ? propResources : resources;
    return list.reduce((acc, curr) => acc + (curr.count || 1), 0);
  }, [propResources]);

  const pendingReportsCount = useMemo(() => {
    if (reportsCount !== null) return reportsCount;
    if (intelligence?.reports?.total !== undefined) return intelligence.reports.total;
    return 6;
  }, [reportsCount, intelligence]);

  // Priority attention items from intelligence/zones
  const priorityItems = useMemo(() => {
    if (zonesList && zonesList.length > 0 && activeMission && (activeMission.missionId !== '027' || activeMission.disasterType !== 'FLOOD')) {
      const sorted = [...zonesList].sort((a, b) => (b.risk || 0) - (a.risk || 0));
      return sorted.slice(0, 3).map(z => ({
        id: z.id || z.zoneId,
        type: 'ZONE',
        name: `ZONE ${z.id || z.zoneId} // ${(z.name || 'SECTOR').toUpperCase()}`,
        riskLevel: z.status === 'CRITICAL' ? 'CRITICAL' : z.status === 'UNKNOWN' ? 'UNKNOWN RISK' : `${z.status || 'HIGH'} RISK`,
        riskScore: z.risk || 75,
        badgeStyle: z.status === 'CRITICAL' ? 'badge-critical' : z.status === 'UNKNOWN' ? 'badge-inactive' : 'badge-warning',
        severityClass: z.status === 'CRITICAL' ? 'severity-critical' : z.status === 'UNKNOWN' ? 'severity-unknown' : 'severity-warning',
        reason: z.criticalAsset ? `Primary exposed facility: ${z.criticalAsset}. High hazard vulnerability.` : (z.description || `Active operational alert in sector with vulnerability index at ${z.risk}%.`),
        indicator: z.isUnknown ? 'INFORMATION GAP: HIGH · RECON REQUIRED' : `CONFIDENCE: ${z.confidence || 88}% · SENSORS CORRELATED`,
        indicatorType: z.isUnknown ? 'GAP' : 'CONFIDENCE',
        actionLabel: 'VIEW ZONE MAP',
        stageTarget: 'map',
        zoneId: z.id || z.zoneId
      }));
    }

    return [
      {
        id: 'D',
        type: 'ZONE',
        name: 'ZONE D // SOUTH GENERAL TRAUMA CENTER',
        riskLevel: 'CRITICAL',
        riskScore: 96,
        badgeStyle: 'badge-critical',
        severityClass: 'severity-critical',
        reason: 'Arterial Road 17 underwater (2.9m flood crest). Triage facility cut off from emergency ambulance ingress.',
        indicator: 'CONFIDENCE: 92% · 5 SENSORS CORRELATED',
        indicatorType: 'CONFIDENCE',
        actionLabel: 'VIEW ZONE MAP',
        stageTarget: 'map',
        zoneId: 'D'
      },
      {
        id: 'E',
        type: 'ZONE',
        name: 'ZONE E // COMMUNICATIONS BLACKOUT',
        riskLevel: 'UNKNOWN RISK',
        riskScore: 78,
        badgeStyle: 'badge-inactive',
        severityClass: 'severity-unknown',
        reason: '88% telemetry loss. 140+ stalled vehicle beacons detected with zero 911 calls. Potential silent mass inundation.',
        indicator: 'INFORMATION GAP: HIGH · RECON REQUIRED',
        indicatorType: 'GAP',
        actionLabel: 'INSPECT REPORT',
        stageTarget: 'unknown',
        zoneId: 'E'
      },
      {
        id: 'C',
        type: 'ZONE',
        name: 'ZONE C // BRIDGE 17 RIVER CORRIDOR',
        riskLevel: 'HIGH RISK',
        riskScore: 74,
        badgeStyle: 'badge-warning',
        severityClass: 'severity-warning',
        reason: 'Water discharge rate exceeds 420 m³/s. River berm breach imminent; overflow threatens Zone B commercial transit corridor.',
        indicator: 'CONFIDENCE: 88% · HYDRO SENSORS ONLINE',
        indicatorType: 'CONFIDENCE',
        actionLabel: 'VIEW ZONE MAP',
        stageTarget: 'map',
        zoneId: 'C'
      }
    ];
  }, [zonesList, activeMission]);

  // Format last updated timestamp
  const lastUpdateTime = useMemo(() => {
    const raw = intelligence?.fusedAt || weatherData?.fetchedAt;
    if (raw) {
      try {
        const d = new Date(raw);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      } catch {
        return 'LIVE SYNC';
      }
    }
    return '09:36:12 UTC';
  }, [intelligence, weatherData]);

  // Handle priority item action navigation
  const handlePriorityAction = (item) => {
    if (onSelectZone && item.zoneId) {
      setMapSelectedZoneId(item.zoneId);
    }
    if (onNavigateStage && item.stageTarget) {
      onNavigateStage(item.stageTarget);
    }
  };

  return (
    <div style={{
      maxWidth: '1580px',
      margin: '0 auto',
      width: '100%',
      padding: '16px 22px 48px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>

      {/* ──────────────────────────────────────────────────────────────────
          1. MISSION & SYSTEM STATE OVERVIEW (Header Banner)
      ────────────────────────────────────────────────────────────────── */}
      <section 
        className="aegis-card"
        style={{
          padding: '18px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          borderLeft: '4px solid var(--color-accent)'
        }}
        aria-label="Mission and System State Overview"
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          {/* Mission Identity Block */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '5px',
              background: 'var(--color-accent-subtle)',
              border: '1px solid var(--border-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-accent-light)',
              flexShrink: 0
            }}>
              <ShieldAlert size={22} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
                <span className="aegis-badge badge-sand">
                  OPERATION #{missionId}
                </span>
                <span className="aegis-badge badge-critical">
                  <span className="aegis-badge-dot" />
                  DEFCON 2 · ACTIVE CRISIS
                </span>
                <span style={{
                  fontSize: '9px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: '800',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  background: `${hazardConfig.badgeColor}22`,
                  color: hazardConfig.badgeColor,
                  border: `1px solid ${hazardConfig.badgeColor}55`,
                  letterSpacing: '0.06em'
                }}>
                  {hazardConfig.badge} · {hazardConfig.name.toUpperCase()}
                </span>
              </div>

              <h1 className="font-hud" style={{
                fontSize: '24px',
                fontWeight: '800',
                letterSpacing: '0.04em',
                color: 'var(--text-primary)',
                margin: 0,
                lineHeight: 1.2
              }}>
                {(activeMission?.name || 'FLASH FLOOD CASCADE & SATELLITE COMMUNICATIONS BLACKOUT').toUpperCase()}
              </h1>
            </div>
          </div>

          {/* Location & Intelligence Update Metas */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            background: 'var(--bg-surface-elevated)',
            padding: '8px 16px',
            borderRadius: '4px',
            border: '1px solid var(--border-subtle)',
            flexWrap: 'wrap'
          }}>
            <div>
              <span className="aegis-data-label">OPERATIONAL THEATER LOCATION</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-primary)' }}>
                <MapPin size={13} color="var(--color-sand)" />
                <span className="font-mono" style={{ fontSize: '12px', fontWeight: '700' }}>
                  {(activeMission?.locationDisplayName || activeMission?.locationName || 'CHANDIGARH, SECTOR 17').toUpperCase()}
                </span>
              </div>
            </div>

            <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)' }} />

            <div>
              <span className="aegis-data-label">COMMAND JURISDICTION</span>
              <span className="font-mono" style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-sand-light)' }}>
                {currentOrg?.name || 'Regional Emergency Response Network'}
              </span>
            </div>

            <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)' }} />

            <div>
              <span className="aegis-data-label">LAST FUSION UPDATE</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Clock size={13} color="var(--color-accent-light)" />
                <span className="font-mono tabular-nums" style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-accent-light)' }}>
                  {lastUpdateTime}
                </span>
                <button 
                  onClick={() => loadOperationalData(true)}
                  disabled={loadingIntel}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px',
                    marginLeft: '4px'
                  }}
                  title="Force recompute fused intelligence telemetry"
                  aria-label="Refresh intelligence"
                >
                  <RefreshCw size={11} className={loadingIntel ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Context Subtext */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '10px',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={14} color="var(--color-sand)" />
            <span>
              <strong style={{ color: 'var(--text-primary)' }}>DIRECTIVE:</strong> {operationalDirective}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isAssigning && (
              <span className="font-mono" style={{ fontSize: '11px', color: '#38BDF8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="aegis-badge-dot" style={{ background: '#38BDF8' }} /> DISPATCH TELEMETRY SYNCING...
              </span>
            )}
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              MODE: {currentUser ? `OPERATOR [${currentUser.role}] ${currentUser.name}` : 'DEMO THEATER PROTOTYPE'}
            </span>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          2. OPERATIONAL SUMMARY CARDS (Compact Row of 4 Real Metric Cards)
      ────────────────────────────────────────────────────────────────── */}
      <section aria-label="Critical Operational Metrics">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '14px'
        }}>
          {/* Card 1: Critical Zones */}
          <div
            onClick={() => onNavigateStage && onNavigateStage('map')}
            className="aegis-summary-card accent-critical"
            role="button"
            tabIndex={0}
            title="Click to view Zone Topography & Telemetry on Map"
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="aegis-data-label">CRITICAL ZONES</span>
                <span className="aegis-badge badge-critical">
                  <span className="aegis-badge-dot" /> DANGER
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span className="font-hud tabular-nums" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-critical)', lineHeight: 1 }}>
                  <AegisAnimatedNumber value={criticalZonesCount} />
                </span>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  OF 5 TOTAL SECTORS
                </span>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '8px',
              fontSize: '11px',
              color: 'var(--text-secondary)'
            }}>
              <span>Sector D: 96% Risk · Sector C: 74%</span>
              <span className="font-mono" style={{ color: 'var(--color-critical)', fontWeight: '700' }}>
                VIEW MAP →
              </span>
            </div>
          </div>

          {/* Card 2: Active Incidents */}
          <div
            onClick={() => onNavigateStage && onNavigateStage('investigate')}
            className="aegis-summary-card accent-warning"
            role="button"
            tabIndex={0}
            title="Click to investigate verified field telemetry signals"
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="aegis-data-label">ACTIVE INCIDENTS</span>
                <span className="aegis-badge badge-warning">
                  <span className="aegis-badge-dot" /> ATTENTION
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span className="font-hud tabular-nums" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-warning)', lineHeight: 1 }}>
                  <AegisAnimatedNumber value={activeIncidentsCount} />
                </span>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  UNRESOLVED ALERTS
                </span>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '8px',
              fontSize: '11px',
              color: 'var(--text-secondary)'
            }}>
              <span>Flood surge, road obstruction & comms cut</span>
              <span className="font-mono" style={{ color: 'var(--color-warning)', fontWeight: '700' }}>
                INVESTIGATE →
              </span>
            </div>
          </div>

          {/* Card 3: Available Resources */}
          <div
            onClick={() => setSecondaryTab('FLEET')}
            className="aegis-summary-card accent-normal"
            role="button"
            tabIndex={0}
            title="Click to manage tactical fleet staging and assignment"
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="aegis-data-label">AVAILABLE FLEET</span>
                <span className="aegis-badge badge-normal">
                  <span className="aegis-badge-dot" /> OPERATIONAL
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span className="font-hud tabular-nums" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-normal)', lineHeight: 1 }}>
                  <AegisAnimatedNumber value={totalAvailableResources} />
                </span>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  TOTAL UNITS STAGED
                </span>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '8px',
              fontSize: '11px',
              color: 'var(--text-secondary)'
            }}>
              <span>EMS, Drones, Rescue squads, Comms relay</span>
              <span className="font-mono" style={{ color: 'var(--color-normal)', fontWeight: '700' }}>
                STAGING FLEET →
              </span>
            </div>
          </div>

          {/* Card 4: Information Gaps & Pending Reports */}
          <div
            onClick={() => onNavigateStage && onNavigateStage('unknown')}
            className="aegis-summary-card accent-sand"
            role="button"
            tabIndex={0}
            title="Click to probe Zone E blackout and field reports"
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="aegis-data-label">PENDING FIELD REPORTS</span>
                <span className="aegis-badge badge-sand">
                  <span className="aegis-badge-dot" />
                  {intelligence?.informationGap?.level ? `${intelligence.informationGap.level} GAP` : '1 BLACKOUT'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span className="font-hud tabular-nums" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-sand)', lineHeight: 1 }}>
                  <AegisAnimatedNumber value={pendingReportsCount} />
                </span>
                <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  INCOMING OBSERVATIONS
                </span>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '8px',
              fontSize: '11px',
              color: 'var(--text-secondary)'
            }}>
              <span>Sector E telemetry blackout (88% lost)</span>
              <span className="font-mono" style={{ color: 'var(--color-sand)', fontWeight: '700' }}>
                PROBE GAP →
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          3. PRIORITY ATTENTION PANEL
      ────────────────────────────────────────────────────────────────── */}
      <section 
        className="aegis-card"
        style={{ padding: '20px 22px' }}
        aria-label="Priority Attention"
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '10px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'var(--color-critical)',
              display: 'inline-block'
            }} />
            <h2 className="font-hud" style={{
              fontSize: '16px',
              fontWeight: '800',
              letterSpacing: '0.1em',
              color: 'var(--text-primary)',
              margin: 0
            }}>
              PRIORITY ATTENTION
            </h2>
            <span className="aegis-badge badge-critical">
              HIGHEST OPERATIONAL RISK ALERTS
            </span>
          </div>

          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            SURFACED FROM DETERMINISTIC MULTI-SOURCE RISK SYNTHESIS
          </span>
        </div>

        {/* Priority items list */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '14px' }}>
          {priorityItems.map((item) => (
            <div
              key={item.id}
              className={`aegis-priority-card ${item.severityClass}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
                cursor: 'pointer'
              }}
              onClick={() => handlePriorityAction(item)}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                  <span className="font-hud" style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
                    {item.name}
                  </span>
                  <span className={`aegis-badge ${item.badgeStyle}`}>
                    <span className="aegis-badge-dot" />
                    {item.riskLevel} ({item.riskScore}%)
                  </span>
                </div>

                <p style={{
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  lineHeight: 1.45,
                  margin: '4px 0 10px 0',
                  opacity: 0.92
                }}>
                  {item.reason}
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '8px',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <span className="font-mono" style={{
                  fontSize: '10px',
                  color: item.indicatorType === 'GAP' ? 'var(--color-sand-light)' : 'var(--color-accent-light)',
                  fontWeight: '700'
                }}>
                  {item.indicator}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePriorityAction(item);
                  }}
                  className="aegis-btn aegis-btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '10px' }}
                >
                  <span>{item.actionLabel}</span>
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          4. OPERATIONAL MAP / MISSION OVERVIEW (Digital Twin Embedding)
      ────────────────────────────────────────────────────────────────── */}
      <section 
        className="aegis-card"
        style={{ padding: '20px 22px' }}
        aria-label="Operational Map Overview"
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '10px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={18} color="var(--color-accent-light)" />
            <h2 className="font-hud" style={{
              fontSize: '16px',
              fontWeight: '800',
              letterSpacing: '0.1em',
              color: 'var(--text-primary)',
              margin: 0
            }}>
              OPERATIONAL MAP &amp; SECTOR TOPOGRAPHY
            </h2>
            <span className="aegis-badge badge-normal">
              DIGITAL TWIN · REAL-TIME
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              CLICK ANY SECTOR TO INSPECT DETAILS
            </span>
            <button
              onClick={() => onNavigateStage && onNavigateStage('map')}
              className="aegis-btn aegis-btn-outline"
              style={{ fontSize: '10px', padding: '4px 10px' }}
              title="Open full interactive Digital Twin screen with layer toggles"
            >
              <ExternalLink size={12} />
              <span>FULL MAP VIEW</span>
            </button>
          </div>
        </div>

        {/* Map Container and Sector Insight Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1fr)',
          gap: '18px',
          alignItems: 'start'
        }}>
          {/* Main Map Visualizer */}
          <div style={{
            background: 'var(--bg-deep-graphite)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <DigitalTwinMap
              zones={zonesList}
              selectedZoneId={mapSelectedZoneId}
              onSelectZone={(zid) => {
                setMapSelectedZoneId(zid);
                setTargetZone(zid);
              }}
              activeMission={activeMission}
              timeOffset={0}
              weather={weatherData || {}}
              deployedResources={{}}
            />

            {/* In-Map Semantic Legend */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              background: 'rgba(10, 13, 18, 0.88)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backdropFilter: 'blur(8px)',
              flexWrap: 'wrap'
            }}>
              <span className="font-mono" style={{ fontSize: '9px', color: 'var(--text-secondary)', fontWeight: '700' }}>
                STATUS LEGEND:
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#F87171' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C93B3B' }} />
                CRITICAL (&gt;80%)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#FBBF24' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C98A2C' }} />
                WARNING (40–79%)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#4ADE80' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#348A64' }} />
                STABLE (&lt;40%)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#9AA4AF' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7A828E' }} />
                UNKNOWN / BLACKOUT
              </span>
            </div>
          </div>

          {/* Active Selected Sector Inspector */}
          {(() => {
            const currentZone = zonesList.find(z => z.id === mapSelectedZoneId) || zonesList[3];
            const isUnknown = currentZone.status === 'UNKNOWN' || currentZone.isUnknown || currentZone.id === 'E';
            const isCritical = currentZone.status === 'CRITICAL' || currentZone.risk >= 80;
            const isWarning = currentZone.status === 'WARNING' || currentZone.status === 'HIGH_RISK';

            return (
              <div style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                  <div>
                    <span className="aegis-data-label">INSPECTED SECTOR</span>
                    <h3 className="font-hud" style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                      SECTOR {currentZone.id}: {currentZone.name || (currentZone.id === 'D' ? 'South Trauma Center' : currentZone.id === 'E' ? 'Blackout Zone' : 'Metropolitan Sector')}
                    </h3>
                  </div>
                  <span className={`aegis-badge ${isCritical ? 'badge-critical' : isUnknown ? 'badge-inactive' : isWarning ? 'badge-warning' : 'badge-normal'}`}>
                    <span className="aegis-badge-dot" />
                    {currentZone.status || (isCritical ? 'CRITICAL' : 'STABLE')}
                  </span>
                </div>

                {/* Metrics Table */}
                <table className="aegis-table">
                  <tbody>
                    <tr>
                      <td style={{ color: 'var(--text-secondary)' }}>RISK INDEX</td>
                      <td style={{ textAlign: 'right', fontWeight: '700', color: isCritical ? '#F87171' : isWarning ? '#FBBF24' : '#4ADE80' }}>
                        {currentZone.risk}%
                      </td>
                    </tr>
                    <tr>
                      <td style={{ color: 'var(--text-secondary)' }}>FLOOD DEPTH</td>
                      <td style={{ textAlign: 'right' }}>
                        {currentZone.floodLevel ? `${currentZone.floodLevel} METERS` : '0.4 METERS'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ color: 'var(--text-secondary)' }}>ROAD PASSABILITY</td>
                      <td style={{ textAlign: 'right', color: (currentZone.roads || 50) < 40 ? '#F87171' : 'var(--text-primary)' }}>
                        {currentZone.roads ?? 64}% ACCESSIBLE
                      </td>
                    </tr>
                    <tr>
                      <td style={{ color: 'var(--text-secondary)' }}>TELEMETRY STATUS</td>
                      <td style={{ textAlign: 'right', color: isUnknown ? '#F87171' : '#4ADE80' }}>
                        {isUnknown ? '88% SENSOR BLACKOUT' : 'FULL SENSOR GRID LINK'}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Specific Tactical Note */}
                <div style={{
                  background: 'var(--bg-surface)',
                  padding: '10px 12px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '11px',
                  lineHeight: 1.4,
                  color: 'var(--text-secondary)'
                }}>
                  {currentZone?.criticalAsset ? (
                    <span><strong>Sector {currentZone.id} Alert:</strong> Critical asset exposed: {currentZone.criticalAsset}. Sector vulnerability risk score is {currentZone.risk}%.</span>
                  ) : currentZone.id === 'D' && (!activeMission || activeMission.missionId === '027') ? (
                    <span><strong>Sector D Alert:</strong> South General Trauma Center represents the primary critical path. Bridge and Road 17 blockage threatens collapse of regional triage capacity.</span>
                  ) : currentZone.id === 'E' && (!activeMission || activeMission.missionId === '027') ? (
                    <span><strong>Sector E Alert:</strong> Complete RF blackout. Unmonitored civilian enclave with suspected flood accumulation behind railway embankment.</span>
                  ) : currentZone.id === 'C' && (!activeMission || activeMission.missionId === '027') ? (
                    <span><strong>Sector C Alert:</strong> River corridor berm is taking peak overflow. Engineering reinforcement recommended to protect arterial roads.</span>
                  ) : (
                    <span><strong>Sector {currentZone.id} Status:</strong> Operational risk index at {currentZone.risk}%. {currentZone.status === 'CRITICAL' ? 'Immediate tactical intervention required.' : 'Perimeter surveillance and staging in progress.'}</span>
                  )}
                </div>

                {/* Quick actions for inspected zone */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      if (onSelectZone) onSelectZone(currentZone.id, null);
                    }}
                    className="aegis-btn aegis-btn-primary"
                    style={{ flex: 1, fontSize: '11px' }}
                  >
                    <span>EXPLAIN RISK (XAI)</span>
                    <ArrowRight size={12} />
                  </button>
                  <button
                    onClick={() => {
                      setTargetZone(currentZone.id);
                      setSecondaryTab('FLEET');
                    }}
                    className="aegis-btn aegis-btn-secondary"
                    style={{ fontSize: '11px' }}
                    title="Stage resources for this specific zone"
                  >
                    <span>STAGE FOR {currentZone.id}</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          5. INTELLIGENCE OVERVIEW (Deterministic Fused World State)
      ────────────────────────────────────────────────────────────────── */}
      <section 
        className="aegis-card"
        style={{ padding: '20px 22px' }}
        aria-label="Operational Intelligence Overview"
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '10px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={18} color="var(--color-accent-light)" />
            <h2 className="font-hud" style={{
              fontSize: '16px',
              fontWeight: '800',
              letterSpacing: '0.1em',
              color: 'var(--text-primary)',
              margin: 0
            }}>
              INTELLIGENCE OVERVIEW
            </h2>
            <span className="aegis-badge badge-sand">
              MULTI-SIGNAL SYNTHESIS
            </span>
          </div>

          <div style={{
            background: 'var(--color-sand-subtle)',
            border: '1px solid var(--border-sand)',
            padding: '3px 9px',
            borderRadius: '4px',
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-sand-light)'
          }}>
            RULE-BASED DETERMINISTIC FUSION · NOT A BLACK-BOX ML PREDICTION
          </div>
        </div>

        {/* Intelligence Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {/* Overall Risk Score */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            padding: '16px',
            borderRadius: '5px',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <span className="aegis-data-label">OVERALL FUSED RISK ASSESSMENT</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                fontSize: '36px',
                fontWeight: '800',
                fontFamily: 'var(--font-hud)',
                color: 'var(--color-critical)',
                lineHeight: 1
              }}>
                <AegisAnimatedNumber value={intelligence?.overallRisk?.score || 82} suffix="%" />
              </div>
              <div>
                <span className="aegis-badge badge-critical" style={{ marginBottom: '4px' }}>
                  {intelligence?.overallRisk?.level || 'CRITICAL RISK'}
                </span>
                <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  COMPOSITE SEVERITY INDEX
                </div>
              </div>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
              Combined hazard score factoring rainfall accumulation, rapid river discharge, and critical facility isolation.
            </p>
          </div>

          {/* Major Contributing Risk Factors */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            padding: '16px',
            borderRadius: '5px',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <span className="aegis-data-label">PRIMARY CONTRIBUTING RISK FACTORS</span>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CloudRain size={12} color="#38BDF8" /> Sustained Rainfall (18 mm/h)
                </span>
                <span className="font-mono" style={{ color: 'var(--color-critical)', fontWeight: '700' }}>+35% IMPACT</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={12} color="#C98A2C" /> Road 17 Arterial Blockage
                </span>
                <span className="font-mono" style={{ color: 'var(--color-warning)', fontWeight: '700' }}>+28% IMPACT</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Radio size={12} color="#8B7FA8" /> Sector E Telemetry Loss
                </span>
                <span className="font-mono" style={{ color: 'var(--color-sand)', fontWeight: '700' }}>+19% IMPACT</span>
              </li>
            </ul>
          </div>

          {/* Weather Context */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            padding: '16px',
            borderRadius: '5px',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="aegis-data-label">LIVE ATMOSPHERIC CONTEXT</span>
              <span className="aegis-badge badge-normal" style={{ fontSize: '9px' }}>
                OPEN-METEO SYNCED
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ background: 'var(--bg-surface)', padding: '6px 8px', borderRadius: '4px' }}>
                <div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>PRECIPITATION</div>
                <div className="font-mono tabular-nums" style={{ fontSize: '13px', fontWeight: '700', color: '#38BDF8' }}>
                  {weatherData?.current?.rainfall ?? 18.2} mm/h
                </div>
              </div>
              <div style={{ background: 'var(--bg-surface)', padding: '6px 8px', borderRadius: '4px' }}>
                <div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>WIND VELOCITY</div>
                <div className="font-mono tabular-nums" style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {weatherData?.current?.windSpeed ?? 28} km/h
                </div>
              </div>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CloudRain size={12} color="var(--color-accent-light)" />
              <span>Heavy monsoon convective bands active across watershed.</span>
            </div>
          </div>

          {/* Information Gaps Breakdown */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            padding: '16px',
            borderRadius: '5px',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="aegis-data-label">INFORMATION GAPS &amp; BLACKOUTS</span>
              <span className="aegis-badge badge-warning" style={{ fontSize: '9px' }}>
                ATTENTION REQUIRED
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
              <strong>Sector E:</strong> Comms relay tower 04 offline. Sensor data unavailable. Rapid reconnaissance drone dispatch recommended.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
              <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                GAP SEVERITY: HIGH
              </span>
              <button
                onClick={() => onNavigateStage && onNavigateStage('unknown')}
                className="aegis-btn aegis-btn-secondary"
                style={{ padding: '3px 8px', fontSize: '10px' }}
              >
                <span>PROBE BLACKOUT</span>
                <ChevronRight size={11} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          6. RECOMMENDED ACTIONS (Backend Decision Support)
      ────────────────────────────────────────────────────────────────── */}
      <section 
        className="aegis-card"
        style={{ padding: '20px 22px' }}
        aria-label="Recommended Operational Actions"
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '10px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Compass size={18} color="var(--color-sand)" />
            <h2 className="font-hud" style={{
              fontSize: '16px',
              fontWeight: '800',
              letterSpacing: '0.1em',
              color: 'var(--text-primary)',
              margin: 0
            }}>
              RECOMMENDED ACTIONS
            </h2>
            <span className="aegis-badge badge-sand">
              STRATEGIC CO-PILOT
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="aegis-badge badge-warning">
              HUMAN APPROVAL REQUIRED FOR EXECUTION
            </span>
            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              NO AUTOMATED DISPATCH
            </span>
          </div>
        </div>

        {/* Recommendations Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
          {/* Action 1: Hospital Access Route Clearence */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '10px',
            borderLeft: '3px solid var(--color-critical)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                <span className="font-mono" style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  STAGE MEDICAL (3) + ENGINEERING (2)
                </span>
                <span className="aegis-badge badge-critical" style={{ fontSize: '9px' }}>
                  PRIORITY 1
                </span>
              </div>
              <div className="font-mono" style={{ fontSize: '10px', color: 'var(--color-sand-light)', marginBottom: '6px' }}>
                TARGET: {recommendationsData?.primaryRecommendation?.targetZoneName || (activeMission && activeMission.missionId !== '027' ? `ZONE ${zonesList.find(z => z.status === 'CRITICAL')?.id || 'D'} (${zonesList.find(z => z.status === 'CRITICAL')?.name || 'CRITICAL SECTOR'})` : 'ZONE D (SOUTH GENERAL TRAUMA CENTER)')}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                {recommendationsData?.primaryRecommendation?.rationale || (activeMission && activeMission.missionId !== '027' ? `Prioritizing immediate tactical response to secure critical infrastructure and prevent cascading sector collapse.` : 'Clearing arterial Road 17 eliminates the single bottleneck cutting off 2,900 civilians and relieves 94% hospital overload before triage collapse.')}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
              <span className="font-mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                APPROVAL: PENDING OPERATOR SIGN-OFF
              </span>
              <button
                onClick={() => {
                  setTargetZone('D');
                  setSecondaryTab('FLEET');
                }}
                className="aegis-btn aegis-btn-secondary"
                style={{ fontSize: '10px', padding: '3px 8px' }}
              >
                <span>STAGE FLEET FOR D</span>
              </button>
            </div>
          </div>

          {/* Action 2: Penetrate Blackout Sector E */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '10px',
            borderLeft: '3px solid var(--color-sand)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                <span className="font-mono" style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  DISPATCH AMPHIBIOUS RECON + DRONE WING
                </span>
                <span className="aegis-badge badge-sand" style={{ fontSize: '9px' }}>
                  PRIORITY 2
                </span>
              </div>
              <div className="font-mono" style={{ fontSize: '10px', color: 'var(--color-sand-light)', marginBottom: '6px' }}>
                TARGET: ZONE E (INFORMATION GAP)
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                Proactively penetrates 88% blackout where 140+ vehicle beacons are stalled without 911 calls. Prevents silent catastrophic drowning.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
              <span className="font-mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                APPROVAL: PENDING OPERATOR SIGN-OFF
              </span>
              <button
                onClick={() => {
                  setTargetZone('E');
                  setSecondaryTab('FLEET');
                }}
                className="aegis-btn aegis-btn-secondary"
                style={{ fontSize: '10px', padding: '3px 8px' }}
              >
                <span>STAGE FLEET FOR E</span>
              </button>
            </div>
          </div>

          {/* Action 3: River Basin Corridor Berm Reinforcement */}
          <div style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '10px',
            borderLeft: '3px solid var(--color-warning)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                <span className="font-mono" style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  FORTIFY BRIDGE 17 BERM (CONVOY + LOGISTICS)
                </span>
                <span className="aegis-badge badge-warning" style={{ fontSize: '9px' }}>
                  PRIORITY 3
                </span>
              </div>
              <div className="font-mono" style={{ fontSize: '10px', color: 'var(--color-sand-light)', marginBottom: '6px' }}>
                TARGET: ZONE C (RIVER BASIN)
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                Fortifies Bridge 17 berm to prevent cascading water overflow from flooding Zone B commercial grid and cutting off alternative transit.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
              <span className="font-mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                APPROVAL: PENDING OPERATOR SIGN-OFF
              </span>
              <button
                onClick={() => {
                  setTargetZone('C');
                  setSecondaryTab('FLEET');
                }}
                className="aegis-btn aegis-btn-secondary"
                style={{ fontSize: '10px', padding: '3px 8px' }}
              >
                <span>STAGE FLEET FOR C</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          7. TACTICAL STAGING & DISPATCH MATRIX (Interactive Fleet Deck)
      ────────────────────────────────────────────────────────────────── */}
      <section 
        className="aegis-card"
        style={{ padding: '20px 22px' }}
        aria-label="Tactical Fleet Staging"
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '10px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Truck size={18} color="var(--color-accent-light)" />
            <h2 className="font-hud" style={{
              fontSize: '16px',
              fontWeight: '800',
              letterSpacing: '0.1em',
              color: 'var(--text-primary)',
              margin: 0
            }}>
              TACTICAL FLEET DISPATCH &amp; STAGING MATRIX
            </h2>
            <span className="aegis-badge badge-normal">
              READY FOR DEPLOYMENT (14/14 UNITS)
            </span>
          </div>

          {/* Target Zone Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              TARGET ASSIGNMENT SECTOR:
            </span>
            <select
              value={targetZone}
              onChange={(e) => setTargetZone(e.target.value)}
              className="aegis-select"
              title="Select sector to assign staging units"
            >
              <option value="D">ZONE D (CRITICAL - HOSPITAL)</option>
              <option value="E">ZONE E (BLACKOUT - RECON)</option>
              <option value="C">ZONE C (RIVER CORRIDOR)</option>
              <option value="B">ZONE B (COMMERCIAL HUB)</option>
              <option value="A">ZONE A (BASE STAGING)</option>
            </select>
          </div>
        </div>

        {/* 6 Interactive Resource Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}>
          {resources.map((res, idx) => {
            const Icon = res.icon;
            const isSelected = selectedUnit === idx;

            return (
              <div
                key={idx}
                onClick={() => handleUnitSelect(idx, res)}
                style={{
                  background: isSelected ? 'var(--bg-surface-hover)' : 'var(--bg-surface-elevated)',
                  border: isSelected ? `1px solid ${res.color}` : '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: isSelected ? `0 4px 16px rgba(0,0,0,0.5), 0 0 10px ${res.color}22` : 'none',
                  transition: 'all 0.16s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '4px',
                      background: 'rgba(255,255,255,0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: res.color
                    }}>
                      <Icon size={15} />
                    </div>
                    <span className="font-hud" style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {res.callsign}
                    </span>
                  </div>

                  <span className="font-mono tabular-nums" style={{ fontSize: '13px', fontWeight: '800', color: res.color }}>
                    ×{res.count} UNITS
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '4px',
                  background: 'var(--bg-surface)',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-subtle)',
                  textAlign: 'center'
                }}>
                  <div>
                    <div className="font-mono" style={{ fontSize: '8px', color: 'var(--text-secondary)' }}>STATUS</div>
                    <div className="font-mono" style={{ fontSize: '10px', fontWeight: '700', color: res.color }}>
                      {res.status}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono" style={{ fontSize: '8px', color: 'var(--text-secondary)' }}>RANGE</div>
                    <div className="font-mono" style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-primary)' }}>
                      {res.range}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono" style={{ fontSize: '8px', color: 'var(--text-secondary)' }}>ETA</div>
                    <div className="font-mono" style={{ fontSize: '10px', fontWeight: '700', color: 'var(--color-sand)' }}>
                      {res.eta}
                    </div>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.35, minHeight: '30px' }}>
                  {res.desc}
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '6px',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)'
                }}>
                  <span style={{ color: isSelected ? res.color : 'var(--text-muted)' }}>
                    {isSelected ? `● STAGED TO ZONE ${targetZone}` : 'CLICK TO STAGE'}
                  </span>
                  <span style={{ fontWeight: '700', color: res.color }}>
                    STAGE →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Primary Command CTA: Navigates to Strategy screen */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <AegisPrimaryCommand
            label="CREATE RESPONSE PLAN"
            subtitle="ACTIVATE DUAL RESPONSE STRATEGY COMPARISON (HUMAN VS AEGIS CO-PILOT)"
            status="FLEET READY (14 UNITS) · ALL SYSTEMS GO"
            icon="◈"
            onClick={onCreatePlan}
            variant="sage"
            width="100%"
          />
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          8. EXPANDABLE TELEMETRY DRAWER (Weather & Field Reports)
      ────────────────────────────────────────────────────────────────── */}
      <section 
        className="aegis-card"
        style={{ padding: '16px 20px' }}
        aria-label="Secondary Telemetries & Observations"
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '10px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={16} color="var(--color-sand)" />
            <span className="font-hud" style={{ fontSize: '14px', fontWeight: '800', letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
              SECONDARY TELEMETRIES &amp; OBSERVATION FEEDS
            </span>
          </div>

          <div className="aegis-filter-group">
            <button
              onClick={() => setSecondaryTab(secondaryTab === 'WEATHER' ? 'NONE' : 'WEATHER')}
              className={`aegis-filter-pill ${secondaryTab === 'WEATHER' ? 'active' : ''}`}
            >
              <CloudRain size={11} style={{ display: 'inline', marginRight: '4px' }} />
              LIVE WEATHER WIDGET
            </button>
            <button
              onClick={() => setSecondaryTab(secondaryTab === 'REPORTS' ? 'NONE' : 'REPORTS')}
              className={`aegis-filter-pill ${secondaryTab === 'REPORTS' ? 'active' : ''}`}
            >
              <FileText size={11} style={{ display: 'inline', marginRight: '4px' }} />
              FIELD OBSERVATIONS ({pendingReportsCount})
            </button>
          </div>
        </div>

        {/* Render Tab Contents */}
        {secondaryTab === 'WEATHER' && (
          <div style={{ marginTop: '16px' }}>
            <AegisWeatherWidget
              missionId={missionId}
              locationName={activeMission?.locationName || 'CHANDIGARH'}
            />
          </div>
        )}

        {secondaryTab === 'REPORTS' && (
          <div style={{ marginTop: '16px' }}>
            <AegisFieldReports
              missionId={missionId}
              activeMission={activeMission}
              currentUser={currentUser}
            />
          </div>
        )}
      </section>

    </div>
  );
}
