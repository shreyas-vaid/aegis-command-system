import React from 'react';
import { 
  ArrowDown, 
  CloudRain, 
  Waves, 
  AlertTriangle, 
  Activity, 
  PhoneCall, 
  Share2,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { AegisPrimaryCommand } from './aegis-controls';
import Aegis3DCard from './aegis-interactive/Aegis3DCard';
import AegisAnimatedNumber from './aegis-interactive/AegisAnimatedNumber';

export default function IncidentFusionScreen({
  onRevealDigitalTwin
}) {
  const signalChain = [
    { title: "WEATHER SENSOR", desc: "42 mm/hr Torrential Storm Cell Influx", icon: CloudRain, color: "#6F947D", badge: "CRITICAL FLUX" },
    { title: "HYDROLOGY BASIN", desc: "+3.4m Basin Water Expansion Crest (Overtopping)", icon: Waves, color: "#9FB5A4", badge: "RUNOFF HIGH" },
    { title: "INFRASTRUCTURE", desc: "Road 17 Culvert Washout & Bridge 17 Deflection", icon: AlertTriangle, color: "#D9534F", badge: "BREACHED" },
    { title: "CRITICAL CARE", desc: "South General Trauma Access Cut (72% Internal Load)", icon: Activity, color: "#C99A45", badge: "ISOLATED" },
    { title: "SIGINT / DISPATCH", desc: "14 Casualty Distress Calls & Zone E Silent Gap", icon: PhoneCall, color: "#8B72A8", badge: "TELECOM LOSS" }
  ];

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      maxWidth: '920px',
      margin: '0 auto',
      width: '100%'
    }}>
      <Aegis3DCard
        className="aegis-glass-panel"
        style={{
          width: '100%',
          padding: '36px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '24px',
          borderColor: 'rgba(111, 148, 125, 0.35)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(111, 148, 125, 0.12)'
        }}
      >
        {/* Title Header with Parallax Tag */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div 
            className="aegis-parallax-layer font-hud" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'rgba(111, 148, 125, 0.12)', 
              border: '1px solid rgba(111, 148, 125, 0.35)', 
              color: 'var(--aegis-sage)', 
              padding: '5px 14px', 
              borderRadius: '2px', 
              fontSize: '11px', 
              fontWeight: '700', 
              letterSpacing: '0.12em' 
            }}
          >
            <Share2 size={13} /> MULTI-SIGNAL SYNTHESIS // ACTIVE
          </div>

          <h2 className="font-hud" style={{ fontSize: '32px', fontWeight: '700', color: 'var(--aegis-off-white)', margin: '12px 0 0 0', letterSpacing: '0.04em' }}>
            INCIDENT FUSION ENGINE
          </h2>
          <p className="font-mono" style={{ fontSize: '12px', color: 'var(--aegis-sage)', margin: '6px 0 0 0', letterSpacing: '0.06em' }}>
            CROSS-CORRELATING 5 TELEMETRY STREAMS INTO UNIFIED DANGER TOPOLOGY
          </p>
        </div>

        {/* Evidence Flowing Together Chain */}
        <div style={{ width: '100%', maxWidth: '720px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          {signalChain.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === signalChain.length - 1;

            return (
              <React.Fragment key={idx}>
                <div
                  className="aegis-interactive-card"
                  style={{
                    width: '100%',
                    background: 'rgba(14, 27, 21, 0.75)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(111, 148, 125, 0.22)',
                    borderLeft: `4px solid ${step.color}`,
                    borderRadius: '3px',
                    padding: '10px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.35)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '2px',
                      background: `${step.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${step.color}35`
                    }}>
                      <Icon size={15} color={step.color} />
                    </div>
                    <span className="font-hud" style={{ fontSize: '13px', fontWeight: '700', color: 'var(--aegis-off-white)', letterSpacing: '0.05em' }}>
                      {step.title}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span className="font-mono" style={{ fontSize: '12px', color: 'rgba(234, 229, 216, 0.85)' }}>
                      {step.desc}
                    </span>
                    <span className="font-mono" style={{
                      fontSize: '9px',
                      fontWeight: '700',
                      letterSpacing: '0.08em',
                      padding: '2px 8px',
                      borderRadius: '2px',
                      background: `${step.color}18`,
                      border: `1px solid ${step.color}45`,
                      color: step.color
                    }}>
                      {step.badge}
                    </span>
                  </div>
                </div>

                {!isLast && (
                  <div style={{ height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowDown size={13} color="var(--aegis-sage)" style={{ opacity: 0.75 }} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--aegis-warm-beige)', opacity: 0.8 }}>
          <Cpu size={15} />
          <ArrowDown size={16} />
        </div>

        {/* Fused Incident Cluster Card */}
        <div 
          className="aegis-glass-panel"
          style={{
            width: '100%',
            maxWidth: '740px',
            background: 'linear-gradient(135deg, rgba(217, 83, 79, 0.12) 0%, rgba(14, 27, 21, 0.85) 100%)',
            border: '1px solid rgba(217, 83, 79, 0.4)',
            borderRadius: '4px',
            padding: '22px 28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.6), 0 0 25px rgba(217, 83, 79, 0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge-status badge-critical" style={{ fontSize: '11px', padding: '3px 10px' }}>
              <CheckCircle2 size={12} style={{ display: 'inline', marginRight: '4px' }} />
              SYNTHESIS COMPLETE
            </span>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--aegis-warm-beige)' }}>
              CLUSTER #027-ALPHA
            </span>
          </div>

          <h3 className="font-hud" style={{ fontSize: '22px', fontWeight: '700', color: 'var(--aegis-off-white)', margin: 0, letterSpacing: '0.04em' }}>
            FLASH FLOOD CONVERGENCE &amp; CASUALTY THREAT
          </h3>

          {/* Animated Metrics */}
          <div style={{ display: 'flex', gap: '32px', margin: '2px 0' }} className="font-mono">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--aegis-sage)' }}>FUSION CONFIDENCE:</span>
              <strong style={{ color: 'var(--aegis-sage)', fontSize: '15px' }}>
                <AegisAnimatedNumber value={94} suffix="%" />
              </strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--aegis-warm-beige)' }}>CORRELATION FACTOR:</span>
              <strong style={{ color: 'var(--aegis-off-white)', fontSize: '15px' }}>
                0.91
              </strong>
            </div>
          </div>

          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(234, 229, 216, 0.85)', lineHeight: 1.5, maxWidth: '640px' }}>
            Correlated single point of critical failure: Atmospheric rain bomb runoff has triggered Bridge 17 deflection, completely severing South General Hospital access while Zone E telecommunications outage masks unobserved casualties.
          </p>

          <AegisPrimaryCommand
            label="REVEAL DIGITAL TWIN"
            subtitle="RENDER HIGH-RESOLUTION 3D SECTOR GRID"
            status="READY // 94% CONFIDENCE"
            icon="◈"
            onClick={onRevealDigitalTwin}
            variant="sage"
            width="380px"
            style={{ marginTop: '8px' }}
          />
        </div>

      </Aegis3DCard>
    </div>
  );
}
