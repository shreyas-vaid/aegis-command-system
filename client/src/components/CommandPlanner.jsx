import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Wrench, 
  Flame, 
  Truck, 
  Sparkles, 
  CheckCircle2, 
  Play, 
  ShieldCheck, 
  HelpCircle, 
  ArrowRight,
  TrendingDown,
  Layers,
  ChevronRight
} from 'lucide-react';
import { getRecommendations } from '../services/api';


export default function CommandPlanner({
  resources = {},
  onDeployPlan,
  loading = false,
  onApplyAIPlan
}) {
  const [activeTab, setActiveTab] = useState('human'); // 'human' | 'ai' | 'comparison'
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Human allocation state across zones
  const [plan, setPlan] = useState({
    medical: { A: 0, B: 0, C: 1, D: 3, E: 1 },
    engineering: { A: 0, B: 0, C: 2, D: 2, E: 0 },
    fire: { A: 0, B: 0, C: 1, D: 0, E: 2 },
    logistics: { A: 1, B: 4, C: 2, D: 1, E: 0 }
  });

  const totals = resources.total || { medical: 5, fire: 3, logistics: 8, engineering: 4 };

  // Calculate allocated totals
  const allocated = {
    medical: Object.values(plan.medical).reduce((a, b) => a + b, 0),
    engineering: Object.values(plan.engineering).reduce((a, b) => a + b, 0),
    fire: Object.values(plan.fire).reduce((a, b) => a + b, 0),
    logistics: Object.values(plan.logistics).reduce((a, b) => a + b, 0)
  };

  const handleUpdate = (resourceType, zoneId, delta) => {
    const current = plan[resourceType][zoneId] || 0;
    const nextVal = current + delta;
    if (nextVal < 0) return;

    // Check capacity
    const currentTotal = Object.values(plan[resourceType]).reduce((a, b) => a + b, 0);
    if (delta > 0 && currentTotal >= totals[resourceType]) {
      return; // Fleet capacity reached
    }

    setPlan(prev => ({
      ...prev,
      [resourceType]: {
        ...prev[resourceType],
        [zoneId]: nextVal
      }
    }));
  };

  const fetchAiPlan = () => {
    setLoadingAi(true);
    getRecommendations()
      .then(data => {
        setAiRecommendation(data);
        setLoadingAi(false);
      })
      .catch(err => {
        console.error("Failed to fetch AI recommendation:", err);
        setLoadingAi(false);
      });
  };

  useEffect(() => {
    fetchAiPlan();
  }, []);

  const applyAiRecommendation = () => {
    if (aiRecommendation?.assignments) {
      setPlan(JSON.parse(JSON.stringify(aiRecommendation.assignments)));
      setActiveTab('human');
    }
  };

  const zonesList = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="hud-panel hud-bracket" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      
      {/* Header and Mode Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
        <div>
          <span className="font-hud" style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '0.08em', color: '#f8fafc' }}>
            TACTICAL COMMAND // HUMAN VS AI RESPONSE
          </span>
          <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
            Decision Support Architecture · Human retains ultimate command authority
          </p>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className={`btn-hud ${activeTab === 'human' ? 'btn-hud-active' : ''}`}
            onClick={() => setActiveTab('human')}
            style={{ fontSize: '11px', padding: '3px 8px' }}
          >
            HUMAN RESPONSE
          </button>
          <button
            className={`btn-hud ${activeTab === 'ai' ? 'btn-hud-active' : ''}`}
            onClick={() => { setActiveTab('ai'); if (!aiRecommendation) fetchAiPlan(); }}
            style={{ fontSize: '11px', padding: '3px 8px', color: '#67e8f9' }}
          >
            <Sparkles size={12} /> AI RECOMMENDATION
          </button>
          <button
            className={`btn-hud ${activeTab === 'comparison' ? 'btn-hud-active' : ''}`}
            onClick={() => setActiveTab('comparison')}
            style={{ fontSize: '11px', padding: '3px 8px' }}
          >
            PROJECTION MATRIX
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: HUMAN RESPONSE ALLOCATION */}
      {/* ========================================================================= */}
      {activeTab === 'human' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* Resource Fleet Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '6px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>MEDICAL UNITS</span>
              <span className="font-mono" style={{ fontSize: '13px', fontWeight: '700', color: '#38bdf8' }}>
                {allocated.medical} / {totals.medical}
              </span>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '6px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>ENGINEERING</span>
              <span className="font-mono" style={{ fontSize: '13px', fontWeight: '700', color: '#fbbf24' }}>
                {allocated.engineering} / {totals.engineering}
              </span>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '6px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>FIRE / RESCUE</span>
              <span className="font-mono" style={{ fontSize: '13px', fontWeight: '700', color: '#f87171' }}>
                {allocated.fire} / {totals.fire}
              </span>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '6px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>LOGISTICS</span>
              <span className="font-mono" style={{ fontSize: '13px', fontWeight: '700', color: '#34d399' }}>
                {allocated.logistics} / {totals.logistics}
              </span>
            </div>
          </div>

          {/* Allocation Matrix Table */}
          <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', background: 'rgba(8, 12, 18, 0.7)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'center' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '6px', textAlign: 'left', fontFamily: 'var(--font-hud)', color: '#94a3b8' }}>ZONE</th>
                  <th style={{ padding: '6px', color: '#38bdf8' }}>MED (5)</th>
                  <th style={{ padding: '6px', color: '#fbbf24' }}>ENG (4)</th>
                  <th style={{ padding: '6px', color: '#f87171' }}>FIRE (3)</th>
                  <th style={{ padding: '6px', color: '#34d399' }}>LOG (8)</th>
                </tr>
              </thead>
              <tbody>
                {zonesList.map(zid => (
                  <tr key={zid} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '6px', textAlign: 'left', fontWeight: '700', color: zid === 'D' ? '#ef4444' : zid === 'E' ? '#c084fc' : '#f8fafc' }}>
                      ZONE {zid} {zid === 'E' && '(GAP)'}
                    </td>
                    
                    {/* Medical */}
                    <td style={{ padding: '4px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <button className="btn-hud" style={{ padding: '1px 5px', fontSize: '10px' }} onClick={() => handleUpdate('medical', zid, -1)}>-</button>
                        <span className="font-mono" style={{ width: '16px', fontWeight: '700' }}>{plan.medical[zid]}</span>
                        <button className="btn-hud" style={{ padding: '1px 5px', fontSize: '10px' }} onClick={() => handleUpdate('medical', zid, 1)}>+</button>
                      </div>
                    </td>

                    {/* Engineering */}
                    <td style={{ padding: '4px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <button className="btn-hud" style={{ padding: '1px 5px', fontSize: '10px' }} onClick={() => handleUpdate('engineering', zid, -1)}>-</button>
                        <span className="font-mono" style={{ width: '16px', fontWeight: '700' }}>{plan.engineering[zid]}</span>
                        <button className="btn-hud" style={{ padding: '1px 5px', fontSize: '10px' }} onClick={() => handleUpdate('engineering', zid, 1)}>+</button>
                      </div>
                    </td>

                    {/* Fire / Rescue */}
                    <td style={{ padding: '4px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <button className="btn-hud" style={{ padding: '1px 5px', fontSize: '10px' }} onClick={() => handleUpdate('fire', zid, -1)}>-</button>
                        <span className="font-mono" style={{ width: '16px', fontWeight: '700' }}>{plan.fire[zid]}</span>
                        <button className="btn-hud" style={{ padding: '1px 5px', fontSize: '10px' }} onClick={() => handleUpdate('fire', zid, 1)}>+</button>
                      </div>
                    </td>

                    {/* Logistics */}
                    <td style={{ padding: '4px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <button className="btn-hud" style={{ padding: '1px 5px', fontSize: '10px' }} onClick={() => handleUpdate('logistics', zid, -1)}>-</button>
                        <span className="font-mono" style={{ width: '16px', fontWeight: '700' }}>{plan.logistics[zid]}</span>
                        <button className="btn-hud" style={{ padding: '1px 5px', fontSize: '10px' }} onClick={() => handleUpdate('logistics', zid, 1)}>+</button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Button */}
          <button 
            className="btn-hud btn-hud-primary"
            onClick={() => onDeployPlan(plan)}
            disabled={loading}
            style={{ width: '100%', padding: '8px', fontSize: '13px' }}
          >
            <Play size={14} /> DEPLOY HUMAN RESPONSE STRATEGY INTO DIGITAL TWIN
          </button>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AI RECOMMENDATION & RATIONALE */}
      {/* ========================================================================= */}
      {activeTab === 'ai' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '4px', padding: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span className="font-hud" style={{ fontSize: '13px', fontWeight: '700', color: '#67e8f9' }}>
                OPTIMAL BOTTLENECK INTERVENTION STRATEGY
              </span>
              <span className="badge-status badge-stable" style={{ fontSize: '10px' }}>
                AI CONFIDENCE: 96%
              </span>
            </div>
            
            {/* Rationale Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#cbd5e1' }}>
              {aiRecommendation?.rationale ? (
                aiRecommendation.rationale.map((item, idx) => (
                  <div key={idx} style={{ background: 'rgba(10, 14, 22, 0.8)', padding: '6px 8px', borderRadius: '3px', borderLeft: '3px solid #06b6d4' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#f1f5f9' }}>
                      <span>{item.target}</span>
                      <span style={{ color: '#38bdf8' }}>{item.primaryFocus}</span>
                    </div>
                    <p style={{ margin: '2px 0 0 0', color: '#94a3b8' }}>
                      <strong>Why: </strong>{item.why}
                    </p>
                  </div>
                ))
              ) : (
                <div style={{ padding: '10px', textAlign: 'center' }}>Loading AI strategy matrix...</div>
              )}
            </div>

            {/* Projected Outcome */}
            <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '10px' }} className="font-mono">
              <div style={{ background: 'rgba(16, 185, 129, 0.12)', padding: '5px', borderRadius: '2px', color: '#34d399' }}>
                Zone D Risk: <strong style={{ color: '#fff' }}>-34% Reduction</strong>
              </div>
              <div style={{ background: 'rgba(56, 189, 248, 0.12)', padding: '5px', borderRadius: '2px', color: '#38bdf8' }}>
                Hospital Load: <strong style={{ color: '#fff' }}>Capped at 68%</strong>
              </div>
            </div>

          </div>

          {/* Adopt Plan Button */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn-hud btn-hud-primary"
              onClick={applyAiRecommendation}
              style={{ flex: 1, padding: '7px' }}
            >
              <CheckCircle2 size={14} /> ADOPT AI ALLOCATION TO EDIT
            </button>
            <button 
              className="btn-hud"
              onClick={() => onDeployPlan(aiRecommendation.assignments)}
              style={{ flex: 1, padding: '7px', borderColor: '#06b6d4', color: '#22d3ee' }}
            >
              <Play size={14} /> RUN AI STRATEGY DIRECTLY
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PROJECTION MATRIX (HUMAN VS AI VS BASELINE) */}
      {/* ========================================================================= */}
      {activeTab === 'comparison' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
          <div style={{ background: 'rgba(10, 14, 22, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th style={{ padding: '6px', color: '#94a3b8' }}>METRIC</th>
                  <th style={{ padding: '6px', color: '#ef4444' }}>UNMITIGATED</th>
                  <th style={{ padding: '6px', color: '#fbbf24' }}>HUMAN PLAN</th>
                  <th style={{ padding: '6px', color: '#34d399' }}>AI PLAN</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '6px', fontWeight: '600' }}>Hospital Saturation (+30m)</td>
                  <td style={{ padding: '6px', color: '#f87171' }}>94% (Code Red)</td>
                  <td style={{ padding: '6px', color: '#fde047' }}>78% (Manageable)</td>
                  <td style={{ padding: '6px', color: '#4ade80' }}>68% (Stabilized)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '6px', fontWeight: '600' }}>Road 17 Clearing ETA</td>
                  <td style={{ padding: '6px', color: '#f87171' }}>Impassable (0%)</td>
                  <td style={{ padding: '6px', color: '#fde047' }}>22 mins</td>
                  <td style={{ padding: '6px', color: '#4ade80' }}>14 mins</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '6px', fontWeight: '600' }}>Zone E Delta Penetration</td>
                  <td style={{ padding: '6px', color: '#f87171' }}>Blind Blackout</td>
                  <td style={{ padding: '6px', color: '#fde047' }}>Recon Drone</td>
                  <td style={{ padding: '6px', color: '#4ade80' }}>Amphibious + Drone</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px', fontWeight: '600' }}>Projected Casualties</td>
                  <td style={{ padding: '6px', color: '#f87171' }}>Critical Surge</td>
                  <td style={{ padding: '6px', color: '#fde047' }}>-64% Minimized</td>
                  <td style={{ padding: '6px', color: '#4ade80' }}>-88% Minimized</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
