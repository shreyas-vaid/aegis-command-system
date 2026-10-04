import React, { useState } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Layers, 
  Eye, 
  AlertOctagon, 
  Zap, 
  Truck, 
  Wrench, 
  Flame, 
  HeartHandshake, 
  HelpCircle,
  Activity,
  Maximize2
} from 'lucide-react';

export default function DigitalTwinMap({
  zones = [],
  selectedZoneId = 'D',
  onSelectZone,
  timeOffset = 0,
  deployedResources = {},
  weather = {}
}) {
  const [activeLayers, setActiveLayers] = useState({
    flood: true,
    roads: true,
    infrastructure: true,
    units: true,
    incidents: true
  });

  const [hoveredZone, setHoveredZone] = useState(null);

  const toggleLayer = (layer) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  // Find zone data
  const zoneA = zones.find(z => z.id === 'A') || { risk: 18, status: 'STABLE', roads: 88 };
  const zoneB = zones.find(z => z.id === 'B') || { risk: 48, status: 'WARNING', roads: 64 };
  const zoneC = zones.find(z => z.id === 'C') || { risk: 74, status: 'HIGH_RISK', roads: 38, floodLevel: 3.4 };
  const zoneD = zones.find(z => z.id === 'D') || { risk: 96, status: 'CRITICAL', roads: 22, floodLevel: 2.9 };
  const zoneE = zones.find(z => z.id === 'E') || { risk: 78, status: 'UNKNOWN', isUnknown: true, roads: 25 };

  // Calculate dynamic flood boundary based on timeOffset and rainfall
  const floodSpread = timeOffset === 0 ? 0 : timeOffset === 15 ? 12 : timeOffset === 30 ? 24 : 38;

  // Determine status color for zone SVG strokes/fills
  const getZoneColors = (zone) => {
    if (zone.status === 'UNKNOWN' || zone.isUnknown || zone.id === 'E') {
      return {
        fill: 'rgba(139, 114, 168, 0.18)',
        stroke: '#8B72A8',
        glow: 'rgba(139, 114, 168, 0.45)',
        badge: 'UNKNOWN'
      };
    }
    if (zone.status === 'CRITICAL' || zone.risk >= 80) {
      return {
        fill: 'rgba(217, 83, 79, 0.22)',
        stroke: '#D9534F',
        glow: 'rgba(217, 83, 79, 0.55)',
        badge: 'CRITICAL'
      };
    }
    if (zone.status === 'HIGH_RISK' || zone.risk >= 60) {
      return {
        fill: 'rgba(201, 154, 69, 0.2)',
        stroke: '#C99A45',
        glow: 'rgba(201, 154, 69, 0.45)',
        badge: 'HIGH RISK'
      };
    }
    if (zone.status === 'WARNING' || zone.risk >= 35) {
      return {
        fill: 'rgba(201, 154, 69, 0.16)',
        stroke: '#C99A45',
        glow: 'rgba(201, 154, 69, 0.35)',
        badge: 'WARNING'
      };
    }
    return {
      fill: 'rgba(111, 148, 125, 0.15)',
      stroke: '#6F947D',
      glow: 'rgba(111, 148, 125, 0.3)',
      badge: 'STABLE'
    };
  };

  const colorsA = getZoneColors(zoneA);
  const colorsB = getZoneColors(zoneB);
  const colorsC = getZoneColors(zoneC);
  const colorsD = getZoneColors(zoneD);
  const colorsE = getZoneColors(zoneE);

  // Render deployed units icons count
  const renderUnitsBadge = (zoneId, cx, cy) => {
    if (!activeLayers.units) return null;
    const med = deployedResources.medical?.[zoneId] || 0;
    const eng = deployedResources.engineering?.[zoneId] || 0;
    const fire = deployedResources.fire?.[zoneId] || 0;
    const log = deployedResources.logistics?.[zoneId] || 0;
    const total = med + eng + fire + log;
    if (total === 0) return null;

    return (
      <g transform={`translate(${cx}, ${cy})`}>
        <rect x="-35" y="-12" width="70" height="24" rx="4" fill="rgba(10, 15, 25, 0.9)" stroke="#06b6d4" strokeWidth="1.5" />
        <text x="0" y="4" textAnchor="middle" fill="#67e8f9" fontSize="10" fontFamily="var(--font-mono)" fontWeight="700">
          {med > 0 && `+${med}MED `}{eng > 0 && `+${eng}ENG `}{fire > 0 && `+${fire}FIRE `}{log > 0 && `+${log}LOG `}
        </text>
      </g>
    );
  };

  const [mapTilt, setMapTilt] = useState({ x: 0, y: 0 });

  const handleMapMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMapTilt({
      x: -y * 3.5, // rotateX
      y: x * 3.5   // rotateY
    });
  };

  const handleMapMouseLeave = () => {
    setMapTilt({ x: 0, y: 0 });
  };

  return (
    <div 
      className="aegis-glass" 
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        minHeight: '520px', 
        position: 'relative', 
        overflow: 'hidden',
        border: '1px solid rgba(214, 198, 165, 0.18)',
        background: 'rgba(14, 27, 21, 0.88)',
        backdropFilter: 'blur(20px)'
      }}
    >
      
      {/* Map Control Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid rgba(214, 198, 165, 0.12)', background: 'rgba(8, 13, 10, 0.75)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6F947D' }} />
          <span className="font-hud" style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.12em', color: '#D6C6A5', textTransform: 'uppercase' }}>
            DIGITAL TWIN // URBAN TOPOLOGY &amp; DISASTER VECTORS
          </span>
          <span className="font-mono" style={{ fontSize: '10px', color: '#9FB5A4', marginLeft: '6px' }}>
            GRID [34°05'N, 118°14'W] · SENSOR REFRESH: 1Hz · HOLOGRAPHIC SAND-TABLE
          </span>
        </div>

        {/* Layer Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="font-hud" style={{ fontSize: '10px', color: '#9FB5A4', marginRight: '4px', letterSpacing: '0.08em' }}>LAYERS:</span>
          
          <button 
            onClick={() => toggleLayer('flood')}
            style={{ 
              fontSize: '10px', 
              padding: '3px 8px', 
              background: activeLayers.flood ? 'rgba(111, 148, 125, 0.25)' : 'rgba(8, 13, 10, 0.6)', 
              border: `1px solid ${activeLayers.flood ? '#6F947D' : 'rgba(214, 198, 165, 0.15)'}`,
              color: activeLayers.flood ? '#EAE5D8' : '#9FB5A4',
              borderRadius: '2px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)'
            }}
          >
            🌊 FLOOD PLAIN
          </button>
          
          <button 
            onClick={() => toggleLayer('roads')}
            style={{ 
              fontSize: '10px', 
              padding: '3px 8px', 
              background: activeLayers.roads ? 'rgba(111, 148, 125, 0.25)' : 'rgba(8, 13, 10, 0.6)', 
              border: `1px solid ${activeLayers.roads ? '#6F947D' : 'rgba(214, 198, 165, 0.15)'}`,
              color: activeLayers.roads ? '#EAE5D8' : '#9FB5A4',
              borderRadius: '2px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)'
            }}
          >
            🛣️ ROADS
          </button>

          <button 
            onClick={() => toggleLayer('infrastructure')}
            style={{ 
              fontSize: '10px', 
              padding: '3px 8px', 
              background: activeLayers.infrastructure ? 'rgba(111, 148, 125, 0.25)' : 'rgba(8, 13, 10, 0.6)', 
              border: `1px solid ${activeLayers.infrastructure ? '#6F947D' : 'rgba(214, 198, 165, 0.15)'}`,
              color: activeLayers.infrastructure ? '#EAE5D8' : '#9FB5A4',
              borderRadius: '2px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)'
            }}
          >
            🏥 INFRASTRUCTURE
          </button>

          <button 
            onClick={() => toggleLayer('units')}
            style={{ 
              fontSize: '10px', 
              padding: '3px 8px', 
              background: activeLayers.units ? 'rgba(111, 148, 125, 0.25)' : 'rgba(8, 13, 10, 0.6)', 
              border: `1px solid ${activeLayers.units ? '#6F947D' : 'rgba(214, 198, 165, 0.15)'}`,
              color: activeLayers.units ? '#EAE5D8' : '#9FB5A4',
              borderRadius: '2px',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)'
            }}
          >
            🚒 FLEET DEPLOYED
          </button>
        </div>
      </div>

      {/* SVG Map Canvas with Holographic Sand-Table Tilt */}
      <div 
        onMouseMove={handleMapMouseMove}
        onMouseLeave={handleMapMouseLeave}
        style={{ 
          flex: 1, 
          position: 'relative', 
          width: '100%', 
          height: '100%', 
          minHeight: '440px', 
          background: '#080D0A',
          perspective: '1200px',
          overflow: 'hidden'
        }}
      >
        <div style={{
          width: '100%',
          height: '100%',
          transform: `rotateX(${mapTilt.x.toFixed(2)}deg) rotateY(${mapTilt.y.toFixed(2)}deg)`,
          transition: 'transform 0.15s ease-out',
          transformStyle: 'preserve-3d'
        }}>
        
        {/* Subtle grid pattern background */}
        <svg
          viewBox="0 0 1000 650"
          style={{ width: '100%', height: '100%', display: 'block', userSelect: 'none' }}
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
            </pattern>
            
            {/* Flood Gradient */}
            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#0369a1" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#075985" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="floodExpGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
            </linearGradient>

            {/* Radar scan radial gradient */}
            <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(6, 182, 212, 0.15)" />
              <stop offset="70%" stopColor="rgba(6, 182, 212, 0.04)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>

            {/* Filter for glow */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Coordinate Grid Background */}
          <rect width="1000" height="650" fill="url(#gridPattern)" />

          {/* Living Radar Sweep with 360 degree sweep line */}
          <circle cx="580" cy="400" r="260" fill="none" stroke="rgba(214, 195, 154, 0.08)" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="580" cy="400" r="140" fill="none" stroke="rgba(214, 195, 154, 0.12)" strokeWidth="1" />
          <line x1="580" y1="400" x2="840" y2="400" stroke="rgba(214, 195, 154, 0.25)" strokeWidth="1.5">
            <animateTransform attributeName="transform" type="rotate" from="0 580 400" to="360 580 400" dur="6s" repeatCount="indefinite" />
          </line>

          {/* Living Zone Connectivity Telemetry Arcs */}
          <g id="connectivityArcs" opacity="0.6">
            {/* Zone A to B trunk */}
            <path d="M 240,140 Q 360,90 480,140" fill="none" stroke="rgba(95, 128, 107, 0.45)" strokeWidth="1.5" strokeDasharray="5 3">
              <animate attributeName="stroke-dashoffset" from="16" to="0" dur="1.2s" repeatCount="indefinite" />
            </path>
            {/* Zone B to D arterial */}
            <path d="M 580,180 Q 640,280 680,380" fill="none" stroke={zoneD.risk >= 80 ? "rgba(217, 83, 79, 0.6)" : "rgba(214, 195, 154, 0.4)"} strokeWidth="2" strokeDasharray="6 4">
              <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.9s" repeatCount="indefinite" />
            </path>
            {/* Zone C to D crossing */}
            <path d="M 380,360 Q 480,410 560,420" fill="none" stroke="rgba(217, 83, 79, 0.65)" strokeWidth="2" strokeDasharray="4 4">
              <animate attributeName="stroke-dashoffset" from="16" to="0" dur="0.8s" repeatCount="indefinite" />
            </path>
          </g>

          {/* ---------------- ZONE POLYGONS (CLICKABLE) ---------------- */}

          {/* ZONE A: North Uplands */}
          <g 
            onClick={() => onSelectZone('A')}
            onMouseEnter={() => setHoveredZone('A')}
            onMouseLeave={() => setHoveredZone(null)}
            data-cursor="inspect"
            data-zone-id="A"
            style={{ 
              cursor: 'pointer',
              opacity: (hoveredZone && hoveredZone !== 'A') ? 0.48 : 1,
              transition: 'opacity 0.25s ease, filter 0.25s ease',
              filter: hoveredZone === 'A' ? 'drop-shadow(0 10px 20px rgba(111, 148, 125, 0.5))' : 'none'
            }}
          >
            <polygon
              points="60,40 400,30 380,240 70,220"
              fill={selectedZoneId === 'A' ? 'rgba(111, 148, 125, 0.3)' : colorsA.fill}
              stroke={hoveredZone === 'A' ? '#D6C6A5' : colorsA.stroke}
              strokeWidth={selectedZoneId === 'A' || hoveredZone === 'A' ? 3 : 1.5}
              strokeDasharray={selectedZoneId === 'A' ? 'none' : '6 3'}
            />
            {/* Zone Label */}
            <rect x="90" y="55" width="130" height="32" rx="3" fill="rgba(14, 27, 21, 0.9)" stroke={hoveredZone === 'A' ? '#D6C6A5' : colorsA.stroke} strokeWidth="1" />
            <text x="100" y="72" fill="#EAE5D8" fontSize="13" fontFamily="var(--font-hud)" fontWeight="700">ZONE A: NORTH</text>
            <text x="100" y="83" fill="#6F947D" fontSize="10" fontFamily="var(--font-mono)">RISK: {zoneA.risk}% · STABLE</text>
          </g>

          {/* ZONE B: Metro Commercial Hub */}
          <g 
            onClick={() => onSelectZone('B')}
            onMouseEnter={() => setHoveredZone('B')}
            onMouseLeave={() => setHoveredZone(null)}
            data-cursor="inspect"
            data-zone-id="B"
            style={{ 
              cursor: 'pointer',
              opacity: (hoveredZone && hoveredZone !== 'B') ? 0.48 : 1,
              transition: 'opacity 0.25s ease, filter 0.25s ease',
              filter: hoveredZone === 'B' ? 'drop-shadow(0 10px 20px rgba(201, 154, 69, 0.5))' : 'none'
            }}
          >
            <polygon
              points="420,30 760,40 730,260 400,250"
              fill={selectedZoneId === 'B' ? 'rgba(201, 154, 69, 0.3)' : colorsB.fill}
              stroke={hoveredZone === 'B' ? '#D6C6A5' : colorsB.stroke}
              strokeWidth={selectedZoneId === 'B' || hoveredZone === 'B' ? 3 : 1.5}
            />
            <rect x="450" y="60" width="165" height="32" rx="3" fill="rgba(14, 27, 21, 0.9)" stroke={hoveredZone === 'B' ? '#D6C6A5' : colorsB.stroke} strokeWidth="1" />
            <text x="460" y="77" fill="#EAE5D8" fontSize="13" fontFamily="var(--font-hud)" fontWeight="700">ZONE B: COMMERCIAL HUB</text>
            <text x="460" y="88" fill="#C99A45" fontSize="10" fontFamily="var(--font-mono)">RISK: {zoneB.risk}% · WARNING</text>
          </g>

          {/* ZONE E: East Industrial Delta (UNKNOWN / INFORMATION GAP) */}
          <g 
            onClick={() => onSelectZone('E')}
            onMouseEnter={() => setHoveredZone('E')}
            onMouseLeave={() => setHoveredZone(null)}
            data-cursor="inspect"
            data-zone-id="E"
            style={{ 
              cursor: 'pointer',
              opacity: (hoveredZone && hoveredZone !== 'E') ? 0.48 : 1,
              transition: 'opacity 0.25s ease, filter 0.25s ease',
              filter: hoveredZone === 'E' ? 'drop-shadow(0 10px 20px rgba(139, 114, 168, 0.5))' : 'none'
            }}
          >
            <polygon
              points="780,45 960,60 970,360 750,280"
              fill={selectedZoneId === 'E' ? 'rgba(139, 114, 168, 0.35)' : colorsE.fill}
              stroke={hoveredZone === 'E' ? '#D6C6A5' : colorsE.stroke}
              strokeWidth={selectedZoneId === 'E' || hoveredZone === 'E' ? 3.5 : 2}
              strokeDasharray="8 4"
              className="pulse-purple"
            />
            {/* Warning Beacon */}
            <rect x="790" y="75" width="165" height="48" rx="3" fill="rgba(30, 22, 38, 0.94)" stroke={hoveredZone === 'E' ? '#D6C6A5' : '#8B72A8'} strokeWidth="1.5" />
            <text x="800" y="93" fill="#EAE5D8" fontSize="12" fontFamily="var(--font-hud)" fontWeight="700">ZONE E: EAST DELTA</text>
            <text x="800" y="106" fill="#B49DCB" fontSize="10" fontFamily="var(--font-mono)" fontWeight="700">STATUS: UNKNOWN</text>
            <text x="800" y="117" fill="#8B72A8" fontSize="9" fontFamily="var(--font-mono)">COMMS: 12% · 140+ GPS STALL</text>
          </g>

          {/* ZONE C: River Basin & Bridge 17 */}
          <g 
            onClick={() => onSelectZone('C')}
            onMouseEnter={() => setHoveredZone('C')}
            onMouseLeave={() => setHoveredZone(null)}
            data-cursor="inspect"
            data-zone-id="C"
            style={{ 
              cursor: 'pointer',
              opacity: (hoveredZone && hoveredZone !== 'C') ? 0.48 : 1,
              transition: 'opacity 0.25s ease, filter 0.25s ease',
              filter: hoveredZone === 'C' ? 'drop-shadow(0 10px 20px rgba(201, 154, 69, 0.5))' : 'none'
            }}
          >
            <polygon
              points="80,240 460,270 470,590 60,540"
              fill={selectedZoneId === 'C' ? 'rgba(201, 154, 69, 0.32)' : colorsC.fill}
              stroke={hoveredZone === 'C' ? '#D6C6A5' : colorsC.stroke}
              strokeWidth={selectedZoneId === 'C' || hoveredZone === 'C' ? 3 : 1.5}
            />
            <rect x="100" y="270" width="175" height="34" rx="3" fill="rgba(14, 27, 21, 0.9)" stroke={hoveredZone === 'C' ? '#D6C6A5' : colorsC.stroke} strokeWidth="1" />
            <text x="110" y="287" fill="#EAE5D8" fontSize="13" fontFamily="var(--font-hud)" fontWeight="700">ZONE C: RIVER BASIN</text>
            <text x="110" y="299" fill="#C99A45" fontSize="10" fontFamily="var(--font-mono)">RISK: {zoneC.risk}% · ELEVATED FLOOD</text>
          </g>

          {/* ZONE D: South Sector & South General Hospital (CRITICAL) */}
          <g 
            onClick={() => onSelectZone('D')}
            onMouseEnter={() => setHoveredZone('D')}
            onMouseLeave={() => setHoveredZone(null)}
            data-cursor="inspect"
            data-zone-id="D"
            style={{ 
              cursor: 'pointer',
              opacity: (hoveredZone && hoveredZone !== 'D') ? 0.48 : 1,
              transition: 'opacity 0.25s ease, filter 0.25s ease',
              filter: hoveredZone === 'D' ? 'drop-shadow(0 12px 24px rgba(217, 83, 79, 0.6))' : 'none'
            }}
          >
            <polygon
              points="480,280 740,285 960,390 940,610 490,590"
              fill={selectedZoneId === 'D' ? 'rgba(217, 83, 79, 0.35)' : colorsD.fill}
              stroke={hoveredZone === 'D' ? '#D6C6A5' : colorsD.stroke}
              strokeWidth={selectedZoneId === 'D' || hoveredZone === 'D' ? 3.5 : 2}
              className={zoneD.risk >= 80 ? 'pulse-red' : ''}
            />
            <rect x="520" y="320" width="205" height="48" rx="3" fill="rgba(42, 16, 16, 0.94)" stroke={hoveredZone === 'D' ? '#D6C6A5' : '#D9534F'} strokeWidth="1.5" />
            <text x="530" y="338" fill="#FCA5A5" fontSize="13" fontFamily="var(--font-hud)" fontWeight="700">ZONE D: SOUTH SECTOR</text>
            <text x="530" y="352" fill="#D9534F" fontSize="11" fontFamily="var(--font-mono)" fontWeight="700">🔴 RISK: {zoneD.risk}% · CRITICAL</text>
            <text x="530" y="363" fill="#FCA5A5" fontSize="9" fontFamily="var(--font-mono)">HOSPITAL ARTERIAL SEVERED</text>
          </g>

          {/* ---------------- FLOOD PLAIN & RIVER (VECTOR) ---------------- */}
          {activeLayers.flood && (
            <g id="floodLayer">
              {/* Expanding Flood Buffer around River Basin */}
              <path
                d={`M 0,380 C 180,${370 + floodSpread} 320,${340 + floodSpread} 480,${390 + floodSpread} C 640,${440 + floodSpread} 780,${430 + floodSpread} 1000,${460 + floodSpread} L 1000,${510 + floodSpread} C 780,${480 + floodSpread} 640,${490 + floodSpread} 480,${440 + floodSpread} C 320,${390 + floodSpread} 180,${420 + floodSpread} 0,430 Z`}
                fill="url(#floodExpGradient)"
              />
              
              {/* Main River Channel with Animated Water Current */}
              <path
                d="M 0,395 C 180,385 320,355 480,405 C 640,455 780,445 1000,475 L 1000,500 C 780,470 640,480 480,430 C 320,380 180,410 0,420 Z"
                fill="url(#waterGradient)"
                stroke="#38bdf8"
                strokeWidth="1.5"
              />
              
              {/* Animated River Flow Dashline */}
              <path
                d="M 10,408 C 180,398 320,368 480,418 C 640,468 780,458 990,488"
                fill="none"
                stroke="#bae6fd"
                strokeWidth="2"
                className="flowing-river"
                opacity="0.75"
              />

              {/* Water gauge indicator in Zone C */}
              <g transform="translate(340, 340)">
                <rect x="-40" y="-12" width="80" height="24" rx="3" fill="rgba(2, 44, 34, 0.85)" stroke="#38bdf8" strokeWidth="1" />
                <text x="0" y="4" textAnchor="middle" fill="#7dd3fc" fontSize="10" fontFamily="var(--font-mono)" fontWeight="700">
                  CREST +{weather?.riverCrestMeters || 3.4}m
                </text>
              </g>
            </g>
          )}

          {/* ---------------- ROAD NETWORK ---------------- */}
          {activeLayers.roads && (
            <g id="roadLayer">
              {/* Highway 1 (North-South bypass - Intact) */}
              <path
                d="M 280,30 L 290,240 L 330,365 L 360,600"
                fill="none"
                stroke="#64748b"
                strokeWidth="5"
                strokeDasharray="10 4"
              />
              <path
                d="M 280,30 L 290,240 L 330,365 L 360,600"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
              />

              {/* Moving Emergency Convoy 1 along Highway 1 */}
              <circle r="4" fill="var(--color-beige)" stroke="#07100C" strokeWidth="1">
                <animateMotion path="M 280,30 L 290,240 L 330,365 L 360,600" dur="9s" repeatCount="indefinite" />
              </circle>

              {/* Moving Dispatch Ambulance toward Zone D Corridor */}
              <circle r="4.5" fill="var(--color-critical)" stroke="var(--color-off-white)" strokeWidth="1">
                <animateMotion path="M 520,120 L 510,280 L 480,400 L 580,420 L 720,440" dur="7s" repeatCount="indefinite" />
              </circle>

              {/* Arterial Road 17 (Zone B through C to Hospital in D) */}
              <path
                d="M 520,120 L 510,280 L 480,400 L 580,420 L 720,440"
                fill="none"
                stroke={timeOffset >= 30 ? "#ef4444" : "#f59e0b"}
                strokeWidth="4"
                strokeDasharray={timeOffset >= 30 ? "6 4" : "none"}
              />

              {/* Bridge 17 Crossing on the river */}
              <g transform="translate(480, 412)">
                <rect x="-18" y="-8" width="36" height="16" fill="#1e293b" stroke={timeOffset >= 15 ? "#ef4444" : "#f59e0b"} strokeWidth="2" />
                <line x1="-14" y1="-8" x2="14" y2="8" stroke="#ef4444" strokeWidth="2" />
                <text x="0" y="-12" textAnchor="middle" fill={timeOffset >= 15 ? "#ef4444" : "#fbbf24"} fontSize="9" fontFamily="var(--font-mono)" fontWeight="700">
                  {timeOffset >= 30 ? "BRIDGE 17: BREACHED" : "BRIDGE 17: STRESSED"}
                </text>
              </g>

              {/* Road 17 Culvert Washout Hazard Block on Hospital route */}
              <g transform="translate(630, 430)">
                <circle cx="0" cy="0" r="14" fill="#450a0a" stroke="#ef4444" strokeWidth="2" className="pulse-red" />
                <text x="0" y="4" textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="900" fontFamily="var(--font-mono)">✕</text>
                <text x="0" y="24" textAnchor="middle" fill="#f87171" fontSize="9" fontFamily="var(--font-mono)" fontWeight="700">
                  ROAD 17 INACCESSIBLE
                </text>
              </g>
            </g>
          )}

          {/* ---------------- CRITICAL INFRASTRUCTURE ---------------- */}
          {activeLayers.infrastructure && (
            <g id="infraLayer">
              {/* Reservoir Intake in Zone A */}
              <g transform="translate(200, 150)">
                <circle cx="0" cy="0" r="12" fill="#064e3b" stroke="#10b981" strokeWidth="1.5" />
                <text x="0" y="4" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="700">💧</text>
                <text x="0" y="22" textAnchor="middle" fill="#a7f3d0" fontSize="9" fontFamily="var(--font-hud)">RESERVOIR INTAKE</text>
              </g>

              {/* Power Substation in Zone B */}
              <g transform="translate(620, 180)">
                <circle cx="0" cy="0" r="12" fill="#451a03" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="0" y="4" textAnchor="middle" fill="#fcd34d" fontSize="10" fontWeight="700">⚡</text>
                <text x="0" y="22" textAnchor="middle" fill="#fde68a" fontSize="9" fontFamily="var(--font-hud)">SUBSTATION #1</text>
              </g>

              {/* South General Hospital (Level-1 Trauma) in Zone D */}
              <g transform="translate(740, 480)">
                {/* Risk Propagation Pulse Rings */}
                <circle cx="0" cy="0" r="22" fill="none" stroke="var(--color-critical)" strokeWidth="1.5" opacity="0.8">
                  <animate attributeName="r" from="22" to="65" dur="2.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.8" to="0" dur="2.4s" repeatCount="indefinite" />
                </circle>
                <circle cx="0" cy="0" r="22" fill="none" stroke="var(--color-beige)" strokeWidth="1" opacity="0.6">
                  <animate attributeName="r" from="22" to="48" dur="2.4s" begin="0.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.6" to="0" dur="2.4s" begin="0.8s" repeatCount="indefinite" />
                </circle>

                <rect x="-22" y="-22" width="44" height="44" rx="6" fill="#450a0a" stroke="#ef4444" strokeWidth="2" className="pulse-red" />
                <text x="0" y="6" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="900">🏥</text>
                <text x="0" y="34" textAnchor="middle" fill="#fca5a5" fontSize="11" fontFamily="var(--font-hud)" fontWeight="700">
                  SOUTH GENERAL HOSPITAL
                </text>
                <text x="0" y="46" textAnchor="middle" fill="#ef4444" fontSize="9" fontFamily="var(--font-mono)" fontWeight="700">
                  LEVEL 1 TRAUMA (ISOLATED)
                </text>
              </g>

              {/* Petrochem Storage in Zone E */}
              <g transform="translate(870, 220)">
                <circle cx="0" cy="0" r="14" fill="#3b0764" stroke="#a855f7" strokeWidth="2" className="pulse-purple" />
                <text x="0" y="5" textAnchor="middle" fill="#e9d5ff" fontSize="12">⚠️</text>
                <text x="0" y="26" textAnchor="middle" fill="#d8b4fe" fontSize="9" fontFamily="var(--font-hud)">DELTA CHEMICAL SIDING</text>
              </g>
            </g>
          )}

          {/* ---------------- DEPLOYED RESOURCES ON MAP ---------------- */}
          {renderUnitsBadge('A', 220, 100)}
          {renderUnitsBadge('B', 580, 100)}
          {renderUnitsBadge('C', 260, 450)}
          {renderUnitsBadge('D', 800, 560)}
          {renderUnitsBadge('E', 880, 150)}

          {/* ---------------- INCIDENT PINS ---------------- */}
          {activeLayers.incidents && (
            <g id="incidentPins">
              {/* Incident 182 Pin in Zone C */}
              <g transform="translate(260, 360)">
                <circle cx="0" cy="0" r="10" fill="#dc2626" stroke="#fff" strokeWidth="1.5" />
                <text x="0" y="3" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="900">182</text>
              </g>

              {/* Incident 189 Pin in Zone D */}
              <g transform="translate(680, 410)">
                <circle cx="0" cy="0" r="10" fill="#ef4444" stroke="#fff" strokeWidth="1.5" className="pulse-red" />
                <text x="0" y="3" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="900">189</text>
              </g>

              {/* Incident 201 Pin in Zone E */}
              <g transform="translate(830, 160)">
                <circle cx="0" cy="0" r="10" fill="#9333ea" stroke="#fff" strokeWidth="1.5" className="pulse-purple" />
                <text x="0" y="3" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="900">201</text>
              </g>
            </g>
          )}
        </svg>
        </div>

        {/* Live Map Watermark & Compass */}
        <div style={{ position: 'absolute', bottom: '12px', right: '14px', pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(8,12,18,0.7)', padding: '4px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
          <span className="font-mono" style={{ fontSize: '10px', color: '#94a3b8' }}>
            AEGIS DIGITAL TWIN CORE · REAL-TIME TELEMETRY
          </span>
        </div>

        {/* Zone Selector Strip at Map Bottom */}
        <div style={{ position: 'absolute', bottom: '12px', left: '14px', display: 'flex', gap: '6px', background: 'rgba(9,13,20,0.85)', padding: '6px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <span className="font-hud" style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', marginRight: '4px' }}>
            INSPECT:
          </span>
          {['A', 'B', 'C', 'D', 'E'].map(zid => {
            const z = zones.find(item => item.id === zid);
            const isSel = selectedZoneId === zid;
            const badgeClass = zid === 'E' ? 'badge-unknown' : (z?.risk >= 80 ? 'badge-critical' : z?.risk >= 60 ? 'badge-high-risk' : z?.risk >= 35 ? 'badge-warning' : 'badge-stable');
            return (
              <button
                key={zid}
                onClick={() => onSelectZone(zid)}
                className={`badge-status ${badgeClass}`}
                style={{ 
                  cursor: 'pointer', 
                  outline: isSel ? '2px solid #38bdf8' : 'none',
                  padding: '3px 10px',
                  background: isSel ? 'rgba(56, 189, 248, 0.25)' : undefined
                }}
              >
                ZONE {zid} {zid === 'E' ? '🟣' : (z?.risk >= 80 ? '🔴' : z?.risk >= 60 ? '🟠' : z?.risk >= 35 ? '🟡' : '🟢')}
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
