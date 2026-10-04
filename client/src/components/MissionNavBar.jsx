import React from 'react';
import { 
  ShieldAlert, 
  RotateCcw, 
  ArrowLeft, 
  Activity, 
  AlertTriangle,
  Radio,
  Lock
} from 'lucide-react';

import { AegisMissionRail } from './aegis-controls';
import { AegisAnimatedNumber } from './aegis-interactive';

export default function MissionNavBar({
  currentStage,
  onSelectStage,
  onReset,
  onBack,
  cityHealth = 70,
  activeAlerts = 7,
  hospitalLoad = 72
}) {
  const stages = [
    { id: 'briefing', num: '01', label: 'BRIEF', tooltip: 'Operational briefing & DEFCON directives' },
    { id: 'investigate', num: '02', label: 'INVESTIGATE', tooltip: 'Dissect 6 real-time multi-sensor signals' },
    { id: 'fuse', num: '03', label: 'FUSE', tooltip: 'Incident Fusion multi-signal synthesis' },
    { id: 'map', num: '04', label: 'MAP', tooltip: 'Digital Twin sector topography & telemetry' },
    { id: 'unknown', num: '05', label: 'UNKNOWN', tooltip: 'Zone E blackout reconnaissance protocols' },
    { id: 'explain', num: '06', label: 'EXPLAIN', tooltip: 'XAI factor attribution & risk explanation' },
    { id: 'command', num: '07', label: 'COMMAND', tooltip: 'Available fleet deployment & logistics' },
    { id: 'strategy', num: '08', label: 'STRATEGY', tooltip: 'Human Command vs AEGIS AI Co-Pilot' },
    { id: 'simulate', num: '09', label: 'SIMULATE', tooltip: 'Butterfly effect forward projection' },
    { id: 'chess', num: '10', label: 'CHESS', tooltip: 'Disaster Chess tactical board maneuvers' },
    { id: 'deploy', num: '11', label: 'DEPLOY', tooltip: 'Real-time dispatch transit execution' },
    { id: 'outcome', num: '12', label: 'OUTCOME', tooltip: 'After Action Report & mission analysis' }
  ];

  return (
    <header style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      padding: '8px 18px',
      borderBottom: '1px solid rgba(214, 198, 165, 0.14)',
      background: 'rgba(14, 27, 21, 0.82)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(20px)',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)'
    }}>
      
      {/* Top Line: Brand, Operation, Compact Metrics, Back & Reset */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        
        {/* Left: Brand & Directive */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: 'rgba(111, 148, 125, 0.2)', border: '1px solid rgba(214, 198, 165, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D6C6A5' }}>
            <ShieldAlert size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="font-hud" style={{ fontSize: '16px', fontWeight: '800', letterSpacing: '0.14em', color: '#EAE5D8' }}>
                AEGIS
              </span>
              <span className="font-mono" style={{ fontSize: '10px', background: 'rgba(217, 83, 79, 0.2)', border: '1px solid rgba(217, 83, 79, 0.45)', color: '#FCA5A5', padding: '1px 6px', borderRadius: '2px', fontWeight: '700' }}>
                OPERATION #027
              </span>
            </div>
            <div className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4' }}>
              DEFCON 2 · FLASH FLOOD CASCADE
            </div>
          </div>
        </div>

        {/* Center: Compact Persistent Operational Telemetry */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(14, 27, 21, 0.75)', padding: '4px 14px', borderRadius: '20px', border: '1px solid rgba(214, 198, 165, 0.16)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Activity size={12} color="#6F947D" />
            <span className="font-mono" style={{ fontSize: '10px', color: '#9FB5A4' }}>HEALTH:</span>
            <AegisAnimatedNumber value={cityHealth} suffix="%" className="font-mono" style={{ fontSize: '12px', fontWeight: '700', color: '#6F947D' }} />
          </div>

          <div style={{ width: '1px', height: '14px', background: 'rgba(214, 198, 165, 0.12)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={12} color="#C99A45" />
            <span className="font-mono" style={{ fontSize: '10px', color: '#9FB5A4' }}>ALERTS:</span>
            <AegisAnimatedNumber value={activeAlerts} className="font-mono" style={{ fontSize: '12px', fontWeight: '700', color: '#C99A45' }} />
          </div>

          <div style={{ width: '1px', height: '14px', background: 'rgba(214, 198, 165, 0.12)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Radio size={12} color="#D6C6A5" />
            <span className="font-mono" style={{ fontSize: '10px', color: '#9FB5A4' }}>HOSPITAL:</span>
            <AegisAnimatedNumber value={hospitalLoad} suffix="%" className="font-mono" style={{ fontSize: '12px', fontWeight: '700', color: hospitalLoad >= 90 ? '#D9534F' : '#D6C6A5' }} />
          </div>
        </div>

        {/* Right: Stage Control Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {currentStage !== 'briefing' && (
            <button
              className="btn-command-secondary"
              onClick={onBack}
              style={{ fontSize: '11px', padding: '4px 10px' }}
              title="Return to preceding phase"
            >
              <ArrowLeft size={12} /> BACK
            </button>
          )}

          <button
            className="btn-command-secondary"
            onClick={onReset}
            style={{ fontSize: '11px', padding: '4px 10px', borderColor: 'rgba(239,68,68,0.3)', color: '#fca5a5' }}
            title="Reset operation to initial briefing"
          >
            <RotateCcw size={12} /> RESET
          </button>
        </div>

      </div>

      {/* Mission Progress Rail: ●───●───●───◉───○───○ */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '4px' }}>
        <AegisMissionRail
          stages={stages}
          currentStage={currentStage}
          onSelectStage={onSelectStage}
        />
      </div>

    </header>
  );
}
