import React from 'react';

export default function AegisZoneHoverCard({
  zone,
  position = { x: 0, y: 0 }
}) {
  if (!zone) return null;

  const isCritical = zone.risk >= 80;
  const isUnknown = zone.isUnknown || zone.id === 'E';
  const accent = isUnknown ? '#8B72A8' : isCritical ? '#D9534F' : zone.risk >= 50 ? '#C99A45' : '#6F947D';

  return (
    <div style={{
      position: 'absolute',
      left: `${position.x}px`,
      top: `${position.y}px`,
      transform: 'translate(-50%, -120%)',
      pointerEvents: 'none',
      zIndex: 50,
      background: 'rgba(14, 27, 21, 0.88)',
      border: `1px solid ${accent}`,
      borderLeft: `3px solid ${accent}`,
      borderRadius: '4px',
      padding: '8px 12px',
      boxShadow: `0 12px 30px rgba(0,0,0,0.8), 0 0 16px ${accent}40, inset 0 1px 1px rgba(234, 229, 216, 0.15)`,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      width: '165px',
      userSelect: 'none'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span className="font-hud" style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff' }}>
          ZONE {zone.id}
        </span>
        <span className="font-mono" style={{ fontSize: '8px', color: accent, fontWeight: '700' }}>
          {isUnknown ? "UNKNOWN" : `${zone.risk}/100`}
        </span>
      </div>

      <div className="font-mono" style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '6px' }}>
        {zone.name || "TACTICAL SECTOR"}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '9px', fontFamily: 'var(--font-mono)' }}>
        <div>
          <span style={{ color: '#64748b' }}>ACCESS:</span>
          <span style={{ color: '#f8fafc', fontWeight: '700', marginLeft: '3px' }}>{zone.roads}%</span>
        </div>
        <div>
          <span style={{ color: '#64748b' }}>STATUS:</span>
          <span style={{ color: accent, fontWeight: '700', marginLeft: '3px' }}>{zone.status || (isCritical ? 'CRIT' : 'WARN')}</span>
        </div>
      </div>

      <div style={{
        marginTop: '6px',
        paddingTop: '4px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '8px',
        fontFamily: 'var(--font-mono)',
        color: accent
      }}>
        <span>CLICK TO PROBE</span>
        <span>→</span>
      </div>
    </div>
  );
}
