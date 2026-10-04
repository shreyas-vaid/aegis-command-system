import React from 'react';
import { TrendingUp, AlertTriangle, Cpu, ShieldAlert } from 'lucide-react';
import { AegisCommandCard, AegisActionControl } from './aegis-controls';
import { AegisAnimatedNumber } from './aegis-interactive';

/**
 * ExplainableAIScreen
 * 
 * Stage 6 conforming to Section 4 & 5:
 * - Entire interactive command card
 * - Tactile magnetic action control
 * - Dynamic risk delta attribution
 */
export default function ExplainableAIScreen({
  onEnterCommandCenter
}) {
  const factorBars = [
    { name: "Heavy Rainfall Intensity", points: 31, color: "var(--color-sage)", desc: "42 mm/hr convective rainfall volume exceeds drainage culvert capacity." },
    { name: "Road 17 Culvert Washout", points: 24, color: "var(--color-critical)", desc: "Culvert washout completely obstructs primary ambulance arterial to Trauma Center." },
    { name: "Population Exposure Inundation", points: 19, color: "var(--color-beige)", desc: "2,900 dense urban residents directly exposed in flood inundation basin." },
    { name: "Trauma Care Power Substation", points: 14, color: "var(--color-beige-light)", desc: "South General auxiliary power substation threatened by rising water levels." },
    { name: "Emergency Dispatch Surge", points: 8, color: "var(--color-sage-light)", desc: "Surge of 14 concurrent 911 trauma dispatch calls." },
    { name: "Fiber Telemetry Degradation", points: 8, color: "var(--color-unknown)", desc: "Direct fiber connection to trauma center degraded under flooding." }
  ];

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
        title="WHY IS ZONE D CRITICAL? — RISK DECOMPOSITION"
        subtitle="XAI ATTRIBUTION · 6 CONTRIBUTING FACTORS"
        badge="CRITICAL FLUX"
        badgeColor="var(--color-critical)"
        active={true}
        actionLabel="ENTER COMMAND CENTER"
        onClick={onEnterCommandCenter}
        style={{ width: '100%', padding: '32px' }}
      >
        {/* Risk Index Change */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(7, 16, 12, 0.75)',
          padding: '18px 24px',
          borderRadius: '4px',
          border: '1px solid rgba(214, 195, 154, 0.12)',
          margin: '12px 0 20px 0'
        }}>
          <div>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--color-sage-light)', letterSpacing: '0.08em' }}>PREVIOUS RISK</span>
            <div className="font-mono" style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-beige)' }}>
              <AegisAnimatedNumber value={61} /> / 100
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-critical)' }}>
            <TrendingUp size={28} />
            <span className="font-mono" style={{ fontSize: '22px', fontWeight: '800' }}>+35 PTS</span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="font-mono" style={{ fontSize: '11px', color: '#fca5a5', letterSpacing: '0.08em' }}>CURRENT ASSESSED RISK</span>
            <div className="font-mono" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-critical)' }}>
              <AegisAnimatedNumber value={96} /> / 100
            </div>
          </div>
        </div>

        {/* Animated Factor Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '8px 0 18px 0' }}>
          <span className="font-hud" style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-beige)', letterSpacing: '0.08em' }}>
            FACTOR RISK ATTRIBUTIONS:
          </span>

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
            Road 17 has suffered sudden culvert collapse due to +3.4m basin overflow. Direct trauma ambulance access to South General Hospital is 100% blocked.
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
