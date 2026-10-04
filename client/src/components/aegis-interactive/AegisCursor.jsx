import React, { useEffect, useState } from 'react';

/**
 * AegisCursor
 * 
 * Minimal tactical custom cursor conforming to Section 14:
 * States:
 * - NORMAL: small geometric cursor
 * - INTERACTIVE: expanded cursor
 * - DRAG: special drag state
 * - CRITICAL: subtle warning state
 * Contextual labels: INSPECT, SELECT, DRAG, ANALYZE
 */
export default function AegisCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [cursorMode, setCursorMode] = useState('normal'); // 'normal' | 'interactive' | 'drag' | 'critical'
  const [cursorLabel, setCursorLabel] = useState(null);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const handleMouseMove = (e) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target.closest('[data-cursor], button, a, .aegis-command-card, .aegis-3d-card, .aegis-magnetic-control, [data-zone-id], input[type="range"]');
      if (target) {
        const explicitCursor = target.getAttribute('data-cursor');
        if (explicitCursor === 'drag' || target.closest('.aegis-time-bus, input[type="range"]')) {
          setCursorMode('drag');
          setCursorLabel('DRAG');
        } else if (explicitCursor === 'critical' || target.closest('.badge-critical, [data-zone-id="D"]')) {
          setCursorMode('critical');
          setCursorLabel('INSPECT');
        } else if (explicitCursor === 'analyze' || target.closest('[data-action="analyze"]')) {
          setCursorMode('interactive');
          setCursorLabel('ANALYZE');
        } else if (target.getAttribute('data-zone-id')) {
          setCursorMode('interactive');
          setCursorLabel('INSPECT');
        } else {
          setCursorMode('interactive');
          setCursorLabel('SELECT');
        }
      } else {
        setCursorMode('normal');
        setCursorLabel(null);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  // Spring trailing interpolation
  useEffect(() => {
    let animId;
    const follow = () => {
      setTrailingPos((prev) => ({
        x: prev.x + (pos.x - prev.x) * 0.38,
        y: prev.y + (pos.y - prev.y) * 0.38
      }));
      animId = requestAnimationFrame(follow);
    };
    animId = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(animId);
  }, [pos]);

  if (!isVisible) return null;

  const getCursorColor = () => {
    switch (cursorMode) {
      case 'critical':
        return 'var(--color-critical)';
      case 'drag':
        return 'var(--color-beige)';
      case 'interactive':
        return 'var(--color-beige)';
      case 'normal':
      default:
        return 'var(--color-sage)';
    }
  };

  const cursorColor = getCursorColor();

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 99999,
        transition: 'opacity 0.2s ease',
        opacity: isVisible ? 1 : 0
      }}
    >
      {/* Outer Trailing Ring */}
      <div
        style={{
          position: 'fixed',
          left: trailingPos.x,
          top: trailingPos.y,
          transform: `translate(-50%, -50%) scale(${isClicking ? 0.75 : cursorMode !== 'normal' ? 1.35 : 1})`,
          width: '22px',
          height: '22px',
          borderRadius: cursorMode === 'drag' ? '2px' : '50%',
          border: `1.5px solid ${cursorColor}`,
          boxShadow: `0 0 10px ${cursorColor}40`,
          transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, border-radius 0.2s ease',
          pointerEvents: 'none'
        }}
      />

      {/* Center Reticle Point */}
      <div
        style={{
          position: 'fixed',
          left: pos.x,
          top: pos.y,
          transform: 'translate(-50%, -50%)',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-off-white)',
          boxShadow: '0 0 4px rgba(241, 235, 221, 0.9)',
          pointerEvents: 'none'
        }}
      />

      {/* Minimal Contextual Tag */}
      {cursorLabel && (
        <div
          style={{
            position: 'fixed',
            left: pos.x + 16,
            top: pos.y - 10,
            background: 'rgba(7, 16, 12, 0.92)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${cursorColor}60`,
            borderRadius: '2px',
            padding: '1px 6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            fontWeight: '700',
            letterSpacing: '0.08em',
            color: cursorColor,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.65)',
            pointerEvents: 'none'
          }}
        >
          {cursorLabel}
        </div>
      )}
    </div>
  );
}
