import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Send, 
  Flame, 
  Activity, 
  Radio, 
  Truck, 
  ShieldAlert, 
  ChevronRight,
  Target,
  Compass,
  Check
} from 'lucide-react';
import { AegisPrimaryCommand } from './aegis-controls';
import { Aegis3DCard, AegisAnimatedNumber } from './aegis-interactive';
import { assignResource } from '../services/api';

export default function CommandCenterScreen({
  onCreatePlan,
  onResourceAssigned,
  currentOrg = null,
  currentUser = null,
  activeMission = null
}) {
  const [selectedUnit, setSelectedUnit] = useState(0);
  const [isAssigning, setIsAssigning] = useState(false);

  const handleUnitSelect = async (idx, res) => {
    setSelectedUnit(idx);
    setIsAssigning(true);
    try {
      const resourceId = res.name || res.callsign;
      await assignResource(resourceId, 'D');
      if (onResourceAssigned) {
        onResourceAssigned(res, 'D');
      }
    } catch (err) {
      console.warn('[AEGIS-API] Resource assignment fallback:', err.message);
    } finally {
      setTimeout(() => setIsAssigning(false), 350);
    }
  };

  const resources = [
    { callsign: "AMBULANCE 02", name: "AMBULANCE", count: 4, icon: HeartHandshake, color: "#6f947d", range: "14 KM", eta: "12 MIN", status: "AVAILABLE", desc: "Emergency medical triage & patient extraction" },
    { callsign: "DRONE WING 01", name: "DRONE", count: 2, icon: Send, color: "#8b72a8", range: "28 KM", eta: "4 MIN", status: "AVAILABLE", desc: "Thermal aerial reconnaissance & damage scanning" },
    { callsign: "RESCUE SQUAD 04", name: "RESCUE TEAM", count: 3, icon: Flame, color: "#d9534f", range: "9 KM", eta: "8 MIN", status: "STAGED", desc: "High-water swift rescue & perimeter evacuation" },
    { callsign: "MEDIC POD ALPHA", name: "MOBILE MEDICAL UNIT", count: 1, icon: Activity, color: "#6f947d", range: "6 KM", eta: "15 MIN", status: "AVAILABLE", desc: "On-site surgical field hospital pod" },
    { callsign: "SAT RELAY ECHO", name: "COMMUNICATION UNIT", count: 2, icon: Radio, color: "#d6c6a5", range: "35 KM", eta: "6 MIN", status: "STANDBY", desc: "Tactical satellite comms relay & portable tower" },
    { callsign: "CONVOY HEAVY 03", name: "SUPPLY CONVOY", count: 2, icon: Truck, color: "#c99a45", range: "18 KM", eta: "20 MIN", status: "AVAILABLE", desc: "Sandbagging barricades & high-capacity generators" }
  ];

  return (
    <div style={{
      minHeight: '88vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      maxWidth: '920px',
      margin: '0 auto',
      width: '100%'
    }}>
      <div
        className="aegis-glass"
        style={{
          width: '100%',
          background: 'rgba(14, 27, 21, 0.92)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(214, 198, 165, 0.22)',
          borderRadius: '8px',
          padding: '34px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(214, 198, 165, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(214, 198, 165, 0.12)', paddingBottom: '16px' }}>
          <span className="font-hud" style={{ fontSize: '12px', letterSpacing: '0.2em', color: '#d6c6a5', textTransform: 'uppercase' }}>
            COMMAND CENTER // RESOURCE LOGISTICS &amp; DEPLOYMENT
          </span>
          {isAssigning && (
            <div style={{ marginTop: '4px' }}>
              <span className="font-mono" style={{ fontSize: '10px', color: '#38bdf8', letterSpacing: '0.1em', animation: 'pulse 1.5s infinite ease-in-out' }}>
                ● RESOURCE DISPATCH SYNCING...
              </span>
            </div>
          )}
          <h2 className="font-hud" style={{ fontSize: '30px', fontWeight: '800', color: '#eae5d8', margin: '4px 0 0 0', letterSpacing: '0.04em' }}>
            TACTICAL DEPLOYMENT MATRIX
          </h2>
        </div>

        {/* Organization Operational Context Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(8, 13, 10, 0.75)',
          padding: '10px 16px',
          borderRadius: '4px',
          border: '1px solid rgba(214, 198, 165, 0.16)',
          borderLeft: '3px solid #6F947D'
        }}>
          <div>
            <span className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4', letterSpacing: '0.08em', display: 'block' }}>
              JURISDICTION / ORGANIZATION
            </span>
            <span className="font-hud" style={{ fontSize: '13px', fontWeight: '700', color: '#EAE5D8' }}>
              {currentOrg?.name || (activeMission?.locationName ? `${activeMission.locationName} Emergency Command` : 'Regional Emergency Operations Command')}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4', letterSpacing: '0.08em', display: 'block' }}>
              ACTIVE THEATER OPERATION
            </span>
            <span className="font-mono" style={{ fontSize: '11px', color: '#4ADE80', fontWeight: '700' }}>
              ● {(activeMission?.name || 'FLASH FLOOD CASCADE').toUpperCase()} (#{activeMission?.missionId || '027'})
            </span>
          </div>
        </div>

        {/* Compact Operational Metrics Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', background: 'rgba(8, 13, 10, 0.65)', padding: '12px 16px', borderRadius: '4px', border: '1px solid rgba(214, 198, 165, 0.1)' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4', letterSpacing: '0.08em' }}>CITY HEALTH</div>
            <div className="font-hud" style={{ fontSize: '18px', fontWeight: '800', color: '#6f947d' }}>
              <AegisAnimatedNumber value={70} suffix="%" />
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4', letterSpacing: '0.08em' }}>ACTIVE ALERTS</div>
            <div className="font-hud" style={{ fontSize: '18px', fontWeight: '800', color: '#c99a45' }}>
              <AegisAnimatedNumber value={7} />
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4', letterSpacing: '0.08em' }}>HOSPITAL LOAD</div>
            <div className="font-hud" style={{ fontSize: '18px', fontWeight: '800', color: '#d9534f' }}>
              <AegisAnimatedNumber value={72} suffix="%" />
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="font-mono" style={{ fontSize: '10px', color: '#9fb5a4', letterSpacing: '0.08em' }}>CRITICAL ZONES</div>
            <div className="font-hud" style={{ fontSize: '18px', fontWeight: '800', color: '#d9534f' }}>
              <AegisAnimatedNumber value={2} />
            </div>
          </div>
        </div>

        {/* Current Objective Callout */}
        <div style={{ background: 'rgba(25, 58, 42, 0.35)', border: '1px solid rgba(214, 198, 165, 0.18)', borderLeft: '4px solid #6f947d', padding: '14px 18px', borderRadius: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Target size={16} color="#d6c6a5" />
            <span className="font-hud" style={{ fontSize: '11px', fontWeight: '700', color: '#d6c6a5', letterSpacing: '0.1em' }}>
              CURRENT MISSION OBJECTIVE:
            </span>
          </div>
          <p className="font-hud" style={{ fontSize: '17px', fontWeight: '700', color: '#eae5d8', margin: 0, letterSpacing: '0.02em' }}>
            "Prevent South General Hospital from losing emergency access &amp; probe Zone E silence."
          </p>
        </div>

        {/* 6 Interactive Resource Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          {resources.map((res, idx) => {
            const Icon = res.icon;
            const isSelected = selectedUnit === idx;
            return (
              <div
                key={idx}
                data-cursor="deploy"
                onClick={() => handleUnitSelect(idx, res)}
                style={{ cursor: 'pointer' }}
              >
                <Aegis3DCard
                  accentColor={res.color}
                  style={{
                    background: isSelected ? 'rgba(25, 58, 42, 0.5)' : 'rgba(8, 13, 10, 0.65)',
                    border: isSelected ? `1px solid ${res.color}` : '1px solid rgba(214, 198, 165, 0.12)',
                    boxShadow: isSelected ? `0 8px 24px rgba(0,0,0,0.6), 0 0 16px ${res.color}33` : 'none',
                    borderRadius: '5px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Icon size={16} color={res.color} />
                      <span className="font-hud" style={{ fontSize: '13px', fontWeight: '700', color: '#eae5d8' }}>
                        {res.callsign}
                      </span>
                    </div>
                    <span className="font-mono" style={{ fontSize: '13px', fontWeight: '700', color: res.color }}>
                      ×{res.count}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: 'rgba(0,0,0,0.3)', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.04)' }}>
                    <div>
                      <div className="font-mono" style={{ fontSize: '9px', color: '#9fb5a4' }}>STATUS</div>
                      <div className="font-mono" style={{ fontSize: '11px', fontWeight: '700', color: res.status === 'AVAILABLE' ? '#6f947d' : '#c99a45' }}>
                        {res.status}
                      </div>
                    </div>
                    <div>
                      <div className="font-mono" style={{ fontSize: '9px', color: '#9fb5a4' }}>RANGE</div>
                      <div className="font-mono" style={{ fontSize: '11px', fontWeight: '700', color: '#eae5d8' }}>
                        {res.range}
                      </div>
                    </div>
                    <div>
                      <div className="font-mono" style={{ fontSize: '9px', color: '#9fb5a4' }}>ETA</div>
                      <div className="font-mono" style={{ fontSize: '11px', fontWeight: '700', color: '#d6c6a5' }}>
                        {res.eta}
                      </div>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: '11px', color: '#9fb5a4', lineHeight: 1.35, minHeight: '30px' }}>
                    {res.desc}
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '6px',
                    borderTop: '1px solid rgba(214, 198, 165, 0.08)'
                  }}>
                    <span className="font-mono" style={{ fontSize: '10px', color: isSelected ? res.color : '#9fb5a4' }}>
                      {isSelected ? "● UNIT STAGED" : "SELECT UNIT"}
                    </span>
                    <span className="font-mono" style={{ fontSize: '10px', fontWeight: '700', color: res.color }}>
                      DEPLOY →
                    </span>
                  </div>
                </Aegis3DCard>
              </div>
            );
          })}
        </div>

        {/* Action Button Replaced with Tactical Command Control */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
          <AegisPrimaryCommand
            label="CREATE RESPONSE PLAN"
            subtitle="ACTIVATE DUAL RESPONSE STRATEGY COMPARISON"
            status="FLEET READY (14 UNITS)"
            icon="◈"
            onClick={onCreatePlan}
            variant="sage"
            width="100%"
          />
        </div>

      </div>
    </div>
  );
}
