import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Cpu, ShieldAlert } from 'lucide-react';
import { AegisCommandCard, AegisActionControl } from './aegis-controls';
import { AegisAnimatedNumber } from './aegis-interactive';
import { getZoneExplanation } from '../services/api';

/**
 * ExplainableAIScreen
 * 
 * Stage 6 conforming to Section 4 & 5:
 * - Entire interactive command card
 * - Tactile magnetic action control
 * - Dynamic risk delta attribution from GET /api/zones/:id/explain
 */
export default function ExplainableAIScreen({
  onEnterCommandCenter,
  explanation: initialExplanation,
  zoneId = 'D'
}) {
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

  const defaultFactors = [
    { name: "Population exposure", points: 31, color: "var(--color-critical)", desc: "2,900 dense urban residents directly exposed in flood inundation basin." },
    { name: "Infrastructure vulnerability", points: 24, color: "var(--color-amber)", desc: "Culvert washout completely obstructs primary ambulance arterial to Trauma Center." },
    { name: "Road connectivity", points: 19, color: "var(--color-critical)", desc: "Road 17 completely severed; secondary roads at 22% access capacity." },
    { name: "Weather severity", points: 14, color: "var(--color-sage)", desc: "42 mm/hr convective rainfall volume exceeds drainage culvert capacity." },
    { name: "Incident reports", points: 8, color: "var(--color-beige)", desc: "Surge of 14 concurrent 911 trauma dispatch calls." },
    { name: "Power & fiber telemetry", points: 8, color: "var(--color-unknown)", desc: "Direct fiber connection to trauma center degraded under flooding." }
  ];

  // Dynamic factor points from API or fallback
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
      minHeight: '88vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      maxWidth: '920px',
      margin: '0 auto',
      width: '100%'
    }}>
      <AegisCommandCard
        title={`WHY THIS ZONE IS AT RISK — ZONE ${zoneId} ATTRIBUTION`}
        subtitle={isSyncing ? "XAI ATTRIBUTION · SYNCING TELEMETRY..." : "EXPLAINABLE RISK DECOMPOSITION · 6 KEY CONTRIBUTORS"}
        badge="CRITICAL FLUX"
        badgeColor="var(--color-critical)"
        active={true}
        actionLabel="ENTER COMMAND CENTER"
        onClick={onEnterCommandCenter}
        style={{ width: '100%', padding: '32px' }}
      >
        {/* Risk Score Decomposition Block */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          background: 'rgba(8, 13, 10, 0.75)',
          padding: '14px 20px',
          borderRadius: '4px',
          border: '1px solid rgba(214, 198, 165, 0.15)',
          margin: '12px 0 16px 0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-hud" style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '0.12em', color: 'var(--color-beige)' }}>
              RISK SCORE // ATTRIBUTION MATRIX
            </span>
            <span className="font-mono" style={{ fontSize: '13px', fontWeight: '800', color: assessedRisk >= 80 ? 'var(--color-critical)' : 'var(--color-amber)' }}>
              {assessedRisk}% RISK COEFFICIENT
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '12px' }}>
            {Array.from({ length: 20 }).map((_, i) => {
              const filled = i < Math.round(assessedRisk / 5);
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: '100%',
                    borderRadius: '2px',
                    background: filled
                      ? (i >= 16 ? 'var(--color-critical)' : i >= 12 ? 'var(--color-amber)' : 'var(--color-sage)')
                      : 'rgba(255, 255, 255, 0.08)',
                    boxShadow: filled ? '0 0 6px rgba(214, 198, 165, 0.2)' : 'none',
                    transition: 'all 0.4s ease'
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Risk Index Change */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(7, 16, 12, 0.75)',
          padding: '16px 22px',
          borderRadius: '4px',
          border: '1px solid rgba(214, 195, 154, 0.12)',
          marginBottom: '16px'
        }}>
          <div>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--color-sage-light)', letterSpacing: '0.08em' }}>PREVIOUS RISK</span>
            <div className="font-mono" style={{ fontSize: '22px', fontWeight: '700', color: 'var(--color-beige)' }}>
              <AegisAnimatedNumber value={61} /> / 100
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-critical)' }}>
            <TrendingUp size={26} />
            <span className="font-mono" style={{ fontSize: '20px', fontWeight: '800' }}>+35 PTS</span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="font-mono" style={{ fontSize: '11px', color: '#fca5a5', letterSpacing: '0.08em' }}>CURRENT ASSESSED RISK</span>
            <div className="font-mono" style={{ fontSize: '30px', fontWeight: '800', color: 'var(--color-critical)' }}>
              <AegisAnimatedNumber value={assessedRisk} /> / 100
            </div>
          </div>
        </div>

        {/* Animated Factor Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '8px 0 18px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-hud" style={{ fontSize: '12px', fontWeight: '800', color: 'var(--color-beige)', letterSpacing: '0.12em' }}>
              CONTRIBUTORS // WHY THIS ZONE IS AT RISK:
            </span>
            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--color-sage-light)' }}>
              FACTOR ATTRIBUTION WEIGHTS
            </span>
          </div>

          {factorBars.map((factor, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                <span className="font-hud" style={{ fontWeight: '700', color: 'var(--color-off-white)' }}>
                  {factor.name}
                </span>
                <span className="font-mono" style={{ fontWeight: '700', color: factor.color }}>
                  +{factor.points} PTS
                </span>
              </div>

              <div className="meter-track" style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  className="meter-fill"
                  style={{
                    width: `${(factor.points / 35) * 100}%`,
                    background: factor.color,
                    borderRadius: '4px',
                    transition: 'width 0.8s ease'
                  }}
                />
              </div>

              <span style={{ fontSize: '11px', color: 'var(--color-sage-light)', lineHeight: 1.4 }}>
                {factor.desc}
              </span>
            </div>
          ))}
        </div>

        {/* WHAT CHANGED? Alert Banner */}
        <div style={{
          background: 'rgba(217, 83, 79, 0.12)',
          borderLeft: '4px solid var(--color-critical)',
          padding: '16px',
          borderRadius: '3px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <AlertTriangle size={18} color="var(--color-critical)" />
            <span className="font-hud" style={{ fontSize: '13px', fontWeight: '700', color: '#fca5a5', letterSpacing: '0.08em' }}>
              CRITICAL VECTOR SHIFT DETECTED
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-off-white)', lineHeight: 1.5 }}>
            {dominantTrigger}
          </p>
        </div>

        {/* Magnetic Action Control */}
        <div style={{ display: 'flex', justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
          <AegisActionControl
            label="ENTER COMMAND CENTER"
            sublabel="ALLOCATE FLEET & TACTICAL LOGISTICS"
            icon={<Cpu size={18} />}
            onClick={onEnterCommandCenter}
            variant="beige"
            width="100%"
          />
        </div>
      </AegisCommandCard>
    </div>
  );
}
