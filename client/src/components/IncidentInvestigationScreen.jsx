import React, { useState } from 'react';
import { 
  CloudRain, 
  Waves, 
  AlertTriangle, 
  Activity, 
  Radio, 
  PhoneCall, 
  CheckCircle2, 
  X, 
  Plus, 
  Sparkles,
  Terminal
} from 'lucide-react';
import { AegisPrimaryCommand, AegisCommandModule } from './aegis-controls';
import { Aegis3DCard } from './aegis-interactive';

export default function IncidentInvestigationScreen({
  onFuseIncident
}) {
  const [activeModalSignal, setActiveModalSignal] = useState(null);
  const [collectedEvidence, setCollectedEvidence] = useState([]);

  const signals = [
    {
      id: "weather",
      tag: "WEATHER",
      headline: "Heavy Rainfall",
      value: "42 mm/hr",
      icon: CloudRain,
      color: "#6F947D",
      source: "Weather Radar + METAR",
      confidence: "94%",
      risk: "+31",
      description: "Localized atmospheric activity detected over North-South drainage corridor. Soil absorption reached saturation.",
      rawTelemetry: [
        { label: "rainfall_intensity", value: "42 mm/hr" },
        { label: "trend", value: "increasing (+14% / hr)" },
        { label: "radar_reflectivity", value: "54 dBZ" },
        { label: "cell_velocity", value: "18 kt (Stationary Stall)" }
      ]
    },
    {
      id: "river",
      tag: "RIVER",
      headline: "Water Expansion",
      value: "+3.4m Crest",
      icon: Waves,
      color: "#9FB5A4",
      source: "IoT River Basin Piezometers",
      confidence: "96%",
      risk: "+24",
      description: "Rapid water expansion cresting natural banks by +3.4m. Inundating dual-carriageway and Levee Berm #2.",
      rawTelemetry: [
        { label: "crest_delta", value: "+3.4m above baseline" },
        { label: "stream_flow", value: "410 m³/sec" },
        { label: "flood_stage", value: "Stage 3 (Major Inundation)" },
        { label: "berm_pore_pressure", value: "184 kPa (Warning)" }
      ]
    },
    {
      id: "road",
      tag: "ROAD",
      headline: "Road 17 Failure",
      value: "Structural Stress",
      icon: AlertTriangle,
      color: "#D9534F",
      source: "DOT Inductive Loop Sensors & Satellite SAR",
      confidence: "98%",
      risk: "+28",
      description: "Culvert washout on Road 17 completely blocks primary ambulance artery into South General Hospital.",
      rawTelemetry: [
        { label: "culvert_breach", value: "true (washout confirmed)" },
        { label: "vehicle_velocity", value: "0 km/h (complete stoppage)" },
        { label: "flow_degradation", value: "-98.4%" },
        { label: "bridge17_pylon_deflection", value: "14 cm lateral shift" }
      ]
    },
    {
      id: "hospital",
      tag: "HOSPITAL",
      headline: "Trauma Load Surge",
      value: "72% Load & Rising",
      icon: Activity,
      color: "#C99A45",
      source: "South General Emergency Intake Core",
      confidence: "99%",
      risk: "+26",
      description: "Level-1 emergency bay at 72% capacity. Ambulance queue stalled on flooded access road.",
      rawTelemetry: [
        { label: "ambulance_wait_time", value: "+38 minutes" },
        { label: "triage_beds_occupied", value: "72% (Critical Intake)" },
        { label: "trauma_queue_count", value: "18 emergency patients" },
        { label: "generator_substation_water_level", value: "0.4m (Risk Zone)" }
      ]
    },
    {
      id: "comms",
      tag: "COMMUNICATION",
      headline: "Zone E Silence",
      value: "12% Connectivity",
      icon: Radio,
      color: "#8B72A8",
      source: "Cellular Tower Grid Diagnostic",
      confidence: "97%",
      risk: "+20",
      description: "88% telecom blackout in East Delta. Zero emergency calls received despite severe localized radar cell.",
      rawTelemetry: [
        { label: "link_loss", value: "88% cellular blackout" },
        { label: "packet_drop", value: "99.4%" },
        { label: "gps_transponder_beacons", value: "140+ stalled units" },
        { label: "tower_grid_status", value: "Towers 4A & 4B offline" }
      ]
    },
    {
      id: "emergency",
      tag: "EMERGENCY",
      headline: "Casualty Distress",
      value: "14 Dispatch Reports",
      icon: PhoneCall,
      color: "#D9534F",
      source: "E-911 Emergency Telephony Dispatch",
      confidence: "98%",
      risk: "+18",
      description: "14 concurrent distress calls reporting trapped vehicles and rising water levels along South General access corridor.",
      rawTelemetry: [
        { label: "active_calls", value: "14 distress lines open" },
        { label: "unanswered_queue", value: "6 callers waiting" },
        { label: "priority_level", value: "RED (Water Ingress / Trauma)" },
        { label: "cad_incident_id", value: "#027-EOC" }
      ]
    }
  ];

  const handleCollect = (signal) => {
    if (!collectedEvidence.includes(signal.id)) {
      setCollectedEvidence(prev => [...prev, signal.id]);
    }
    setActiveModalSignal(null);
  };

  const isCollected = (id) => collectedEvidence.includes(id);
  const canFuse = collectedEvidence.length >= 3;

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      maxWidth: '1100px',
      margin: '0 auto',
      width: '100%',
      position: 'relative'
    }}>
      
      {/* Investigation Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <span className="font-hud" style={{ fontSize: '13px', letterSpacing: '0.2em', color: 'var(--color-beige)', textTransform: 'uppercase' }}>
          STAGE 2 // INCIDENT INVESTIGATION
        </span>
        <h2 className="font-hud" style={{ fontSize: '32px', fontWeight: '700', color: 'var(--color-off-white)', margin: '4px 0' }}>
          "Something is happening in South Sector."
        </h2>
        <p className="font-mono" style={{ fontSize: '13px', color: 'var(--color-sage-light)', margin: 0 }}>
          Probe live sensor signals, examine raw telemetry, and collect evidence to correlate the crisis cluster.
        </p>
      </div>

      {/* 6 Large Interactive Evidence Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '18px',
        width: '100%',
        marginBottom: '28px'
      }}>
        {signals.map(sig => {
          const Icon = sig.icon;
          const collected = isCollected(sig.id);

          return (
            <Aegis3DCard
              key={sig.id}
              onClick={() => setActiveModalSignal(sig)}
              className="hud-panel hud-bracket"
              maxTilt={6}
              elevation={14}
              expandOnClick={true}
              data-cursor="probe"
              style={{
                padding: '22px',
                background: collected ? 'rgba(111, 148, 125, 0.16)' : 'rgba(14, 27, 21, 0.78)',
                border: collected ? '1px solid rgba(111, 148, 125, 0.6)' : '1px solid rgba(214, 198, 165, 0.16)',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.65), inset 0 1px 1px rgba(234, 229, 216, 0.12)',
                minHeight: '155px',
                justifyContent: 'space-between',
                backdropFilter: 'blur(16px)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: `${sig.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} color={sig.color} />
                    </div>
                    <span className="font-hud" style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '0.12em', color: sig.color }}>
                      [ {sig.tag} ]
                    </span>
                  </div>

                  {collected ? (
                    <span className="badge-status badge-stable" style={{ fontSize: '10px' }}>
                      ✓ COLLECTED
                    </span>
                  ) : (
                    <span className="font-mono" style={{ fontSize: '11px', color: '#9FB5A4' }}>
                      CLICK TO PROBE
                    </span>
                  )}
                </div>

                <div className="font-hud" style={{ fontSize: '20px', fontWeight: '800', color: '#EAE5D8' }}>
                  {sig.headline}
                </div>
              </div>

              <div className="font-mono" style={{ fontSize: '15px', fontWeight: '800', color: sig.color }}>
                {sig.value}
              </div>
            </Aegis3DCard>
          );
        })}
      </div>

      {/* Bottom Evidence Tracker & Fuse Incident Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '16px 24px',
        background: 'rgba(14, 27, 21, 0.85)',
        border: '1px solid rgba(214, 198, 165, 0.2)',
        borderRadius: '6px',
        boxShadow: '0 12px 30px rgba(0,0,0,0.6), inset 0 1px 1px rgba(234, 229, 216, 0.12)',
        backdropFilter: 'blur(20px)'
      }}>
        <div>
          <span className="font-hud" style={{ fontSize: '12px', color: '#9FB5A4', letterSpacing: '0.1em', display: 'block' }}>
            EVIDENCE DOSSIER PROGRESS:
          </span>
          <span className="font-mono" style={{ fontSize: '18px', fontWeight: '800', color: canFuse ? '#6F947D' : '#C99A45' }}>
            {collectedEvidence.length} / 6 PIECES COLLECTED {canFuse ? "(CRISIS CORRELATION UNLOCKED)" : "(MINIMUM 3 REQUIRED)"}
          </span>
        </div>

        <AegisPrimaryCommand
          label="FUSE INCIDENT"
          subtitle="MULTI-SIGNAL SYNTHESIS ENGINE"
          status={canFuse ? "CORRELATION READY" : "LOCKED (MIN 3 SIGNALS)"}
          icon="◈"
          onClick={onFuseIncident}
          disabled={!canFuse}
          variant="sage"
          width="320px"
        />
      </div>

      {/* Detail Modal with RAW SENSOR TELEMETRY */}
      {activeModalSignal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(4, 7, 12, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="hud-panel hud-bracket" style={{ width: '600px', maxWidth: '95vw', background: '#0b0f17', border: `1px solid ${activeModalSignal.color}`, borderRadius: '6px', padding: '26px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
              <div>
                <span className="font-hud" style={{ fontSize: '12px', color: activeModalSignal.color, letterSpacing: '0.12em' }}>
                  EVIDENCE TELEMETRY DISSECTION
                </span>
                <h3 className="font-hud" style={{ fontSize: '24px', fontWeight: '700', color: '#f8fafc', margin: '2px 0 0 0' }}>
                  {activeModalSignal.headline.toUpperCase()}
                </h3>
              </div>

              <button 
                onClick={() => setActiveModalSignal(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '10px', borderRadius: '4px' }}>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>VALUE</span>
                <div className="font-mono" style={{ fontSize: '18px', fontWeight: '700', color: activeModalSignal.color }}>
                  {activeModalSignal.value}
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '10px', borderRadius: '4px' }}>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>CONFIDENCE</span>
                <div className="font-mono" style={{ fontSize: '18px', fontWeight: '700', color: '#34d399' }}>
                  {activeModalSignal.confidence}
                </div>
              </div>

              <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '10px', borderRadius: '4px' }}>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>RISK IMPACT</span>
                <div className="font-mono" style={{ fontSize: '18px', fontWeight: '700', color: '#ef4444' }}>
                  {activeModalSignal.risk} PTS
                </div>
              </div>
            </div>

            <div>
              <span className="font-mono" style={{ fontSize: '11px', color: '#94a3b8' }}>SOURCE: {activeModalSignal.source}</span>
              <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.45, margin: '6px 0 0 0' }}>
                {activeModalSignal.description}
              </p>
            </div>

            {/* RESTORED: RAW SENSOR TELEMETRY BLOCK */}
            <div style={{ background: 'rgba(10, 14, 22, 0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '10px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <Terminal size={14} color="#06b6d4" />
                <span className="font-hud" style={{ fontSize: '11px', fontWeight: '700', color: '#67e8f9', letterSpacing: '0.08em' }}>
                  RAW SENSOR TELEMETRY [{activeModalSignal.tag}]
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '11px' }} className="font-mono">
                {activeModalSignal.rawTelemetry?.map((item, idx) => (
                  <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '3px 8px', borderRadius: '2px', color: '#94a3b8' }}>
                    <span style={{ color: '#cbd5e1' }}>{item.label}:</span> <strong style={{ color: activeModalSignal.color }}>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '6px' }}>
              <AegisCommandModule
                tag={activeModalSignal.tag}
                title={isCollected(activeModalSignal.id) ? "TELEMETRY COMMITTED" : `COMMIT ${activeModalSignal.tag} DATA`}
                detail="INTEGRATE SENSOR TELEMETRY INTO INCIDENT DOSSIER"
                status={isCollected(activeModalSignal.id) ? "DATA ACQUIRED" : "READY"}
                onClick={() => handleCollect(activeModalSignal)}
                disabled={isCollected(activeModalSignal.id)}
                variant="cyan"
              />
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
