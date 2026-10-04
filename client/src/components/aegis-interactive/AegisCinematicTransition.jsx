import React, { useEffect, useState } from 'react';

/**
 * AEGIS Cinematic Stage Transition
 * Context-aware transition effects:
 * - DIGITAL TWIN (map): Zoom through the grid
 * - INVESTIGATION (investigate): Cards slide/float in
 * - INCIDENT FUSION (fuse): Convergence toward center
 * - SIMULATION (simulate): Scanline + temporal warp
 * - CRITICAL (explain / danger): Brief red pulse + subtle shake
 * - UNKNOWN ZONE (unknown): Darkness edge vignette + signal unmask
 * - BURN/REVEAL: Organic glowing boundary reveal
 */
export default function AegisCinematicTransition({
  stage,
  children
}) {
  const [animClass, setAnimClass] = useState("cinematic-burn-reveal");
  const [key, setKey] = useState(stage);

  useEffect(() => {
    setKey(stage);

    // Pick contextual transition class based on stage
    switch (stage) {
      case 'map':
        setAnimClass("transition-digital-twin");
        break;
      case 'investigate':
        setAnimClass("transition-investigate");
        break;
      case 'fuse':
        setAnimClass("transition-fuse");
        break;
      case 'simulate':
        setAnimClass("transition-simulation");
        break;
      case 'explain':
        setAnimClass("transition-critical screen-shake-subtle");
        break;
      case 'unknown':
        setAnimClass("transition-unknown");
        break;
      default:
        setAnimClass("cinematic-burn-reveal");
        break;
    }
  }, [stage]);

  return (
    <div
      key={key}
      className={`aegis-stage-viewport ${animClass}`}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Simulation Scanline Effect for Stage 9 */}
      {stage === 'simulate' && (
        <div className="simulation-scanline" />
      )}

      {/* Unknown Zone Edge Interference for Stage 5 */}
      {stage === 'unknown' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            boxShadow: 'inset 0 0 90px rgba(0, 0, 0, 0.85), inset 0 0 35px rgba(139, 114, 168, 0.25)',
            zIndex: 30
          }}
        />
      )}

      {children}
    </div>
  );
}
