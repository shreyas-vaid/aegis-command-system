import React, { useRef, useState } from 'react';

/**
 * AegisActionControl
 * 
 * Reusable magnetic action control conforming to Section 4 & 7:
 * - Proximity magnetic attraction following cursor (4-8px displacement)
 * - Physical tactile press on click (scale 0.96)
 * - Smooth cubic-bezier spring return
 * - Used for: INVESTIGATE, EXPLAIN, SIMULATE, DEPLOY, ANALYZE, PROCEED
 */
export default function AegisActionControl({
  label = "ENGAGE",
  sublabel,
  icon,
  onClick,
  variant = "beige", // "beige" | "sage" | "critical" | "charcoal"
  magnetic = true,
  disabled = false,
  className = "",
  style = {},
  width = "auto"
}) {
  const btnRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseMove = (e) => {
    if (!magnetic || disabled || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    // Magnetic pull: max 7px in each direction
    const pullX = (x / (rect.width / 2)) * 7;
    const pullY = (y / (rect.height / 2)) * 7;
    setOffset({ x: pullX, y: pullY });
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  const handleClick = (e) => {
    if (disabled) return;
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 160);
    if (onClick) onClick(e);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "critical":
        return {
          background: 'linear-gradient(135deg, rgba(217, 83, 79, 0.22) 0%, rgba(13, 27, 20, 0.9) 100%)',
          border: '1px solid rgba(217, 83, 79, 0.65)',
          color: 'var(--color-off-white)',
          activeColor: 'var(--color-critical)',
          glow: 'rgba(217, 83, 79, 0.25)'
        };
      case "sage":
        return {
          background: 'linear-gradient(135deg, rgba(95, 128, 107, 0.22) 0%, rgba(13, 27, 20, 0.9) 100%)',
          border: '1px solid rgba(95, 128, 107, 0.55)',
          color: 'var(--color-off-white)',
          activeColor: 'var(--color-sage-light)',
          glow: 'rgba(95, 128, 107, 0.2)'
        };
      case "charcoal":
        return {
          background: 'rgba(13, 27, 20, 0.85)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--color-sage-light)',
          activeColor: 'var(--color-off-white)',
          glow: 'none'
        };
      case "beige":
      default:
        return {
          background: 'linear-gradient(135deg, rgba(214, 195, 154, 0.2) 0%, rgba(20, 41, 30, 0.85) 100%)',
          border: '1px solid var(--border-beige-active)',
          color: 'var(--color-off-white)',
          activeColor: 'var(--color-beige)',
          glow: 'rgba(214, 195, 154, 0.2)'
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <button
      ref={btnRef}
      className={`aegis-magnetic-control ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      disabled={disabled}
      style={{
        transform: isPressed 
          ? `translate3d(${offset.x}px, ${offset.y}px, 0) scale(0.96)` 
          : `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        width,
        background: vStyles.background,
        border: vStyles.border,
        borderRadius: '3px',
        padding: '12px 22px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        boxShadow: `0 8px 24px rgba(0, 0, 0, 0.6), 0 0 16px ${vStyles.glow}`,
        backdropFilter: 'blur(16px)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        ...style
      }}
    >
      {/* Corner bracket detail */}
      <div style={{
        position: 'absolute',
        top: '2px',
        left: '2px',
        width: '5px',
        height: '5px',
        borderTop: '1px solid var(--color-beige)',
        borderLeft: '1px solid var(--color-beige)',
        opacity: 0.6
      }} />

      <div style={{
        position: 'absolute',
        bottom: '2px',
        right: '2px',
        width: '5px',
        height: '5px',
        borderBottom: '1px solid var(--color-beige)',
        borderRight: '1px solid var(--color-beige)',
        opacity: 0.6
      }} />

      {icon && (
        <span style={{ display: 'flex', alignItems: 'center', color: vStyles.activeColor }}>
          {icon}
        </span>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
        <span 
          className="font-hud" 
          style={{ 
            fontSize: '13px', 
            fontWeight: '700', 
            letterSpacing: '0.12em', 
            color: vStyles.color,
            textTransform: 'uppercase'
          }}
        >
          {label}
        </span>
        {sublabel && (
          <span 
            className="font-mono" 
            style={{ 
              fontSize: '10px', 
              color: 'var(--color-sage-light)', 
              letterSpacing: '0.06em' 
            }}
          >
            {sublabel}
          </span>
        )}
      </div>

      <div style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: vStyles.activeColor,
        boxShadow: `0 0 8px ${vStyles.activeColor}`
      }} />
    </button>
  );
}
