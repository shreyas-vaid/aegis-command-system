import React from 'react';
import { 
  User, 
  ShieldCheck, 
  Building2, 
  BadgeCheck, 
  LogOut, 
  X, 
  Radio, 
  KeyRound, 
  Layers
} from 'lucide-react';

export default function AegisProfileDrawer({
  isOpen,
  onClose,
  currentUser,
  onLogout,
  mode,
  onToggleMode
}) {
  if (!isOpen || !currentUser) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'flex-end',
      background: 'rgba(5, 10, 7, 0.65)',
      backdropFilter: 'blur(8px)',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div 
        className="aegis-card-glass"
        style={{
          width: '100%',
          maxWidth: '360px',
          height: '100%',
          background: 'linear-gradient(180deg, rgba(14, 27, 21, 0.98) 0%, rgba(8, 13, 10, 0.98) 100%)',
          borderLeft: '1px solid rgba(214, 198, 165, 0.28)',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.7)',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box'
        }}
      >
        <div>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '4px',
                background: 'rgba(111, 148, 125, 0.2)',
                border: '1px solid rgba(214, 198, 165, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D6C6A5'
              }}>
                <User size={15} />
              </div>
              <span className="font-hud" style={{ fontSize: '13px', letterSpacing: '0.12em', color: '#EAE5D8', fontWeight: '800' }}>
                OPERATOR DOSSIER
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#9FB5A4',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Mode Status Badge */}
          <div style={{
            padding: '10px 12px',
            borderRadius: '4px',
            background: mode === 'LIVE' ? 'rgba(74, 222, 128, 0.12)' : 'rgba(201, 154, 69, 0.12)',
            border: `1px solid ${mode === 'LIVE' ? 'rgba(74, 222, 128, 0.35)' : 'rgba(201, 154, 69, 0.35)'}`,
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4' }}>ACTIVE PLATFORM MODE</div>
              <div className="font-hud" style={{
                fontSize: '12px',
                fontWeight: '700',
                color: mode === 'LIVE' ? '#4ADE80' : '#D6C6A5',
                letterSpacing: '0.1em'
              }}>
                {mode === 'LIVE' ? '● LIVE OPERATION' : '○ DEMO / SIMULATION'}
              </div>
            </div>
            <button
              onClick={onToggleMode}
              className="font-mono"
              style={{
                fontSize: '9px',
                padding: '4px 8px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(214, 198, 165, 0.25)',
                color: '#EAE5D8',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              TOGGLE
            </button>
          </div>

          {/* Profile Details */}
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '6px',
            border: '1px solid rgba(214, 198, 165, 0.14)',
            padding: '16px',
            marginBottom: '18px'
          }}>
            <div style={{ marginBottom: '14px' }}>
              <div className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4', letterSpacing: '0.08em' }}>
                CALLSIGN / NAME
              </div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#EAE5D8', marginTop: '2px' }}>
                {currentUser.name}
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <div className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4', letterSpacing: '0.08em' }}>
                OPERATIONAL ROLE
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '4px', background: 'rgba(111, 148, 125, 0.2)', border: '1px solid rgba(111, 148, 125, 0.4)', padding: '2px 8px', borderRadius: '3px' }}>
                <BadgeCheck size={12} color="#4ADE80" />
                <span className="font-mono" style={{ fontSize: '11px', fontWeight: '700', color: '#D1FAE5' }}>
                  {currentUser.role}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <div className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4', letterSpacing: '0.08em' }}>
                ORGANIZATION / JURISDICTION
              </div>
              <div style={{ fontSize: '12px', color: '#D6C6A5', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={13} color="#6F947D" />
                <span>{currentUser.organizationId || 'Chandigarh Emergency Response'}</span>
              </div>
            </div>

            <div>
              <div className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4', letterSpacing: '0.08em' }}>
                SECURE IDENTITY
              </div>
              <div className="font-mono" style={{ fontSize: '11px', color: '#9FB5A4', marginTop: '3px' }}>
                {currentUser.email}
              </div>
            </div>
          </div>

          {/* Quick Stats / Privileges */}
          <div style={{
            background: 'rgba(111, 148, 125, 0.06)',
            borderRadius: '6px',
            border: '1px solid rgba(111, 148, 125, 0.16)',
            padding: '12px 14px'
          }}>
            <div className="font-mono" style={{ fontSize: '9px', color: '#D6C6A5', marginBottom: '8px', letterSpacing: '0.06em' }}>
              ACTIVE PERMISSIONS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#9FB5A4', fontFamily: 'monospace' }}>
                <span style={{ color: '#4ADE80' }}>✔</span> Digital Twin Telemetry Ingestion
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#9FB5A4', fontFamily: 'monospace' }}>
                <span style={{ color: '#4ADE80' }}>✔</span> Forward Butterfly Simulation (+30m)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#9FB5A4', fontFamily: 'monospace' }}>
                <span style={{ color: '#4ADE80' }}>✔</span> Tactical Resource Allocation
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#9FB5A4', fontFamily: 'monospace' }}>
                <span style={{ color: '#4ADE80' }}>✔</span> Information Gap Reconnaissance
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ borderTop: '1px solid rgba(214, 198, 165, 0.14)', paddingTop: '16px' }}>
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="btn-command-secondary"
            style={{
              width: '100%',
              padding: '9px 12px',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              color: '#FCA5A5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '11px'
            }}
          >
            <LogOut size={14} />
            <span>TERMINATE OPERATIONAL SESSION</span>
          </button>
        </div>

      </div>
    </div>
  );
}
