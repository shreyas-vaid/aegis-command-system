import React, { useEffect, useRef } from 'react';

/**
 * AEGIS Living Canvas
 * Ambient tactical living background with:
 * - Subtle floating data/atmospheric particles
 * - Slow radial sweep / telemetry pulses
 * - Environmental response to active stage / critical status
 */
export default function AegisLivingCanvas({ currentStage, isCritical = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pool
    const particleCount = 42;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.8 + 0.6,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      alpha: Math.random() * 0.35 + 0.1,
      color: Math.random() > 0.4 ? 'rgba(111, 148, 125,' : 'rgba(214, 198, 165,'
    }));

    // Radar sweep angle
    let sweepAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Radar sweep line from top-center
      sweepAngle += 0.0035;
      const originX = width * 0.5;
      const originY = height * 0.35;
      const sweepRadius = Math.max(width, height) * 0.8;
      
      const sweepEndX = originX + Math.cos(sweepAngle) * sweepRadius;
      const sweepEndY = originY + Math.sin(sweepAngle) * sweepRadius;

      const grad = ctx.createLinearGradient(originX, originY, sweepEndX, sweepEndY);
      grad.addColorStop(0, 'rgba(111, 148, 125, 0.04)');
      grad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.moveTo(originX, originY);
      ctx.arc(originX, originY, sweepRadius, sweepAngle - 0.2, sweepAngle);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // 2. Render particles
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color} ${p.alpha})`;
        ctx.fill();
      }

      // 3. Subtle critical red vignette when in critical state
      if (isCritical) {
        const pulse = Math.sin(Date.now() * 0.003) * 0.035 + 0.05;
        const vignette = ctx.createRadialGradient(
          width / 2, height / 2, width * 0.2,
          width / 2, height / 2, width * 0.7
        );
        vignette.addColorStop(0, 'transparent');
        vignette.addColorStop(1, `rgba(217, 83, 79, ${pulse})`);
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, width, height);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [isCritical]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.85
      }}
    />
  );
}
