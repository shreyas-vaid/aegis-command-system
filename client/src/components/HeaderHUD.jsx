import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  AlertTriangle, 
  HelpCircle, 
  RotateCcw, 
  Play, 
  Layers, 
  Radio, 
  Compass, 
  Clock,
  Sparkles,
  Swords
} from 'lucide-react';

export default function HeaderHUD({
  state,
  activeTimeline,
  onTimelineChange,
  onReset,
  onOpenChess,
  onOpenAIResponse,
  loading
}) {
  const [liveClock, setLiveClock] = useState("14:37:21");

  useEffect(() => {
    // If on LIVE timeline, update clock dynamically
    if (activeTimeline === 0) {
      const interval = setInterval(() => {
        const now = new Date();
        const hrs = String(now.getHours()).padStart(2, '0');
        const mins = String(now.getMinutes()).padStart(2, '0');
        const secs = String(now.getSeconds()).padStart(2, '0');
        setLiveClock(`${hrs}:${mins}:${secs}`);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setLiveClock(state?.time || "14:37:21");
    }
  }, [activeTimeline, state?.time]);

  const cityHealth = state?.cityHealth ?? 72;
  const activeAlerts = state?.activeAlerts ?? 7;
  const unknownZones = state?.unknownZones ?? 1;
  const hospitalLoad = state?.hospitalLoad ?? 72;

  // Determine health color
  const getHealthColor = (val) => {
    if (val >= 70) return '#10b981';
    if (val >= 45) return '#f59e0b';
    return '#ef4444';
  };

  const getHospitalColor = (val) => {
    if (val >= 90) return '#ef4444';
    if (val >= 75) return '#f97316';
    return '#f59e0b';
  };

  return (
    <header className="hud-panel hud-bracket p-3" style={{ padding: '10px 16px' }}>
      {/* Top Banner Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            background: 'rgba(6, 182, 212, 0.12)', 
            border: '1px solid rgba(6, 182, 212, 0.4)', 
            borderRadius: '4px',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#22d3ee'
          }}>
            <ShieldAlert size={22} className="pulse-red" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="font-hud" style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '0.12em', color: '#f8fafc', margin: 0 }}>
                AEGIS
              </h1>
              <span style={{ fontSize: '11px', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', padding: '1px 6px', borderRadius: '2px', fontWeight: '600' }} className="font-mono">
                DEFCON 2
              </span>
              <span style={{ fontSize: '11px', background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', color: '#67e8f9', padding: '1px 6px', borderRadius: '2px' }} className="font-mono">
                DISASTER DIGITAL TWIN
              </span>
            </div>
            <p className="font-hud" style={{ fontSize: '11px', letterSpacing: '0.16em', color: '#94a3b8', margin: 0, textTransform: 'uppercase' }}>
              AI Emergency Intelligence &amp; Simulation System
            </p>
          </div>
        </div>

        {/* Live Incident Status & Clock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} className="pulse-red" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="font-hud" style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '0.08em' }}>INCIDENT CLUSTER</span>
              <span className="font-mono" style={{ fontSize: '13px', fontWeight: '700', color: '#fca5a5' }}>
                #027 FLASH FLOOD &amp; CASUALTY RISK
              </span>
            </div>
          </div>

          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="#67e8f9" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="font-hud" style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.08em' }}>
                {activeTimeline === 0 ? "LIVE OPERATIONAL TIME" : `SIMULATED TIME (+${activeTimeline}M)`}
              </span>
              <span className="font-mono" style={{ fontSize: '16px', fontWeight: '700', color: activeTimeline === 0 ? '#38bdf8' : '#fb923c' }}>
                {liveClock}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics & Control Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        
        {/* Four Primary Telemetry Readouts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 auto' }}>
          
          {/* City Health */}
          <div className="metric-box" style={{ minWidth: '130px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="metric-title">CITY HEALTH</span>
              <Activity size={14} color={getHealthColor(cityHealth)} />
            </div>
            <div className="metric-value" style={{ color: getHealthColor(cityHealth) }}>
              {cityHealth}%
            </div>
            <div className="meter-track" style={{ marginTop: '4px' }}>
              <div 
                className="meter-fill" 
                style={{ width: `${cityHealth}%`, background: getHealthColor(cityHealth) }} 
              />
            </div>
          </div>

          {/* Active Alerts */}
          <div className="metric-box" style={{ minWidth: '130px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="metric-title">ACTIVE ALERTS</span>
              <AlertTriangle size={14} color="#f59e0b" />
            </div>
            <div className="metric-value" style={{ color: '#f59e0b' }}>
              {activeAlerts}
            </div>
            <div className="metric-subtitle">
              4 Critical · 3 Elevated
            </div>
          </div>

          {/* Unknown Zones */}
          <div className="metric-box" style={{ minWidth: '130px', flex: 1, border: '1px solid rgba(168, 85, 247, 0.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="metric-title" style={{ color: '#c084fc' }}>UNKNOWN ZONES</span>
              <HelpCircle size={14} color="#a855f7" className="pulse-purple" />
            </div>
            <div className="metric-value" style={{ color: '#c084fc' }}>
              {unknownZones}
            </div>
            <div className="metric-subtitle" style={{ color: '#d8b4fe' }}>
              Zone E (Delta Comms Gap)
            </div>
          </div>

          {/* Hospital Load */}
          <div className="metric-box" style={{ minWidth: '130px', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="metric-title">HOSPITAL LOAD</span>
              <Radio size={14} color={getHospitalColor(hospitalLoad)} />
            </div>
            <div className="metric-value" style={{ color: getHospitalColor(hospitalLoad) }}>
              {hospitalLoad}%
            </div>
            <div className="meter-track" style={{ marginTop: '4px' }}>
              <div 
                className="meter-fill" 
                style={{ width: `${Math.min(100, hospitalLoad)}%`, background: getHospitalColor(hospitalLoad) }} 
              />
            </div>
          </div>
        </div>

        {/* Timeline Simulation Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(9, 13, 20, 0.8)', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <span className="font-hud" style={{ fontSize: '11px', color: '#94a3b8', marginRight: '4px' }}>
            SIMULATION:
          </span>
          <button
            className={`btn-hud ${activeTimeline === 0 ? 'btn-hud-active' : ''}`}
            onClick={() => onTimelineChange(0)}
            disabled={loading}
            style={{ fontSize: '12px', padding: '4px 10px' }}
          >
            ● LIVE
          </button>
          <button
            className={`btn-hud ${activeTimeline === 15 ? 'btn-hud-active' : ''}`}
            onClick={() => onTimelineChange(15)}
            disabled={loading}
            style={{ fontSize: '12px', padding: '4px 10px' }}
          >
            +15 MIN
          </button>
          <button
            className={`btn-hud ${activeTimeline === 30 ? 'btn-hud-active' : ''}`}
            onClick={() => onTimelineChange(30)}
            disabled={loading}
            style={{ fontSize: '12px', padding: '4px 10px' }}
          >
            +30 MIN
          </button>
          <button
            className={`btn-hud ${activeTimeline === 60 ? 'btn-hud-active' : ''}`}
            onClick={() => onTimelineChange(60)}
            disabled={loading}
            style={{ fontSize: '12px', padding: '4px 10px' }}
          >
            +60 MIN
          </button>
        </div>

        {/* Strategic Mode Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn-hud btn-hud-primary"
            onClick={onOpenAIResponse}
            title="Generate and inspect AI response plan"
          >
            <Sparkles size={14} />
            AI COMMAND
          </button>

          <button
            className="btn-hud"
            onClick={onOpenChess}
            title="Open Disaster Chess Tactical Mode"
            style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fde047' }}
          >
            <Swords size={14} />
            DISASTER CHESS
          </button>

          <button
            className="btn-hud btn-hud-danger"
            onClick={onReset}
            disabled={loading}
            title="Restore pristine baseline scenario #027"
          >
            <RotateCcw size={14} />
            RESET WORLD
          </button>
        </div>

      </div>
    </header>
  );
}
