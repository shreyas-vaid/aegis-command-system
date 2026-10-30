import React, { useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  Flame, 
  HeartHandshake, 
  Truck, 
  Radio, 
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { AegisAnimatedNumber } from './aegis-interactive';

export default function AnalyticsScreen({
  worldState = null,
  activeMission = null
}) {
  const cityHealth = worldState?.cityHealth ?? 70;
  const activeAlerts = worldState?.activeAlerts ?? 7;
  const hospitalLoad = worldState?.hospitalLoad ?? 72;

  // Real-time disaster trend metrics
  const sectorTrends = [
    { name: 'Sector D (Trauma Center)', risk: 96, delta: '+14%', trend: 'up', severity: 'CRITICAL', floodRate: '+0.4m/hr' },
    { name: 'Sector E (Blackout)', risk: 78, delta: '+8%', trend: 'up', severity: 'UNKNOWN', floodRate: '+0.2m/hr' },
    { name: 'Sector C (River Corridor)', risk: 74, delta: '+12%', trend: 'up', severity: 'HIGH_RISK', floodRate: '+0.6m/hr' },
    { name: 'Sector B (Commercial Core)', risk: 48, delta: '-4%', trend: 'down', severity: 'WARNING', floodRate: 'STABILIZED' },
    { name: 'Sector A (Base Staging)', risk: 18, delta: '-6%', trend: 'down', severity: 'STABLE', floodRate: 'RECEDING' }
  ];

  // Resource Utilization Breakdown
  const resourceAllocation = [
    { type: 'Medical Wings', total: 5, deployed: 4, pct: 80, color: '#00F0FF' },
    { type: 'Rescue Vehicles', total: 4, deployed: 3, pct: 75, color: '#EF4444' },
    { type: 'Logistics Convoys', total: 6, deployed: 4, pct: 67, color: '#F59E0B' },
    { type: 'Equipment Units', total: 3, deployed: 2, pct: 66, color: '#10B981' }
  ];

  return (
    <div style={{
      maxWidth: '1440px',
      margin: '0 auto',
      width: '100%',
      padding: '20px 24px 60px',
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
        paddingBottom: '14px',
        flexWrap: 'wrap',
        gap: '10px'
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
            <BarChart3 size={20} />
          </div>
          <div>
            <h1 className="font-hud" style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
              OPERATIONAL ANALYTICS &amp; DISASTER TRENDS
            </h1>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              THEATER #{activeMission?.missionId || '027'} · {activeMission?.locationDisplayName || 'CHANDIGARH REGION'}
            </div>
          </div>
        </div>

        <div className="aegis-badge badge-sand">
          BAYESIAN TIME-SERIES MODELING · LIVE
        </div>
      </div>

      {/* Top Telemetry KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
        <div className="aegis-card" style={{ padding: '16px 18px' }}>
          <span className="aegis-data-label">CITY-WIDE STABILITY INDEX</span>
          <div className="font-hud tabular-nums" style={{ fontSize: '32px', fontWeight: '800', color: '#10B981', lineHeight: 1.1 }}>
            <AegisAnimatedNumber value={cityHealth} suffix="%" />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            +18% projected recovery upon clearing Zone D
          </div>
        </div>

        <div className="aegis-card" style={{ padding: '16px 18px' }}>
          <span className="aegis-data-label">HOSPITAL ICU INTAKE LOAD</span>
          <div className="font-hud tabular-nums" style={{ fontSize: '32px', fontWeight: '800', color: hospitalLoad >= 85 ? '#EF4444' : '#F59E0B', lineHeight: 1.1 }}>
            <AegisAnimatedNumber value={hospitalLoad} suffix="%" />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Threshold limit: 90% (Blackout warning at 92%)
          </div>
        </div>

        <div className="aegis-card" style={{ padding: '16px 18px' }}>
          <span className="aegis-data-label">ACTIVE EMERGENCY SIGNALS</span>
          <div className="font-hud tabular-nums" style={{ fontSize: '32px', fontWeight: '800', color: '#F59E0B', lineHeight: 1.1 }}>
            <AegisAnimatedNumber value={activeAlerts} />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            5 multi-source verified telemetries correlated
          </div>
        </div>

        <div className="aegis-card" style={{ padding: '16px 18px' }}>
          <span className="aegis-data-label">MEAN DISPATCH TIME</span>
          <div className="font-hud tabular-nums" style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-cyan)', lineHeight: 1.1 }}>
            6.4m
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            -3.2m reduction via elevated bypass route
          </div>
        </div>
      </div>

      {/* Main Grid: Disaster Trend Velocity & Resource Utilization */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '16px' }}>
        
        {/* Sector Inundation & Risk Trajectory */}
        <div className="aegis-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} color="var(--color-cyan)" />
              <h3 className="font-hud" style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>
                SECTOR RISK TRAJECTORY &amp; RATE OF INUNDATION
              </h3>
            </div>
            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              15-MIN DELTA
            </span>
          </div>

          <table className="aegis-table">
            <thead>
              <tr>
                <th>SECTOR</th>
                <th>CURRENT RISK</th>
                <th>TREND</th>
                <th>FLOOD RATE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {sectorTrends.map((st, sIdx) => (
                <tr key={sIdx}>
                  <td style={{ fontWeight: '600' }}>{st.name}</td>
                  <td className="font-mono" style={{ fontWeight: '700', color: st.risk > 80 ? '#EF4444' : st.risk > 50 ? '#F59E0B' : '#10B981' }}>
                    {st.risk}%
                  </td>
                  <td className="font-mono" style={{ color: st.trend === 'up' ? '#EF4444' : '#10B981' }}>
                    {st.trend === 'up' ? <ArrowUpRight size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> : <ArrowDownRight size={13} style={{ display: 'inline', verticalAlign: 'middle' }} />}
                    {st.delta}
                  </td>
                  <td className="font-mono" style={{ color: 'var(--text-secondary)' }}>{st.floodRate}</td>
                  <td>
                    <span className={`aegis-badge ${st.severity === 'CRITICAL' ? 'badge-critical' : st.severity === 'WARNING' || st.severity === 'HIGH_RISK' ? 'badge-warning' : 'badge-normal'}`}>
                      {st.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resource Allocation Breakdown */}
        <div className="aegis-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={16} color="var(--color-cyan)" />
            <h3 className="font-hud" style={{ fontSize: '15px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>
              RESOURCE UTILIZATION BY CATEGORY
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {resourceAllocation.map((ra, rIdx) => (
              <div key={rIdx} style={{ background: 'var(--bg-surface-elevated)', padding: '10px 12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ fontWeight: '600', color: '#FFFFFF' }}>{ra.type}</span>
                  <span className="font-mono" style={{ color: ra.color, fontWeight: '700' }}>
                    {ra.deployed} / {ra.total} ({ra.pct}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${ra.pct}%`, height: '100%', background: ra.color, borderRadius: '3px', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{
            background: 'rgba(0, 240, 255, 0.06)',
            border: '1px solid var(--border-accent)',
            padding: '10px 12px',
            borderRadius: '4px',
            fontSize: '11px',
            lineHeight: 1.4,
            color: 'var(--text-secondary)'
          }}>
            <strong>Fleet Readiness Recommendation:</strong> Keep 1 Swift Water Rescue Squad in tactical reserve for secondary flash flood cresting in River Basin Corridor.
          </div>
        </div>

      </div>

    </div>
  );
}
