import React from 'react';
import { Check } from 'lucide-react';

/**
 * AegisMissionNode
 * 
 * Reusable mission node for the mission rail conforming to Section 13:
 * - Connected nodes with active progress line
 * - Animated current node with pulsing beige halo
 * - Completed node transformation
 * - Tactile hover and activation
 */
export default function AegisMissionNode({
  stage,
  isCurrent,
  isCompleted,
  isUpcoming,
  onClick,
  isLast = false
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
      {/* Node Interactive Chit */}
      <button
        onClick={() => onClick && onClick(stage.id)}
        className="aegis-magnetic-control"
        title={stage.tooltip || stage.label}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: isCurrent ? '4px 10px' : '4px 7px',
          background: isCurrent 
            ? 'linear-gradient(135deg, rgba(214, 195, 154, 0.22) 0%, rgba(13, 27, 20, 0.95) 100%)' 
            : isCompleted
            ? 'rgba(49, 92, 67, 0.28)'
            : 'rgba(7, 16, 12, 0.65)',
          border: isCurrent 
            ? '1px solid var(--border-beige-active)' 
            : isCompleted
            ? '1px solid rgba(95, 128, 107, 0.45)'
            : '1px solid rgba(214, 195, 154, 0.1)',
          borderRadius: '3px',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: isCurrent 
            ? '0 0 16px rgba(214, 195, 154, 0.25), 0 4px 12px rgba(0, 0, 0, 0.5)' 
            : 'none',
          zIndex: 2
        }}
      >
        {/* Node Circle / Indicator */}
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isCurrent 
            ? 'var(--color-beige)' 
            : isCompleted 
            ? 'var(--color-sage)' 
            : 'rgba(255, 255, 255, 0.15)',
          boxShadow: isCurrent ? '0 0 8px var(--color-beige)' : 'none',
          transition: 'all 0.2s ease'
        }}>
          {isCompleted ? (
            <Check size={8} color="#07100C" strokeWidth={3} />
          ) : (
            <div style={{
              width: isCurrent ? '5px' : '3px',
              height: isCurrent ? '5px' : '3px',
              borderRadius: '50%',
              background: isCurrent ? '#07100C' : 'transparent'
            }} />
          )}
        </div>

        {/* Phase Number & Label */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
          <span className="font-mono" style={{
            fontSize: '9px',
            fontWeight: '700',
            color: isCurrent ? 'var(--color-beige)' : isCompleted ? 'var(--color-sage-light)' : 'rgba(241, 235, 221, 0.4)'
          }}>
            {stage.num}
          </span>
          <span className="font-hud" style={{
            fontSize: '11px',
            fontWeight: isCurrent ? '800' : '600',
            letterSpacing: '0.06em',
            color: isCurrent ? 'var(--color-off-white)' : isCompleted ? 'rgba(241, 235, 221, 0.85)' : 'rgba(241, 235, 221, 0.45)',
            textTransform: 'uppercase'
          }}>
            {stage.label}
          </span>
        </div>
      </button>

      {/* Connecting Segment Line */}
      {!isLast && (
        <div style={{
          width: '18px',
          height: '2px',
          background: isCompleted 
            ? 'linear-gradient(90deg, var(--color-sage) 0%, rgba(95, 128, 107, 0.6) 100%)' 
            : 'rgba(214, 195, 154, 0.12)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {isCurrent && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, var(--color-beige) 50%, transparent 100%)',
              animation: 'radar-sweep 2s linear infinite'
            }} />
          )}
        </div>
      )}
    </div>
  );
}
