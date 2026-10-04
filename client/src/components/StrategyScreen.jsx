import React, { useState, useEffect } from 'react';
import { User, Sparkles, Play, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AegisPrimaryCommand } from './aegis-controls';
import { Aegis3DCard, AegisAnimatedNumber } from './aegis-interactive';
import { getRecommendations } from '../services/api';

export default function StrategyScreen({
  onRunHumanPlan,
  onRunAiPlan
}) {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [isSyncingRecs, setIsSyncingRecs] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsSyncingRecs(true);
    getRecommendations({ missionId: '027', zoneId: 'D' })
      .then(res => {
        if (isMounted && res?.recommendations) {
          setRecommendations(res.recommendations);
        }
      })
      .catch(err => {
        console.warn('[AEGIS-API] Recommendations fallback:', err.message);
      })
      .finally(() => {
        if (isMounted) setIsSyncingRecs(false);
      });

    return () => { isMounted = false; };
  }, []);

  const handlePlanSelect = async (type, runner) => {
    setSelectedPlan(type);
    if (type === 'ai') {
      try {
        setIsSyncingRecs(true);
        const res = await getRecommendations({ missionId: '027', zoneId: 'D' }).catch(() => null);
        if (res?.recommendations) {
          setRecommendations(res.recommendations);
        }
      } finally {
        setIsSyncingRecs(false);
      }
    }
    setTimeout(() => {
      runner();
    }, 450);
  };

  return (
    <div style={{
      minHeight: '88vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      maxWidth: '1060px',
      margin: '0 auto',
      width: '100%'
    }}>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        
        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <span className="font-hud" style={{ fontSize: '12px', letterSpacing: '0.2em', color: '#d6c6a5', textTransform: 'uppercase' }}>
            STAGE 8 // DUAL RESPONSE FORMULATION &amp; STRATEGY DISPATCH
          </span>
          <h2 className="font-hud" style={{ fontSize: '32px', fontWeight: '800', color: '#eae5d8', margin: '4px 0 0 0', letterSpacing: '0.04em' }}>
            TACTICAL STRATEGY MODULES
          </h2>
          <span className="font-mono" style={{ fontSize: '11px', color: '#9fb5a4' }}>
            SELECT A STRATEGY OBJECT TO EXPAND &amp; EXECUTE DIRECT INTERVENTION
          </span>
        </div>

        {/* 2 System Module Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
          
          {/* MODULE 1: HUMAN COMMAND */}
          <Aegis3DCard
            accentColor="#d6c6a5"
            expandOnClick={true}
            onClick={() => handlePlanSelect('human', onRunHumanPlan)}
            style={{
              padding: '28px',
              border: selectedPlan === 'human' ? '1px solid #d6c6a5' : '1px solid rgba(214, 198, 165, 0.22)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '18px',
              background: 'rgba(14, 27, 21, 0.92)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.7), inset 0 1px 0 rgba(214, 198, 165, 0.15)'
            }}
          >
            <div>
              {/* Module Header Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid rgba(214, 198, 165, 0.12)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <User size={22} color="#d6c6a5" />
                  <div>
                    <h3 className="font-hud" style={{ fontSize: '20px', fontWeight: '800', color: '#eae5d8', margin: 0 }}>
                      HUMAN COMMAND
                    </h3>
                    <span className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4', letterSpacing: '0.08em' }}>
                      OPERATOR-GUIDED DIRECT DISPATCH
                    </span>
                  </div>
                </div>

                <span className="font-mono" style={{ fontSize: '11px', color: '#d6c6a5', border: '1px solid rgba(214, 198, 165, 0.3)', padding: '2px 8px', borderRadius: '2px', background: 'rgba(214, 198, 165, 0.08)' }}>
                  [ MANUAL ]
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '14px 0' }}>
                <div style={{ background: 'rgba(8, 13, 10, 0.65)', padding: '10px 14px', borderRadius: '4px', fontSize: '12px', color: '#eae5d8', borderLeft: '3px solid #d6c6a5' }}>
                  <strong>1. </strong> Send Ambulance Units to Zone D trauma intake.
                </div>
                <div style={{ background: 'rgba(8, 13, 10, 0.65)', padding: '10px 14px', borderRadius: '4px', fontSize: '12px', color: '#eae5d8', borderLeft: '3px solid #d6c6a5' }}>
                  <strong>2. </strong> Deploy Recon Drone to Zone E delta blackout.
                </div>
                <div style={{ background: 'rgba(8, 13, 10, 0.65)', padding: '10px 14px', borderRadius: '4px', fontSize: '12px', color: '#eae5d8', borderLeft: '3px solid #d6c6a5' }}>
                  <strong>3. </strong> Send Rescue Team to Road 17 bridge breach.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <AegisPrimaryCommand
                label="RUN HUMAN PLAN"
                subtitle="OPERATOR DIRECT OVERRIDE"
                status="SYSTEM READY"
                icon="◈"
                onClick={() => handlePlanSelect('human', onRunHumanPlan)}
                variant="beige"
                width="100%"
              />
              <span className="font-mono" style={{ fontSize: '9px', color: '#9fb5a4', textAlign: 'center', marginTop: '4px', letterSpacing: '0.08em' }}>
                TACTICAL DIRECT COMMAND · MANUAL CONTROL
              </span>
            </div>
          </Aegis3DCard>

          {/* MODULE 2: AI COMMAND */}
          <Aegis3DCard
            accentColor="#6f947d"
            expandOnClick={true}
            onClick={() => handlePlanSelect('ai', onRunAiPlan)}
            style={{
              padding: '28px',
              border: selectedPlan === 'ai' ? '1px solid #6f947d' : '1px solid rgba(111, 148, 125, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '18px',
              background: 'rgba(14, 27, 21, 0.94)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 25px rgba(111, 148, 125, 0.15), inset 0 1px 0 rgba(111, 148, 125, 0.2)'
            }}
          >
            <div>
              {/* Module Header Bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid rgba(214, 198, 165, 0.12)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={22} color="#6f947d" />
                  <div>
                    <h3 className="font-hud" style={{ fontSize: '20px', fontWeight: '800', color: '#eae5d8', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      ✦ AI COMMAND
                    </h3>
                    <span className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4', letterSpacing: '0.08em' }}>
                      RESPONSE OPTIMIZATION MODEL
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="font-mono" style={{ fontSize: '9px', color: '#9fb5a4' }}>CONFIDENCE</div>
                  <div className="font-mono" style={{ fontSize: '14px', fontWeight: '800', color: '#d6c6a5' }}>
                    <AegisAnimatedNumber value={91} suffix="%" />
                  </div>
                </div>
              </div>

              {/* Recommended Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                {recommendations && recommendations.length > 0 ? (
                  recommendations.map((rec, idx) => (
                    <div key={idx} style={{ background: 'rgba(25, 58, 42, 0.35)', padding: '8px 12px', borderRadius: '4px', fontSize: '12px', color: '#eae5d8', borderLeft: '3px solid #6f947d' }}>
                      <strong>{idx + 1}. </strong> {rec.action} {rec.reason ? <span style={{ color: '#9fb5a4', fontSize: '11px' }}>({rec.reason})</span> : null}
                    </div>
                  ))
                ) : (
                  <>
                    <div style={{ background: 'rgba(25, 58, 42, 0.35)', padding: '8px 12px', borderRadius: '4px', fontSize: '12px', color: '#eae5d8', borderLeft: '3px solid #6f947d' }}>
                      <strong>1. </strong> Deploy Recon Drone to Zone E delta blackout.
                    </div>
                    <div style={{ background: 'rgba(25, 58, 42, 0.35)', padding: '8px 12px', borderRadius: '4px', fontSize: '12px', color: '#eae5d8', borderLeft: '3px solid #6f947d' }}>
                      <strong>2. </strong> Reroute ambulances via secondary Road 12 connector.
                    </div>
                    <div style={{ background: 'rgba(25, 58, 42, 0.35)', padding: '8px 12px', borderRadius: '4px', fontSize: '12px', color: '#eae5d8', borderLeft: '3px solid #6f947d' }}>
                      <strong>3. </strong> Deploy Mobile Medical Unit directly on-site to Zone D.
                    </div>
                    <div style={{ background: 'rgba(25, 58, 42, 0.35)', padding: '8px 12px', borderRadius: '4px', fontSize: '12px', color: '#eae5d8', borderLeft: '3px solid #6f947d' }}>
                      <strong>4. </strong> Restore communications with tactical satellite link.
                    </div>
                  </>
                )}
              </div>

              {/* WHY Reasoning */}
              <div style={{ background: 'rgba(8, 13, 10, 0.65)', border: '1px solid rgba(214, 198, 165, 0.08)', padding: '10px 12px', borderRadius: '4px', fontSize: '11px', color: '#9fb5a4', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className="font-hud" style={{ fontSize: '11px', color: '#d6c6a5', fontWeight: '700', letterSpacing: '0.08em' }}>
                  WHY THIS INTERVENTION?
                </span>
                <div>• "Zone E has highest information uncertainty (88% blackout)."</div>
                <div>• "Road 17 has 10% accessibility; Road 12 bypass saves 32 minutes."</div>
                <div>• "Hospital load approaching critical capacity (72% → 94%)."</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <AegisPrimaryCommand
                label="RUN AEGIS PLAN"
                subtitle="BAYESIAN HEURISTIC OPTIMIZATION"
                status="SYSTEM READY ↗"
                icon="◈"
                onClick={() => handlePlanSelect('ai', onRunAiPlan)}
                variant="sage"
                width="100%"
              />
              <span className="font-mono" style={{ fontSize: '9px', color: '#9fb5a4', textAlign: 'center', marginTop: '4px', letterSpacing: '0.08em' }}>
                BAYESIAN OPTIMIZATION · SINGLE POINT OF FAILURE HEURISTIC
              </span>
            </div>
          </Aegis3DCard>

        </div>

      </div>
    </div>
  );
}
