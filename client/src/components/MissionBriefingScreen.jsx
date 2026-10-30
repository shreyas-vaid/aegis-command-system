import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Play, 
  AlertTriangle, 
  Activity, 
  Clock, 
  Users, 
  Truck, 
  CheckCircle2, 
  Radio, 
  Layers, 
  ChevronRight,
  TrendingUp,
  MapPin,
  Calendar
} from 'lucide-react';
import { AegisPrimaryCommand } from './aegis-controls';
import { Aegis3DCard, AegisAnimatedNumber } from './aegis-interactive';

export default function MissionBriefingScreen({
  cityHealth = 70,
  activeAlerts = 7,
  unknownZones = 1,
  onBeginOperation,
  activeMission = null,
  missionsList = [],
  resources = [],
  onSelectMission = null
}) {
  const [selectedTab, setSelectedTab] = useState('overview');

  // Assigned teams derived from actual backend resources or tactical fallback
  const assignedUnits = resources.length > 0 
    ? resources.filter(r => r.status === 'DEPLOYED' || r.status === 'ASSIGNED' || r.isAssigned)
    : [
        { id: 'ALS-02', name: 'ALS Ambulance Unit 02', type: 'MEDICAL', status: 'DEPLOYED', location: 'Zone D', callsign: 'RESCUE-2' },
        { id: 'PMP-01', name: 'Heavy Rescue Pump 01', type: 'EQUIPMENT', status: 'DEPLOYED', location: 'Road 17 Culvert', callsign: 'STRIKE-1' },
        { id: 'SAR-04', name: 'Swiftwater Rescue Team 04', type: 'PERSONNEL', status: 'ASSIGNED', location: 'Zone B Basin', callsign: 'DELTA-4' }
      ];

  // Mission timeline milestones
  const timelineMilestones = [
    {
      time: 'T -00:45:00',
      title: 'Monsoon Surge Detected',
      desc: 'Regional hydrologic radar flagged +85mm/hr precipitation event in North Watershed.',
      status: 'completed'
    },
    {
      time: 'T -00:20:00',
      title: 'Road 17 Culvert Failure',
      desc: 'Culvert structural breach confirmed. South General Trauma corridor compromised.',
      status: 'completed'
    },
    {
      time: 'T -00:05:00',
      title: 'Zone E Comms Blackout',
      desc: 'Repeater tower 7 down. Cellular and 911 telemetry disconnected in Sector E.',
      status: 'active'
    },
    {
      time: 'T +00:15:00',
      title: 'AI Multi-Agency Dispatch',
      desc: 'Coordinated deployment of swiftwater, ALS, and mobile bridge assets across sectors.',
      status: 'pending'
    },
    {
      time: 'T +01:00:00',
      title: 'Peak Surge Stabilization',
      desc: 'Projected drainage crest mitigation and restoration of secondary access arteries.',
      status: 'pending'
    }
  ];

  return (
    <div style={{
      minHeight: '88vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 32px',
      maxWidth: '1440px',
      margin: '0 auto',
      width: '100%',
      gap: '24px'
    }}>
      {/* Top Banner / Mission Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(10, 20, 36, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: '1px solid rgba(0, 240, 255, 0.25)',
        borderRadius: '8px',
        padding: '24px 28px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(0, 240, 255, 0.15)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{
              fontSize: '11px',
              fontFamily: 'monospace',
              letterSpacing: '0.12em',
              padding: '2px 8px',
              borderRadius: '3px',
              background: 'rgba(0, 240, 255, 0.12)',
              color: '#00F0FF',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              fontWeight: 700
            }}>
              MISSION CONTROL // SECTOR DISPATCH
            </span>
            <span style={{
              fontSize: '11px',
              fontFamily: 'monospace',
              letterSpacing: '0.12em',
              padding: '2px 8px',
              borderRadius: '3px',
              background: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              fontWeight: 700
            }}>
              THREAT LEVEL: HIGH
            </span>
          </div>

          <h1 className="font-hud" style={{ fontSize: '28px', fontWeight: '800', color: '#F1F5F9', margin: '0 0 6px 0', letterSpacing: '0.04em' }}>
            OPERATION #{activeMission?.missionId || '027'}: {activeMission?.name || 'Flash Flood Cascade'}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#94a3b8' }}>
              <MapPin size={14} color="#00F0FF" />
              {activeMission?.locationName || 'Chandigarh Capital Region'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#94a3b8' }}>
              <Activity size={14} color="#f59e0b" />
              Vector: <strong style={{ color: '#F1F5F9' }}>{activeMission?.disasterType || 'FLOOD SURGE'}</strong>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#94a3b8' }}>
              <Clock size={14} color="#10b981" />
              Status: <strong style={{ color: '#10b981' }}>OPERATIONAL ACTIVE</strong>
            </span>
          </div>
        </div>

        {/* Primary Action Button */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={onBeginOperation}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #00F0FF 0%, #00a2ff 100%)',
              color: '#0a0f1d',
              border: 'none',
              borderRadius: '6px',
              padding: '12px 24px',
              fontFamily: 'monospace',
              fontSize: '13px',
              fontWeight: '800',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            <Play size={16} fill="#0a0f1d" />
            ENGAGE CRISIS TACTICAL CORE
          </button>
        </div>
      </div>

      {/* Mission Progress Ribbon */}
      <div style={{
        background: 'rgba(10, 20, 36, 0.8)',
        border: '1px solid rgba(0, 240, 255, 0.15)',
        borderRadius: '6px',
        padding: '16px 24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8', letterSpacing: '0.08em' }}>
            OVERALL MISSION ESCALATION & RESOLUTION PROGRESS
          </span>
          <span style={{ fontSize: '13px', fontFamily: 'monospace', color: '#00F0FF', fontWeight: '700' }}>
            45% COMPLETED
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          background: 'rgba(15, 23, 42, 0.8)',
          borderRadius: '4px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{
            width: '45%',
            height: '100%',
            background: 'linear-gradient(90deg, #00F0FF 0%, #10b981 100%)',
            boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)'
          }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', marginTop: '10px', fontSize: '11px', fontFamily: 'monospace' }}>
          <span style={{ color: '#10b981' }}>✓ 1. Briefing & Alert Ingestion</span>
          <span style={{ color: '#00F0FF' }}>● 2. Fusion & Telemetry Recon</span>
          <span style={{ color: '#64748b' }}>○ 3. Simulation & Tactical Chess</span>
          <span style={{ color: '#64748b' }}>○ 4. Resource Execution & Recovery</span>
        </div>
      </div>

      {/* Main Grid: Left Tabs / Content & Right Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        
        {/* Left Column: Mission Cards & Assigned Teams */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Telemetry Snapshot Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            <div style={{
              background: 'rgba(10, 20, 36, 0.75)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '6px',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8', letterSpacing: '0.08em' }}>
                SECTOR STABILITY INDEX
              </span>
              <span className="font-mono" style={{ fontSize: '28px', fontWeight: '800', color: '#10b981', margin: '4px 0' }}>
                <AegisAnimatedNumber value={cityHealth} suffix="%" />
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Baseline Threshold: 85%
              </span>
            </div>

            <div style={{
              background: 'rgba(10, 20, 36, 0.75)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '6px',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8', letterSpacing: '0.08em' }}>
                CRITICAL WARNINGS
              </span>
              <span className="font-mono" style={{ fontSize: '28px', fontWeight: '800', color: '#f59e0b', margin: '4px 0' }}>
                <AegisAnimatedNumber value={activeAlerts} />
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                3 High Impact, 4 Moderate
              </span>
            </div>

            <div style={{
              background: 'rgba(10, 20, 36, 0.75)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '6px',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8', letterSpacing: '0.08em' }}>
                BLACKOUT TELEMETRY ZONES
              </span>
              <span className="font-mono" style={{ fontSize: '28px', fontWeight: '800', color: '#ef4444', margin: '4px 0' }}>
                <AegisAnimatedNumber value={unknownZones} />
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Zone E Comms Severed
              </span>
            </div>
          </div>

          {/* Assigned Teams and Active Deployed Resources */}
          <div style={{
            background: 'rgba(10, 20, 36, 0.8)',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            borderRadius: '6px',
            padding: '20px 24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} color="#00F0FF" />
                <h3 className="font-hud" style={{ fontSize: '15px', fontWeight: '700', color: '#F1F5F9', margin: 0, letterSpacing: '0.06em' }}>
                  ASSIGNED TEAMS & EMERGENCY ASSETS ({assignedUnits.length})
                </h3>
              </div>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#00F0FF' }}>
                LIVE DISPATCH FEED
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {assignedUnits.map((unit, idx) => (
                <div
                  key={unit.id || unit._id || idx}
                  style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    border: '1px solid rgba(0, 240, 255, 0.15)',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#F1F5F9' }}>
                      {unit.callsign || unit.name}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      fontFamily: 'monospace',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      background: unit.status === 'DEPLOYED' ? 'rgba(0, 240, 255, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: unit.status === 'DEPLOYED' ? '#00F0FF' : '#10b981',
                      border: `1px solid ${unit.status === 'DEPLOYED' ? 'rgba(0, 240, 255, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                    }}>
                      {unit.status || 'DEPLOYED'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8' }}>
                    <span>Type: <strong style={{ color: '#cbd5e1' }}>{unit.type}</strong></span>
                    <span>Location: <strong style={{ color: '#00F0FF' }}>{unit.location || 'Zone D'}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mission Dossier & Operational Directive */}
          <div style={{
            background: 'rgba(10, 20, 36, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            padding: '20px 24px'
          }}>
            <h3 className="font-hud" style={{ fontSize: '14px', fontWeight: '700', color: '#F1F5F9', marginBottom: '12px', letterSpacing: '0.06em' }}>
              OPERATIONAL SITUATION DIRECTIVE
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#cbd5e1' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#00F0FF' }}>▶</span> Heavy precipitation across northern watershed feeding tributary crest (+3.4m).
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#ef4444' }}>▶</span> Road 17 culvert collapsed; emergency EMS detour via elevated bypass active.
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#f59e0b' }}>▶</span> South General Hospital ICU operating at 72% capacity and escalating.
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: '#00F0FF' }}>▶</span> Mobile generator and rescue pontoons staged at Sector A command depot.
              </li>
            </ul>
          </div>

        </div>

        {/* Right Column: Mission Status Timeline & Available Mission Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Mission Status Timeline */}
          <div style={{
            background: 'rgba(10, 20, 36, 0.85)',
            border: '1px solid rgba(0, 240, 255, 0.2)',
            borderRadius: '6px',
            padding: '20px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Clock size={16} color="#00F0FF" />
              <h3 className="font-hud" style={{ fontSize: '14px', fontWeight: '700', color: '#F1F5F9', margin: 0, letterSpacing: '0.06em' }}>
                INCIDENT STATUS TIMELINE
              </h3>
            </div>

            <div style={{ position: 'relative', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{
                position: 'absolute',
                left: '6px',
                top: '6px',
                bottom: '6px',
                width: '2px',
                background: 'rgba(0, 240, 255, 0.25)'
              }} />

              {timelineMilestones.map((m, idx) => {
                const isCompleted = m.status === 'completed';
                const isActive = m.status === 'active';
                return (
                  <div key={idx} style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: '-18px',
                      top: '2px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: isCompleted ? '#10b981' : isActive ? '#00F0FF' : '#334155',
                      boxShadow: isActive ? '0 0 8px #00F0FF' : 'none',
                      border: '2px solid #0a0f1d'
                    }} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', color: isActive ? '#00F0FF' : isCompleted ? '#10b981' : '#64748b', fontWeight: '700' }}>
                        {m.time}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#F1F5F9' }}>
                        {m.title}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>
                        {m.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active / Alternate Mission Cards */}
          {missionsList.length > 0 && (
            <div style={{
              background: 'rgba(10, 20, 36, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              padding: '16px 20px'
            }}>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#94a3b8', letterSpacing: '0.08em', display: 'block', marginBottom: '12px' }}>
                REGISTERED MISSIONS ({missionsList.length})
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {missionsList.slice(0, 4).map(m => {
                  const mId = m.missionId || m.id || m._id;
                  const isCurrent = mId === (activeMission?.missionId || activeMission?.id || '027');
                  return (
                    <div
                      key={mId}
                      onClick={() => onSelectMission && onSelectMission(mId)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '4px',
                        background: isCurrent ? 'rgba(0, 240, 255, 0.12)' : 'rgba(15, 23, 42, 0.5)',
                        border: `1px solid ${isCurrent ? 'rgba(0, 240, 255, 0.4)' : 'rgba(255, 255, 255, 0.06)'}`,
                        cursor: onSelectMission ? 'pointer' : 'default',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: isCurrent ? '#00F0FF' : '#e2e8f0', display: 'block' }}>
                          #{mId} - {m.name || 'Disaster Incident'}
                        </span>
                        <span style={{ fontSize: '10px', color: '#64748b' }}>
                          {m.locationName || 'Capital Region'}
                        </span>
                      </div>
                      {isCurrent && (
                        <span style={{ fontSize: '9px', fontFamily: 'monospace', color: '#00F0FF', fontWeight: '800' }}>
                          ACTIVE
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
