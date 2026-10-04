import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Radio, 
  Crosshair, 
  Satellite, 
  Send, 
  EyeOff, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  Loader2,
  FileText,
  MapPin,
  Flame
} from 'lucide-react';
import { AegisPrimaryCommand, AegisCommandModule } from './aegis-controls';
import { Aegis3DCard, AegisAnimatedNumber } from './aegis-interactive';
import { investigateZoneE } from '../services/api';

export default function UnknownZoneScreen({ onProceedToExplain, onZoneUpdated }) {
  const [dataConfidence, setDataConfidence] = useState(18);
  const [zoneStatus, setZoneStatus] = useState("UNKNOWN");
  const [communication, setCommunication] = useState(12);
  const [reports, setReports] = useState(0);
  const [gpsStatus, setGpsStatus] = useState("STALE (140+ Pings Stalled)");
  const [activeAction, setActiveAction] = useState(null);
  const [actionStep, setActionStep] = useState(null); // 'deploying', 'scanning', 'complete'
  const [intelLogs, setIntelLogs] = useState([
    { time: "14:28:10", type: "system", msg: "Telemetry Blackout detected in East Delta Zone E." },
    { time: "14:31:02", type: "system", msg: "Zero 911 reports received. Automated warning: silence indicates severed access, not safety." }
  ]);

  const handleReconAction = async (actionType) => {
    setActiveAction(actionType);
    setActionStep('deploying');

    // Notify backend
    try {
      investigateZoneE(actionType).catch(() => {});
    } catch (_) {}

    if (actionType === 'drone') {
      setTimeout(() => {
        setActionStep('scanning');
      }, 1200);

      setTimeout(() => {
        setActionStep('complete');
        setDataConfidence(71);
        setZoneStatus("CRITICAL");
        setCommunication(48);
        setReports(8);
        setGpsStatus("ACTIVE (Drone Mesh Relay Established)");
        setIntelLogs(prev => [
          { time: "14:38:44", type: "recon", msg: "DRONE DEPLOYED > FLIGHT PATH OVER EAST DELTA COMPLETE." },
          { time: "14:39:12", type: "recon", msg: "SCANNING > STRUCTURAL DAMAGE DETECTED AT RAIL TERMINAL." },
          { time: "14:39:30", type: "alert", msg: "LEVEE OVERFLOW DETECTED: 140+ VEHICLES TRAPPED UNDER 3.4M WATER." },
          ...prev
        ]);
        if (onZoneUpdated) {
          onZoneUpdated({ id: 'E', confidence: 71, isUnknown: false, status: 'CRITICAL', risk: 88 });
        }
      }, 2600);
    } else if (actionType === 'satellite') {
      setTimeout(() => {
        setActionStep('scanning');
      }, 1200);

      setTimeout(() => {
        setActionStep('complete');
        setDataConfidence(86);
        setZoneStatus("CRITICAL - BREACH CONFIRMED");
        setIntelLogs(prev => [
          { time: "14:40:05", type: "recon", msg: "SENTINEL-1 SAR MULTISPECTRAL PASS RECEIVED." },
          { time: "14:40:22", type: "alert", msg: "SYNTHETIC RADAR CONFIRMS: 12KM² INUNDATION IN LOWLAND DELTA." },
          ...prev
        ]);
      }, 2400);
    } else if (actionType === 'field') {
      setTimeout(() => {
        setActionStep('scanning');
      }, 1000);

      setTimeout(() => {
        setActionStep('complete');
        setDataConfidence(94);
        setZoneStatus("CRITICAL - IMMEDIATE EVAC NEEDED");
        setReports(19);
        setIntelLogs(prev => [
          { time: "14:41:15", type: "recon", msg: "AMPHIBIOUS SCOUT UNIT ALPHA REACHED DELTA PERIMETER." },
          { time: "14:41:40", type: "alert", msg: "PETROCHEMICAL TANK RIG BREACHED: RESIDUAL OIL SLICK HEADING TOWARD RESIDENTIAL INTERSECT." },
          ...prev
        ]);
      }, 2200);
    }
  };

  const isReconCompleted = dataConfidence >= 70;

  return (
    <div style={{ flex: 1, padding: '24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      
      {/* Header Banner */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(214, 198, 165, 0.12)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="font-mono" style={{ fontSize: '11px', color: '#c99a45', background: 'rgba(201, 154, 69, 0.14)', padding: '2px 8px', borderRadius: '2px', border: '1px solid rgba(201, 154, 69, 0.4)', fontWeight: '700' }}>
              STAGE 5 // UNKNOWN ZONE INTELLIGENCE
            </span>
            <span className="font-mono" style={{ fontSize: '11px', color: '#9fb5a4' }}>
              INFORMATION GAP RESOLUTION PROTOCOL
            </span>
          </div>
          <h1 className="font-hud" style={{ fontSize: '26px', fontWeight: '800', color: '#eae5d8', margin: '6px 0 0 0', letterSpacing: '0.04em' }}>
            ZONE E — EAST DELTA ANOMALY
          </h1>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4', letterSpacing: '0.08em' }}>ZONE STATUS</div>
          <div className="font-hud" style={{
            fontSize: '18px',
            fontWeight: '800',
            color: zoneStatus === 'UNKNOWN' ? '#c99a45' : '#d9534f',
            letterSpacing: '0.05em'
          }}>
            {zoneStatus}
          </div>
        </div>
      </div>

      {/* Main Grid: Telemetry Card vs Recon Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.2fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Left Column: Live Zone E Blackout State */}
        <Aegis3DCard
          accentColor="#c99a45"
          style={{ 
            background: 'rgba(14, 27, 21, 0.88)', 
            border: '1px solid rgba(201, 154, 69, 0.3)', 
            borderRadius: '6px', 
            padding: '20px' 
          }}
        >
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <EyeOff size={18} color="#c99a45" />
              <span className="font-hud" style={{ fontSize: '15px', fontWeight: '700', color: '#d6c6a5' }}>
                TELEMETRY & CONFIDENCE PROFILE
              </span>
            </div>
            <span className="font-mono" style={{ fontSize: '11px', color: '#9fb5a4' }}>
              GRID REF: DELTA-80-28
            </span>
          </div>

          {/* Large Confidence Bar */}
          <div style={{ background: 'rgba(8, 13, 10, 0.65)', padding: '14px', borderRadius: '4px', border: '1px solid rgba(214, 198, 165, 0.1)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span className="font-mono" style={{ fontSize: '11px', color: '#9fb5a4' }}>DATA CONFIDENCE INDEX</span>
              <span className="font-mono" style={{ fontSize: '14px', fontWeight: '700', color: dataConfidence < 50 ? '#c99a45' : '#6f947d' }}>
                <AegisAnimatedNumber value={dataConfidence} suffix="%" />
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${dataConfidence}%`,
                height: '100%',
                background: dataConfidence < 50 ? 'linear-gradient(90deg, #8a6524, #c99a45)' : 'linear-gradient(90deg, #193a2a, #6f947d)',
                transition: 'width 0.8s ease'
              }} />
            </div>
            <div className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4', marginTop: '6px' }}>
              {dataConfidence < 50 
                ? "STATUS: INSUFFICIENT INFORMATION FOR TRIAGE DECISION" 
                : "STATUS: SENSOR RECON COMPLETE — CASUALTY RISK UNMASKED"}
            </div>
          </div>

          {/* Metric Rows */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            
            <div style={{ background: 'rgba(8, 13, 10, 0.55)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(214, 198, 165, 0.08)' }}>
              <div className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4' }}>COMMUNICATION</div>
              <div className="font-hud" style={{ fontSize: '18px', fontWeight: '700', color: communication < 30 ? '#d9534f' : '#6f947d' }}>
                <AegisAnimatedNumber value={communication} suffix="%" />
              </div>
              <div className="font-mono" style={{ fontSize: '9px', color: communication < 30 ? '#fca5a5' : '#9fb5a4' }}>
                {communication < 30 ? 'Severe Blackout' : 'Mesh Linked'}
              </div>
            </div>

            <div style={{ background: 'rgba(8, 13, 10, 0.55)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(214, 198, 165, 0.08)' }}>
              <div className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4' }}>EMERGENCY REPORTS</div>
              <div className="font-hud" style={{ fontSize: '18px', fontWeight: '700', color: reports === 0 ? '#c99a45' : '#d9534f' }}>
                <AegisAnimatedNumber value={reports} />
              </div>
              <div className="font-mono" style={{ fontSize: '9px', color: '#9fb5a4' }}>
                {reports === 0 ? 'Silence (Tower Down)' : 'Direct Calls Intercepted'}
              </div>
            </div>

            <div style={{ gridColumn: 'span 2', background: 'rgba(8, 13, 10, 0.55)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(214, 198, 165, 0.08)' }}>
              <div className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4' }}>GPS TRANSLATION STATUS</div>
              <div className="font-mono" style={{ fontSize: '12px', fontWeight: '700', color: gpsStatus.includes('ACTIVE') ? '#6f947d' : '#c99a45' }}>
                {gpsStatus}
              </div>
            </div>

          </div>

          {/* Key Insight Quote */}
          <div style={{ padding: '12px 14px', background: 'rgba(201, 154, 69, 0.1)', borderLeft: '3px solid #c99a45', borderRadius: '0 4px 4px 0' }}>
            <div className="font-mono" style={{ fontSize: '10px', color: '#d6c6a5', fontWeight: '700', marginBottom: '2px', letterSpacing: '0.08em' }}>
              AEGIS UNCERTAINTY HEURISTIC
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#eae5d8', lineHeight: 1.45 }}>
              "Traditional EMS ignores areas with zero 911 calls. AEGIS recognizes that 0 calls paired with a tower blackout and stalled GPS indicates catastrophic isolation."
            </p>
          </div>

        </Aegis3DCard>

        {/* Right Column: Reconnaissance Action Triggers & Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Action Trigger Buttons */}
          <div style={{ background: 'rgba(14, 27, 21, 0.88)', border: '1px solid rgba(214, 198, 165, 0.15)', borderRadius: '6px', padding: '16px' }}>
            <div className="font-hud" style={{ fontSize: '13px', fontWeight: '700', color: '#d6c6a5', marginBottom: '12px', letterSpacing: '0.08em' }}>
              AVAILABLE RECONNAISSANCE PROTOCOLS
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* 1. Request Drone */}
              <AegisCommandModule
                tag="UAV-02"
                title="REQUEST DRONE"
                detail="AUTONOMOUS UAV FLIGHT OVER DELTA RAIL YARD"
                status={activeAction === 'drone' && actionStep !== 'complete' ? 'DEPLOYING... ◌' : dataConfidence >= 71 ? 'DATA ACQUIRED ✓' : 'READY →'}
                icon="◇"
                onClick={() => handleReconAction('drone')}
                disabled={activeAction === 'drone' && actionStep !== 'complete'}
                variant="sage"
              />

              {/* 2. Request Satellite */}
              <AegisCommandModule
                tag="SAR-1"
                title="REQUEST SATELLITE"
                detail="MULTISPECTRAL CLOUD-PENETRATING SAR RADAR"
                status={activeAction === 'satellite' && actionStep !== 'complete' ? 'SCANNING... ◌' : dataConfidence >= 86 ? 'SAR PASS COMPLETE ✓' : 'READY →'}
                icon="◇"
                onClick={() => handleReconAction('satellite')}
                disabled={activeAction === 'satellite' && actionStep !== 'complete'}
                variant="purple"
              />

              {/* 3. Request Field Report */}
              <AegisCommandModule
                tag="SCOUT"
                title="REQUEST FIELD REPORT"
                detail="AMPHIBIOUS TACTICAL UNIT GROUND RECON"
                status={activeAction === 'field' && actionStep !== 'complete' ? 'DISPATCHING... ◌' : dataConfidence >= 94 ? 'ROUTE SECURED ✓' : 'READY →'}
                icon="◇"
                onClick={() => handleReconAction('field')}
                disabled={activeAction === 'field' && actionStep !== 'complete'}
                variant="beige"
              />

            </div>
          </div>

          {/* Real-Time Recon Log Stream */}
          <div style={{ background: 'rgba(14, 27, 21, 0.88)', border: '1px solid rgba(214, 198, 165, 0.12)', borderRadius: '6px', padding: '14px', flex: 1, minHeight: '180px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span className="font-hud" style={{ fontSize: '11px', fontWeight: '700', color: '#9fb5a4', letterSpacing: '0.08em' }}>
                INTEL DISPATCH & TELEMETRY STREAM
              </span>
              <span className="font-mono" style={{ fontSize: '10px', color: '#6f947d' }}>● LIVE FEED</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {intelLogs.map((log, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  background: log.type === 'alert' ? 'rgba(217, 83, 79, 0.15)' : 'rgba(8, 13, 10, 0.55)',
                  borderLeft: `2px solid ${log.type === 'alert' ? '#d9534f' : log.type === 'recon' ? '#6f947d' : '#9fb5a4'}`,
                  padding: '6px 10px',
                  borderRadius: '2px'
                }}>
                  <span className="font-mono" style={{ fontSize: '9px', color: '#9fb5a4', marginTop: '2px' }}>
                    {log.time}
                  </span>
                  <span className="font-mono" style={{
                    fontSize: '11px',
                    color: log.type === 'alert' ? '#fca5a5' : log.type === 'recon' ? '#eae5d8' : '#9fb5a4'
                  }}>
                    {log.msg}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Advance Command Control (Unlocked once recon complete) */}
          <AegisPrimaryCommand
            label="PROCEED TO EXPLAINABLE AI"
            subtitle="ANALYZE ZONE D FACTOR ATTRIBUTION"
            status={isReconCompleted ? "SYSTEM UNLOCKED" : "LOCKED (RECON REQUIRED)"}
            icon="◈"
            onClick={onProceedToExplain}
            disabled={!isReconCompleted}
            variant="sage"
            width="100%"
          />

        </div>

      </div>

    </div>
  );
}
