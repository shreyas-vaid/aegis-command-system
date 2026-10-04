import React, { useState } from 'react';
import { 
  GitFork, 
  ArrowDown, 
  Clock, 
  ChevronRight, 
  AlertTriangle, 
  Activity, 
  TrendingDown, 
  ShieldAlert 
} from 'lucide-react';

import { AegisTimeControl, AegisPrimaryCommand } from './aegis-controls';
import { Aegis3DCard, AegisAnimatedNumber } from './aegis-interactive';

export default function DisasterSimulationScreen({
  onProceedToChess
}) {
  const [timeOffset, setTimeOffset] = useState(0);

  // Dynamic values that evolve with timeOffset matching exact specs
  const road17Val = timeOffset === 0 ? 22 : timeOffset === 15 ? 12 : timeOffset === 30 ? 4 : 0;
  const hospitalLoad = timeOffset === 0 ? 72 : timeOffset === 15 ? 81 : timeOffset === 30 ? 91 : 98;
  const zoneDRisk = timeOffset === 0 ? 89 : timeOffset === 15 ? 92 : timeOffset === 30 ? 96 : 99;
  const zoneEStatus = timeOffset === 0 ? "UNKNOWN" : timeOffset === 15 ? "WARNING" : "CRITICAL";
  const cityHealth = timeOffset === 0 ? 70 : timeOffset === 15 ? 67 : timeOffset === 30 ? 61 : 54;

  return (
    <div style={{
      minHeight: '88vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      maxWidth: '980px',
      margin: '0 auto',
      width: '100%'
    }}>
      <div
        className="aegis-glass"
        style={{
          width: '100%',
          background: 'rgba(14, 27, 21, 0.92)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(214, 198, 165, 0.22)',
          borderRadius: '8px',
          padding: '32px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(214, 198, 165, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        
        {/* Header & Simulation Mode Indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(214, 198, 165, 0.12)', paddingBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="font-mono" style={{ fontSize: '11px', color: '#c99a45', background: 'rgba(201, 154, 69, 0.14)', padding: '2px 8px', borderRadius: '2px', border: '1px solid rgba(201, 154, 69, 0.4)', fontWeight: '700' }}>
                STAGE 9 // BUTTERFLY EFFECT SIMULATION
              </span>
              <span className="font-mono" style={{ fontSize: '11px', color: '#9fb5a4' }}>
                FORWARD CASCADE PROJECTION
              </span>
            </div>
            <h2 className="font-hud" style={{ fontSize: '28px', fontWeight: '800', color: '#eae5d8', margin: '4px 0 0 0', letterSpacing: '0.04em' }}>
              TEMPORAL SIMULATION CONSOLE
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={20} color="#c99a45" />
            <span className="font-mono" style={{ fontSize: '24px', fontWeight: '800', color: '#d6c6a5' }}>
              T +00:{String(timeOffset).padStart(2, '0')}:00
            </span>
          </div>
        </div>

        {/* Physical Draggable Interactive AegisTimeControl */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <AegisTimeControl
            activeOffset={timeOffset}
            onChangeOffset={setTimeOffset}
          />
        </div>

        {/* Dynamic World State Shifts - 5 Restored 3D Metrics with Animated Numbers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
          
          <Aegis3DCard
            accentColor="#d9534f"
            style={{ 
              background: 'rgba(8, 13, 10, 0.65)', 
              padding: '14px', 
              borderRadius: '4px', 
              border: '1px solid rgba(214, 198, 165, 0.12)', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textAlign: 'center' 
            }}
          >
            <span style={{ fontSize: '10px', color: '#9fb5a4', letterSpacing: '0.08em', fontWeight: '600' }}>ROAD 17 ACCESS</span>
            <div className="font-mono" style={{ fontSize: '22px', fontWeight: '800', color: timeOffset >= 30 ? '#d9534f' : '#c99a45', marginTop: '2px' }}>
              <AegisAnimatedNumber value={road17Val} suffix="%" />
            </div>
            <span className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4', marginTop: '4px' }}>
              22% → {road17Val}%
            </span>
          </Aegis3DCard>

          <Aegis3DCard
            accentColor="#d9534f"
            style={{ 
              background: 'rgba(8, 13, 10, 0.65)', 
              padding: '14px', 
              borderRadius: '4px', 
              border: '1px solid rgba(214, 198, 165, 0.12)', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textAlign: 'center' 
            }}
          >
            <span style={{ fontSize: '10px', color: '#9fb5a4', letterSpacing: '0.08em', fontWeight: '600' }}>HOSPITAL LOAD</span>
            <div className="font-mono" style={{ fontSize: '22px', fontWeight: '800', color: hospitalLoad >= 90 ? '#d9534f' : '#c99a45', marginTop: '2px' }}>
              <AegisAnimatedNumber value={hospitalLoad} suffix="%" />
            </div>
            <span className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4', marginTop: '4px' }}>
              72% → {hospitalLoad}%
            </span>
          </Aegis3DCard>

          <Aegis3DCard
            accentColor="#d9534f"
            style={{ 
              background: 'rgba(8, 13, 10, 0.65)', 
              padding: '14px', 
              borderRadius: '4px', 
              border: '1px solid rgba(217, 83, 79, 0.35)', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textAlign: 'center' 
            }}
          >
            <span style={{ fontSize: '10px', color: '#fca5a5', letterSpacing: '0.08em', fontWeight: '600' }}>ZONE D RISK</span>
            <div className="font-mono" style={{ fontSize: '22px', fontWeight: '800', color: '#d9534f', marginTop: '2px' }}>
              <AegisAnimatedNumber value={zoneDRisk} /> / 100
            </div>
            <span className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4', marginTop: '4px' }}>
              89 → {zoneDRisk}
            </span>
          </Aegis3DCard>

          <Aegis3DCard
            accentColor="#8b72a8"
            style={{ 
              background: 'rgba(8, 13, 10, 0.65)', 
              padding: '14px', 
              borderRadius: '4px', 
              border: '1px solid rgba(139, 114, 168, 0.35)', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textAlign: 'center' 
            }}
          >
            <span style={{ fontSize: '10px', color: '#8b72a8', letterSpacing: '0.08em', fontWeight: '600' }}>ZONE E STATUS</span>
            <div className="font-mono" style={{ fontSize: '15px', fontWeight: '800', color: zoneEStatus === 'CRITICAL' ? '#d9534f' : '#8b72a8', marginTop: '4px' }}>
              {zoneEStatus}
            </div>
            <span className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4', marginTop: '4px' }}>
              UNKNOWN → {zoneEStatus}
            </span>
          </Aegis3DCard>

          <Aegis3DCard
            accentColor="#6f947d"
            style={{ 
              background: 'rgba(8, 13, 10, 0.65)', 
              padding: '14px', 
              borderRadius: '4px', 
              border: '1px solid rgba(111, 148, 125, 0.35)', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textAlign: 'center' 
            }}
          >
            <span style={{ fontSize: '10px', color: '#6f947d', letterSpacing: '0.08em', fontWeight: '600' }}>CITY HEALTH</span>
            <div className="font-mono" style={{ fontSize: '22px', fontWeight: '800', color: cityHealth < 65 ? '#d9534f' : '#6f947d', marginTop: '2px' }}>
              <AegisAnimatedNumber value={cityHealth} suffix="%" />
            </div>
            <span className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4', marginTop: '4px' }}>
              70% → {cityHealth}%
            </span>
          </Aegis3DCard>

        </div>

        {/* Cascading Consequences Butterfly Chain - Exact Causality Flow */}
        <div style={{ background: 'rgba(8, 13, 10, 0.7)', border: '1px solid rgba(214, 198, 165, 0.12)', borderRadius: '6px', padding: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <GitFork size={14} color="#c99a45" />
            <span className="font-hud" style={{ fontSize: '12px', fontWeight: '700', color: '#d6c6a5', letterSpacing: '0.1em' }}>
              THE BUTTERFLY EFFECT — CAUSALITY CHAIN
            </span>
          </div>

          <div className="font-hud" style={{ fontSize: '12px', fontWeight: '700', color: '#eae5d8', background: 'rgba(217, 83, 79, 0.2)', border: '1px solid rgba(217, 83, 79, 0.4)', padding: '6px 24px', borderRadius: '3px', width: '280px', textAlign: 'center' }}>
            ROAD 17 FAILURE
          </div>
          <ArrowDown size={14} color="#c99a45" />

          <div className="font-hud" style={{ fontSize: '12px', fontWeight: '700', color: '#eae5d8', background: 'rgba(201, 154, 69, 0.2)', border: '1px solid rgba(201, 154, 69, 0.4)', padding: '6px 24px', borderRadius: '3px', width: '280px', textAlign: 'center' }}>
            AMBULANCE DELAY
          </div>
          <ArrowDown size={14} color="#c99a45" />

          <div className="font-hud" style={{ fontSize: '12px', fontWeight: '700', color: '#eae5d8', background: 'rgba(201, 154, 69, 0.2)', border: '1px solid rgba(201, 154, 69, 0.4)', padding: '6px 24px', borderRadius: '3px', width: '280px', textAlign: 'center' }}>
            HOSPITAL ACCESS LOSS
          </div>
          <ArrowDown size={14} color="#c99a45" />

          <div className="font-hud" style={{ fontSize: '12px', fontWeight: '700', color: '#eae5d8', background: 'rgba(217, 83, 79, 0.25)', border: '1px solid rgba(217, 83, 79, 0.4)', padding: '6px 24px', borderRadius: '3px', width: '280px', textAlign: 'center' }}>
            TRAUMA LOAD ESCALATION
          </div>
          <ArrowDown size={14} color="#c99a45" />

          <div className="font-hud" style={{ fontSize: '12px', fontWeight: '700', color: '#fca5a5', background: 'rgba(217, 83, 79, 0.35)', border: '1px solid #d9534f', padding: '6px 24px', borderRadius: '3px', width: '280px', textAlign: 'center' }}>
            CITY HEALTH DECLINE (70 → 61)
          </div>
        </div>

        {/* Tactical Primary Command Control */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
          <AegisPrimaryCommand
            label="PROCEED TO DISASTER CHESS"
            subtitle="STAGE 10 // DEPLOY COUNTERMEASURES ON LIVE GRID"
            status="SIMULATION VERIFIED"
            icon="◈"
            onClick={onProceedToChess}
            variant="sage"
            width="100%"
          />
        </div>

      </div>
    </div>
  );
}
