import React, { useState, useEffect, useRef } from 'react';
import { 
  GitFork, 
  ArrowDown, 
  Clock, 
  ChevronRight, 
  AlertTriangle, 
  Activity, 
  TrendingDown, 
  ShieldAlert,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Layers,
  MapPin
} from 'lucide-react';

import { AegisTimeControl, AegisPrimaryCommand } from './aegis-controls';
import { Aegis3DCard, AegisAnimatedNumber } from './aegis-interactive';
import { runSimulation } from '../services/api';
import { getHazardConfig } from '../services/hazardConfig';

export default function DisasterSimulationScreen({
  onProceedToChess,
  activeMission = null
}) {
  const [timeOffset, setTimeOffset] = useState(0);
  const [simData, setSimData] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedZone, setSelectedZone] = useState('D');
  const timerRef = useRef(null);

  const missionId = activeMission?.missionId || '027';
  const hazard = getHazardConfig(activeMission?.disasterType);

  // Auto-play timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimeOffset(prev => {
          if (prev >= 60) {
            setIsPlaying(false);
            return 60;
          }
          return prev + 15;
        });
      }, 3000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    let isMounted = true;
    setIsSimulating(true);
    runSimulation({
      missionId,
      timeOffset,
      actions: []
    })
      .then(res => {
        if (isMounted && res) {
          setSimData(res);
        }
      })
      .catch(err => {
        console.warn('[AEGIS-API] Forward simulation fallback:', err.message);
      })
      .finally(() => {
        if (isMounted) {
          setTimeout(() => setIsSimulating(false), 300);
        }
      });

    return () => { isMounted = false; };
  }, [missionId, timeOffset]);

  // Dynamic values that evolve with timeOffset matching exact specs with backend sync
  const fallbackRoad17 = timeOffset === 0 ? 22 : timeOffset === 15 ? 12 : timeOffset === 30 ? 4 : 0;
  const fallbackHospital = timeOffset === 0 ? 72 : timeOffset === 15 ? 81 : timeOffset === 30 ? 91 : 98;
  const fallbackZoneDRisk = timeOffset === 0 ? 89 : timeOffset === 15 ? 92 : timeOffset === 30 ? 96 : 99;
  const fallbackZoneEStatus = timeOffset === 0 ? "UNKNOWN" : timeOffset === 15 ? "WARNING" : "CRITICAL";
  const fallbackCityHealth = timeOffset === 0 ? 70 : timeOffset === 15 ? 67 : timeOffset === 30 ? 61 : 54;

  const zoneD = simData?.zones?.find(z => (z.zoneId || z.id) === 'D');
  const zoneE = simData?.zones?.find(z => (z.zoneId || z.id) === 'E');

  const road17Val = zoneD?.roadAccess !== undefined ? zoneD.roadAccess : fallbackRoad17;
  const hospitalLoad = simData?.hospitalStatus?.includes('94%') ? 94 : (timeOffset >= 30 ? 91 : fallbackHospital);
  const zoneDRisk = zoneD?.risk !== undefined ? zoneD.risk : fallbackZoneDRisk;
  const zoneEStatus = zoneE?.status !== undefined ? (zoneE.status === 'CRITICAL' ? 'CRITICAL' : zoneE.status === 'HIGH_RISK' ? 'WARNING' : zoneE.status) : fallbackZoneEStatus;
  const cityHealth = simData?.zones?.length
    ? Math.round(simData.zones.reduce((sum, z) => sum + (z.health || (100 - z.risk)), 0) / simData.zones.length)
    : fallbackCityHealth;

  // Sector tactical map representations
  const sectorZones = [
    { id: 'A', name: 'Zone A - Command Depot', baseRisk: 12, riskOffset: timeOffset * 0.2, status: 'SECURE', floodLevel: '0.1m', color: '#10b981', x: 20, y: 30, w: 120, h: 90 },
    { id: 'B', name: 'Zone B - North Watershed', baseRisk: 68, riskOffset: timeOffset * 0.4, status: 'HIGH_RISK', floodLevel: `${(1.2 + timeOffset * 0.04).toFixed(1)}m`, color: '#f59e0b', x: 160, y: 20, w: 130, h: 80 },
    { id: 'C', name: 'Zone C - West Res. Sector', baseRisk: 42, riskOffset: timeOffset * 0.3, status: 'MODERATE', floodLevel: `${(0.4 + timeOffset * 0.02).toFixed(1)}m`, color: '#f59e0b', x: 20, y: 140, w: 120, h: 100 },
    { id: 'D', name: 'Zone D - South Trauma Corridor', baseRisk: 89, riskOffset: (zoneDRisk - 89), status: 'CRITICAL', floodLevel: `${(2.1 + timeOffset * 0.05).toFixed(1)}m`, color: '#ef4444', x: 160, y: 120, w: 130, h: 120 },
    { id: 'E', name: 'Zone E - East Substation Grid', baseRisk: 75, riskOffset: timeOffset * 0.5, status: zoneEStatus, floodLevel: `${(1.8 + timeOffset * 0.06).toFixed(1)}m`, color: '#a855f7', x: 310, y: 60, w: 120, h: 160 }
  ];

  return (
    <div style={{
      minHeight: '88vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 32px',
      maxWidth: '1440px',
      margin: '0 auto',
      width: '100%',
      gap: '24px'
    }}>
      {/* Header & Simulation Mode Bar */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(10, 20, 36, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: '1px solid rgba(0, 240, 255, 0.25)',
        borderRadius: '8px',
        padding: '20px 28px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(0, 240, 255, 0.15)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{
              fontSize: '11px',
              fontFamily: 'monospace',
              letterSpacing: '0.12em',
              padding: '2px 8px',
              borderRadius: '3px',
              background: `${hazard.badgeColor}22`,
              color: hazard.badgeColor,
              border: `1px solid ${hazard.badgeColor}44`,
              fontWeight: 700
            }}>
              SIMULATION ENGINE // {hazard.badge} FORWARD CASCADE
            </span>
            {isSimulating && (
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#00F0FF', animation: 'pulse 1.5s infinite ease-in-out' }}>
                ● SYNCING TELEMETRY MATRIX...
              </span>
            )}
          </div>
          <h2 className="font-hud" style={{ fontSize: '26px', fontWeight: '800', color: '#F1F5F9', margin: 0, letterSpacing: '0.04em' }}>
            {hazard.simulationTitle}
          </h2>
        </div>

        {/* Start / Stop & Offset Step Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: isPlaying ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 240, 255, 0.15)',
              border: `1px solid ${isPlaying ? '#ef4444' : '#00F0FF'}`,
              color: isPlaying ? '#ef4444' : '#00F0FF',
              borderRadius: '6px',
              padding: '8px 16px',
              fontFamily: 'monospace',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            {isPlaying ? 'PAUSE PROJECTION' : 'START SIMULATION'}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setTimeOffset(0);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#94a3b8',
              borderRadius: '6px',
              padding: '8px 12px',
              fontFamily: 'monospace',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={13} />
            RESET (T+0)
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            borderRadius: '6px',
            padding: '6px 14px'
          }}>
            <Clock size={16} color="#00F0FF" />
            <span className="font-mono" style={{ fontSize: '18px', fontWeight: '800', color: '#00F0FF' }}>
              T +00:{String(timeOffset).padStart(2, '0')}:00
            </span>
          </div>
        </div>
      </div>

      {/* Time Offset Step Presets */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(10, 20, 36, 0.8)',
        border: '1px solid rgba(0, 240, 255, 0.15)',
        borderRadius: '6px',
        padding: '12px 24px'
      }}>
        <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#94a3b8', letterSpacing: '0.08em' }}>
          TEMPORAL PROJECTION HORIZON:
        </span>
        <div style={{ display: 'flex', gap: '10px' }}>
          {[0, 15, 30, 45, 60].map(mins => {
            const isCurrent = timeOffset === mins;
            return (
              <button
                key={mins}
                onClick={() => setTimeOffset(mins)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '4px',
                  background: isCurrent ? '#00F0FF' : 'rgba(15, 23, 42, 0.6)',
                  color: isCurrent ? '#0a0f1d' : '#cbd5e1',
                  border: `1px solid ${isCurrent ? '#00F0FF' : 'rgba(255, 255, 255, 0.1)'}`,
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  fontWeight: isCurrent ? '800' : '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                +{mins} MIN
              </button>
            );
          })}
        </div>
      </div>

      {/* World State Shifts Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
        <div style={{
          background: 'rgba(10, 20, 36, 0.8)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '6px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8', letterSpacing: '0.08em' }}>ROAD 17 ACCESS</span>
          <div className="font-mono" style={{ fontSize: '24px', fontWeight: '800', color: timeOffset >= 30 ? '#ef4444' : '#f59e0b', margin: '4px 0' }}>
            <AegisAnimatedNumber value={road17Val} suffix="%" />
          </div>
          <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>22% → {road17Val}%</span>
        </div>

        <div style={{
          background: 'rgba(10, 20, 36, 0.8)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '6px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8', letterSpacing: '0.08em' }}>HOSPITAL ICU LOAD</span>
          <div className="font-mono" style={{ fontSize: '24px', fontWeight: '800', color: hospitalLoad >= 90 ? '#ef4444' : '#f59e0b', margin: '4px 0' }}>
            <AegisAnimatedNumber value={hospitalLoad} suffix="%" />
          </div>
          <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>72% → {hospitalLoad}%</span>
        </div>

        <div style={{
          background: 'rgba(10, 20, 36, 0.8)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '6px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#fca5a5', letterSpacing: '0.08em' }}>ZONE D RISK</span>
          <div className="font-mono" style={{ fontSize: '24px', fontWeight: '800', color: '#ef4444', margin: '4px 0' }}>
            <AegisAnimatedNumber value={zoneDRisk} /> / 100
          </div>
          <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>89 → {zoneDRisk}</span>
        </div>

        <div style={{
          background: 'rgba(10, 20, 36, 0.8)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          borderRadius: '6px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#c084fc', letterSpacing: '0.08em' }}>ZONE E STATUS</span>
          <div className="font-mono" style={{ fontSize: '16px', fontWeight: '800', color: zoneEStatus === 'CRITICAL' ? '#ef4444' : '#c084fc', margin: '8px 0 4px 0' }}>
            {zoneEStatus}
          </div>
          <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>UNKNOWN → {zoneEStatus}</span>
        </div>

        <div style={{
          background: 'rgba(10, 20, 36, 0.8)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '6px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#10b981', letterSpacing: '0.08em' }}>CITY HEALTH</span>
          <div className="font-mono" style={{ fontSize: '24px', fontWeight: '800', color: cityHealth < 65 ? '#ef4444' : '#10b981', margin: '4px 0' }}>
            <AegisAnimatedNumber value={cityHealth} suffix="%" />
          </div>
          <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>70% → {cityHealth}%</span>
        </div>
      </div>

      {/* Grid: Left Map-Based Sector Representation & Right Causality / Risk Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        
        {/* Map-Based Representation of Affected Zones */}
        <div style={{
          background: 'rgba(10, 20, 36, 0.85)',
          border: '1px solid rgba(0, 240, 255, 0.2)',
          borderRadius: '8px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} color="#00F0FF" />
              <h3 className="font-hud" style={{ fontSize: '15px', fontWeight: '700', color: '#F1F5F9', margin: 0, letterSpacing: '0.06em' }}>
                TACTICAL SECTOR FLOOD & INUNDATION MAP
              </h3>
            </div>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8' }}>
              INTERACTIVE SECTORS (A–E)
            </span>
          </div>

          {/* SVG Sector Visualization Map */}
          <div style={{
            background: 'rgba(5, 10, 20, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            position: 'relative',
            height: '280px',
            overflow: 'hidden'
          }}>
            <svg width="100%" height="100%" viewBox="0 0 460 260" style={{ display: 'block' }}>
              {/* Grid overlay */}
              <defs>
                <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0, 240, 255, 0.04)" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#gridPattern)" />

              {/* Waterway / River Vector */}
              <path
                d="M 140 0 C 150 70, 220 110, 260 260"
                fill="none"
                stroke="rgba(0, 240, 255, 0.35)"
                strokeWidth={14 + timeOffset * 0.25}
                strokeDasharray="4 2"
              />

              {/* Zones */}
              {sectorZones.map(z => {
                const isSel = selectedZone === z.id;
                const calculatedRisk = Math.min(99, Math.round(z.baseRisk + z.riskOffset));
                return (
                  <g
                    key={z.id}
                    onClick={() => setSelectedZone(z.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect
                      x={z.x}
                      y={z.y}
                      width={z.w}
                      height={z.h}
                      rx="4"
                      fill={isSel ? 'rgba(0, 240, 255, 0.12)' : 'rgba(15, 23, 42, 0.75)'}
                      stroke={isSel ? '#00F0FF' : z.color}
                      strokeWidth={isSel ? 2 : 1}
                      strokeDasharray={z.id === 'E' && timeOffset === 0 ? '4 3' : 'none'}
                    />
                    <text
                      x={z.x + 10}
                      y={z.y + 20}
                      fill={isSel ? '#00F0FF' : '#F1F5F9'}
                      fontSize="12"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      SECTOR {z.id}
                    </text>
                    <text
                      x={z.x + 10}
                      y={z.y + 36}
                      fill="#94a3b8"
                      fontSize="9"
                      fontFamily="sans-serif"
                    >
                      Risk: {calculatedRisk}% | {z.floodLevel}
                    </text>
                    <circle
                      cx={z.x + z.w - 12}
                      cy={z.y + 16}
                      r="5"
                      fill={z.color}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Selected Zone Quick Spec */}
          {selectedZone && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              borderRadius: '6px',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#00F0FF' }}>
                  INSPECTING SECTOR {selectedZone}:
                </span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#F1F5F9', display: 'block' }}>
                  {sectorZones.find(z => z.id === selectedZone)?.name}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>INUNDATION DEPTH</span>
                <span style={{ fontSize: '14px', fontFamily: 'monospace', fontWeight: '800', color: '#f59e0b', display: 'block' }}>
                  {sectorZones.find(z => z.id === selectedZone)?.floodLevel}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Butterfly Causality Chain & Risk Comparison */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Causality Chain */}
          <div style={{
            background: 'rgba(10, 20, 36, 0.85)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '8px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <GitFork size={15} color="#f59e0b" />
              <span className="font-hud" style={{ fontSize: '13px', fontWeight: '700', color: '#F1F5F9', letterSpacing: '0.08em' }}>
                THE BUTTERFLY EFFECT — CAUSALITY CHAIN
              </span>
            </div>

            <div style={{ fontSize: '11px', fontWeight: '700', color: '#F1F5F9', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '6px 20px', borderRadius: '4px', width: '280px', textAlign: 'center' }}>
              ROAD 17 BREACH & CULVERT LOSS
            </div>
            <ArrowDown size={14} color="#f59e0b" />

            <div style={{ fontSize: '11px', fontWeight: '700', color: '#F1F5F9', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '6px 20px', borderRadius: '4px', width: '280px', textAlign: 'center' }}>
              ALS AMBULANCE DETOUR DELAY (+14 MIN)
            </div>
            <ArrowDown size={14} color="#f59e0b" />

            <div style={{ fontSize: '11px', fontWeight: '700', color: '#F1F5F9', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.4)', padding: '6px 20px', borderRadius: '4px', width: '280px', textAlign: 'center' }}>
              TRAUMA CENTER SATURATION (&gt;90%)
            </div>
            <ArrowDown size={14} color="#f59e0b" />

            <div style={{ fontSize: '11px', fontWeight: '700', color: '#ef4444', background: 'rgba(239, 68, 68, 0.3)', border: '1px solid #ef4444', padding: '6px 20px', borderRadius: '4px', width: '280px', textAlign: 'center' }}>
              CASCADE MORTALITY THREAT (HEALTH: {cityHealth}%)
            </div>
          </div>

          {/* Risk Comparison Table */}
          <div style={{
            background: 'rgba(10, 20, 36, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '18px 20px'
          }}>
            <h4 className="font-hud" style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', margin: '0 0 12px 0', letterSpacing: '0.08em' }}>
              SECTOR RISK PROJECTION COMPARISON
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sectorZones.map(z => {
                const currentRisk = Math.min(99, Math.round(z.baseRisk + z.riskOffset));
                const delta = currentRisk - z.baseRisk;
                return (
                  <div key={z.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ color: '#cbd5e1' }}>Sector {z.id}</span>
                    <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>Baseline: {z.baseRisk}%</span>
                    <span style={{ fontFamily: 'monospace', color: delta > 0 ? '#ef4444' : '#10b981', fontWeight: '700' }}>
                      {currentRisk}% ({delta >= 0 ? `+${delta}%` : `${delta}%`})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Proceed to Chess Command Button */}
          <button
            onClick={onProceedToChess}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #00F0FF 0%, #00a2ff 100%)',
              color: '#0a0f1d',
              border: 'none',
              borderRadius: '6px',
              padding: '14px',
              fontFamily: 'monospace',
              fontSize: '13px',
              fontWeight: '800',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            PROCEED TO DISASTER CHESS
            <ChevronRight size={16} />
          </button>

        </div>

      </div>
    </div>
  );
}
