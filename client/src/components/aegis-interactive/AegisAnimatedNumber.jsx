import React, { useEffect, useState, useRef } from 'react';

/**
 * AEGIS Animated Number
 * Smooth micro-animation for numbers (e.g. 70 → 61, 72% → 91%)
 */
export default function AegisAnimatedNumber({
  value = 0,
  duration = 600,
  prefix = "",
  suffix = "",
  className = "",
  style = {}
}) {
  const numericTarget = typeof value === 'number' ? value : parseFloat(value) || 0;
  const [displayValue, setDisplayValue] = useState(numericTarget);
  const prevTargetRef = useRef(numericTarget);

  useEffect(() => {
    const startVal = prevTargetRef.current;
    const endVal = numericTarget;
    prevTargetRef.current = endVal;

    if (startVal === endVal) return;

    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth cubic ease out
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (endVal - startVal) * easeProgress);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    const animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [numericTarget, duration]);

  return (
    <span className={className} style={{ display: 'inline-block', fontVariantNumeric: 'tabular-nums', ...style }}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}
