import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  Radio, 
  CheckCircle2, 
  Activity,
  AlertTriangle,
  Ambulance,
  Compass
} from 'lucide-react';
import { AegisPrimaryCommand } from './aegis-controls';
import { Aegis3DCard, AegisAnimatedNumber } from './aegis-interactive';

export default function DeploymentAnimationScreen({ 
  deployedUnit = {
    callsign: "AMBULANCE 02",
    type: "Advanced Life Support EMS",
    from: "CENTRAL BASE STAGING (ZONE A)",
    via: "ROAD 12 (ELEVATED BYPASS)",
    to: "ZONE D (SOUTH GENERAL TRAUMA CENTER)",
    etaMinutes: 14
  },
  onCompleteDeployment 
}) {
  const [transitProgress, setTransitProgress] = useState(15);
  const [etaRemaining, setEtaRemaining] = useState(deployedUnit.etaMinutes || 14);
  const [currentWaypoint, setCurrentWaypoint] = useState(0); // 0: Base, 1: Road 12, 2: Hospital Zone D
  const [isFinished, setIsFinished] = useState(false);

  const waypoints = [
    { name: "BASE STAGING (ZONE A)", status: "DEPARTED", timestamp: "14:42:10", desc: "Emergency beacon cleared bay 3" },
    { name: "ROAD 12 ELEVATED ARTERIAL", status: currentWaypoint >= 1 ? "TRANSITING" : "QUEUED", timestamp: "14:48:32", desc: "Bypassing inundated Bridge 17 bottleneck" },
    { name: "ZONE D TRAUMA PERIMETER", status: currentWaypoint >= 2 ? "ARRIVED" : "TARGET", timestamp: "14:56:00", desc: "South General critical access restored" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTransitProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsFinished(true);
          setCurrentWaypoint(2);
          setEtaRemaining(0);
          return 100;
        }
        const next = prev + 5;
        if (next > 45 && currentWaypoint === 0) setCurrentWaypoint(1);
        if (next > 85 && currentWaypoint === 1) setCurrentWaypoint(2);
        setEtaRemaining(Math.max(0, Math.round(14 * (1 - next / 100))));
        return next;
      });
    }, 250);

    return () => clearInterval(timer);
  }, [currentWaypoint]);

  return (
    <div style={{ flex: 1, padding: '24px', maxWidth: '1020px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid rgba(214, 198, 165, 0.12)', paddingBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="font-mono" style={{ fontSize: '11px', color: '#6f947d', background: 'rgba(111, 148, 125, 0.14)', padding: '2px 8px', borderRadius: '2px', border: '1px solid rgba(111, 148, 125, 0.4)', fontWeight: '700' }}>
              STAGE 11 // LIVE ASSET DEPLOYMENT
            </span>
            <span className="font-mono" style={{ fontSize: '11px', color: '#9fb5a4' }}>
              REAL-TIME DISPATCH EXECUTION
            </span>
          </div>
          <h1 className="font-hud" style={{ fontSize: '26px', fontWeight: '800', color: '#eae5d8', margin: '6px 0 0 0', letterSpacing: '0.04em' }}>
            {deployedUnit.callsign} — DISPATCH IN TRANSIT
          </h1>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4', letterSpacing: '0.08em' }}>ESTIMATED TIME OF ARRIVAL</div>
          <div className="font-mono" style={{ fontSize: '22px', fontWeight: '800', color: isFinished ? '#6f947d' : '#d6c6a5' }}>
            {isFinished ? "ON SCENE" : `T-${etaRemaining} MIN`}
          </div>
        </div>
      </div>

      {/* Main Deployment Card */}
      <div className="aegis-glass" style={{ background: 'rgba(14, 27, 21, 0.92)', border: '1px solid rgba(214, 198, 165, 0.22)', borderRadius: '8px', padding: '26px', boxShadow: '0 24px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(214, 198, 165, 0.15)' }}>
        
        {/* Unit Summary Banner */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(8, 13, 10, 0.65)', padding: '16px 20px', borderRadius: '6px', border: '1px solid rgba(214, 198, 165, 0.1)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '6px', background: 'rgba(111, 148, 125, 0.18)', border: '1px solid #6f947d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d6c6a5' }}>
              <Ambulance size={24} />
            </div>
            <div>
              <div className="font-hud" style={{ fontSize: '18px', fontWeight: '800', color: '#eae5d8' }}>
                {deployedUnit.callsign}
              </div>
              <div className="font-mono" style={{ fontSize: '11px', color: '#9fb5a4' }}>
                {deployedUnit.type} · PRIORITY 1 EMERGENCY DISPATCH
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isFinished ? 'rgba(111, 148, 125, 0.2)' : 'rgba(201, 154, 69, 0.15)', border: `1px solid ${isFinished ? '#6f947d' : '#c99a45'}`, padding: '6px 14px', borderRadius: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isFinished ? '#6f947d' : '#c99a45', display: 'inline-block' }} />
            <span className="font-mono" style={{ fontSize: '12px', fontWeight: '700', color: isFinished ? '#6f947d' : '#d6c6a5' }}>
              {isFinished ? "DEPLOYMENT SUCCESSFUL" : "TRANSIT IN PROGRESS"}
            </span>
          </div>
        </div>

        {/* Transit Progress Bar */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span className="font-mono" style={{ fontSize: '11px', color: '#9fb5a4' }}>ROUTE PROGRESSION TO SOUTH GENERAL HOSPITAL</span>
            <span className="font-mono" style={{ fontSize: '12px', fontWeight: '700', color: '#d6c6a5' }}>
              <AegisAnimatedNumber value={transitProgress} suffix="%" />
            </span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${transitProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #193a2a, #6f947d, #d6c6a5)',
              transition: 'width 0.25s linear'
            }} />
          </div>
        </div>

        {/* Route Flowchart: BASE -> ROAD 12 -> ZONE D */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
          
          {/* Waypoint 1: Base */}
          <Aegis3DCard
            accentColor="#6f947d"
            style={{
              background: 'rgba(8, 13, 10, 0.65)',
              border: '1px solid rgba(111, 148, 125, 0.4)',
              borderRadius: '6px',
              padding: '16px',
              textAlign: 'center'
            }}
          >
            <div className="font-mono" style={{ fontSize: '10px', color: '#6f947d', fontWeight: '700' }}>ORIGIN</div>
            <div className="font-hud" style={{ fontSize: '15px', fontWeight: '700', color: '#eae5d8', marginTop: '4px' }}>
              BASE STAGING
            </div>
            <div className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4', marginTop: '2px' }}>
              Zone A Central Depots
            </div>
            <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#6f947d', background: 'rgba(111, 148, 125, 0.12)', padding: '2px 6px', borderRadius: '2px' }}>
              <CheckCircle2 size={10} /> DISPATCHED
            </div>
          </Aegis3DCard>

          <div style={{ color: '#6f947d', fontSize: '20px', fontWeight: 'bold' }}>↓</div>

          {/* Waypoint 2: Road 12 */}
          <Aegis3DCard
            accentColor="#d6c6a5"
            style={{
              background: 'rgba(8, 13, 10, 0.65)',
              border: `1px solid ${currentWaypoint >= 1 ? '#d6c6a5' : 'rgba(214, 198, 165, 0.1)'}`,
              borderRadius: '6px',
              padding: '16px',
              textAlign: 'center'
            }}
          >
            <div className="font-mono" style={{ fontSize: '10px', color: '#d6c6a5', fontWeight: '700' }}>TRANSIT ARTERIAL</div>
            <div className="font-hud" style={{ fontSize: '15px', fontWeight: '700', color: '#eae5d8', marginTop: '4px' }}>
              ROAD 12 BYPASS
            </div>
            <div className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4', marginTop: '2px' }}>
              Elevated River Crossing
            </div>
            <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: currentWaypoint >= 1 ? '#d6c6a5' : '#9fb5a4', background: 'rgba(214, 198, 165, 0.1)', padding: '2px 6px', borderRadius: '2px' }}>
              <Navigation size={10} /> {currentWaypoint >= 2 ? "CLEARED" : "IN TRANSIT"}
            </div>
          </Aegis3DCard>

          <div style={{ color: currentWaypoint >= 1 ? '#d6c6a5' : '#475569', fontSize: '20px', fontWeight: 'bold' }}>↓</div>

          {/* Waypoint 3: Zone D South General */}
          <Aegis3DCard
            accentColor="#6f947d"
            style={{
              background: 'rgba(8, 13, 10, 0.65)',
              border: `1px solid ${currentWaypoint >= 2 ? '#6f947d' : 'rgba(214, 198, 165, 0.1)'}`,
              borderRadius: '6px',
              padding: '16px',
              textAlign: 'center'
            }}
          >
            <div className="font-mono" style={{ fontSize: '10px', color: currentWaypoint >= 2 ? '#6f947d' : '#c99a45', fontWeight: '700' }}>DESTINATION</div>
            <div className="font-hud" style={{ fontSize: '15px', fontWeight: '700', color: '#eae5d8', marginTop: '4px' }}>
              ZONE D HOSPITAL
            </div>
            <div className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4', marginTop: '2px' }}>
              South General Level-1 Trauma
            </div>
            <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: currentWaypoint >= 2 ? '#6f947d' : '#c99a45', background: 'rgba(201, 154, 69, 0.1)', padding: '2px 6px', borderRadius: '2px' }}>
              <MapPin size={10} /> {currentWaypoint >= 2 ? "ARRIVED ON SCENE" : "TARGETING ACCESS"}
            </div>
          </Aegis3DCard>

        </div>

        {/* Telemetry Chips */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(8, 13, 10, 0.55)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(214, 198, 165, 0.08)' }}>
            <div className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4' }}>VEHICLE SPEED</div>
            <div className="font-mono" style={{ fontSize: '13px', fontWeight: '700', color: '#eae5d8' }}>
              {isFinished ? "0 km/h (Stationary)" : "68 km/h"}
            </div>
          </div>

          <div style={{ background: 'rgba(8, 13, 10, 0.55)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(214, 198, 165, 0.08)' }}>
            <div className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4' }}>ROUTE HAZARDS</div>
            <div className="font-mono" style={{ fontSize: '13px', fontWeight: '700', color: '#6f947d' }}>
              Road 17 Avoided
            </div>
          </div>

          <div style={{ background: 'rgba(8, 13, 10, 0.55)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(214, 198, 165, 0.08)' }}>
            <div className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4' }}>ESTIMATED BENEFIT</div>
            <div className="font-mono" style={{ fontSize: '13px', fontWeight: '700', color: '#d6c6a5' }}>
              Hospital Access +18%
            </div>
          </div>

          <div style={{ background: 'rgba(8, 13, 10, 0.55)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(214, 198, 165, 0.08)' }}>
            <div className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4' }}>TRANSIT PROTOCOL</div>
            <div className="font-mono" style={{ fontSize: '13px', fontWeight: '700', color: '#8b72a8' }}>
              Emergency Sirens Priority
            </div>
          </div>
        </div>

        {/* Action Button to Complete Stage */}
        <AegisPrimaryCommand
          label={isFinished ? "AFTER ACTION REPORT" : "ACCELERATE TRANSIT"}
          subtitle={isFinished ? "EVALUATE SAVED LIVES & CONTAINMENT OUTCOME" : "ADVANCE TELEMETRY & VIEW OUTCOME"}
          status={isFinished ? "ARRIVED ON SCENE (ZONE D)" : "EN ROUTE (ROAD 12)"}
          icon="◈"
          onClick={onCompleteDeployment}
          variant="sage"
          width="100%"
        />

      </div>
    </div>
  );
}
