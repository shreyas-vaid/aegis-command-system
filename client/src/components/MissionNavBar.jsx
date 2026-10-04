import React from 'react';
import { 
  ShieldAlert, 
  RotateCcw, 
  ArrowLeft, 
  Activity, 
  AlertTriangle,
  Radio,
  Lock,
  User,
  UserCheck,
  Layers
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
  hospitalLoad = 72,
  mode = 'DEMO',
  onToggleMode,
  currentUser = null,
  currentOrg = null,
  activeMission = null,
  activeView = 'MISSION',
  onNavigateToDeck,
  onOpenAuth,
  onOpenProfile
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
      
      {/* Top Line: Brand, Mode, Compact Metrics, Profile & Reset */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        
        {/* Left: Brand, Mode Indicator & Directive */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: 'rgba(111, 148, 125, 0.2)', border: '1px solid rgba(214, 198, 165, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D6C6A5' }}>
            <ShieldAlert size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className="font-hud" style={{ fontSize: '16px', fontWeight: '800', letterSpacing: '0.14em', color: '#EAE5D8' }}>
                AEGIS
              </span>
              
              {/* CLEAR MODE INDICATOR */}
              <button
                onClick={onToggleMode}
                title={mode === 'LIVE' ? "Active: LIVE OPERATION mode. Click to toggle." : "Active: DEMO MODE. Click to authenticate and switch to LIVE OPERATION."}
                className="font-mono"
                style={{
                  fontSize: '9px',
                  fontWeight: '700',
                  letterSpacing: '0.08em',
                  padding: '2px 8px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.2s ease',
                  background: mode === 'LIVE' ? 'rgba(74, 222, 128, 0.16)' : 'rgba(201, 154, 69, 0.16)',
                  border: `1px solid ${mode === 'LIVE' ? 'rgba(74, 222, 128, 0.5)' : 'rgba(201, 154, 69, 0.5)'}`,
                  color: mode === 'LIVE' ? '#4ADE80' : '#D6C6A5'
                }}
              >
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: mode === 'LIVE' ? '#4ADE80' : '#C99A45',
                  boxShadow: mode === 'LIVE' ? '0 0 6px #4ADE80' : 'none',
                  display: 'inline-block'
                }} />
                {mode === 'LIVE' ? '[ LIVE OPERATION ]' : '[ DEMO MODE ]'}
              </button>

              <span className="font-mono" style={{ fontSize: '10px', background: 'rgba(217, 83, 79, 0.2)', border: '1px solid rgba(217, 83, 79, 0.45)', color: '#FCA5A5', padding: '1px 6px', borderRadius: '2px', fontWeight: '700' }}>
                OPERATION #{activeMission?.missionId || '027'}
              </span>

              {mode === 'LIVE' && onNavigateToDeck && (
                <button
                  onClick={onNavigateToDeck}
                  className="font-mono"
                  style={{
                    fontSize: '9px',
                    padding: '2px 7px',
                    background: activeView === 'DECK' ? 'rgba(111, 148, 125, 0.25)' : 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(214, 198, 165, 0.25)',
                    color: activeView === 'DECK' ? '#A7F3D0' : '#D6C6A5',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title="Switch between Operations Deck and Mission Theater"
                >
                  <Layers size={10} />
                  <span>{activeView === 'DECK' ? 'IN OPERATIONS DECK' : 'OPERATIONS DECK'}</span>
                </button>
              )}
            </div>
            <div className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>DEFCON 2 · {activeMission?.name?.toUpperCase() || 'FLASH FLOOD CASCADE'}</span>
              {currentOrg?.name && (
                <span style={{ color: '#D6C6A5' }}>· {currentOrg.name}</span>
              )}
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

        {/* Right: Operator Identity & Stage Control Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          
          {currentUser ? (
            <button
              onClick={onOpenProfile}
              style={{
                background: 'rgba(8, 13, 10, 0.85)',
                border: '1px solid rgba(214, 198, 165, 0.28)',
                borderLeft: '3px solid #6F947D',
                borderRadius: '4px',
                padding: '4px 10px',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
                transition: 'all 0.2s ease'
              }}
              title="Click to view operator dossier, organization clearance and settings"
            >
              <div style={{ lineHeight: 1.15 }}>
                <div className="font-mono" style={{ fontSize: '8px', color: '#4ADE80', fontWeight: '800', letterSpacing: '0.08em' }}>
                  {currentUser.role}
                </div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#EAE5D8', letterSpacing: '0.02em' }}>
                  {currentUser.name}
                </div>
                <div className="font-mono" style={{ fontSize: '8.5px', color: '#D6C6A5', opacity: 0.9 }}>
                  {currentOrg?.name || 'Chandigarh Emergency Response'}
                </div>
              </div>
              <UserCheck size={14} color="#4ADE80" style={{ flexShrink: 0 }} />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="font-mono"
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                background: 'rgba(214, 198, 165, 0.12)',
                border: '1px solid rgba(214, 198, 165, 0.3)',
                color: '#D6C6A5',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Authenticate operator for LIVE OPERATION mode"
            >
              <Lock size={12} color="#D6C6A5" />
              <span>AUTHENTICATE</span>
            </button>
          )}

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

      {/* Mission Progress Rail or Operations Deck Status */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '4px' }}>
        {activeView === 'MISSION' ? (
          <AegisMissionRail
            stages={stages}
            currentStage={currentStage}
            onSelectStage={onSelectStage}
          />
        ) : (
          <div style={{ padding: '4px 0', textAlign: 'center' }}>
            <span className="font-mono" style={{ fontSize: '10px', color: '#9FB5A4', letterSpacing: '0.12em' }}>
              ● OPERATIONS DECK // SELECT AN ACTIVE INCIDENT THEATER TO ENGAGE 12-STAGE COMMAND CYCLE
            </span>
          </div>
        )}
      </div>

    </header>
  );
}
