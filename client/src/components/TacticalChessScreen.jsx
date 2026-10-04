import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Send, 
  Flame, 
  Radio, 
  Truck, 
  Activity,
  Play, 
  CheckCircle2, 
  ChevronRight, 
  ShieldAlert, 
  Clock, 
  MapPin,
  AlertTriangle,
  Navigation
} from 'lucide-react';
import { AegisPrimaryCommand } from './aegis-controls';
import { Aegis3DCard, AegisAnimatedNumber } from './aegis-interactive';

export default function TacticalChessScreen({
  onProceedToDeploy
}) {
  const pieces = [
    {
      id: "amb-02",
      name: "AMBULANCE 02",
      type: "AMBULANCE",
      icon: HeartHandshake,
      color: "#6f947d",
      current: "BASE (ZONE A)",
      target: "ZONE D",
      targetDesc: "South General Hospital Trauma Bay",
      eta: "14 MIN",
      etaMinutes: 14,
      risk: "HIGH",
      impact: "Hospital access +18%",
      route: "Base → Road 12 → Zone D",
      coords: { x: 22, y: 22 },
      targetCoords: { x: 74, y: 72 }
    },
    {
      id: "drone-01",
      name: "DRONE 01",
      type: "DRONE",
      icon: Send,
      color: "#8b72a8",
      current: "BASE (ZONE A)",
      target: "ZONE E",
      targetDesc: "East Delta Industrial Blackout",
      eta: "6 MIN",
      etaMinutes: 6,
      risk: "LOW (AERIAL BYPASS)",
      impact: "Recon coverage +53%",
      route: "Base → High Airspace → Delta Yard",
      coords: { x: 22, y: 22 },
      targetCoords: { x: 80, y: 28 }
    },
    {
      id: "rescue-01",
      name: "RESCUE TEAM 01",
      type: "RESCUE TEAM",
      icon: Flame,
      color: "#d9534f",
      current: "BASE (ZONE A)",
      target: "ZONE C",
      targetDesc: "Bridge 17 Industrial Berm",
      eta: "18 MIN",
      etaMinutes: 18,
      risk: "SEVERE",
      impact: "Berm stabilization +35%",
      route: "Base → North Arterial → Bridge 17",
      coords: { x: 22, y: 22 },
      targetCoords: { x: 42, y: 62 }
    },
    {
      id: "med-01",
      name: "MEDICAL UNIT 01",
      type: "MEDICAL UNIT",
      icon: Activity,
      color: "#6f947d",
      current: "BASE (ZONE A)",
      target: "ZONE D",
      targetDesc: "Mobile Field Surgical Pod",
      eta: "22 MIN",
      etaMinutes: 22,
      risk: "HIGH",
      impact: "Trauma capacity +40 beds",
      route: "Base → Road 12 → Zone D Yard",
      coords: { x: 22, y: 22 },
      targetCoords: { x: 74, y: 72 }
    },
    {
      id: "comms-01",
      name: "COMMUNICATION UNIT 01",
      type: "COMMUNICATION UNIT",
      icon: Radio,
      color: "#d6c6a5",
      current: "BASE (ZONE A)",
      target: "ZONE E",
      targetDesc: "High Ground Satellite Relay Mast",
      eta: "12 MIN",
      etaMinutes: 12,
      risk: "MODERATE",
      impact: "Comms link +48%",
      route: "Base → East Ridge Overlook",
      coords: { x: 22, y: 22 },
      targetCoords: { x: 80, y: 28 }
    },
    {
      id: "supply-01",
      name: "SUPPLY CONVOY 01",
      type: "SUPPLY CONVOY",
      icon: Truck,
      color: "#c99a45",
      current: "BASE (ZONE A)",
      target: "ZONE B",
      targetDesc: "Commercial Hub Flood Barrier Staging",
      eta: "10 MIN",
      etaMinutes: 10,
      risk: "MODERATE",
      impact: "Flood barrier +500m",
      route: "Base → Commercial Connector",
      coords: { x: 22, y: 22 },
      targetCoords: { x: 50, y: 32 }
    }
  ];

  const [selectedPiece, setSelectedPiece] = useState(pieces[0]);

  return (
    <div style={{ flex: 1, padding: '24px', maxWidth: '1220px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid rgba(214, 198, 165, 0.12)', paddingBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="font-mono" style={{ fontSize: '11px', color: '#c99a45', background: 'rgba(201, 154, 69, 0.14)', padding: '2px 8px', borderRadius: '2px', border: '1px solid rgba(201, 154, 69, 0.4)', fontWeight: '700' }}>
              STAGE 10 // DISASTER CHESS STRATEGY
            </span>
            <span className="font-mono" style={{ fontSize: '11px', color: '#9fb5a4' }}>
              TACTICAL PIECE ALLOCATION &amp; BOARD MANEUVER
            </span>
          </div>
          <h1 className="font-hud" style={{ fontSize: '26px', fontWeight: '800', color: '#eae5d8', margin: '6px 0 0 0', letterSpacing: '0.04em' }}>
            TACTICAL BOARD &amp; ASSET MANEUVER
          </h1>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4', letterSpacing: '0.08em' }}>ACTIVE PIECE</div>
          <div className="font-hud" style={{ fontSize: '18px', fontWeight: '800', color: selectedPiece.color }}>
            {selectedPiece.name}
          </div>
        </div>
      </div>

      {/* 3-Column Layout: Pieces List, Visual Board, Deployment Slip */}
      <div style={{ display: 'grid', gridTemplateColumns: '290px 1fr 340px', gap: '18px', alignItems: 'stretch' }}>
        
        {/* Left Column: 6 Tactical Pieces */}
        <div className="aegis-glass" style={{ background: 'rgba(14, 27, 21, 0.88)', border: '1px solid rgba(214, 198, 165, 0.15)', borderRadius: '6px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span className="font-hud" style={{ fontSize: '11px', fontWeight: '700', color: '#d6c6a5', letterSpacing: '0.08em', marginBottom: '4px' }}>
            SELECT TACTICAL PIECE ({pieces.length})
          </span>

          {pieces.map(piece => {
            const Icon = piece.icon;
            const isSelected = selectedPiece.id === piece.id;

            return (
              <button
                key={piece.id}
                data-cursor="deploy"
                onClick={() => setSelectedPiece(piece)}
                style={{
                  background: isSelected ? 'rgba(25, 58, 42, 0.65)' : 'rgba(8, 13, 10, 0.6)',
                  border: isSelected ? `1px solid ${piece.color}` : '1px solid rgba(214, 198, 165, 0.1)',
                  borderRadius: '4px',
                  padding: '10px 12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? `0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(214, 198, 165, 0.15)` : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={16} color={piece.color} />
                  <div>
                    <div className="font-hud" style={{ fontSize: '13px', fontWeight: '700', color: '#eae5d8' }}>
                      {piece.name}
                    </div>
                    <div className="font-mono" style={{ fontSize: '9px', color: '#9fb5a4' }}>
                      {piece.type}
                    </div>
                  </div>
                </div>

                <span className="font-mono" style={{ fontSize: '11px', color: isSelected ? '#eae5d8' : '#9fb5a4', fontWeight: '700' }}>
                  → {piece.target}
                </span>
              </button>
            );
          })}
        </div>

        {/* Center Column: Visual Tactical Board with Hazards, Blocked Roads, Routes */}
        <div className="aegis-glass" style={{ background: 'rgba(14, 27, 21, 0.92)', border: '1px solid rgba(214, 198, 165, 0.2)', borderRadius: '6px', padding: '16px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', zIndex: 10 }}>
            <span className="font-hud" style={{ fontSize: '12px', fontWeight: '700', color: '#d6c6a5', letterSpacing: '0.08em' }}>
              TACTICAL GRID // THREAT OVERLAY
            </span>
            <div style={{ display: 'flex', gap: '12px', fontSize: '10px' }} className="font-mono">
              <span style={{ color: '#d9534f' }}>■ BLOCKED (ROAD 17)</span>
              <span style={{ color: '#6f947d' }}>■ BYPASS (ROAD 12)</span>
              <span style={{ color: '#c99a45' }}>■ HIGH RISK</span>
            </div>
          </div>

          {/* SVG Tactical Chess Board */}
          <div style={{ flex: 1, minHeight: '360px', position: 'relative', background: 'radial-gradient(ellipse at center, rgba(25,58,42,0.3) 0%, rgba(8,13,10,0.9) 100%)', borderRadius: '4px', border: '1px solid rgba(214, 198, 165, 0.1)' }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ position: 'absolute', top: 0, left: 0 }}>
              
              {/* Tactical Grid Lines */}
              <defs>
                <pattern id="tacticalGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(214, 198, 165, 0.05)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#tacticalGrid)" />

              {/* River Flow Line */}
              <path d="M 15 50 Q 40 55 60 75 T 95 90" fill="none" stroke="rgba(111, 148, 125, 0.25)" strokeWidth="4" />
              <path d="M 15 50 Q 40 55 60 75 T 95 90" fill="none" stroke="#6f947d" strokeWidth="1" strokeDasharray="2,2" />

              {/* Blocked Road 17 with Hazard Red line */}
              <line x1="42" y1="62" x2="74" y2="72" stroke="#d9534f" strokeWidth="2.5" strokeDasharray="3,2" />
              <circle cx="58" cy="67" r="3" fill="rgba(217, 83, 79, 0.4)" stroke="#d9534f" strokeWidth="0.8" />
              <text x="58" y="66" fill="#fca5a5" fontSize="3" textAnchor="middle" fontFamily="monospace">✕ BLOCKED RD-17</text>

              {/* Active Recommended Bypass Road 12 */}
              <line x1="22" y1="22" x2="50" y2="32" stroke="#6f947d" strokeWidth="1.5" />
              <line x1="50" y1="32" x2="74" y2="72" stroke="#6f947d" strokeWidth="2" strokeDasharray="2,2" />
              <text x="62" y="50" fill="#9fb5a4" fontSize="2.8" fontFamily="monospace">ROUTE: RD-12 BYPASS</text>

              {/* Zone Markers */}
              {/* Zone A */}
              <circle cx="22" cy="22" r="8" fill="rgba(111, 148, 125, 0.18)" stroke="#6f947d" strokeWidth="1" />
              <text x="22" y="23" fill="#eae5d8" fontSize="3.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">A: BASE</text>

              {/* Zone B */}
              <circle cx="50" cy="32" r="9" fill="rgba(201, 154, 69, 0.18)" stroke="#c99a45" strokeWidth="1" />
              <text x="50" y="33" fill="#eae5d8" fontSize="3.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">B: HUB</text>

              {/* Zone C */}
              <circle cx="42" cy="62" r="8" fill="rgba(217, 83, 79, 0.2)" stroke="#d9534f" strokeWidth="1" />
              <text x="42" y="63" fill="#eae5d8" fontSize="3.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">C: BASIN</text>

              {/* Zone D */}
              <circle cx="74" cy="72" r="10" fill="rgba(217, 83, 79, 0.28)" stroke="#d9534f" strokeWidth="1.5" />
              <text x="74" y="71" fill="#fca5a5" fontSize="3.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">D: HOSPITAL</text>
              <text x="74" y="76" fill="#d9534f" fontSize="2.8" textAnchor="middle" fontFamily="monospace">RISK 96%</text>

              {/* Zone E */}
              <circle cx="80" cy="28" r="8" fill="rgba(139, 114, 168, 0.2)" stroke="#8b72a8" strokeWidth="1" />
              <text x="80" y="29" fill="#eae5d8" fontSize="3.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">E: DELTA</text>

              {/* Selected Piece Movement Vector */}
              <line
                x1={selectedPiece.coords.x}
                y1={selectedPiece.coords.y}
                x2={selectedPiece.targetCoords.x}
                y2={selectedPiece.targetCoords.y}
                stroke={selectedPiece.color}
                strokeWidth="2"
                strokeDasharray="4,4"
              />
              <circle
                cx={selectedPiece.targetCoords.x}
                cy={selectedPiece.targetCoords.y}
                r="4"
                fill="none"
                stroke={selectedPiece.color}
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>

        {/* Right Column: Piece Deployment Slip & Action */}
        <div className="aegis-glass" style={{ background: 'rgba(14, 27, 21, 0.88)', border: '1px solid rgba(214, 198, 165, 0.15)', borderRadius: '6px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ borderBottom: '1px solid rgba(214, 198, 165, 0.12)', paddingBottom: '10px' }}>
              <span className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4', letterSpacing: '0.08em' }}>TACTICAL PIECE</span>
              <div className="font-hud" style={{ fontSize: '20px', fontWeight: '800', color: selectedPiece.color }}>
                {selectedPiece.name}
              </div>
            </div>

            <div>
              <span className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4' }}>CURRENT LOCATION:</span>
              <div className="font-mono" style={{ fontSize: '13px', color: '#eae5d8', fontWeight: '700' }}>
                {selectedPiece.current}
              </div>
            </div>

            <div>
              <span className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4' }}>TARGET DEPLOYMENT:</span>
              <div className="font-hud" style={{ fontSize: '16px', fontWeight: '700', color: '#d6c6a5' }}>
                [ {selectedPiece.target} ]
              </div>
              <div style={{ fontSize: '11px', color: '#9fb5a4', marginTop: '2px' }}>
                {selectedPiece.targetDesc}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ background: 'rgba(8, 13, 10, 0.55)', padding: '8px', borderRadius: '4px', border: '1px solid rgba(214, 198, 165, 0.08)' }}>
                <span className="font-mono" style={{ fontSize: '9px', color: '#9fb5a4' }}>ETA:</span>
                <div className="font-mono" style={{ fontSize: '14px', fontWeight: '800', color: '#6f947d' }}>
                  {selectedPiece.eta}
                </div>
              </div>

              <div style={{ background: 'rgba(8, 13, 10, 0.55)', padding: '8px', borderRadius: '4px', border: '1px solid rgba(214, 198, 165, 0.08)' }}>
                <span className="font-mono" style={{ fontSize: '9px', color: '#9fb5a4' }}>TRANSIT RISK:</span>
                <div className="font-mono" style={{ fontSize: '13px', fontWeight: '800', color: selectedPiece.risk === 'HIGH' || selectedPiece.risk === 'SEVERE' ? '#d9534f' : '#6f947d' }}>
                  {selectedPiece.risk}
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(25, 58, 42, 0.35)', borderLeft: '3px solid #6f947d', padding: '10px 12px', borderRadius: '2px' }}>
              <div className="font-mono" style={{ fontSize: '10px', color: '#d6c6a5', fontWeight: '700' }}>EXPECTED IMPACT:</div>
              <div style={{ fontSize: '12px', color: '#eae5d8', marginTop: '2px', fontWeight: '600' }}>
                {selectedPiece.impact}
              </div>
            </div>

            <div>
              <span className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4' }}>VECTOR ROUTE:</span>
              <div className="font-mono" style={{ fontSize: '11px', color: '#eae5d8', marginTop: '2px' }}>
                {selectedPiece.route}
              </div>
            </div>

          </div>

          {/* Confirm Deployment Button -> Triggers Stage 11 Live Deployment Animation */}
          <AegisPrimaryCommand
            label="CONFIRM DEPLOYMENT"
            subtitle={`DISPATCH ${selectedPiece.name} TO ${selectedPiece.target}`}
            status="ROUTE VERIFIED (ROAD 12 BYPASS)"
            icon="◈"
            onClick={() => onProceedToDeploy(selectedPiece)}
            variant="sage"
            width="100%"
          />

        </div>

      </div>

    </div>
  );
}
