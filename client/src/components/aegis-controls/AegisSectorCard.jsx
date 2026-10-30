import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Radio, Activity } from 'lucide-react';
import AegisAnimatedNumber from '../aegis-interactive/AegisAnimatedNumber';

/**
 * AegisSectorCard
 * 
 * Reusable interactive sector card conforming to Section 4, 5 & 15:
 * - Zone rises on hover (translateZ & elevation)
 * - Highlights telemetry and active risk breakdown
 * - Clickable to focus sector on digital twin
 */
export default function AegisSectorCard({
  zone,
  isSelected = false,
  onSelect,
  className = "",
  style = {}
}) {
  if (!zone) return null;

  const isCritical = zone.status === 'CRITICAL' || zone.risk >= 80;
  const isHighRisk = zone.status === 'HIGH_RISK' || (zone.risk >= 60 && zone.risk < 80);
  const isUnknown = zone.status === 'UNKNOWN' || zone.isUnknown;

  const statusColor = isCritical 
    ? "var(--color-critical)" 
    : isHighRisk 
    ? "var(--color-beige)" 
    : isUnknown 
    ? "var(--color-unknown)" 
    : "var(--color-sage)";

  return (
    <div
      className={`aegis-sector-card ${className} ${isSelected ? 'is-selected' : ''}`}
      onClick={() => onSelect && onSelect(zone)}
      style={{
        transform: isSelected ? 'translateY(-2px)' : 'none',
        position: 'relative',
        background: isSelected 
          ? 'linear-gradient(135deg, rgba(20, 41, 30, 0.95) 0%, rgba(13, 27, 20, 0.98) 100%)' 
          : 'rgba(13, 27, 20, 0.72)',
        border: isSelected 
          ? '1px solid var(--border-beige-active)' 
          : '1px solid var(--border-subtle)',
        borderLeft: `4px solid ${statusColor}`,
        borderRadius: '3px',
        padding: '14px 16px',
        cursor: 'pointer',
        userSelect: 'none',
        backdropFilter: 'blur(16px)',
        transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: isSelected
          ? '0 12px 30px rgba(0, 0, 0, 0.65), 0 0 20px rgba(214, 195, 154, 0.16)'
          : '0 4px 16px rgba(0, 0, 0, 0.45)',
        ...style
      }}
    >
      {/* Specular Sheen */}
      <div 
        className="aegis-glass-sheen" 
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          borderRadius: 'inherit',
          background: 'radial-gradient(circle 180px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(214, 195, 154, 0.12), transparent 75%)'
        }}
      />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span 
            className="font-hud" 
            style={{ 
              fontSize: '15px', 
              fontWeight: '800', 
              color: isSelected ? 'var(--color-beige-light)' : 'var(--color-off-white)' 
            }}
          >
            SECTOR {zone.id}
          </span>
          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--color-sage-light)' }}>
            {zone.name}
          </span>
        </div>

        <span 
          className="font-mono" 
          style={{ 
            fontSize: '9px', 
            fontWeight: '700', 
            padding: '2px 7px', 
            borderRadius: '2px', 
            background: `${statusColor}20`, 
            border: `1px solid ${statusColor}50`, 
            color: statusColor 
          }}
        >
          {zone.status}
        </span>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '10px' }} className="font-mono">
        <div style={{ background: 'rgba(7, 16, 12, 0.6)', padding: '4px 8px', borderRadius: '2px', border: '1px solid rgba(214, 195, 154, 0.08)' }}>
          <div style={{ fontSize: '9px', color: 'var(--color-sage)' }}>RISK INDEX</div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: statusColor }}>
            <AegisAnimatedNumber value={zone.risk || 0} suffix="%" />
          </div>
        </div>

        <div style={{ background: 'rgba(7, 16, 12, 0.6)', padding: '4px 8px', borderRadius: '2px', border: '1px solid rgba(214, 195, 154, 0.08)' }}>
          <div style={{ fontSize: '9px', color: 'var(--color-sage)' }}>POPULATION</div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-off-white)' }}>
            {zone.population ? `${(zone.population / 1000).toFixed(1)}k` : "N/A"}
          </div>
        </div>

        <div style={{ background: 'rgba(7, 16, 12, 0.6)', padding: '4px 8px', borderRadius: '2px', border: '1px solid rgba(214, 195, 154, 0.08)' }}>
          <div style={{ fontSize: '9px', color: 'var(--color-sage)' }}>CONNECTIVITY</div>
          <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-beige)' }}>
            {zone.connectivity ? `${zone.connectivity}%` : "OFFLINE"}
          </div>
        </div>
      </div>

      {/* Key Asset */}
      {zone.keyAsset && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'rgba(241, 235, 221, 0.85)' }}>
          <ShieldAlert size={12} color="var(--color-beige)" style={{ flexShrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {zone.keyAsset}
          </span>
        </div>
      )}
    </div>
  );
}
