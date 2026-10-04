import React from 'react';
import { 
  GitMerge, 
  ArrowDown, 
  CloudRain, 
  Waves, 
  AlertTriangle, 
  ShieldAlert, 
  Radio, 
  Activity, 
  Sparkles,
  ChevronRight,
  Share2
} from 'lucide-react';

export default function IncidentAnalysisScreen({
  onProceedToExplain
}) {
  const signalNodes = [
    { id: 1, name: "FLASH FLOOD", desc: "Atmospheric saturation dumped 42mm/h; river crest +3.4m", icon: Waves, color: "#38bdf8" },
    { id: 2, name: "ROAD FAILURE", desc: "Bridge 17 structural stress & Road 17 culvert collapsed", icon: AlertTriangle, color: "#f59e0b" },
    { id: 3, name: "HOSPITAL ACCESS FAILURE", desc: "Primary ambulance corridor to Level-1 Trauma severed", icon: ShieldAlert, color: "#ef4444" },
    { id: 4, name: "COMMUNICATION LOSS", desc: "Zone E cell blackout with 140+ stalled vehicle transponders", icon: Radio, color: "#c084fc" }
  ];

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div className="hud-panel p-3" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span className="font-hud" style={{ fontSize: '12px', letterSpacing: '0.14em', color: '#06b6d4' }}>
            STAGE 4 // INCIDENT SYNTHESIS &amp; CORRELATION ENGINE
          </span>
          <h2 className="font-hud" style={{ fontSize: '22px', fontWeight: '700', color: '#f8fafc', margin: '2px 0 0 0' }}>
            INCIDENT FUSION ENGINE // 5 SIGNALS FUSED
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge-status badge-high-risk" style={{ fontSize: '11px' }}>
            CORRELATION CONFIDENCE: 96%
          </span>
        </div>
      </div>

      {/* Visual Fusion Flow Graph */}
      <div className="hud-panel hud-bracket" style={{ padding: '24px', background: 'rgba(11, 15, 24, 0.94)', border: '1px solid rgba(6, 182, 212, 0.35)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        
        {/* Top Input Signals */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', width: '100%' }}>
          {signalNodes.map(node => {
            const Icon = node.icon;
            return (
              <div
                key={node.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: `1px solid ${node.color}50`,
                  borderTop: `4px solid ${node.color}`,
                  borderRadius: '4px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={16} color={node.color} />
                  <span className="font-hud" style={{ fontSize: '12px', fontWeight: '700', color: '#f8fafc' }}>
                    {node.name}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8', lineHeight: 1.3 }}>
                  {node.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Animated Connecting Flow Downward */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', margin: '4px 0' }}>
          <div style={{ display: 'flex', gap: '80px', color: '#06b6d4', opacity: 0.7 }}>
            <ArrowDown size={18} />
            <ArrowDown size={18} />
            <ArrowDown size={18} />
            <ArrowDown size={18} />
          </div>
          <span className="font-mono" style={{ fontSize: '11px', color: '#67e8f9', background: 'rgba(6, 182, 212, 0.1)', padding: '2px 10px', borderRadius: '10px' }}>
            ✦ NEURAL MULTI-MODAL SYNTHESIS APPLIED
          </span>
        </div>

        {/* Resulting Fused Incident Cluster Card */}
        <div style={{
          width: '100%',
          maxWidth: '720px',
          background: 'rgba(69, 10, 10, 0.35)',
          border: '1px solid #ef4444',
          borderRadius: '6px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)'
        }}>
          <span className="badge-status badge-critical" style={{ fontSize: '11px', padding: '3px 10px', marginBottom: '8px' }}>
            CRITICAL CLUSTER IDENTIFIED
          </span>
          <h3 className="font-hud" style={{ fontSize: '24px', fontWeight: '700', color: '#fecaca', margin: 0 }}>
            INCIDENT CLUSTER #027: SOUTH TRAUMA CORRIDOR COLLAPSE
          </h3>
          <p style={{ fontSize: '13px', color: '#fca5a5', maxWidth: '580px', margin: '8px 0 16px 0', lineHeight: 1.4 }}>
            Atmospheric flood surge combined with Bridge 17 scouring and Road 17 culvert washout has isolated South General Hospital, while a simultaneous comms blackout conceals a high-casualty industrial pocket in Zone E.
          </p>

          {/* Primary Action Button */}
          <button
            className="btn-hud btn-hud-primary"
            onClick={onProceedToExplain}
            style={{ padding: '12px 32px', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Sparkles size={16} /> ANALYZE WHY (EXPLAINABLE AI) <ChevronRight size={16} />
          </button>
        </div>

      </div>

    </div>
  );
}
