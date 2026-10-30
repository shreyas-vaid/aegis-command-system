import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Cpu, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Compass, 
  ArrowRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { AegisAnimatedNumber } from './aegis-interactive';
import { getZoneExplanation } from '../services/api';

export default function ExplainableAIScreen({
  onEnterCommandCenter,
  explanation: initialExplanation,
  zoneId = 'D'
}) {
  const [activeTab, setActiveTab] = useState('RECOMMENDATIONS'); // 'RECOMMENDATIONS' | 'XAI_FACTORS'
  const [explanation, setExplanation] = useState(initialExplanation);
  const [isSyncing, setIsSyncing] = useState(!initialExplanation);

  useEffect(() => {
    if (initialExplanation) {
      setExplanation(initialExplanation);
      return;
    }
    let isMounted = true;
    setIsSyncing(true);
    getZoneExplanation(zoneId || 'D')
      .then(data => {
        if (isMounted && data) setExplanation(data);
      })
      .catch(err => {
        console.warn('[AEGIS-API] Explanation fallback:', err.message);
      })
      .finally(() => {
        if (isMounted) setIsSyncing(false);
      });
    return () => { isMounted = false; };
  }, [initialExplanation, zoneId]);

  // Recommendations data with clear AI vs Confirmed Operational Decision badges
  const recommendations = [
    {
      id: 'REC-01',
      title: 'Arterial Road 17 Breach Diversion & Bypass Staging',
      priority: 'PRIORITY 1',
      priorityColor: '#EF4444',
      type: 'AI_ADVISORY', // AI-Generated vs Confirmed
      typeLabel: 'AI STRATEGIC ADVISORY',
      target: 'Zone D (South General Trauma Corridor)',
      action: 'Stage 3 Advanced Life Support ambulances via Road 12 elevated bypass; deploy Swift Water extraction squad to culvert breach.',
      reasoning: 'Road 17 culvert failure represents the single catastrophic bottleneck cutting off 2,900 civilians and driving 94% hospital intake saturation.',
      expectedImpact: '-34% Risk Index reduction in Sector D within 20 minutes',
      status: 'PENDING OPERATOR CONFIRMATION'
    },
    {
      id: 'REC-02',
      title: 'Sector E Autonomous Reconnaissance & Mesh Uplink',
      priority: 'PRIORITY 2',
      priorityColor: '#F59E0B',
      type: 'AI_ADVISORY',
      typeLabel: 'AI STRATEGIC ADVISORY',
      target: 'Zone E (East Delta Blackout Sector)',
      action: 'Launch 2 thermal aerial drones and dispatch mobile satellite telemetry relay vehicle to perimeter guardpost.',
      reasoning: '88% sensor blackout conceals 140+ stalled vehicle transponders with zero 911 phone capability. High probability of silent drowning.',
      expectedImpact: 'Restores 92% telemetry fidelity across unmonitored basin',
      status: 'PENDING OPERATOR CONFIRMATION'
    },
    {
      id: 'REC-03',
      title: 'Emergency ICU Generator Flood Shoring Barrier',
      priority: 'PRIORITY 1',
      priorityColor: '#EF4444',
      type: 'CONFIRMED_DIRECTIVE',
      typeLabel: 'CONFIRMED OPERATIONAL DIRECTIVE',
      target: 'Zone D (South General Trauma Center ICU Substation)',
      action: 'Dispatch Heavy Convoy with 2,400 rapid polymer sandbags to reinforce electrical generator substation perimeter.',
      reasoning: 'Water depth at hospital basement is 0.4m; electrical short threatens ventilator and life-support array within 45 minutes.',
      expectedImpact: 'Guarantees continuous hospital power for 72+ hours',
      status: 'CONFIRMED BY INCIDENT COMMANDER'
    },
    {
      id: 'REC-04',
      title: 'Levee Berm 2 Hydro-Scour Stabilization',
      priority: 'PRIORITY 3',
      priorityColor: '#00F0FF',
      type: 'AI_ADVISORY',
      typeLabel: 'AI STRATEGIC ADVISORY',
      target: 'Zone C (River Basin Levee Milepost 4)',
      action: 'Engineering heavy units reinforce River Basin levee berm with rock gabions before secondary cresting surge.',
      reasoning: 'Stream flow at 410 m³/s causes 12-meter fissure. Failure will trigger unmitigated flooding into Zone B commercial district.',
      expectedImpact: 'Prevents cascading inundation into Sector 17',
      status: 'PENDING OPERATOR CONFIRMATION'
    }
  ];

  const defaultFactors = [
    { name: "Population exposure", points: 31, color: "#EF4444", desc: "2,900 dense urban residents directly exposed in flood inundation basin." },
    { name: "Infrastructure vulnerability", points: 24, color: "#F59E0B", desc: "Culvert washout completely obstructs primary ambulance arterial to Trauma Center." },
    { name: "Road connectivity", points: 19, color: "#EF4444", desc: "Road 17 completely severed; secondary roads at 22% access capacity." },
    { name: "Weather severity", points: 14, color: "#00F0FF", desc: "42 mm/hr convective rainfall volume exceeds drainage culvert capacity." },
    { name: "Incident reports", points: 8, color: "#C8B99D", desc: "Surge of 14 concurrent 911 trauma dispatch calls." },
    { name: "Power & fiber telemetry", points: 8, color: "#8B7FA8", desc: "Direct fiber connection to trauma center degraded under flooding." }
  ];

  const factorBars = defaultFactors.map((df, idx) => {
    const apiItem = explanation?.factorBreakdown?.[idx] || explanation?.factors?.[idx];
    if (apiItem) {
      return {
        ...df,
        name: apiItem.name || apiItem.factor || df.name,
        points: apiItem.points || apiItem.impact || df.points
      };
    }
    return df;
  });

  const assessedRisk = explanation?.risk !== undefined ? explanation.risk : 96;
  const dominantTrigger = explanation?.dominantTrigger || "Road 17 has suffered sudden culvert collapse due to +3.4m basin overflow. Direct trauma ambulance access to South General Hospital is 100% blocked.";

  return (
    <div style={{
      maxWidth: '1240px',
      margin: '0 auto',
      width: '100%',
      padding: '24px 28px 60px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '5px',
            background: 'rgba(0, 240, 255, 0.12)',
            border: '1px solid var(--border-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-cyan)'
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="font-hud" style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
              AI RECOMMENDATIONS &amp; EXPLAINABLE RISK ATTRIBUTION
            </h1>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              BAYESIAN DECISION SUPPORT MATRIX // DETERMINISTIC FACTORS VS HUMAN DIRECTIVES
            </div>
          </div>
        </div>

        {/* View Toggle Tabs */}
        <div className="aegis-filter-group">
          <button
            onClick={() => setActiveTab('RECOMMENDATIONS')}
            className={`aegis-filter-pill ${activeTab === 'RECOMMENDATIONS' ? 'active' : ''}`}
            style={{ fontSize: '11px', padding: '6px 14px' }}
          >
            RECOMMENDED ACTIONS ({recommendations.length})
          </button>
          <button
            onClick={() => setActiveTab('XAI_FACTORS')}
            className={`aegis-filter-pill ${activeTab === 'XAI_FACTORS' ? 'active' : ''}`}
            style={{ fontSize: '11px', padding: '6px 14px' }}
          >
            ZONE {zoneId} ATTRIBUTION BREAKDOWN (XAI)
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          TAB 1: STRATEGIC RECOMMENDATIONS
      ────────────────────────────────────────────────────────────────── */}
      {activeTab === 'RECOMMENDATIONS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Advisory vs Confirmed Notice */}
          <div style={{
            background: 'rgba(0, 240, 255, 0.06)',
            border: '1px solid var(--border-accent)',
            borderRadius: '6px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: 'var(--text-primary)',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={16} color="var(--color-cyan)" />
              <span>
                <strong>OPERATIONAL SAFEGUARD:</strong> AI recommendations require formal Incident Commander confirmation prior to fleet dispatch.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span className="aegis-badge badge-sand" style={{ fontSize: '9px' }}>AI SUGGESTION</span>
              <span className="aegis-badge badge-normal" style={{ fontSize: '9px' }}>CONFIRMED DIRECTIVE</span>
            </div>
          </div>

          {/* Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
            {recommendations.map(rec => {
              const isConfirmed = rec.type === 'CONFIRMED_DIRECTIVE';

              return (
                <div
                  key={rec.id}
                  className="aegis-card"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    borderLeft: `4px solid ${rec.priorityColor}`
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span className={`aegis-badge ${isConfirmed ? 'badge-normal' : 'badge-sand'}`} style={{ fontSize: '9px' }}>
                        {isConfirmed ? <ShieldCheck size={11} /> : <Sparkles size={11} />}
                        {rec.typeLabel}
                      </span>
                      <span className="font-mono" style={{ fontSize: '10px', color: rec.priorityColor, fontWeight: '700' }}>
                        {rec.priority}
                      </span>
                    </div>

                    <h3 className="font-hud" style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF', margin: '4px 0 6px 0' }}>
                      {rec.title}
                    </h3>

                    <div className="font-mono" style={{ fontSize: '10px', color: 'var(--color-sand)', marginBottom: '8px' }}>
                      TARGET: {rec.target}
                    </div>

                    <div style={{ background: 'var(--bg-surface-elevated)', padding: '10px 12px', borderRadius: '4px', marginBottom: '10px', border: '1px solid var(--border-subtle)' }}>
                      <span className="aegis-data-label" style={{ color: 'var(--color-cyan)' }}>PROPOSED TACTICAL ACTION</span>
                      <p style={{ fontSize: '12px', color: '#FFFFFF', margin: '3px 0 0 0', lineHeight: 1.4 }}>
                        {rec.action}
                      </p>
                    </div>

                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      <strong>Rationale:</strong> {rec.reasoning}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '10px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    flexWrap: 'wrap',
                    gap: '6px'
                  }}>
                    <span style={{ color: '#10B981' }}>
                      ▲ {rec.expectedImpact}
                    </span>

                    <button
                      onClick={onEnterCommandCenter}
                      className="aegis-btn aegis-btn-secondary"
                      style={{ fontSize: '10px', padding: '4px 10px' }}
                    >
                      <span>STAGE IN FLEET</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          TAB 2: ZONE RISK ATTRIBUTION DECOMPOSITION (XAI)
      ────────────────────────────────────────────────────────────────── */}
      {activeTab === 'XAI_FACTORS' && (
        <div className="aegis-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
            <div>
              <span className="aegis-data-label">SECTOR {zoneId} ATTRIBUTION BREAKDOWN</span>
              <h2 className="font-hud" style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
                WHY SECTOR {zoneId} IS AT ELEVATED RISK ({assessedRisk}%)
              </h2>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="font-mono" style={{ fontSize: '11px', color: '#EF4444' }}>CRITICAL RISK FLUX</span>
              <div className="font-hud tabular-nums" style={{ fontSize: '28px', fontWeight: '800', color: '#EF4444', lineHeight: 1 }}>
                <AegisAnimatedNumber value={assessedRisk} suffix="%" />
              </div>
            </div>
          </div>

          {/* Trigger Alert */}
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            borderLeft: '4px solid #EF4444',
            padding: '14px 16px',
            borderRadius: '4px',
            fontSize: '12.5px',
            color: '#FFFFFF',
            lineHeight: 1.45
          }}>
            <strong>Dominant Risk Vector:</strong> {dominantTrigger}
          </div>

          {/* 6 Contributing Factors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {factorBars.map((factor, idx) => (
              <div key={idx} style={{ background: 'var(--bg-surface-elevated)', padding: '12px 14px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', color: '#FFFFFF' }}>{factor.name}</span>
                  <span className="font-mono" style={{ fontWeight: '700', color: factor.color }}>+{factor.points} PTS</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
                  <div style={{ width: `${(factor.points / 35) * 100}%`, height: '100%', background: factor.color, borderRadius: '3px' }} />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{factor.desc}</div>
              </div>
            ))}
          </div>

          <button
            onClick={onEnterCommandCenter}
            className="aegis-btn aegis-btn-primary"
            style={{ alignSelf: 'flex-start', padding: '10px 20px', fontSize: '12px' }}
          >
            <span>PROCEED TO FLEET DEPLOYMENT</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

    </div>
  );
}
