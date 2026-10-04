import React, { useState } from 'react';
import DigitalTwinMap from './DigitalTwinMap';
import { 
  ShieldAlert, 
  HelpCircle, 
  ChevronRight, 
  Activity, 
  Users, 
  Wrench, 
  Radio, 
  FileText, 
  Sparkles,
  X,
  Compass,
  Crosshair,
  ArrowRight
} from 'lucide-react';
import { 
  AegisPrimaryCommand, 
  AegisCommandModule, 
  AegisSectorControl, 
  AegisZoneHoverCard 
} from './aegis-controls';
import { AegisAnimatedNumber, Aegis3DCard } from './aegis-interactive';
import { getZone, getZoneExplanation } from '../services/api';

export default function DigitalTwinScreen({
  zones = [],
  onExplainRisk,
  onInvestigateUnknown
}) {
  const [activeZoneId, setActiveZoneId] = useState('D');
  const [panelOpen, setPanelOpen] = useState(true);
  const [hoveredZoneId, setHoveredZoneId] = useState(null);

  // Full rich data for all 5 zones in the new palette
  const zoneDefaults = {
    A: { id: "A", name: "NORTH UPLANDS", risk: 18, health: 82, status: "STABLE", population: 4100, roads: 88, infrastructure: 92, reports: 2, connectivity: 98, hospitalAccess: "NORMAL (STAGING ACTIVE)", color: "#6f947d", bg: "rgba(111, 148, 125, 0.14)" },
    B: { id: "B", name: "COMMERCIAL HUB", risk: 48, health: 52, status: "WARNING", population: 8400, roads: 64, infrastructure: 74, reports: 6, connectivity: 89, hospitalAccess: "RESTRICTED (CONGESTION)", color: "#c99a45", bg: "rgba(201, 154, 69, 0.14)" },
    C: { id: "C", name: "RIVER BASIN", risk: 74, health: 26, status: "ELEVATED", population: 3600, roads: 38, infrastructure: 45, reports: 11, connectivity: 68, hospitalAccess: "PARTIALLY SEVERED", color: "#d97706", bg: "rgba(217, 119, 6, 0.14)" },
    D: { id: "D", name: "SOUTH SECTOR", risk: 96, health: 4, status: "CRITICAL", population: 2900, roads: 22, infrastructure: 39, reports: 14, connectivity: 42, hospitalAccess: "CRITICAL (AMBULANCES BLOCKED)", color: "#d9534f", bg: "rgba(217, 83, 79, 0.18)" },
    E: { id: "E", name: "EAST DELTA", risk: 78, health: 22, status: "UNKNOWN", population: 1850, roads: 25, infrastructure: 30, reports: 0, connectivity: 12, hospitalAccess: "UNKNOWN (COMMS BLACKOUT)", color: "#8b72a8", bg: "rgba(139, 114, 168, 0.16)" }
  };

  const sectorList = [
    { id: "A", name: "NORTH", risk: "18%", status: "STABLE", color: "#6f947d", bg: "rgba(111, 148, 125, 0.14)" },
    { id: "B", name: "COMM", risk: "48%", status: "WARNING", color: "#c99a45", bg: "rgba(201, 154, 69, 0.14)" },
    { id: "C", name: "RIVER", risk: "74%", status: "ELEVATED", color: "#d97706", bg: "rgba(217, 119, 6, 0.14)" },
    { id: "D", name: "SOUTH", risk: "96%", status: "CRITICAL", color: "#d9534f", bg: "rgba(217, 83, 79, 0.18)" },
    { id: "E", name: "DELTA", risk: "?", status: "UNKNOWN", color: "#8b72a8", bg: "rgba(139, 114, 168, 0.16)" }
  ];

  const [zoneOverrides, setZoneOverrides] = useState({});
  const [isSyncingZone, setIsSyncingZone] = useState(false);

  const baseZone = zoneDefaults[activeZoneId] || zoneDefaults.D;
  const zoneData = { ...baseZone, ...(zoneOverrides[activeZoneId] || {}) };
  const isZoneE = activeZoneId === 'E';

  const handleSelectZone = async (zid) => {
    setActiveZoneId(zid);
    setPanelOpen(true);
    setIsSyncingZone(true);
    try {
      const fetched = await getZone(zid);
      if (fetched) {
        setZoneOverrides(prev => ({
          ...prev,
          [zid]: {
            ...prev[zid],
            risk: fetched.risk !== undefined ? fetched.risk : prev[zid]?.risk,
            health: fetched.health !== undefined ? fetched.health : (fetched.risk !== undefined ? Math.max(1, 100 - fetched.risk) : prev[zid]?.health),
            roads: fetched.roadAccess !== undefined ? fetched.roadAccess : prev[zid]?.roads,
            infrastructure: fetched.infrastructure !== undefined ? fetched.infrastructure : prev[zid]?.infrastructure,
            reports: fetched.reportsCount !== undefined ? fetched.reportsCount : prev[zid]?.reports,
            connectivity: fetched.connectivity !== undefined ? fetched.connectivity : prev[zid]?.connectivity,
            status: fetched.status || prev[zid]?.status,
            population: fetched.population || prev[zid]?.population,
            hospitalAccess: fetched.hospitalAccess ? `${fetched.hospitalAccess}% INTAKE` : prev[zid]?.hospitalAccess
          }
        }));
      }
    } catch (err) {
      console.warn(`[AEGIS-API] Sector ${zid} telemetry fallback:`, err.message);
    } finally {
      setTimeout(() => setIsSyncingZone(false), 350);
    }
  };

  const handleExplain = async () => {
    try {
      setIsSyncingZone(true);
      const explanation = await getZoneExplanation(activeZoneId).catch(() => null);
      if (onExplainRisk) {
        onExplainRisk(explanation, activeZoneId);
      }
    } finally {
      setTimeout(() => setIsSyncingZone(false), 300);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 85px)',
      position: 'relative',
      overflow: 'hidden',
      padding: '12px'
    }}>
      
      {/* Top Header Control Rail */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="font-hud" style={{ fontSize: '13px', letterSpacing: '0.14em', color: '#d6c6a5', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', background: '#6f947d', borderRadius: '50%' }}></span>
            STAGE 4 // DIGITAL TWIN TOPOLOGY &amp; ZONE RISK MATRIX
          </span>
          <span className="font-mono" style={{ fontSize: '11px', color: '#9fb5a4' }}>
            SELECT TACTICAL SECTORS (A–E) TO PROBE TELEMETRY
          </span>
          {isSyncingZone && (
            <span className="font-mono" style={{ fontSize: '10px', color: '#38bdf8', letterSpacing: '0.1em', animation: 'pulse 1.5s infinite ease-in-out' }}>
              ● ZONE DATA SYNCING...
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AegisPrimaryCommand
            label="PROCEED TO UNKNOWN ZONE E"
            subtitle="INITIATE SILENCE PROTOCOL"
            status="RECON PENDING"
            icon="◈"
            onClick={onInvestigateUnknown}
            variant="purple"
            style={{ padding: '8px 16px', minWidth: '240px' }}
          />
        </div>
      </div>

      {/* Hero Map Canvas */}
      <div style={{ flex: 1, position: 'relative', width: '100%', borderRadius: '4px', overflow: 'hidden' }}>
        <DigitalTwinMap
          zones={zones}
          selectedZoneId={activeZoneId}
          hoveredZoneId={hoveredZoneId}
          onSelectZone={handleSelectZone}
          timeOffset={0}
        />

        {/* Floating Technical Readout on Hover */}
        {hoveredZoneId && zoneDefaults[hoveredZoneId] && (
          <AegisZoneHoverCard
            zone={zoneDefaults[hoveredZoneId]}
            position={{ x: 300, y: 180 }}
          />
        )}

        {/* Bottom Tactical Sector Selector Console */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          zIndex: 25
        }}>
          <AegisSectorControl
            sectors={sectorList}
            selectedId={activeZoneId}
            onSelectSector={handleSelectZone}
            onHoverSector={(id) => setHoveredZoneId(id)}
          />
        </div>

        {/* Focused Zone Investigation Panel (Glassmorphic Drawer) */}
        {panelOpen && (
          <div
            className="aegis-glass"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '420px',
              maxHeight: 'calc(100% - 32px)',
              background: 'rgba(14, 27, 21, 0.88)',
              backdropFilter: 'blur(20px)',
              border: isZoneE 
                ? '1px solid rgba(139, 114, 168, 0.55)' 
                : activeZoneId === 'D' 
                  ? '1px solid rgba(217, 83, 79, 0.55)' 
                  : '1px solid rgba(214, 198, 165, 0.25)',
              borderRadius: '6px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              zIndex: 30,
              boxShadow: '0 12px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(214, 198, 165, 0.15)',
              overflowY: 'auto'
            }}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(214, 198, 165, 0.12)', paddingBottom: '10px' }}>
              <div>
                <span className="font-hud" style={{ fontSize: '11px', letterSpacing: '0.12em', color: isZoneE ? '#8b72a8' : '#d6c6a5' }}>
                  ZONE TELEMETRY DOSSIER
                </span>
                <h3 className="font-hud" style={{ fontSize: '20px', fontWeight: '800', color: '#eae5d8', margin: '2px 0 0 0', letterSpacing: '0.04em' }}>
                  ZONE {zoneData.id} — {zoneData.name}
                </h3>
              </div>
              <button
                onClick={() => setPanelOpen(false)}
                style={{ 
                  background: 'rgba(255,255,255,0.04)', 
                  border: '1px solid rgba(214, 198, 165, 0.15)', 
                  color: '#9fb5a4', 
                  cursor: 'pointer', 
                  padding: '4px',
                  borderRadius: '3px',
                  transition: 'all 0.15s ease'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Risk & Health Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <div style={{ background: 'rgba(25, 58, 42, 0.35)', padding: '12px', borderRadius: '4px', border: '1px solid rgba(214, 198, 165, 0.12)' }}>
                <span style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#9fb5a4', textTransform: 'uppercase' }}>RISK SCORE</span>
                <div className="font-mono" style={{ fontSize: '24px', fontWeight: '800', color: isZoneE ? '#8b72a8' : zoneData.risk >= 80 ? '#d9534f' : zoneData.risk >= 60 ? '#c99a45' : '#6f947d' }}>
                  <AegisAnimatedNumber value={zoneData.risk} /> / 100
                </div>
                <span className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4' }}>
                  STATUS: <strong style={{ color: isZoneE ? '#8b72a8' : zoneData.risk >= 80 ? '#d9534f' : '#6f947d' }}>{zoneData.status}</strong>
                </span>
              </div>

              <div style={{ background: 'rgba(25, 58, 42, 0.35)', padding: '12px', borderRadius: '4px', border: '1px solid rgba(214, 198, 165, 0.12)' }}>
                <span style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#9fb5a4', textTransform: 'uppercase' }}>SECTOR HEALTH</span>
                <div className="font-mono" style={{ fontSize: '24px', fontWeight: '800', color: '#d6c6a5' }}>
                  <AegisAnimatedNumber value={zoneData.health} suffix="%" />
                </div>
                <span className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4' }}>
                  POPULATION: <strong style={{ color: '#eae5d8' }}>{zoneData.population.toLocaleString()}</strong>
                </span>
              </div>
            </div>

            {/* 4 Restored Telemetry Stat Boxes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              <div style={{ background: 'rgba(14, 27, 21, 0.6)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(214, 198, 165, 0.08)' }}>
                <span style={{ fontSize: '10px', letterSpacing: '0.08em', color: '#9fb5a4' }}>ROAD ACCESS</span>
                <div className="font-mono" style={{ fontSize: '16px', fontWeight: '700', color: zoneData.roads < 30 ? '#d9534f' : '#6f947d' }}>
                  <AegisAnimatedNumber value={zoneData.roads} suffix="%" />
                </div>
              </div>

              <div style={{ background: 'rgba(14, 27, 21, 0.6)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(214, 198, 165, 0.08)' }}>
                <span style={{ fontSize: '10px', letterSpacing: '0.08em', color: '#9fb5a4' }}>INFRASTRUCTURE</span>
                <div className="font-mono" style={{ fontSize: '16px', fontWeight: '700', color: zoneData.infrastructure < 40 ? '#c99a45' : '#d6c6a5' }}>
                  <AegisAnimatedNumber value={zoneData.infrastructure} suffix="%" />
                </div>
              </div>

              <div style={{ background: 'rgba(14, 27, 21, 0.6)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(214, 198, 165, 0.08)' }}>
                <span style={{ fontSize: '10px', letterSpacing: '0.08em', color: '#9fb5a4' }}>911 REPORTS</span>
                <div className="font-mono" style={{ fontSize: '16px', fontWeight: '700', color: zoneData.reports === 0 ? '#8b72a8' : '#eae5d8' }}>
                  <AegisAnimatedNumber value={zoneData.reports} /> Incoming
                </div>
              </div>

              <div style={{ background: 'rgba(14, 27, 21, 0.6)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(214, 198, 165, 0.08)' }}>
                <span style={{ fontSize: '10px', letterSpacing: '0.08em', color: '#9fb5a4' }}>CONNECTIVITY</span>
                <div className="font-mono" style={{ fontSize: '16px', fontWeight: '700', color: zoneData.connectivity < 30 ? '#8b72a8' : '#6f947d' }}>
                  <AegisAnimatedNumber value={zoneData.connectivity} suffix="%" />
                </div>
              </div>
            </div>

            {/* Hospital Access Banner */}
            <div style={{ 
              background: zoneData.risk >= 80 ? 'rgba(217, 83, 79, 0.12)' : 'rgba(25, 58, 42, 0.35)', 
              borderLeft: `3px solid ${zoneData.risk >= 80 ? '#d9534f' : '#6f947d'}`, 
              padding: '12px', 
              borderRadius: '3px', 
              fontSize: '11px', 
              color: '#eae5d8' 
            }}>
              <span className="font-hud" style={{ fontSize: '10px', letterSpacing: '0.1em', fontWeight: '700', color: zoneData.risk >= 80 ? '#fca5a5' : '#d6c6a5' }}>
                HOSPITAL INTAKE ACCESS:
              </span>
              <p style={{ margin: '4px 0 0 0', fontWeight: '700', color: zoneData.risk >= 80 ? '#d9534f' : '#eae5d8' }}>
                {zoneData.hospitalAccess}
              </p>
            </div>

            {/* Command Modules in Drawer (EXPLAIN RISK & INVESTIGATE) */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '10px', borderTop: '1px solid rgba(214, 198, 165, 0.12)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <AegisCommandModule
                  tag="XAI"
                  title="EXPLAIN RISK"
                  detail="WEIGHT MODEL"
                  status="READY"
                  icon="◉"
                  onClick={handleExplain}
                  variant="sage"
                />

                <AegisCommandModule
                  tag="RECON"
                  title="INVESTIGATE"
                  detail="ANOMALY PROBE"
                  status={isZoneE ? "GAP DETECTED" : "READY"}
                  icon="⌁"
                  onClick={onInvestigateUnknown}
                  variant="purple"
                />
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
