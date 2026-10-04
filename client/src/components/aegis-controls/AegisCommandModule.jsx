import React, { useState } from 'react';
import { Loader2, Check } from 'lucide-react';

export default function AegisCommandModule({
  tag = "SYS",
  title = "MODULE ACTION",
  detail = "TACTICAL INTERVENTION",
  status = "READY", // 'READY' | 'DEPLOYING...' | 'DATA ACQUIRED' | 'EXECUTING' | 'LOCKED'
  icon = "◉",
  onClick,
  disabled = false,
  variant = "cyan", // 'cyan' | 'purple' | 'emerald' | 'amber' | 'red'
  width,
  style = {}
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const colors = {
    sage: {
      accent: "#6F947D",
      accentBright: "#9FB5A4",
      glow: "rgba(111, 148, 125, 0.3)",
      bg: "rgba(25, 58, 42, 0.55)",
      border: "rgba(111, 148, 125, 0.35)",
      hoverBorder: "#D6C6A5"
    },
    cyan: {
      accent: "#6F947D",
      accentBright: "#D6C6A5",
      glow: "rgba(111, 148, 125, 0.3)",
      bg: "rgba(25, 58, 42, 0.55)",
      border: "rgba(111, 148, 125, 0.35)",
      hoverBorder: "#D6C6A5"
    },
    purple: {
      accent: "#8B72A8",
      accentBright: "#B49DCB",
      glow: "rgba(139, 114, 168, 0.3)",
      bg: "rgba(30, 22, 38, 0.65)",
      border: "rgba(139, 114, 168, 0.4)",
      hoverBorder: "#B49DCB"
    },
    emerald: {
      accent: "#6F947D",
      accentBright: "#9FB5A4",
      glow: "rgba(111, 148, 125, 0.3)",
      bg: "rgba(25, 58, 42, 0.55)",
      border: "rgba(111, 148, 125, 0.35)",
      hoverBorder: "#9FB5A4"
    },
    amber: {
      accent: "#C99A45",
      accentBright: "#D6C6A5",
      glow: "rgba(201, 154, 69, 0.3)",
      bg: "rgba(38, 28, 14, 0.65)",
      border: "rgba(201, 154, 69, 0.4)",
      hoverBorder: "#D6C6A5"
    },
    red: {
      accent: "#D9534F",
      accentBright: "#FCA5A5",
      glow: "rgba(217, 83, 79, 0.3)",
      bg: "rgba(42, 16, 16, 0.65)",
      border: "rgba(217, 83, 79, 0.45)",
      hoverBorder: "#FCA5A5"
    }
  };

  const scheme = colors[variant] || colors.cyan;
  const isExecuting = status.includes('DEPLOYING') || status.includes('SCANNING') || status === 'EXECUTING';
  const isComplete = status.includes('COMPLETE') || status.includes('ACQUIRED');
  const isLocked = disabled || status === 'LOCKED';

  return (
    <button
      onClick={isLocked || isExecuting ? undefined : onClick}
      onMouseEnter={() => !isLocked && setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
      onMouseDown={() => !isLocked && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      disabled={isLocked || isExecuting}
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '12px 16px',
        width: width || '100%',
        minHeight: '84px',
        background: isLocked ? 'rgba(15, 23, 42, 0.5)' : scheme.bg,
        border: `1px solid ${isLocked ? 'rgba(255,255,255,0.08)' : isHovered ? scheme.hoverBorder : scheme.border}`,
        borderRadius: '3px',
        boxShadow: isLocked 
          ? 'none' 
          : isHovered 
          ? `0 0 16px ${scheme.glow}, inset 0 1px 0 rgba(255,255,255,0.12)` 
          : '0 2px 8px rgba(0,0,0,0.5)',
        cursor: isLocked ? 'not-allowed' : isExecuting ? 'wait' : 'pointer',
        transform: isPressed ? 'scale(0.985)' : isHovered ? 'translateY(-1px)' : 'none',
        transition: 'all 0.16s cubic-bezier(0.16, 1, 0.3, 1)',
        textAlign: 'left',
        userSelect: 'none',
        outline: 'none',
        ...style
      }}
    >
      {/* Top Header Row: System Tag + Icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: '12px',
            color: isComplete ? '#34d399' : scheme.accentBright
          }}>
            {isComplete ? <Check size={12} /> : icon}
          </span>
          <span className="font-mono" style={{
            fontSize: '10px',
            fontWeight: '700',
            color: isComplete ? '#34d399' : scheme.accentBright,
            letterSpacing: '0.1em',
            textTransform: 'uppercase'
          }}>
            {tag}
          </span>
        </div>

        {/* Small corner bracket visual detail */}
        <span className="font-mono" style={{ fontSize: '8px', color: '#475569' }}>
          MOD_CTRL
        </span>
      </div>

      {/* Main Title: Large Command Name */}
      <div className="font-hud" style={{
        fontSize: '15px',
        fontWeight: '800',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: isLocked ? '#64748b' : '#f8fafc',
        lineHeight: 1.2
      }}>
        {title}
      </div>

      {/* Detail / Subtext */}
      <div className="font-mono" style={{
        fontSize: '9px',
        color: isLocked ? '#475569' : '#94a3b8',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        marginTop: '2px',
        marginBottom: '6px'
      }}>
        {detail}
      </div>

      {/* Status Footer Rail */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '6px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        width: '100%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {isExecuting ? (
            <Loader2 size={10} className="animate-spin" color={scheme.accentBright} />
          ) : (
            <span style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              background: isComplete ? '#10b981' : isLocked ? '#475569' : scheme.accentBright,
              display: 'inline-block'
            }} />
          )}

          <span className="font-mono" style={{
            fontSize: '9px',
            fontWeight: '700',
            letterSpacing: '0.1em',
            color: isComplete ? '#34d399' : isLocked ? '#64748b' : scheme.accentBright
          }}>
            {status}
          </span>
        </div>

        <span style={{
          fontSize: '12px',
          fontWeight: 'bold',
          color: isLocked ? '#475569' : scheme.accentBright,
          transition: 'transform 0.2s ease',
          transform: isHovered ? 'translateX(3px)' : 'none'
        }}>
          →
        </span>
      </div>
    </button>
  );
}
