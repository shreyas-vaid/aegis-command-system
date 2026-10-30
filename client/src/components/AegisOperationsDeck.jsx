import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  MapPin, 
  AlertTriangle, 
  Activity, 
  Play, 
  Archive, 
  RefreshCw, 
  Layers, 
  CheckCircle2, 
  PauseCircle,
  Building2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { updateMission, archiveMission } from '../services/api';

export default function AegisOperationsDeck({
  missions = [],
  currentOrg,
  currentUser,
  onSelectOperation,
  onOpenNewOperationModal,
  onRefreshMissions,
  onEnterDemoMode
}) {
  const [updatingId, setUpdatingId] = useState(null);

  const canManage = currentUser && ['ADMIN', 'COMMANDER'].includes(currentUser.role);

  const handleStatusChange = async (missionId, newStatus) => {
    setUpdatingId(missionId);
    try {
      await updateMission(missionId, { status: newStatus });
      if (onRefreshMissions) onRefreshMissions();
    } catch (err) {
      console.warn('Failed to update status:', err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleArchive = async (missionId) => {
    if (!window.confirm('Are you sure you want to archive this operation?')) return;
    setUpdatingId(missionId);
    try {
      await archiveMission(missionId);
      if (onRefreshMissions) onRefreshMissions();
    } catch (err) {
      console.warn('Failed to archive operation:', err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="font-mono" style={{ fontSize: '10px', color: '#4ADE80', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(74, 222, 128, 0.15)', border: '1px solid rgba(74, 222, 128, 0.35)', padding: '2px 8px', borderRadius: '3px' }}>
            ● ACTIVE
          </span>
        );
      case 'PLANNING':
        return (
          <span className="font-mono" style={{ fontSize: '10px', color: '#FBBF24', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(251, 191, 36, 0.15)', border: '1px solid rgba(251, 191, 36, 0.35)', padding: '2px 8px', borderRadius: '3px' }}>
            ● PLANNING
          </span>
        );
      case 'PAUSED':
        return (
          <span className="font-mono" style={{ fontSize: '10px', color: '#93C5FD', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(147, 197, 253, 0.15)', border: '1px solid rgba(147, 197, 253, 0.35)', padding: '2px 8px', borderRadius: '3px' }}>
            Ⅱ PAUSED
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="font-mono" style={{ fontSize: '10px', color: '#6EE7B7', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(110, 231, 183, 0.15)', border: '1px solid rgba(110, 231, 183, 0.35)', padding: '2px 8px', borderRadius: '3px' }}>
            ✓ COMPLETED
          </span>
        );
      default:
        return (
          <span className="font-mono" style={{ fontSize: '10px', color: '#9FB5A4', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '3px' }}>
            {status}
          </span>
        );
    }
  };

  return (
    <div style={{
      minHeight: '88vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 20px',
      maxWidth: '1040px',
      margin: '0 auto',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Deck Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '26px',
        background: 'rgba(14, 27, 21, 0.85)',
        border: '1px solid rgba(214, 198, 165, 0.2)',
        borderRadius: '6px',
        padding: '20px 24px',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 12px 36px rgba(0,0,0,0.6)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              background: 'rgba(111, 148, 125, 0.2)',
              border: '1px solid rgba(214, 198, 165, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D6C6A5'
            }}>
              <ShieldAlert size={18} />
            </div>
            <div>
              <h2 className="font-hud" style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '0.12em', color: '#EAE5D8', margin: 0 }}>
                AEGIS COMMAND CENTER
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                <Building2 size={13} color="#6F947D" />
                <span className="font-mono" style={{ fontSize: '11px', color: '#D6C6A5', fontWeight: '700' }}>
                  {currentOrg?.name?.toUpperCase() || 'CHANDIGARH EMERGENCY RESPONSE CORPS'}
                </span>
                <span className="font-mono" style={{ fontSize: '9px', background: 'rgba(74, 222, 128, 0.15)', border: '1px solid rgba(74, 222, 128, 0.35)', color: '#4ADE80', padding: '1px 6px', borderRadius: '2px' }}>
                  DATA ISOLATED
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onRefreshMissions}
            className="btn-command-secondary"
            style={{ fontSize: '11px', padding: '7px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Refresh operations telemetry"
          >
            <RefreshCw size={13} />
            <span>SYNC</span>
          </button>

          {canManage && (
            <button
              onClick={onOpenNewOperationModal}
              className="btn-command-primary"
              style={{ fontSize: '11px', padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} />
              <span>+ NEW OPERATION</span>
            </button>
          )}
        </div>
      </div>

      {/* Subhead: Operations List */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="font-hud" style={{ fontSize: '14px', letterSpacing: '0.14em', color: '#EAE5D8', fontWeight: '800' }}>
            OPERATIONAL THEATERS & MISSIONS
          </span>
          <span className="font-mono" style={{ fontSize: '11px', color: '#9FB5A4', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '3px' }}>
            {missions.length} AVAILABLE
          </span>
        </div>

        <button
          onClick={onEnterDemoMode}
          className="font-mono"
          style={{
            fontSize: '10px',
            background: 'rgba(201, 154, 69, 0.12)',
            border: '1px solid rgba(201, 154, 69, 0.35)',
            color: '#D6C6A5',
            padding: '4px 10px',
            borderRadius: '3px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px'
          }}
          title="Switch to unauthenticated deterministic demo scenario"
        >
          <span>OPEN PROTOTYPE DEMO (#027)</span>
          <ArrowRight size={11} />
        </button>
      </div>

      {/* Operations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {missions.map((mission) => {
          const mId = mission.missionId || mission.id || mission._id;
          return (
            <div
              key={mId}
              className="aegis-card-glass"
              style={{
                background: 'linear-gradient(165deg, rgba(14, 27, 21, 0.92) 0%, rgba(8, 13, 10, 0.95) 100%)',
                border: '1px solid rgba(214, 198, 165, 0.22)',
                borderRadius: '6px',
                padding: '18px 20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div>
                {/* Top line: Mission Code, Status & Disaster Type */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="font-mono" style={{ fontSize: '11px', fontWeight: '800', background: 'rgba(217, 83, 79, 0.2)', border: '1px solid rgba(217, 83, 79, 0.4)', color: '#FCA5A5', padding: '1px 7px', borderRadius: '2px' }}>
                      #{mId}
                    </span>
                    <span className="font-mono" style={{ fontSize: '9px', background: 'rgba(214, 198, 165, 0.12)', border: '1px solid rgba(214, 198, 165, 0.25)', color: '#D6C6A5', padding: '1px 6px', borderRadius: '2px' }}>
                      {mission.disasterType || 'FLOOD'}
                    </span>
                  </div>

                  {getStatusBadge(mission.status)}
                </div>

                {/* Operation Title */}
                <h3 className="font-hud" style={{ fontSize: '16px', fontWeight: '800', color: '#EAE5D8', margin: '0 0 6px 0', letterSpacing: '0.04em' }}>
                  {mission.name}
                </h3>

                {/* Description */}
                <p style={{ fontSize: '12px', color: '#9FB5A4', margin: '0 0 14px 0', lineHeight: 1.4, minHeight: '34px' }}>
                  {mission.description || 'Regional emergency response operation actively deployed across municipal sectors.'}
                </p>

                {/* Location & Coordinates */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', fontSize: '11px', color: '#D6C6A5' }}>
                  <MapPin size={13} color="#6F947D" />
                  <span>{mission.locationName || 'Chandigarh'}</span>
                  {mission.latitude && mission.longitude && (
                    <span className="font-mono" style={{ fontSize: '10px', color: '#6F947D' }}>
                      ({mission.latitude.toFixed(2)}°, {mission.longitude.toFixed(2)}°)
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer: Status control + Enter button */}
              <div style={{ borderTop: '1px solid rgba(214, 198, 165, 0.12)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  {canManage && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <select
                        value={mission.status}
                        disabled={updatingId === mId}
                        onChange={(e) => handleStatusChange(mId, e.target.value)}
                        className="font-mono"
                        style={{
                          fontSize: '9px',
                          background: 'rgba(0,0,0,0.5)',
                          border: '1px solid rgba(214, 198, 165, 0.25)',
                          color: '#D6C6A5',
                          borderRadius: '3px',
                          padding: '4px 6px',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="PLANNING">PLANNING</option>
                        <option value="PAUSED">PAUSED</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>

                      <button
                        onClick={() => handleArchive(mId)}
                        disabled={updatingId === mId}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#F87171',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          borderRadius: '3px'
                        }}
                        title="Archive Operation"
                      >
                        <Archive size={13} />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => onSelectOperation(mission)}
                    className="btn-command-primary"
                    style={{
                      fontSize: '11px',
                      padding: '6px 14px',
                      letterSpacing: '0.08em',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginLeft: 'auto'
                    }}
                  >
                    <span>ENTER OPERATION</span>
                    <Play size={11} />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {missions.length === 0 && (
        <div style={{
          background: 'rgba(14, 27, 21, 0.75)',
          border: '1px dashed rgba(214, 198, 165, 0.25)',
          borderRadius: '8px',
          padding: '40px 24px',
          textAlign: 'center',
          margin: '20px 0'
        }}>
          <ShieldAlert size={36} color="#6F947D" style={{ margin: '0 auto 12px auto' }} />
          <h3 className="font-hud" style={{ fontSize: '18px', color: '#EAE5D8', margin: '0 0 8px 0' }}>
            NO ACTIVE OPERATIONS FOUND FOR THIS ORGANIZATION
          </h3>
          <p style={{ fontSize: '12px', color: '#9FB5A4', maxWidth: '440px', margin: '0 auto 20px auto' }}>
            Commission an initial emergency response theater or load the default demonstration scenario.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            {canManage && (
              <button
                onClick={onOpenNewOperationModal}
                className="btn-command-primary"
                style={{ fontSize: '11px', padding: '8px 16px' }}
              >
                + COMMISSION FIRST OPERATION
              </button>
            )}
            <button
              onClick={onEnterDemoMode}
              className="btn-command-secondary"
              style={{ fontSize: '11px', padding: '8px 16px' }}
            >
              LOAD DEMO SCENARIO #027
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
