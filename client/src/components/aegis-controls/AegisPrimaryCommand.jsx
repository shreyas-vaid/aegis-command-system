import React, { useState, useRef } from 'react';

export default function AegisPrimaryCommand({
  label = "COMMAND",
  subtitle = "EXECUTE TACTICAL PROTOCOL",
  status = "READY", // 'READY' | 'EXECUTING' | 'LOCKED' | 'COMPLETE'
  icon = "◈",
  onClick,
  disabled = false,
  variant = "sage", // 'sage' | 'beige' | 'forest' | 'red' | 'amber' | 'cyan'
  width,
  style = {}
}) {
  const btnRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });

  const colors = {
    sage: {
      accent: "#6F947D",
      accentBright: "#9FB5A4",
      glow: "rgba(111, 148, 125, 0.35)",
      bg: "linear-gradient(135deg, rgba(25, 58, 42, 0.85) 0%, rgba(14, 27, 21, 0.95) 100%)",
      border: "rgba(111, 148, 125, 0.45)",
      hoverBorder: "#D6C6A5",
      text: "#EAE5D8",
      sub: "#D6C6A5"
    },
    beige: {
      accent: "#D6C6A5",
      accentBright: "#EAE5D8",
      glow: "rgba(214, 198, 165, 0.35)",
      bg: "linear-gradient(135deg, rgba(35, 30, 22, 0.85) 0%, rgba(18, 22, 18, 0.95) 100%)",
      border: "rgba(214, 198, 165, 0.45)",
      hoverBorder: "#EAE5D8",
      text: "#FFFFFF",
      sub: "#D6C6A5"
    },
    forest: {
      accent: "#193A2A",
      accentBright: "#6F947D",
      glow: "rgba(25, 58, 42, 0.4)",
      bg: "linear-gradient(135deg, rgba(14, 27, 21, 0.9) 0%, rgba(8, 13, 10, 0.95) 100%)",
      border: "rgba(111, 148, 125, 0.35)",
      hoverBorder: "#9FB5A4",
      text: "#EAE5D8",
      sub: "#9FB5A4"
    },
    cyan: {
      accent: "#6F947D",
      accentBright: "#D6C6A5",
      glow: "rgba(111, 148, 125, 0.35)",
      bg: "linear-gradient(135deg, rgba(25, 58, 42, 0.85) 0%, rgba(14, 27, 21, 0.95) 100%)",
      border: "rgba(111, 148, 125, 0.45)",
      hoverBorder: "#D6C6A5",
      text: "#EAE5D8",
      sub: "#D6C6A5"
    },
    red: {
      accent: "#D9534F",
      accentBright: "#FCA5A5",
      glow: "rgba(217, 83, 79, 0.35)",
      bg: "linear-gradient(135deg, rgba(42, 16, 16, 0.9) 0%, rgba(20, 8, 8, 0.95) 100%)",
      border: "rgba(217, 83, 79, 0.55)",
      hoverBorder: "#FCA5A5",
      text: "#FFF1F2",
      sub: "#FCA5A5"
    },
    amber: {
      accent: "#C99A45",
      accentBright: "#D6C6A5",
      glow: "rgba(201, 154, 69, 0.35)",
      bg: "linear-gradient(135deg, rgba(38, 28, 14, 0.9) 0%, rgba(20, 16, 8, 0.95) 100%)",
      border: "rgba(201, 154, 69, 0.5)",
      hoverBorder: "#D6C6A5",
      text: "#FFFBEB",
      sub: "#D6C6A5"
    },
    emerald: {
      accent: "#6F947D",
      accentBright: "#9FB5A4",
      glow: "rgba(111, 148, 125, 0.35)",
      bg: "linear-gradient(135deg, rgba(25, 58, 42, 0.85) 0%, rgba(14, 27, 21, 0.95) 100%)",
      border: "rgba(111, 148, 125, 0.45)",
      hoverBorder: "#D6C6A5",
      text: "#EAE5D8",
      sub: "#D6C6A5"
    }
  };

  const scheme = colors[variant] || colors.sage;
  const isLocked = disabled || status === 'LOCKED';

  // Magnetic Hover Physics
  const handleMouseMove = (e) => {
    if (isLocked || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    // Calculate magnetic pull (3 - 5px max)
    const deltaX = (e.clientX - centerX) * 0.12;
    const deltaY = (e.clientY - centerY) * 0.12;
    setMagneticOffset({
      x: Math.max(-6, Math.min(6, deltaX)),
      y: Math.max(-6, Math.min(6, deltaY))
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
    setMagneticOffset({ x: 0, y: 0 });
  };

  return (
    <button
      ref={btnRef}
      onClick={isLocked ? undefined : onClick}
      onMouseEnter={() => !isLocked && setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={() => !isLocked && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      disabled={isLocked}
      data-cursor="execute"
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '16px 24px',
        width: width || 'auto',
        minWidth: '280px',
        background: isLocked ? 'rgba(14, 27, 21, 0.5)' : scheme.bg,
        border: `1px solid ${isLocked ? 'rgba(214, 198, 165, 0.1)' : isHovered ? scheme.hoverBorder : scheme.border}`,
        clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: isLocked 
          ? 'none' 
          : isHovered 
          ? `0 14px 32px ${scheme.glow}, inset 0 1px 1px rgba(234, 229, 216, 0.2)` 
          : `0 8px 24px rgba(0,0,0,0.65), inset 0 1px 1px rgba(234, 229, 216, 0.1)`,
        cursor: isLocked ? 'not-allowed' : 'pointer',
        transform: isPressed 
          ? `translate(${magneticOffset.x}px, ${magneticOffset.y}px) scale(0.965)` 
          : isHovered 
          ? `translate(${magneticOffset.x}px, ${magneticOffset.y - 2}px)` 
          : 'none',
        transition: isPressed 
          ? 'transform 0.08s ease' 
          : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease',
        textAlign: 'left',
        userSelect: 'none',
        outline: 'none',
        ...style
      }}
    >
      {/* Top chamfer technical notch border */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '14px',
        height: '14px',
        borderTop: `2px solid ${isLocked ? '#475569' : scheme.accentBright}`,
        borderRight: `2px solid ${isLocked ? '#475569' : scheme.accentBright}`,
        pointerEvents: 'none'
      }} />

      {/* Bottom chamfer technical notch border */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '14px',
        height: '14px',
        borderBottom: `2px solid ${isLocked ? '#475569' : scheme.accentBright}`,
        borderLeft: `2px solid ${isLocked ? '#475569' : scheme.accentBright}`,
        pointerEvents: 'none'
      }} />

      {/* Primary Row: Icon + Main Command Name */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: '15px',
            color: isLocked ? '#64748b' : scheme.accentBright,
            transition: 'transform 0.2s ease',
            transform: isHovered ? 'scale(1.15)' : 'none'
          }}>
            {typeof icon === 'string' ? icon : icon}
          </span>
          
          <span className="font-hud" style={{
            fontSize: '18px',
            fontWeight: '800',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: isLocked ? '#64748b' : isHovered ? '#ffffff' : scheme.text,
            lineHeight: 1.1
          }}>
            {label}
          </span>
        </div>

        {/* Directional Indicator */}
        <span style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: isLocked ? '#475569' : scheme.accentBright,
          transition: 'transform 0.2s ease',
          transform: isHovered ? 'translateX(5px)' : 'none'
        }}>
          →
        </span>
      </div>

      {/* Secondary Subtitle: Technical Operation Subtext */}
      <div className="font-mono" style={{
        fontSize: '10px',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: isLocked ? '#475569' : isHovered ? '#e2e8f0' : '#94a3b8',
        marginTop: '4px',
        marginLeft: '25px'
      }}>
        {subtitle}
      </div>

      {/* Bottom Status Rail */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '10px',
        paddingTop: '6px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: isLocked ? '#64748b' : status === 'EXECUTING' ? '#f59e0b' : scheme.accentBright,
            boxShadow: isLocked ? 'none' : `0 0 6px ${scheme.accentBright}`,
            display: 'inline-block',
            animation: status === 'EXECUTING' ? 'ping 1.2s infinite' : 'none'
          }} />
          <span className="font-mono" style={{
            fontSize: '9px',
            fontWeight: '700',
            letterSpacing: '0.12em',
            color: isLocked ? '#64748b' : scheme.sub
          }}>
            {status}
          </span>
        </div>

        <span className="font-mono" style={{ fontSize: '8px', color: '#475569', letterSpacing: '0.1em' }}>
          ACT_SYS_027
        </span>
      </div>
    </button>
  );
}
