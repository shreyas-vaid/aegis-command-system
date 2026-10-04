import React from 'react';
import { 
  HeartHandshake, 
  Flame, 
  Truck, 
  Wrench, 
  Radio, 
  Activity, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

export default function ResourceBoard({
  resources = {},
  hospitalLoad = 72,
  weather = {}
}) {
  const totals = resources.total || { medical: 5, fire: 3, logistics: 8, engineering: 4 };
  const deployed = resources.deployed || { medical: {}, fire: {}, logistics: {}, engineering: {} };

  // Calculate deployed sums
  const depMed = Object.values(deployed.medical || {}).reduce((a, b) => a + b, 0);
  const depFire = Object.values(deployed.fire || {}).reduce((a, b) => a + b, 0);
  const depLog = Object.values(deployed.logistics || {}).reduce((a, b) => a + b, 0);
  const depEng = Object.values(deployed.engineering || {}).reduce((a, b) => a + b, 0);

  const availMed = Math.max(0, totals.medical - depMed);
  const availFire = Math.max(0, totals.fire - depFire);
  const availLog = Math.max(0, totals.logistics - depLog);
  const availEng = Math.max(0, totals.engineering - depEng);

  return (
    <div className="hud-panel hud-bracket" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} color="#10b981" />
          <span className="font-hud" style={{ fontSize: '14px', fontWeight: '700', letterSpacing: '0.08em', color: '#f8fafc' }}>
            TACTICAL RESOURCE BOARD // FLEET READINESS
          </span>
        </div>
        <span className="font-mono" style={{ fontSize: '11px', color: '#34d399' }}>
          ACTIVE FLEET READY
        </span>
      </div>

      {/* Resource Fleet Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        
        {/* Medical */}
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '4px', padding: '8px 10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-hud" style={{ fontSize: '11px', color: '#94a3b8' }}>MEDICAL</span>
            <HeartHandshake size={14} color="#38bdf8" />
          </div>
          <div className="font-mono" style={{ fontSize: '18px', fontWeight: '700', color: '#38bdf8', marginTop: '2px' }}>
            {availMed} <span style={{ fontSize: '11px', color: '#64748b' }}>/ {totals.medical}</span>
          </div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
            {depMed > 0 ? `${depMed} in field` : 'In reserve'}
          </div>
        </div>

        {/* Fire / Rescue */}
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '4px', padding: '8px 10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-hud" style={{ fontSize: '11px', color: '#94a3b8' }}>FIRE / RESCUE</span>
            <Flame size={14} color="#f87171" />
          </div>
          <div className="font-mono" style={{ fontSize: '18px', fontWeight: '700', color: '#f87171', marginTop: '2px' }}>
            {availFire} <span style={{ fontSize: '11px', color: '#64748b' }}>/ {totals.fire}</span>
          </div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
            {depFire > 0 ? `${depFire} in field` : 'In reserve'}
          </div>
        </div>

        {/* Logistics */}
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(52, 211, 153, 0.25)', borderRadius: '4px', padding: '8px 10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-hud" style={{ fontSize: '11px', color: '#94a3b8' }}>LOGISTICS</span>
            <Truck size={14} color="#34d399" />
          </div>
          <div className="font-mono" style={{ fontSize: '18px', fontWeight: '700', color: '#34d399', marginTop: '2px' }}>
            {availLog} <span style={{ fontSize: '11px', color: '#64748b' }}>/ {totals.logistics}</span>
          </div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
            {depLog > 0 ? `${depLog} in field` : 'In reserve'}
          </div>
        </div>

        {/* Engineering */}
        <div style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(251, 191, 36, 0.25)', borderRadius: '4px', padding: '8px 10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="font-hud" style={{ fontSize: '11px', color: '#94a3b8' }}>ENGINEERING</span>
            <Wrench size={14} color="#fbbf24" />
          </div>
          <div className="font-mono" style={{ fontSize: '18px', fontWeight: '700', color: '#fbbf24', marginTop: '2px' }}>
            {availEng} <span style={{ fontSize: '11px', color: '#64748b' }}>/ {totals.engineering}</span>
          </div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
            {depEng > 0 ? `${depEng} in field` : 'In reserve'}
          </div>
        </div>

      </div>

      {/* Hospital Capacity Gauge & Regional Environmental Telemetry */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '8px', background: 'rgba(10, 14, 22, 0.8)', padding: '8px 10px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
        
        {/* Hospital Capacity Detail */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
            <span className="font-hud" style={{ color: '#94a3b8' }}>SOUTH GENERAL TRAUMA CAPACITY</span>
            <span className="font-mono" style={{ fontWeight: '700', color: hospitalLoad >= 90 ? '#ef4444' : hospitalLoad >= 75 ? '#f97316' : '#f59e0b' }}>
              {hospitalLoad}% LOAD
            </span>
          </div>
          <div className="meter-track">
            <div 
              className="meter-fill" 
              style={{ 
                width: `${Math.min(100, hospitalLoad)}%`, 
                background: hospitalLoad >= 90 ? '#ef4444' : hospitalLoad >= 75 ? '#f97316' : '#f59e0b' 
              }} 
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '10px', color: '#64748b' }}>
            <span>Available ICU: {Math.max(0, Math.round((100 - hospitalLoad) * 0.4))} beds</span>
            <span>Status: {hospitalLoad >= 90 ? 'CODE BLACK IMMINENT' : 'CRITICAL INTAKE'}</span>
          </div>
        </div>

        {/* Environmental Telemetry */}
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span className="font-hud" style={{ fontSize: '10px', color: '#94a3b8' }}>HYDRO-MET SENSORS</span>
          <div className="font-mono" style={{ fontSize: '11px', color: '#f1f5f9', marginTop: '2px' }}>
            🌧️ Rain: {weather.rainfall || 42} mm/h · 💨 Wind: {weather.wind || 68} km/h
          </div>
          <div className="font-mono" style={{ fontSize: '10px', color: '#38bdf8', marginTop: '2px' }}>
            🌊 Basin Crest: +{weather.riverCrestMeters || 3.4}m
          </div>
        </div>

      </div>

    </div>
  );
}
