import React from 'react';
import { 
  GitFork, 
  ArrowRight, 
  AlertTriangle, 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  Clock,
  Sparkles
} from 'lucide-react';

export default function ButterflyEffectViewer({
  timeOffset = 0,
  onSimulate,
  loading = false,
  butterflyChain = []
}) {
  const defaultChain = [
    {
      id: 1,
      title: "Bridge 17 Compromised",
      status: timeOffset >= 15 ? "TRIGGERED" : "PENDING",
      time: "T+10m",
      consequence: "Heavy transport diverted away from primary river crossing.",
      severity: timeOffset >= 15 ? "danger" : "neutral"
    },
    {
      id: 2,
      title: "Traffic Diverted to Secondary Arterials",
      status: timeOffset >= 15 ? "ACTIVE GRIDLOCK" : "PENDING",
      time: "T+18m",
      consequence: "Zone B residential roads exceed capacity by 310%.",
      severity: timeOffset >= 15 ? "warning" : "neutral"
    },
    {
      id: 3,
      title: "Road 17 Inaccessible to Ambulances",
      status: timeOffset >= 30 ? "CRITICAL SEVERED" : "PARTIAL SLOWDOWN",
      time: "T+26m",
      consequence: "EMS response times spike +38 mins; critical trauma transit blocked.",
      severity: timeOffset >= 30 ? "danger" : "warning"
    },
    {
      id: 4,
      title: "South General Hospital Overloaded (94%)",
      status: timeOffset >= 30 ? "CODE BLACK THREAT" : "ELEVATED (72%)",
      time: "T+34m",
      consequence: "Emergency trauma bays overflow; auxiliary power fluctuations.",
      severity: timeOffset >= 30 ? "danger" : "warning"
    },
    {
      id: 5,
      title: "East Delta Unmonitored Breach (Zone E)",
      status: timeOffset >= 60 ? "CATASTROPHIC SPILLOVER" : "INFORMATION GAP",
      time: "T+48m",
      consequence: "Silent levee failure threatens 140+ stalled civilian vehicles.",
      severity: timeOffset >= 60 ? "danger" : "purple"
    }
  ];

  const displayChain = (butterflyChain && butterflyChain.length > 0) ? butterflyChain : defaultChain;

  return (
    <div className="hud-panel hud-bracket" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitFork size={16} color="#f97316" />
          <span className="font-hud" style={{ fontSize: '14px', fontWeight: '700', letterSpacing: '0.08em', color: '#f8fafc' }}>
            BUTTERFLY EFFECT // CASCADING FAILURE SIMULATOR
          </span>
        </div>

        {/* Quick simulation buttons */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button 
            className={`btn-hud ${timeOffset === 15 ? 'btn-hud-active' : ''}`}
            onClick={() => onSimulate(15)}
            disabled={loading}
            style={{ fontSize: '11px', padding: '2px 8px' }}
          >
            +15m
          </button>
          <button 
            className={`btn-hud ${timeOffset === 30 ? 'btn-hud-active' : ''}`}
            onClick={() => onSimulate(30)}
            disabled={loading}
            style={{ fontSize: '11px', padding: '2px 8px', borderColor: '#f97316', color: '#fed7aa' }}
          >
            ⚡ SIMULATE +30 MIN
          </button>
          <button 
            className={`btn-hud ${timeOffset === 60 ? 'btn-hud-active' : ''}`}
            onClick={() => onSimulate(60)}
            disabled={loading}
            style={{ fontSize: '11px', padding: '2px 8px', borderColor: '#ef4444', color: '#fca5a5' }}
          >
            +60m
          </button>
        </div>
      </div>

      {/* Horizontal Cascade Progression Flow */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
        {displayChain.map((step, idx) => {
          const isTriggered = timeOffset >= (idx === 0 ? 10 : idx === 1 ? 15 : idx === 2 ? 30 : idx === 3 ? 30 : 60);
          const borderClr = idx === 4 ? '#a855f7' : isTriggered ? '#ef4444' : 'rgba(255,255,255,0.1)';
          const bgClr = idx === 4 ? 'rgba(88, 28, 135, 0.15)' : isTriggered ? 'rgba(69, 10, 10, 0.35)' : 'rgba(12, 17, 26, 0.6)';

          return (
            <div 
              key={idx}
              style={{ 
                background: bgClr, 
                border: `1px solid ${borderClr}`, 
                borderRadius: '4px', 
                padding: '8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                minHeight: '100px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span className="font-mono" style={{ fontSize: '9px', color: '#94a3b8' }}>
                    STEP 0{idx + 1}
                  </span>
                  <span 
                    className="font-mono" 
                    style={{ 
                      fontSize: '9px', 
                      fontWeight: '700', 
                      color: isTriggered ? (idx === 4 ? '#c084fc' : '#f87171') : '#64748b' 
                    }}
                  >
                    {step.status || (isTriggered ? "ACTIVE" : "PENDING")}
                  </span>
                </div>
                
                <h4 className="font-hud" style={{ fontSize: '11px', fontWeight: '700', color: '#f8fafc', margin: '0 0 4px 0', lineHeight: 1.2 }}>
                  {step.title}
                </h4>
              </div>

              <p style={{ fontSize: '9px', color: '#cbd5e1', margin: 0, lineHeight: 1.3 }}>
                {step.consequence || step.detail}
              </p>
            </div>
          );
        })}
      </div>

    </div>
  );
}
