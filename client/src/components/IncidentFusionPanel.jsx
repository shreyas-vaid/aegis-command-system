import React from 'react';
import { 
  GitMerge, 
  ArrowDown, 
  CloudRain, 
  Waves, 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Radio, 
  Satellite, 
  Crosshair,
  Share2
} from 'lucide-react';

export default function IncidentFusionPanel({
  incidents = []
}) {
  const fusedChain = [
    {
      id: 1,
      title: "Heavy Rainfall (42 mm/h)",
      source: "Weather Radar & METAR",
      color: "#38bdf8",
      icon: CloudRain,
      detail: "Localized atmospheric saturation stalls over North-West basin."
    },
    {
      id: 2,
      title: "Water Expansion (+3.4m Crest)",
      source: "IoT River Gauges",
      color: "#0284c7",
      icon: Waves,
      detail: "River Basin breaches levee berm; flood plain rapidly expands."
    },
    {
      id: 3,
      title: "Bridge 17 Stress & Road 17 Blockage",
      source: "Satellite SAR + Citizen 911",
      color: "#f59e0b",
      icon: AlertTriangle,
      detail: "Culvert washout on Road 17; Bridge 17 pylon deflection of 14cm."
    },
    {
      id: 4,
      title: "Hospital Access Failure",
      source: "EMS Radio Feed Unit #12",
      color: "#ef4444",
      icon: ShieldAlert,
      detail: "Direct ambulance transit to South General Level-1 Trauma severed."
    },
    {
      id: 5,
      title: "Trauma Care Collapse Risk",
      source: "Hospital Telemetry Core",
      color: "#dc2626",
      icon: Activity,
      detail: "South General load accelerates to 94%; critical surge without intervention."
    }
  ];

  return (
    <div className="hud-panel hud-bracket" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      
      {/* Panel Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Share2 size={16} color="#06b6d4" />
          <span className="font-hud" style={{ fontSize: '14px', fontWeight: '700', letterSpacing: '0.08em', color: '#f8fafc' }}>
            INCIDENT FUSION ENGINE // MULTI-SIGNAL SYNTHESIS
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="badge-status badge-high-risk" style={{ fontSize: '10px', padding: '2px 6px' }}>
            FUSION CONFIDENCE: 94%
          </span>
        </div>
      </div>

      {/* Cluster Meta */}
      <div style={{ background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: '4px', padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="font-mono" style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '700' }}>
            INCIDENT CLUSTER #027
          </span>
          <p style={{ margin: 0, fontSize: '12px', color: '#e2e8f0', fontWeight: '600' }}>
            South Hospital Corridor Isolation &amp; Arterial Inundation
          </p>
        </div>
        <div className="font-mono" style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'right' }}>
          5 Sources Fused · Corr: 0.91
        </div>
      </div>

      {/* Visual Causality Flow (Step by step with downward connecting arrows) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
        {fusedChain.map((step, idx) => {
          const Icon = step.icon;
          const isLast = idx === fusedChain.length - 1;

          return (
            <React.Fragment key={step.id}>
              {/* Step Card */}
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  background: 'rgba(12, 17, 26, 0.85)', 
                  border: `1px solid ${step.color}40`, 
                  borderRadius: '4px', 
                  padding: '7px 10px',
                  borderLeft: `4px solid ${step.color}`
                }}
              >
                <div style={{ 
                  width: '26px', 
                  height: '26px', 
                  borderRadius: '4px', 
                  background: `${step.color}20`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={14} color={step.color} />
                </div>
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="font-hud" style={{ fontSize: '12px', fontWeight: '700', color: '#f8fafc' }}>
                      {step.title}
                    </span>
                    <span className="font-mono" style={{ fontSize: '9px', color: '#94a3b8' }}>
                      {step.source}
                    </span>
                  </div>
                  <p style={{ fontSize: '10px', color: '#94a3b8', margin: '2px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {step.detail}
                  </p>
                </div>
              </div>

              {/* Connecting Down Arrow */}
              {!isLast && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '1px 0' }}>
                  <ArrowDown size={13} color="#06b6d4" style={{ opacity: 0.6 }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Raw Incoming Signals Ticker / List */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px' }}>
        <span className="font-hud" style={{ fontSize: '11px', color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          RAW SENSOR TELEMETRY &amp; CALLS ({incidents.length} INGESTED):
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px', maxHeight: '110px', overflowY: 'auto' }}>
          {incidents.map((inc) => (
            <div key={inc.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', background: 'rgba(10, 14, 22, 0.6)', padding: '3px 6px', borderRadius: '2px' }} className="font-mono">
              <span style={{ color: inc.zone === 'D' ? '#ef4444' : inc.zone === 'E' ? '#c084fc' : '#38bdf8' }}>
                [{inc.source}] #{inc.id}
              </span>
              <span style={{ color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                {inc.summary}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
