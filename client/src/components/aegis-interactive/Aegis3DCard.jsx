import React, { useState } from 'react';

/**
 * AEGIS 3D Interactive Card
 * Features:
 * - Stable, flat planar card layout (cursor tilt removed)
 * - Dynamic Specular Glass Sheen
 * - Click expansion trigger (optional)
 */
export default function Aegis3DCard({
  children,
  className = "",
  style = {},
  onClick,
  maxTilt: _maxTilt,
  elevation: _elevation,
  expandOnClick = false,
  ...props
}) {
  const [isExpanding, setIsExpanding] = useState(false);

  const handleClick = (e) => {
    if (expandOnClick) {
      setIsExpanding(true);
      setTimeout(() => {
        setIsExpanding(false);
      }, 350);
    }
    if (onClick) onClick(e);
  };

  return (
    <div
      className={`aegis-3d-card ${className}`}
      onClick={handleClick}
      style={{
        transform: isExpanding ? 'scale(1.02)' : 'none',
        ...style
      }}
      {...props}
    >
      {/* Specular Glass Sheen Overlay */}
      <div className="aegis-glass-sheen" />

      {/* Internal Content */}
      <div style={{ position: 'relative', zIndex: 2, height: '100%' }}>
        {children}
      </div>
    </div>
  );
}
