import React, { useRef, useState } from 'react';

/**
 * AEGIS 3D Interactive Card
 * Features:
 * - 3D Perspective Tilt (5-7 degrees max)
 * - Dynamic Specular Glass Sheen following cursor
 * - Mouse Parallax on internal content
 * - Click expansion trigger
 * - Smooth spring-like return on mouse leave
 */
export default function Aegis3DCard({
  children,
  className = "",
  style = {},
  onClick,
  maxTilt = 6,
  elevation = 14,
  expandOnClick = false,
  ...props
}) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)");
  const [isExpanding, setIsExpanding] = useState(false);
  const [coords, setCoords] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (isExpanding || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const percentX = (x / rect.width) * 100;
    const percentY = (y / rect.height) * 100;
    setCoords({ x: percentX, y: percentY });

    // Rotate bounds: maxTilt (5 - 7 degrees)
    const rotateY = ((x - centerX) / centerX) * maxTilt;
    const rotateX = -((y - centerY) / centerY) * maxTilt;

    // Parallax depth offset (-4px to +4px)
    const parallaxX = ((x - centerX) / centerX) * 4;
    const parallaxY = ((y - centerY) / centerY) * 4;

    setTransform(
      `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(${elevation}px)`
    );
    if (cardRef.current) {
      cardRef.current.style.setProperty('--parallax-x', `${parallaxX.toFixed(1)}px`);
      cardRef.current.style.setProperty('--parallax-y', `${parallaxY.toFixed(1)}px`);
    }
  };

  const handleMouseLeave = () => {
    if (isExpanding) return;
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)");
    if (cardRef.current) {
      cardRef.current.style.setProperty('--parallax-x', '0px');
      cardRef.current.style.setProperty('--parallax-y', '0px');
    }
  };

  const handleClick = (e) => {
    if (expandOnClick) {
      setIsExpanding(true);
      setTransform("perspective(1000px) scale(1.04) translateZ(30px)");
      setTimeout(() => {
        setIsExpanding(false);
        setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)");
      }, 500);
    }
    if (onClick) onClick(e);
  };

  return (
    <div
      ref={cardRef}
      className={`aegis-3d-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        transform,
        '--mouse-x': `${coords.x}%`,
        '--mouse-y': `${coords.y}%`,
        ...style
      }}
      {...props}
    >
      {/* Dynamic Specular Glass Sheen Overlay */}
      <div className="aegis-glass-sheen" />

      {/* Internal Content */}
      <div style={{ position: 'relative', zIndex: 2, height: '100%' }}>
        {children}
      </div>
    </div>
  );
}
