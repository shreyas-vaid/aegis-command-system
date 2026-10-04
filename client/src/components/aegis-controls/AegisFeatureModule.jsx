import React, { useRef, useState } from 'react';

/**
 * AegisFeatureModule
 * 
 * Reusable interactive feature module conforming to Section 4 & 5:
 * - Clickable module card
 * - Hover physics with 3D tilt and specular sheen
 * - Visual hierarchy with active / dimmed states
 */
export default function AegisFeatureModule({
  icon = "✦",
  title = "MODULE TITLE",
  subtitle = "SUBSYSTEM PROTOCOL",
  metrics = [],
  status = "SYSTEM READY",
  actionLabel = "ACTIVATE",
  onActivate,
  variant = "beige", // "beige" | "sage" | "critical"
  active = false,
  dimmed = false,
  disabled = false,
  style = {}
}) {
  const moduleRef = useRef(null);
  const [coords, setCoords] = useState({ x: 50, y: 50 });
  const [isPressed, setIsPressed] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const getVariant = () => {
    switch (variant) {
      case "critical":
        return {
          accent: "var(--color-critical)",
          accentBright: "#f87171",
          border: "rgba(217, 83, 79, 0.45)",
          hoverBorder: "var(--color-critical)",
          glow: "rgba(217, 83, 79, 0.25)"
        };
      case "sage":
        return {
          accent: "var(--color-sage)",
          accentBright: "var(--color-sage-light)",
          border: "rgba(95, 128, 107, 0.45)",
          hoverBorder: "var(--color-sage-light)",
          glow: "rgba(95, 128, 107, 0.22)"
        };
      case "beige":
      default:
        return {
          accent: "var(--color-beige)",
          accentBright: "var(--color-beige-light)",
          border: "var(--border-subtle)",
          hoverBorder: "var(--border-beige-active)",
          glow: "rgba(214, 195, 154, 0.2)"
        };
    }
  };

  const scheme = getVariant();

  const handleMouseMove = (e) => {
    if (disabled || !moduleRef.current) return;
    const rect = moduleRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setCoords({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
    const rotateY = ((x - centerX) / centerX) * 4;
    const rotateX = -((y - centerY) / centerY) * 4;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsPressed(false);
  };

  const handleClick = (e) => {
    if (disabled) return;
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 200);
    if (onActivate) onActivate(e);
  };

  return (
    <div
      ref={moduleRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '22px 24px',
        background: active 
          ? 'linear-gradient(135deg, rgba(20, 41, 30, 0.95) 0%, rgba(13, 27, 20, 0.98) 100%)' 
          : 'rgba(13, 27, 20, 0.75)',
        border: active ? `1px solid ${scheme.hoverBorder}` : `1px solid ${scheme.border}`,
        borderRadius: '4px',
        boxShadow: disabled 
          ? 'none' 
          : active 
          ? `0 16px 40px rgba(0, 0, 0, 0.7), 0 0 24px ${scheme.glow}` 
          : '0 4px 18px rgba(0, 0, 0, 0.5)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transform: isPressed 
          ? 'scale(0.97)' 
          : `perspective(1000px) rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg) translateZ(${active ? '12px' : '0px'})`,
        transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, box-shadow 0.25s ease, opacity 0.25s ease',
        userSelect: 'none',
        backdropFilter: 'blur(20px)',
        opacity: dimmed ? 0.45 : disabled ? 0.4 : 1,
        ...style
      }}
    >
      {/* Specular sheen */}
      <div 
        className="aegis-glass-sheen" 
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          borderRadius: 'inherit',
          background: `radial-gradient(circle 200px at ${coords.x}% ${coords.y}%, rgba(214, 195, 154, 0.12), transparent 75%)`
        }} 
      />

      {/* Corner Brackets */}
      <span style={{ position: 'absolute', top: '-1px', left: '-1px', width: '6px', height: '6px', borderTop: `2px solid var(--color-beige)`, borderLeft: `2px solid var(--color-beige)`, pointerEvents: 'none', opacity: 0.6 }} />
      <span style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '6px', height: '6px', borderBottom: `2px solid var(--color-beige)`, borderRight: `2px solid var(--color-beige)`, pointerEvents: 'none', opacity: 0.6 }} />

      {/* Header Row: Icon + Title */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <span style={{ fontSize: '16px', color: scheme.accentBright }}>{icon}</span>
          <h3 className="font-hud" style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '0.08em', color: active ? 'var(--color-beige-light)' : 'var(--color-off-white)', margin: 0 }}>
            {title}
          </h3>
        </div>

        <div className="font-mono" style={{ fontSize: '10px', color: 'var(--color-sage-light)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {subtitle}
        </div>
      </div>

      {/* Key Metric Chips */}
      {metrics && metrics.length > 0 && (
        <div style={{ display: 'flex', gap: '12px', margin: '16px 0' }}>
          {metrics.map((m, idx) => (
            <div key={idx} style={{ background: 'rgba(7, 16, 12, 0.6)', padding: '6px 12px', borderRadius: '2px', border: '1px solid rgba(214, 195, 154, 0.1)' }}>
              <div className="font-mono" style={{ fontSize: '9px', color: 'var(--color-sage)' }}>{m.label}</div>
              <div className="font-mono" style={{ fontSize: '13px', fontWeight: '700', color: scheme.accentBright }}>{m.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Activation Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '12px',
        borderTop: '1px solid rgba(214, 195, 154, 0.1)',
        marginTop: metrics && metrics.length > 0 ? '0' : '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: scheme.accentBright, boxShadow: `0 0 6px ${scheme.accentBright}`, display: 'inline-block' }} />
          <span className="font-mono" style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.12em', color: scheme.accentBright }}>
            {status}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: active ? 'var(--color-beige)' : 'var(--color-off-white)', fontSize: '12px', fontWeight: '700' }}>
          <span className="font-hud">{actionLabel}</span>
          <span>→</span>
        </div>
      </div>
    </div>
  );
}
