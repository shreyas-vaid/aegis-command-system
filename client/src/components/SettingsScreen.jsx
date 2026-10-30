import React, { useState } from 'react';
import { 
  Sliders, 
  UserCheck, 
  Lock, 
  RotateCcw, 
  Radio, 
  Server, 
  Database, 
  Eye, 
  CheckCircle2, 
  ShieldCheck, 
  RefreshCw,
  LogOut,
  Terminal
} from 'lucide-react';

export default function SettingsScreen({
  currentUser = null,
  currentOrg = null,
  mode = 'DEMO',
  onToggleMode = null,
  onReset = null,
  onOpenAuth = null,
  onLogout = null,
  onReplayBoot = null,
  showToast = () => {}
}) {
  const [tacticalSound, setTacticalSound] = useState(true);
  const [highContrastRadar, setHighContrastRadar] = useState(true);
  const [telemetryInterval, setTelemetryInterval] = useState('15');

  return (
    <div style={{
      maxWidth: '1100px',
      margin: '0 auto',
      width: '100%',
      padding: '24px 24px 60px',
      display: 'flex',
      flexDirection: 'column',
      gap: '22px'
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
            <Sliders size={20} />
          </div>
          <div>
            <h1 className="font-hud" style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
              SYSTEM CONFIGURATION &amp; OPERATOR CLEARANCE
            </h1>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              SECURITY ARCHITECTURE // DEFCON DIRECTIVES &amp; PLATFORM SETTINGS
            </div>
          </div>
        </div>

        <span className="aegis-badge badge-sand">
          CLEARANCE LEVEL 3 VERIFIED
        </span>
      </div>

      {/* Grid: Operator Profile & Organization Clearance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        
        {/* Operator Credentials */}
        <div className="aegis-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="aegis-data-label">ACTIVE OPERATOR DOSSIER</span>
            <span className={`aegis-badge ${currentUser ? 'badge-normal' : 'badge-sand'}`}>
              {currentUser ? 'AUTHENTICATED' : 'ANONYMOUS DEMO'}
            </span>
          </div>

          {currentUser ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1.5px solid #10B981',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '18px',
                  fontFamily: 'var(--font-hud)'
                }}>
                  {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'OP'}
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF' }}>
                    {currentUser.name}
                  </div>
                  <div className="font-mono" style={{ fontSize: '11px', color: '#10B981' }}>
                    {currentUser.role || 'INCIDENT COMMANDER'}
                  </div>
                </div>
              </div>

              <table className="aegis-table">
                <tbody>
                  <tr>
                    <td style={{ color: 'var(--text-secondary)' }}>BADGE NUMBER</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>AEGIS-0927</td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--text-secondary)' }}>COMMISSION CLEARANCE</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#10B981' }}>TIER 1 INCIDENT DISPATCH</td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--text-secondary)' }}>ASSIGNED SECTOR</td>
                    <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>NORTHERN REGIONAL REOC</td>
                  </tr>
                </tbody>
              </table>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="aegis-btn aegis-btn-critical"
                  style={{ alignSelf: 'flex-start', fontSize: '11px' }}
                >
                  <LogOut size={13} />
                  <span>TERMINATE OPERATOR SESSION</span>
                </button>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <Lock size={28} color="var(--color-sand)" />
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                Currently operating in public prototype mode. Authenticate to commission custom disaster operations.
              </p>
              {onOpenAuth && (
                <button
                  onClick={onOpenAuth}
                  className="aegis-btn aegis-btn-primary"
                  style={{ fontSize: '11px' }}
                >
                  <Lock size={13} />
                  <span>AUTHENTICATE OPERATOR</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Operational Mode & System Resets */}
        <div className="aegis-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <span className="aegis-data-label">ENVIRONMENT &amp; THEATER CONTROLS</span>

          {/* Mode Switcher */}
          <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px 14px', borderRadius: '5px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF' }}>
                THEATER OPERATING MODE
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {mode === 'LIVE' ? 'Connected to live sensor streaming' : 'Local benchmark scenario #027 active'}
              </div>
            </div>
            {onToggleMode && (
              <button
                onClick={onToggleMode}
                className={`aegis-btn ${mode === 'LIVE' ? 'aegis-btn-primary' : 'aegis-btn-secondary'}`}
                style={{ fontSize: '11px' }}
              >
                SWITCH TO {mode === 'LIVE' ? 'DEMO' : 'LIVE'}
              </button>
            )}
          </div>

          {/* Simulation Reset */}
          <div style={{ background: 'var(--bg-surface-elevated)', padding: '12px 14px', borderRadius: '5px', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#FFFFFF' }}>
                RESTORE SCENARIO BASELINE
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                Reverts all dispatch actions and resets city health to 70%
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {onReplayBoot && (
                <button
                  onClick={onReplayBoot}
                  className="aegis-btn aegis-btn-secondary"
                  style={{ fontSize: '11px' }}
                  title="Replay cinematic system initialization sequence"
                >
                  <Terminal size={12} />
                  <span>REPLAY BOOT</span>
                </button>
              )}
              {onReset && (
                <button
                  onClick={onReset}
                  className="aegis-btn aegis-btn-critical"
                  style={{ fontSize: '11px' }}
                >
                  <RotateCcw size={12} />
                  <span>RESET STATE</span>
                </button>
              )}
            </div>
          </div>

          {/* Backend Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
              <div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>REST API GATEWAY</div>
              <div className="font-mono" style={{ fontSize: '11px', fontWeight: '700', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={11} /> EXPRESS ONLINE
              </div>
            </div>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
              <div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>DATA STORE</div>
              <div className="font-mono" style={{ fontSize: '11px', fontWeight: '700', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={11} /> MONGODB ATLAS
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Interface & Tactical Telemetry Preferences */}
      <div className="aegis-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <span className="aegis-data-label">COMMAND COCKPIT PREFERENCES</span>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface-elevated)', padding: '12px 14px', borderRadius: '4px', cursor: 'pointer', border: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#FFFFFF' }}>HIGH-CONTRAST RADAR GRID</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Enhance contour lines on tactical Leaflet map</div>
            </div>
            <input 
              type="checkbox" 
              checked={highContrastRadar} 
              onChange={() => setHighContrastRadar(!highContrastRadar)} 
              style={{ accentColor: 'var(--color-cyan)', transform: 'scale(1.2)' }}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-surface-elevated)', padding: '12px 14px', borderRadius: '4px', cursor: 'pointer', border: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#FFFFFF' }}>TELEMETRY POLLING INTERVAL</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Automated sync rate for fused intelligence</div>
            </div>
            <select
              value={telemetryInterval}
              onChange={(e) => setTelemetryInterval(e.target.value)}
              className="aegis-select"
            >
              <option value="5">5 SECONDS</option>
              <option value="15">15 SECONDS</option>
              <option value="30">30 SECONDS</option>
            </select>
          </label>

        </div>
      </div>

    </div>
  );
}
