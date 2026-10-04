import React from 'react';
import { ShieldAlert, Play, AlertTriangle, Activity, HelpCircle } from 'lucide-react';
import { AegisPrimaryCommand } from './aegis-controls';
import { Aegis3DCard, AegisAnimatedNumber } from './aegis-interactive';

export default function MissionBriefingScreen({
  cityHealth = 70,
  activeAlerts = 7,
  unknownZones = 1,
  onBeginOperation,
  activeMission = null
}) {
  return (
    <div style={{
      minHeight: '88vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(circle at 50% 30%, rgba(111, 148, 125, 0.1) 0%, transparent 70%)'
    }}>
      <Aegis3DCard
        className="hud-panel hud-bracket" 
        maxTilt={4}
        elevation={20}
        style={{
          width: '760px',
          maxWidth: '95vw',
          background: 'rgba(14, 27, 21, 0.88)',
          border: '1px solid rgba(214, 198, 165, 0.22)',
          borderRadius: '8px',
          padding: '42px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8), inset 0 1px 1px rgba(234, 229, 216, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <ShieldAlert size={28} color="#D6C6A5" />
          <h1 className="font-hud" style={{ fontSize: '38px', fontWeight: '800', letterSpacing: '0.14em', color: '#EAE5D8', margin: 0 }}>
            AEGIS
          </h1>
        </div>
        
        <p className="font-hud" style={{ fontSize: '12px', letterSpacing: '0.24em', color: '#9FB5A4', margin: 0, textTransform: 'uppercase' }}>
          AI Emergency Intelligence &amp; Simulation System
        </p>

        {/* Operational Codename */}
        <div style={{ marginTop: '12px', marginBottom: '4px' }}>
          <span className="font-hud" style={{ fontSize: '18px', color: '#D6C6A5', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {activeMission?.name || 'Flash Flood Cascade'}
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: '100%', height: '1px', background: 'rgba(214, 198, 165, 0.12)', margin: '18px 0' }} />

        {/* Operation Dossier Tag */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div>
            <span className="font-mono" style={{ fontSize: '10px', color: '#9FB5A4', display: 'block' }}>OPERATION</span>
            <span className="font-mono" style={{ fontSize: '18px', fontWeight: '800', color: '#D9534F' }}>
              #{activeMission?.missionId || '027'}
            </span>
          </div>

          <div style={{ width: '1px', height: '28px', background: 'rgba(214, 198, 165, 0.14)' }} />

          <div>
            <span className="font-mono" style={{ fontSize: '10px', color: '#9FB5A4', display: 'block' }}>THEATER LOCATION</span>
            <span className="font-hud" style={{ fontSize: '15px', fontWeight: '700', color: '#D6C6A5' }}>
              {activeMission?.locationName || 'Chandigarh'}
            </span>
          </div>

          <div style={{ width: '1px', height: '28px', background: 'rgba(214, 198, 165, 0.14)' }} />

          <div>
            <span className="font-mono" style={{ fontSize: '10px', color: '#9FB5A4', display: 'block' }}>COORDINATES</span>
            <span className="font-mono" style={{ fontSize: '12px', fontWeight: '700', color: '#6EE7B7' }}>
              {activeMission?.latitude ? activeMission.latitude.toFixed(4) : '30.7333'}° N, {activeMission?.longitude ? activeMission.longitude.toFixed(4) : '76.7794'}° E
            </span>
          </div>

          <div style={{ width: '1px', height: '28px', background: 'rgba(214, 198, 165, 0.14)' }} />

          <div>
            <span className="font-mono" style={{ fontSize: '10px', color: '#9FB5A4', display: 'block' }}>DISASTER VECTOR</span>
            <span className="font-hud" style={{ fontSize: '15px', fontWeight: '700', color: '#C99A45' }}>
              {activeMission?.disasterType || 'FLOOD'}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: '100%', height: '1px', background: 'rgba(214, 198, 165, 0.12)', margin: '24px 0' }} />

        {/* Initial Situation */}
        <div style={{ width: '100%', textAlign: 'left', background: 'rgba(14, 27, 21, 0.75)', border: '1px solid rgba(214, 198, 165, 0.14)', borderRadius: '6px', padding: '18px 24px', marginBottom: '24px' }}>
          <span className="font-hud" style={{ fontSize: '12px', fontWeight: '800', color: '#D6C6A5', letterSpacing: '0.12em', display: 'block', marginBottom: '10px' }}>
            INITIAL SITUATION BRIEFING:
          </span>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#EAE5D8' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#6F947D' }}>▶</span> Heavy rainfall detected over regional drainage basin.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#6F947D' }}>▶</span> River level rising rapidly toward crest threshold (+3.4m).
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#D9534F' }}>▶</span> Road 17 showing structural failure &amp; culvert breach.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#C99A45' }}>▶</span> South General Hospital approaching critical trauma intake load.
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#8B72A8' }}>▶</span> Zone E has lost communications with zero incoming 911 calls.
            </li>
          </ul>
        </div>

        {/* 3 Telemetry Metrics with 3D Tilt */}
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '28px' }}>
          
          <Aegis3DCard maxTilt={5} elevation={10} className="metric-box" style={{ textAlign: 'center', background: 'rgba(14, 27, 21, 0.8)', border: '1px solid rgba(111, 148, 125, 0.35)' }}>
            <span className="metric-title" style={{ textAlign: 'center', color: '#9FB5A4' }}>CURRENT CITY HEALTH</span>
            <div className="font-mono" style={{ fontSize: '26px', fontWeight: '800', color: '#6F947D' }}>
              <AegisAnimatedNumber value={cityHealth} suffix="%" />
            </div>
            <div className="metric-subtitle" style={{ textAlign: 'center', color: '#9FB5A4' }}>Baseline Stability</div>
          </Aegis3DCard>

          <Aegis3DCard maxTilt={5} elevation={10} className="metric-box" style={{ textAlign: 'center', background: 'rgba(14, 27, 21, 0.8)', border: '1px solid rgba(201, 154, 69, 0.35)' }}>
            <span className="metric-title" style={{ textAlign: 'center', color: '#9FB5A4' }}>ACTIVE ALERTS</span>
            <div className="font-mono" style={{ fontSize: '26px', fontWeight: '800', color: '#C99A45' }}>
              <AegisAnimatedNumber value={activeAlerts} />
            </div>
            <div className="metric-subtitle" style={{ textAlign: 'center', color: '#D6C6A5' }}>Severe Hazard Warnings</div>
          </Aegis3DCard>

          <Aegis3DCard maxTilt={5} elevation={10} className="metric-box" style={{ textAlign: 'center', background: 'rgba(14, 27, 21, 0.8)', border: '1px solid rgba(139, 114, 168, 0.4)' }}>
            <span className="metric-title" style={{ textAlign: 'center', color: '#B49DCB' }}>UNKNOWN ZONES</span>
            <div className="font-mono" style={{ fontSize: '26px', fontWeight: '800', color: '#8B72A8' }}>
              <AegisAnimatedNumber value={unknownZones} />
            </div>
            <div className="metric-subtitle" style={{ textAlign: 'center', color: '#B49DCB' }}>Zone E (Delta Comms Gap)</div>
          </Aegis3DCard>

        </div>

        {/* Primary Action Command Control with Magnetic Interaction */}
        <AegisPrimaryCommand
          label="BEGIN OPERATION"
          subtitle="INITIALIZE CRISIS INTELLIGENCE CORE"
          status="SYSTEM READY"
          icon="◈"
          onClick={onBeginOperation}
          variant="sage"
          width="390px"
        />

      </Aegis3DCard>
    </div>
  );
}
