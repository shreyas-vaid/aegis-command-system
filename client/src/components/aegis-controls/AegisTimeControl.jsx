import React, { useRef, useState } from 'react';
import { Clock } from 'lucide-react';

/**
 * AegisTimeControl
 * 
 * Reusable continuous timeline scrubber conforming to Section 12:
 * LIVE ─────●──────────●──────────●
 *           +15        +30        +60
 * Dragging through time continuously shifts temporal projection.
 */
export default function AegisTimeControl({
  activeOffset = 0,
  onChangeOffset,
  steps = [
    { offset: 0, label: "LIVE", sub: "T+00", state: "BASELINE REAL-TIME" },
    { offset: 15, label: "+15 MIN", sub: "T+15", state: "INITIAL RUNOFF" },
    { offset: 30, label: "+30 MIN", sub: "T+30", state: "CULVERT BREACH" },
    { offset: 60, label: "+60 MIN", sub: "T+60", state: "PEAK FLOOD CREST" }
  ]
}) {
  const activeIdx = steps.findIndex(s => s.offset === activeOffset);
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculateOffsetFromPointer = (clientX) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));

    if (percent < 0.2) onChangeOffset(0);
    else if (percent < 0.5) onChangeOffset(15);
    else if (percent < 0.8) onChangeOffset(30);
    else onChangeOffset(60);
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    calculateOffsetFromPointer(e.clientX);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    calculateOffsetFromPointer(e.clientX);
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      background: 'rgba(13, 27, 20, 0.82)',
      border: '1px solid var(--border-medium)',
      borderRadius: '4px',
      padding: '16px 22px',
      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65), inset 0 1px 1px rgba(241, 235, 221, 0.12)',
      backdropFilter: 'blur(20px)',
      userSelect: 'none',
      width: '100%',
      maxWidth: '740px'
    }}>
      {/* Time Control Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={15} color="var(--color-beige)" />
          <span className="font-hud" style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '0.14em', color: 'var(--color-off-white)' }}>
            TEMPORAL PROJECTION BUS
          </span>
        </div>

        <div className="font-mono" style={{ fontSize: '11px', color: 'var(--color-beige)', fontWeight: '700' }}>
          T+00:{String(activeOffset).padStart(2, '0')}:00 · {steps[activeIdx]?.state}
        </div>
      </div>

      {/* Horizontal Interactive Timeline Bus with Drag/Click Scrubber */}
      <div 
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ 
          position: 'relative', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '14px 12px 6px 12px', 
          marginTop: '4px', 
          cursor: isDragging ? 'grabbing' : 'ew-resize',
          touchAction: 'none'
        }}
      >
        {/* Continuous background bus line */}
        <div style={{
          position: 'absolute',
          top: '22px',
          left: '32px',
          right: '32px',
          height: '2px',
          background: 'rgba(214, 195, 154, 0.16)',
          zIndex: 1
        }} />

        {/* Dynamic Glowing Active Fill Line */}
        <div style={{
          position: 'absolute',
          top: '22px',
          left: '32px',
          width: activeIdx === 0 ? '0%' : activeIdx === 1 ? '33%' : activeIdx === 2 ? '66%' : 'calc(100% - 64px)',
          height: '2px',
          background: 'linear-gradient(90deg, var(--color-sage) 0%, var(--color-beige) 100%)',
          boxShadow: '0 0 10px rgba(214, 195, 154, 0.5)',
          transition: isDragging ? 'none' : 'width 0.25s ease',
          zIndex: 2
        }} />

        {/* 4 Time Nodes */}
        {steps.map((st, idx) => {
          const isActive = st.offset === activeOffset;

          return (
            <div
              key={st.offset}
              style={{
                position: 'relative',
                zIndex: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {/* Node Bullseye Circle */}
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: isActive ? 'var(--color-beige)' : 'var(--bg-deep-green)',
                border: `2px solid ${isActive ? 'var(--color-off-white)' : 'rgba(214, 195, 154, 0.3)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isActive ? '0 0 16px rgba(214, 195, 154, 0.75), inset 0 0 4px #FFFFFF' : 'none',
                transition: 'all 0.2s ease',
                transform: isActive ? 'scale(1.2)' : 'none'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isActive ? '#07100C' : 'rgba(214, 195, 154, 0.4)'
                }} />
              </div>

              {/* Node Label & Subtext */}
              <div style={{ textAlign: 'center' }}>
                <div className="font-hud" style={{
                  fontSize: '13px',
                  fontWeight: '800',
                  letterSpacing: '0.06em',
                  color: isActive ? 'var(--color-beige-light)' : 'var(--color-sage-light)'
                }}>
                  {st.label}
                </div>
                <div className="font-mono" style={{
                  fontSize: '9px',
                  color: isActive ? 'var(--color-beige)' : 'rgba(214, 195, 154, 0.45)'
                }}>
                  {st.sub}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
