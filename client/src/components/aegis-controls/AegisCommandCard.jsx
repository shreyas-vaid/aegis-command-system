import React, { useState } from 'react';

/**
 * AegisCommandCard
 * Reusable interactive command card:
 * - Stable planar card layout (cursor tilt removed)
 * - Subtle beige border illumination on hover
 * - Physical compression on click
 * - Entire card clickable
 */
export default function AegisCommandCard({
  title,
  subtitle,
  badge,
  badgeColor = "var(--color-sage)",
  active = false,
  dimmed = false,
  onClick,
  children,
  className = "",
  style = {},
  actionLabel = "ENGAGE",
  accentColor: _accentColor = "var(--color-beige)"
}) {
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = (e) => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 200);
    if (onClick) onClick(e);
  };

  return (
    <div
      className={`aegis-command-card ${className} ${active ? 'is-active' : ''} ${dimmed ? 'is-dimmed' : ''}`}
      onClick={handleClick}
      style={{
        transform: isPressed ? 'scale(0.97)' : 'none',
        position: 'relative',
        background: active 
          ? 'linear-gradient(145deg, rgba(20, 41, 30, 0.92) 0%, rgba(13, 27, 20, 0.96) 100%)' 
          : 'rgba(13, 27, 20, 0.72)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: active 
          ? '1px solid var(--border-beige-active)' 
          : '1px solid var(--border-subtle)',
        borderRadius: '4px',
        padding: '20px 22px',
        cursor: 'pointer',
        userSelect: 'none',
        opacity: dimmed ? 0.42 : 1,
        transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, box-shadow 0.25s ease, opacity 0.3s ease',
        boxShadow: active
          ? '0 16px 40px rgba(0, 0, 0, 0.7), 0 0 25px rgba(214, 195, 154, 0.15)'
          : '0 8px 30px rgba(0, 0, 0, 0.55)',
        ...style
      }}
    >
      {/* Dynamic Specular Glass Sheen Overlay */}
      <div 
        className="aegis-glass-sheen" 
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          zIndex: 3,
          background: `radial-gradient(circle 240px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(214, 195, 154, 0.14), transparent 75%)`
        }} 
      />

      {/* Card Header & Parallax Badge */}
      <div style={{ position: 'relative', zIndex: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: active ? 'var(--color-beige)' : badgeColor,
            boxShadow: active ? '0 0 8px var(--color-beige)' : 'none'
          }} />
          <span 
            className="font-mono aegis-parallax-layer" 
            style={{ 
              fontSize: '11px', 
              color: 'var(--color-sage-light)', 
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}
          >
            {subtitle || "COMMAND OBJECT"}
          </span>
        </div>

        {badge && (
          <span 
            className="font-mono aegis-parallax-reverse"
            style={{
              fontSize: '9px',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '2px',
              letterSpacing: '0.08em',
              background: `${badgeColor}18`,
              border: `1px solid ${badgeColor}45`,
              color: badgeColor
            }}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Main Title */}
      <h3 
        className="font-hud aegis-parallax-layer" 
        style={{ 
          fontSize: '18px', 
          fontWeight: '700', 
          color: active ? 'var(--color-beige-light)' : 'var(--color-off-white)', 
          margin: '0 0 10px 0',
          letterSpacing: '0.04em'
        }}
      >
        {title}
      </h3>

      {/* Children Content Body */}
      <div style={{ position: 'relative', zIndex: 4, marginBottom: '14px' }}>
        {children}
      </div>

      {/* Action Footer Indicator */}
      <div 
        style={{ 
          position: 'relative', 
          zIndex: 4, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(214, 195, 154, 0.1)',
          paddingTop: '10px'
        }}
      >
        <span className="font-mono" style={{ fontSize: '10px', color: 'var(--color-sage)', letterSpacing: '0.06em' }}>
          {active ? "ACTIVE FOCUS" : "CLICK TO EXPAND"}
        </span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          fontWeight: '700',
          color: active ? 'var(--color-beige)' : 'var(--color-sage-light)',
          letterSpacing: '0.06em'
        }}>
          <span>{actionLabel}</span>
          <span style={{ fontSize: '13px' }}>→</span>
        </div>
      </div>
    </div>
  );
}
