import React from 'react';
import { CheckCircle2, RotateCcw, ShieldCheck, Users, Activity, AlertTriangle, Sparkles, Map, User } from 'lucide-react';
import { AegisPrimaryCommand, AegisCommandModule } from './aegis-controls';
import { Aegis3DCard, AegisAnimatedNumber } from './aegis-interactive';

export default function OutcomeScreen({
  onReplay,
  onTryDifferentStrategy,
  onReturnToCommand
}) {
  return (
    <div style={{
      minHeight: '88vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      maxWidth: '960px',
      margin: '0 auto',
      width: '100%'
    }}>
      <div
        className="aegis-glass"
        style={{
          width: '100%',
          background: 'rgba(14, 27, 21, 0.92)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(111, 148, 125, 0.35)',
          borderRadius: '8px',
          padding: '36px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(214, 198, 165, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        
        {/* Title */}
        <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(214, 198, 165, 0.12)', paddingBottom: '16px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(111, 148, 125, 0.16)', border: '1px solid rgba(111, 148, 125, 0.4)', color: '#eae5d8', padding: '4px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em' }} className="font-hud">
            <CheckCircle2 size={14} color="#6f947d" /> OPERATION COMPLETE
          </div>
          <h2 className="font-hud" style={{ fontSize: '32px', fontWeight: '800', color: '#eae5d8', margin: '8px 0 0 0', letterSpacing: '0.04em' }}>
            AFTER ACTION REPORT: OPERATION #027
          </h2>
          <p className="font-mono" style={{ fontSize: '12px', color: '#9fb5a4', margin: '4px 0 0 0' }}>
            DISASTER CASCADE CONTAINED · CASUALTY MITIGATION STRATEGY SUCCESSFUL
          </p>
        </div>

        {/* 4 Outcome Metrics Readouts wrapped in Aegis3DCard */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
          
          <Aegis3DCard
            accentColor="#6f947d"
            style={{ 
              background: 'rgba(8, 13, 10, 0.65)', 
              padding: '16px', 
              borderRadius: '6px', 
              border: '1px solid rgba(111, 148, 125, 0.35)',
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: '10px', color: '#9fb5a4', letterSpacing: '0.08em', fontWeight: '600' }}>CITY HEALTH</span>
            <div className="font-mono" style={{ fontSize: '22px', fontWeight: '800', color: '#6f947d', marginTop: '4px' }}>
              70% → <AegisAnimatedNumber value={78} suffix="%" />
            </div>
            <div className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4', marginTop: '4px' }}>+8% Recovery</div>
          </Aegis3DCard>

          <Aegis3DCard
            accentColor="#d6c6a5"
            style={{ 
              background: 'rgba(8, 13, 10, 0.65)', 
              padding: '16px', 
              borderRadius: '6px', 
              border: '1px solid rgba(214, 198, 165, 0.25)',
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: '10px', color: '#9fb5a4', letterSpacing: '0.08em', fontWeight: '600' }}>HOSPITAL LOAD</span>
            <div className="font-mono" style={{ fontSize: '22px', fontWeight: '800', color: '#d6c6a5', marginTop: '4px' }}>
              72% → <AegisAnimatedNumber value={64} suffix="%" />
            </div>
            <div className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4', marginTop: '4px' }}>Trauma Queue Relieved</div>
          </Aegis3DCard>

          <Aegis3DCard
            accentColor="#6f947d"
            style={{ 
              background: 'rgba(8, 13, 10, 0.65)', 
              padding: '16px', 
              borderRadius: '6px', 
              border: '1px solid rgba(214, 198, 165, 0.15)',
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: '10px', color: '#9fb5a4', letterSpacing: '0.08em', fontWeight: '600' }}>CRITICAL ZONES</span>
            <div className="font-mono" style={{ fontSize: '22px', fontWeight: '800', color: '#eae5d8', marginTop: '4px' }}>
              2 → <AegisAnimatedNumber value={1} />
            </div>
            <div className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4', marginTop: '4px' }}>Zone D Stabilized</div>
          </Aegis3DCard>

          <Aegis3DCard
            accentColor="#8b72a8"
            style={{ 
              background: 'rgba(8, 13, 10, 0.65)', 
              padding: '16px', 
              borderRadius: '6px', 
              border: '1px solid rgba(139, 114, 168, 0.35)',
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: '10px', color: '#8b72a8', letterSpacing: '0.08em', fontWeight: '600' }}>INFORMATION GAPS</span>
            <div className="font-mono" style={{ fontSize: '22px', fontWeight: '800', color: '#8b72a8', marginTop: '4px' }}>
              1 → <AegisAnimatedNumber value={0} />
            </div>
            <div className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4', marginTop: '4px' }}>Zone E Fully Monitored</div>
          </Aegis3DCard>

        </div>

        {/* Lives at Risk Metric */}
        <div style={{ background: 'rgba(25, 58, 42, 0.35)', border: '1px solid rgba(214, 198, 165, 0.18)', borderRadius: '4px', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="#d6c6a5" />
            <span className="font-hud" style={{ fontSize: '13px', fontWeight: '700', color: '#eae5d8', letterSpacing: '0.04em' }}>
              SIMULATED LIVES PROTECTED &amp; SECURED:
            </span>
          </div>
          <span className="font-mono" style={{ fontSize: '22px', fontWeight: '800', color: '#d6c6a5' }}>
            ~1,840 RESIDENTS
          </span>
        </div>

        {/* Intelligence Quadrant: What Worked, What Failed, What Changed, AI Learning */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
          
          <div style={{ background: 'rgba(8, 13, 10, 0.65)', borderLeft: '4px solid #6f947d', border: '1px solid rgba(214, 198, 165, 0.1)', borderLeftWidth: '4px', borderLeftColor: '#6f947d', padding: '14px 16px', borderRadius: '4px' }}>
            <span className="font-hud" style={{ fontSize: '12px', fontWeight: '700', color: '#6f947d', display: 'block', marginBottom: '4px', letterSpacing: '0.08em' }}>
              WHAT WORKED:
            </span>
            <p style={{ margin: 0, fontSize: '12px', color: '#eae5d8', lineHeight: 1.45 }}>
              Road 17 culvert unblocking restored Level-1 trauma ambulance flow. Recon drone probed Zone E blackout, safeguarding 140+ stranded delta motorists.
            </p>
          </div>

          <div style={{ background: 'rgba(8, 13, 10, 0.65)', border: '1px solid rgba(214, 198, 165, 0.1)', borderLeftWidth: '4px', borderLeftColor: '#c99a45', padding: '14px 16px', borderRadius: '4px' }}>
            <span className="font-hud" style={{ fontSize: '12px', fontWeight: '700', color: '#c99a45', display: 'block', marginBottom: '4px', letterSpacing: '0.08em' }}>
              WHAT FAILED:
            </span>
            <p style={{ margin: 0, fontSize: '12px', color: '#eae5d8', lineHeight: 1.45 }}>
              Bridge 17 foundation endured 14cm scouring deflection before berm reinforcement arrived. South General backup generator experienced voltage sag.
            </p>
          </div>

          <div style={{ background: 'rgba(8, 13, 10, 0.65)', border: '1px solid rgba(214, 198, 165, 0.1)', borderLeftWidth: '4px', borderLeftColor: '#d6c6a5', padding: '14px 16px', borderRadius: '4px' }}>
            <span className="font-hud" style={{ fontSize: '12px', fontWeight: '700', color: '#d6c6a5', display: 'block', marginBottom: '4px', letterSpacing: '0.08em' }}>
              WHAT CHANGED:
            </span>
            <p style={{ margin: 0, fontSize: '12px', color: '#eae5d8', lineHeight: 1.45 }}>
              City health stabilized from 70% to 78%. Regional flood waters crested and began receding; emergency transit corridors reopened.
            </p>
          </div>

          <div style={{ background: 'rgba(8, 13, 10, 0.65)', border: '1px solid rgba(214, 198, 165, 0.1)', borderLeftWidth: '4px', borderLeftColor: '#8b72a8', padding: '14px 16px', borderRadius: '4px' }}>
            <span className="font-hud" style={{ fontSize: '12px', fontWeight: '700', color: '#8b72a8', display: 'block', marginBottom: '4px', letterSpacing: '0.08em' }}>
              AI LEARNING / EXPLANATION:
            </span>
            <p style={{ margin: 0, fontSize: '12px', color: '#eae5d8', lineHeight: 1.45 }}>
              Treating absence of telemetry as an information gap rather than "safe" reduced mortality risk by 42%. Single-bottleneck intervention was decisive.
            </p>
          </div>

        </div>

        {/* Action Command Controls with AEGIS Control Language */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '6px', alignItems: 'center' }}>
          <AegisPrimaryCommand
            label="REPLAY OPERATION"
            subtitle="REINITIALIZE DISASTER CASCADE SCENARIO"
            status="OPERATION CONCLUDED"
            icon="◈"
            onClick={onReplay}
            variant="sage"
            width="100%"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', width: '100%' }}>
            <AegisCommandModule
              tag="STRATEGY"
              title="TRY ALTERNATIVE PLAN"
              detail="RE-RUN DISPATCH SIMULATION"
              status="READY"
              onClick={onTryDifferentStrategy}
              variant="beige"
            />
            <AegisCommandModule
              tag="FLEET EOC"
              title="RETURN TO COMMAND"
              detail="RE-ALLOCATE TACTICAL ASSETS"
              status="STANDBY"
              onClick={onReturnToCommand}
              variant="sage"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
