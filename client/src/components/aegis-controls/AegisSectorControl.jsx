import React from 'react';
import { Crosshair } from 'lucide-react';

export default function AegisSectorControl({
  sectors = [
    { id: "A", name: "NORTH", risk: "18%", status: "STABLE", color: "#6F947D", bg: "rgba(111, 148, 125, 0.16)" },
    { id: "B", name: "COMM", risk: "48%", status: "WARNING", color: "#C99A45", bg: "rgba(201, 154, 69, 0.16)" },
    { id: "C", name: "RIVER", risk: "74%", status: "ELEVATED", color: "#C99A45", bg: "rgba(201, 154, 69, 0.16)" },
    { id: "D", name: "SOUTH", risk: "96%", status: "CRITICAL", color: "#D9534F", bg: "rgba(217, 83, 79, 0.18)" },
    { id: "E", name: "DELTA", risk: "?", status: "UNKNOWN", color: "#8B72A8", bg: "rgba(139, 114, 168, 0.18)" }
  ],
  selectedId = "D",
  onSelectSector,
  onHoverSector
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: 'rgba(14, 27, 21, 0.8)',
      border: '1px solid rgba(214, 198, 165, 0.16)',
      borderRadius: '6px',
      padding: '8px 14px',
      boxShadow: '0 12px 35px rgba(0,0,0,0.7), inset 0 1px 1px rgba(234, 229, 216, 0.12)',
      backdropFilter: 'blur(20px)',
      userSelect: 'none'
    }}>
      {/* Console Header Rail */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Crosshair size={13} color="#06b6d4" />
          <span className="font-hud" style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.14em', color: '#f8fafc' }}>
            SECTOR
          </span>
        </div>
        <span className="font-mono" style={{ fontSize: '9px', color: '#64748b', letterSpacing: '0.1em' }}>
          SELECT
        </span>
      </div>

      {/* 5 Tactical Sector Module Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {sectors.map((sec) => {
          const isSelected = selectedId === sec.id;

          return (
            <button
              key={sec.id}
              onClick={() => onSelectSector && onSelectSector(sec.id)}
              onMouseEnter={() => onHoverSector && onHoverSector(sec.id)}
              onMouseLeave={() => onHoverSector && onHoverSector(null)}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '74px',
                height: '70px',
                padding: '6px 4px',
                background: isSelected ? sec.bg : 'rgba(15, 23, 42, 0.65)',
                border: `1px solid ${isSelected ? sec.color : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '3px',
                cursor: 'pointer',
                transition: 'all 0.16s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isSelected ? `0 0 16px ${sec.color}40, inset 0 0 12px ${sec.color}25` : 'none',
                transform: isSelected ? 'translateY(-2px)' : 'none'
              }}
            >
              {/* Corner Bracket Accents when Selected */}
              {isSelected && (
                <>
                  <span style={{ position: 'absolute', top: '-1px', left: '-1px', width: '5px', height: '5px', borderTop: `2px solid ${sec.color}`, borderLeft: `2px solid ${sec.color}`, pointerEvents: 'none' }} />
                  <span style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '5px', height: '5px', borderBottom: `2px solid ${sec.color}`, borderRight: `2px solid ${sec.color}`, pointerEvents: 'none' }} />
                </>
              )}

              {/* Sector Letter & Status Indicator Dot */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 4px' }}>
                <span className="font-hud" style={{ fontSize: '15px', fontWeight: '800', color: isSelected ? '#ffffff' : '#e2e8f0', lineHeight: 1 }}>
                  {sec.id}
                </span>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: sec.color,
                  boxShadow: `0 0 6px ${sec.color}`,
                  display: 'inline-block'
                }} />
              </div>

              {/* Sector Shortcode */}
              <span className="font-mono" style={{ fontSize: '9px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {sec.name}
              </span>

              {/* Risk Percentage Readout */}
              <div className="font-mono" style={{
                fontSize: '12px',
                fontWeight: '800',
                color: sec.color,
                letterSpacing: '0.04em',
                lineHeight: 1
              }}>
                {sec.risk}
              </div>

              {/* Tiny Status Tag */}
              <span style={{
                fontSize: '7px',
                fontFamily: 'var(--font-mono)',
                color: isSelected ? sec.color : '#64748b',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontWeight: '700'
              }}>
                {sec.status}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
