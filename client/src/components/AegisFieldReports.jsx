import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Shield,
  Send,
  X,
  RefreshCw,
  Eye,
  Check,
  Ban
} from 'lucide-react';
import {
  getMissionReports,
  createMissionReport,
  updateMissionReport
} from '../services/api';

const REPORT_TYPES = [
  { value: 'FLOODING', label: 'Flooding' },
  { value: 'ROAD_BLOCKED', label: 'Road Blocked' },
  { value: 'INFRASTRUCTURE_DAMAGE', label: 'Infrastructure Damage' },
  { value: 'MEDICAL', label: 'Medical Emergency' },
  { value: 'FIRE', label: 'Fire Outbreak' },
  { value: 'POWER_FAILURE', label: 'Power Grid Failure' },
  { value: 'EVACUATION', label: 'Evacuation Required' },
  { value: 'WATER_LEVEL', label: 'Water Level Surge' },
  { value: 'OTHER', label: 'Other Observation' }
];

const SEVERITY_LEVELS = [
  { value: 'LOW', label: 'LOW', color: '#10B981' },
  { value: 'MEDIUM', label: 'MEDIUM', color: '#FBBF24' },
  { value: 'HIGH', label: 'HIGH', color: '#F97316' },
  { value: 'CRITICAL', label: 'CRITICAL', color: '#EF4444' }
];

function getSeverityColor(sev) {
  switch (sev) {
    case 'CRITICAL': return '#EF4444';
    case 'HIGH': return '#F97316';
    case 'MEDIUM': return '#FBBF24';
    case 'LOW': return '#10B981';
    default: return '#9FB5A4';
  }
}

function getStatusBadge(status) {
  switch (status) {
    case 'NEW':
      return { bg: 'rgba(56, 189, 248, 0.15)', border: 'rgba(56, 189, 248, 0.35)', color: '#38BDF8' };
    case 'REVIEWED':
      return { bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.35)', color: '#FBBF24' };
    case 'RESOLVED':
      return { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.35)', color: '#6EE7B7' };
    case 'DISMISSED':
      return { bg: 'rgba(156, 163, 175, 0.15)', border: 'rgba(156, 163, 175, 0.35)', color: '#9CA3AF' };
    default:
      return { bg: 'rgba(214, 198, 165, 0.15)', border: 'rgba(214, 198, 165, 0.35)', color: '#D6C6A5' };
  }
}

function formatReportTime(iso) {
  if (!iso) return '--:--';
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch {
    return '--:--';
  }
}

export default function AegisFieldReports({
  missionId,
  activeMission = null,
  currentUser = null,
  onReportCreated = null,
  compact = false,
  style = {}
}) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Form submission state machine: 'IDLE' | 'TRANSMITTING' | 'SUCCESS' | 'FAILED'
  const [submitState, setSubmitState] = useState('IDLE');
  const [submitError, setSubmitError] = useState(null);
  const [formData, setFormData] = useState({
    locationName: '',
    latitude: '',
    longitude: '',
    type: 'FLOODING',
    severity: 'MEDIUM',
    description: ''
  });

  const fetchReports = useCallback(async () => {
    if (!missionId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getMissionReports(missionId);
      if (Array.isArray(data)) {
        setReports(data);
      }
    } catch (err) {
      console.warn(`[AEGIS-REPORTS] Fetch failed for ${missionId}:`, err.message);
      setError(err.message || 'FAILED TO RETRIEVE FIELD INTELLIGENCE');
    } finally {
      setLoading(false);
    }
  }, [missionId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Pre-fill location when opening submission panel
  const handleOpenNewModal = () => {
    setFormData({
      locationName: activeMission?.locationName || '',
      latitude: activeMission?.latitude !== undefined ? activeMission.latitude : '',
      longitude: activeMission?.longitude !== undefined ? activeMission.longitude : '',
      type: 'FLOODING',
      severity: 'MEDIUM',
      description: ''
    });
    setSubmitState('IDLE');
    setSubmitError(null);
    setIsNewModalOpen(true);
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      setSubmitError('Report description is required');
      return;
    }

    setSubmitState('TRANSMITTING');
    setSubmitError(null);

    try {
      const payload = {
        locationName: formData.locationName.trim() || activeMission?.locationName || 'Operational Sector',
        type: formData.type,
        severity: formData.severity,
        description: formData.description.trim()
      };
      if (formData.latitude !== '') payload.latitude = Number(formData.latitude);
      if (formData.longitude !== '') payload.longitude = Number(formData.longitude);

      const res = await createMissionReport(missionId, payload);
      setSubmitState('SUCCESS');

      setTimeout(() => {
        setIsNewModalOpen(false);
        setSubmitState('IDLE');
        fetchReports();
        if (onReportCreated) onReportCreated(res.report);
      }, 900);
    } catch (err) {
      console.error('[AEGIS-REPORTS] Submit error:', err);
      setSubmitState('FAILED');
      setSubmitError(err.message || 'REPORT TRANSMISSION FAILED');
    }
  };

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      const updated = await updateMissionReport(missionId, reportId, { status: newStatus });
      setSelectedReport(updated.report || null);
      fetchReports();
    } catch (err) {
      console.warn('[AEGIS-REPORTS] Status update failed:', err);
    }
  };

  const canReview = ['ADMIN', 'COMMANDER', 'ANALYST'].includes(currentUser?.role || '');

  return (
    <div
      className="aegis-card-glass"
      style={{
        background: 'linear-gradient(175deg, rgba(14, 27, 21, 0.95) 0%, rgba(8, 13, 10, 0.95) 100%)',
        border: '1px solid rgba(214, 198, 165, 0.22)',
        borderRadius: '6px',
        padding: compact ? '12px 14px' : '16px 18px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(214, 198, 165, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        ...style
      }}
    >
      {/* Header Rail */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(214, 198, 165, 0.12)', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: loading ? '#38BDF8' : reports.length > 0 ? '#10B981' : '#FBBF24',
            boxShadow: loading ? '0 0 6px #38BDF8' : reports.length > 0 ? '0 0 6px #10B981' : '0 0 6px #FBBF24'
          }} />
          <span className="font-hud" style={{ fontSize: '11px', letterSpacing: '0.1em', color: '#D6C6A5', textTransform: 'uppercase' }}>
            FIELD INTELLIGENCE // {activeMission?.locationName || 'THEATER'}
          </span>
          <span style={{
            fontSize: '9px',
            padding: '1px 6px',
            borderRadius: '2px',
            background: 'rgba(214, 198, 165, 0.12)',
            border: '1px solid rgba(214, 198, 165, 0.25)',
            color: '#D6C6A5',
            fontFamily: 'monospace'
          }}>
            {reports.length} {reports.length === 1 ? 'REPORT' : 'REPORTS'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={fetchReports}
            disabled={loading}
            title="Refresh Field Reports"
            style={{
              background: 'transparent',
              border: 'none',
              color: loading ? '#38BDF8' : '#9FB5A4',
              cursor: loading ? 'not-allowed' : 'pointer',
              padding: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              fontSize: '10px'
            }}
          >
            <RefreshCw size={12} className={loading ? 'spin' : ''} />
          </button>

          <button
            onClick={handleOpenNewModal}
            style={{
              background: 'rgba(25, 58, 42, 0.8)',
              border: '1px solid rgba(111, 148, 125, 0.5)',
              borderRadius: '3px',
              color: '#6EE7B7',
              padding: '4px 10px',
              fontSize: '10px',
              fontFamily: 'monospace',
              letterSpacing: '0.08em',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: '700'
            }}
          >
            <Plus size={12} />
            <span>[ + NEW FIELD REPORT ]</span>
          </button>
        </div>
      </div>

      {/* Loading Banner */}
      {loading && reports.length === 0 && (
        <div style={{ padding: '16px 8px', textAlign: 'center', color: '#38BDF8', fontSize: '11px', fontFamily: 'monospace' }}>
          FIELD INTELLIGENCE SYNCING...
        </div>
      )}

      {/* Empty State / Information Gap */}
      {!loading && reports.length === 0 && (
        <div style={{
          background: 'rgba(8, 13, 10, 0.6)',
          border: '1px dashed rgba(214, 198, 165, 0.2)',
          borderRadius: '4px',
          padding: '20px 14px',
          textAlign: 'center',
          color: '#9FB5A4'
        }}>
          <div className="font-hud" style={{ fontSize: '11px', color: '#D6C6A5', letterSpacing: '0.1em', marginBottom: '4px' }}>
            NO FIELD REPORTS AVAILABLE
          </div>
          <div className="font-mono" style={{ fontSize: '9px', color: '#C99A45' }}>
            INFORMATION GAP // RECONNAISSANCE UNITS UNASSIGNED OR OFFLINE
          </div>
        </div>
      )}

      {/* Report Feed Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: compact ? '280px' : '360px', overflowY: 'auto', paddingRight: '4px' }}>
        {reports.map((rep) => {
          const sevColor = getSeverityColor(rep.severity);
          const stBadge = getStatusBadge(rep.status);

          return (
            <div
              key={rep.reportId || rep._id}
              onClick={() => setSelectedReport(rep)}
              style={{
                background: 'rgba(8, 13, 10, 0.75)',
                border: '1px solid rgba(214, 198, 165, 0.14)',
                borderLeft: `3px solid ${sevColor}`,
                borderRadius: '4px',
                padding: '10px 12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(25, 58, 42, 0.35)';
                e.currentTarget.style.borderColor = 'rgba(214, 198, 165, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(8, 13, 10, 0.75)';
                e.currentTarget.style.borderColor = 'rgba(214, 198, 165, 0.14)';
              }}
            >
              {/* Card Header: Type, Severity, Time */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="font-mono" style={{ fontSize: '9px', fontWeight: '800', color: sevColor }}>
                    ● {rep.type?.replace(/_/g, ' ')}
                  </span>
                  <span style={{ fontSize: '8px', color: '#9FB5A4' }}>·</span>
                  <span className="font-mono" style={{ fontSize: '9px', color: sevColor, fontWeight: '700' }}>
                    {rep.severity}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {rep.isDemo && (
                    <span style={{
                      fontSize: '8px',
                      background: 'rgba(234, 179, 8, 0.15)',
                      border: '1px solid rgba(234, 179, 8, 0.3)',
                      color: '#FBBF24',
                      padding: '1px 4px',
                      borderRadius: '2px',
                      fontFamily: 'monospace'
                    }}>
                      DEMO DATA
                    </span>
                  )}
                  <span style={{
                    fontSize: '8px',
                    background: stBadge.bg,
                    border: `1px solid ${stBadge.border}`,
                    color: stBadge.color,
                    padding: '1px 5px',
                    borderRadius: '2px',
                    fontFamily: 'monospace'
                  }}>
                    {rep.status}
                  </span>
                  <span className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4' }}>
                    {formatReportTime(rep.createdAt)}
                  </span>
                </div>
              </div>

              {/* Location Tag */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={10} color="#D6C6A5" />
                <span className="font-hud" style={{ fontSize: '11px', color: '#EAE5D8', fontWeight: '700' }}>
                  {rep.locationName}
                </span>
              </div>

              {/* Description Body */}
              <p style={{
                margin: 0,
                fontSize: '11px',
                color: '#D6C6A5',
                lineHeight: 1.4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}>
                {rep.description}
              </p>

              {/* Submitter & Transparency Footer */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '8px', color: '#6F947D', fontFamily: 'monospace', borderTop: '1px solid rgba(214, 198, 165, 0.08)', paddingTop: '4px' }}>
                <span>SOURCE: <strong style={{ color: '#D6C6A5' }}>FIELD OPERATOR</strong></span>
                <span>BY: {rep.submitterCallsign || rep.submitterName || 'OBSERVER'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: NEW FIELD REPORT DIALOG */}
      {isNewModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.82)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div 
            className="aegis-card-glass"
            style={{
              width: '480px',
              maxWidth: '95vw',
              background: 'linear-gradient(175deg, rgba(14, 27, 21, 0.98) 0%, rgba(8, 13, 10, 0.98) 100%)',
              border: '1px solid rgba(214, 198, 165, 0.3)',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)'
            }}
          >
            {/* Modal Title */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid rgba(214, 198, 165, 0.15)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#6EE7B7" />
                <span className="font-hud" style={{ fontSize: '14px', fontWeight: '800', letterSpacing: '0.12em', color: '#EAE5D8', textTransform: 'uppercase' }}>
                  FIELD INTELLIGENCE REPORT
                </span>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#9FB5A4', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitReport} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="font-mono" style={{ fontSize: '10px', color: '#9FB5A4', display: 'block', marginBottom: '4px' }}>
                  LOCATION NAME
                </label>
                <input
                  type="text"
                  value={formData.locationName}
                  onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                  placeholder={activeMission?.locationName || 'e.g. Sector 17 Underpass'}
                  style={{
                    width: '100%',
                    background: 'rgba(8, 13, 10, 0.8)',
                    border: '1px solid rgba(214, 198, 165, 0.25)',
                    borderRadius: '4px',
                    padding: '8px 10px',
                    color: '#EAE5D8',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="font-mono" style={{ fontSize: '10px', color: '#9FB5A4', display: 'block', marginBottom: '4px' }}>
                    REPORT TYPE
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(8, 13, 10, 0.8)',
                      border: '1px solid rgba(214, 198, 165, 0.25)',
                      borderRadius: '4px',
                      padding: '8px 10px',
                      color: '#EAE5D8',
                      fontSize: '12px',
                      fontFamily: 'inherit',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    {REPORT_TYPES.map((t) => (
                      <option key={t.value} value={t.value} style={{ background: '#0e1b15', color: '#EAE5D8' }}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-mono" style={{ fontSize: '10px', color: '#9FB5A4', display: 'block', marginBottom: '4px' }}>
                    SEVERITY
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'rgba(8, 13, 10, 0.8)',
                      border: '1px solid rgba(214, 198, 165, 0.25)',
                      borderRadius: '4px',
                      padding: '8px 10px',
                      color: getSeverityColor(formData.severity),
                      fontSize: '12px',
                      fontFamily: 'inherit',
                      fontWeight: '700',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    {SEVERITY_LEVELS.map((s) => (
                      <option key={s.value} value={s.value} style={{ background: '#0e1b15', color: s.color }}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono" style={{ fontSize: '10px', color: '#9FB5A4', display: 'block', marginBottom: '4px' }}>
                  DESCRIPTION
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detail observable conditions, water depth, physical road obstructions, or affected infrastructure..."
                  style={{
                    width: '100%',
                    background: 'rgba(8, 13, 10, 0.8)',
                    border: '1px solid rgba(214, 198, 165, 0.25)',
                    borderRadius: '4px',
                    padding: '8px 10px',
                    color: '#EAE5D8',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {submitError && (
                <div style={{ color: '#F87171', fontSize: '11px', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={12} />
                  <span>{submitError}</span>
                </div>
              )}

              {submitState === 'SUCCESS' && (
                <div style={{ color: '#6EE7B7', fontSize: '11px', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={12} />
                  <span>REPORT RECEIVED // CATALOGED TO THEATER FEED</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  disabled={submitState === 'TRANSMITTING'}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(214, 198, 165, 0.2)',
                    color: '#9FB5A4',
                    padding: '8px 14px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    cursor: 'pointer'
                  }}
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  disabled={submitState === 'TRANSMITTING'}
                  style={{
                    background: submitState === 'SUCCESS' ? '#10B981' : 'linear-gradient(135deg, #193a2a 0%, #0e1b15 100%)',
                    border: '1px solid rgba(111, 148, 125, 0.5)',
                    color: submitState === 'SUCCESS' ? '#080d0a' : '#6EE7B7',
                    padding: '8px 18px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    fontWeight: '700',
                    cursor: submitState === 'TRANSMITTING' ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Send size={12} />
                  <span>
                    {submitState === 'TRANSMITTING' ? 'REPORT TRANSMITTING...' : submitState === 'SUCCESS' ? 'REPORT RECEIVED' : '[ SUBMIT REPORT ]'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REPORT DETAIL DIALOG */}
      {selectedReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.82)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div
            className="aegis-card-glass"
            style={{
              width: '520px',
              maxWidth: '95vw',
              background: 'linear-gradient(175deg, rgba(14, 27, 21, 0.98) 0%, rgba(8, 13, 10, 0.98) 100%)',
              border: '1px solid rgba(214, 198, 165, 0.3)',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(214, 198, 165, 0.15)', paddingBottom: '10px' }}>
              <div>
                <span className="font-mono" style={{ fontSize: '10px', color: '#9FB5A4' }}>REPORT DOSSIER</span>
                <div className="font-hud" style={{ fontSize: '16px', fontWeight: '800', color: '#EAE5D8' }}>
                  REPORT #{selectedReport.reportId || '001'}
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                style={{ background: 'transparent', border: 'none', color: '#9FB5A4', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Metadata Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
              background: 'rgba(8, 13, 10, 0.65)',
              padding: '10px 14px',
              borderRadius: '4px',
              border: '1px solid rgba(214, 198, 165, 0.12)'
            }}>
              <div>
                <div className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4' }}>LOCATION</div>
                <div className="font-hud" style={{ fontSize: '13px', fontWeight: '700', color: '#EAE5D8' }}>
                  {selectedReport.locationName}
                </div>
              </div>

              <div>
                <div className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4' }}>TYPE</div>
                <div className="font-mono" style={{ fontSize: '12px', fontWeight: '700', color: '#D6C6A5' }}>
                  {selectedReport.type?.replace(/_/g, ' ')}
                </div>
              </div>

              <div>
                <div className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4' }}>SEVERITY</div>
                <div className="font-mono" style={{ fontSize: '12px', fontWeight: '800', color: getSeverityColor(selectedReport.severity) }}>
                  {selectedReport.severity}
                </div>
              </div>

              <div>
                <div className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4' }}>STATUS</div>
                <div className="font-mono" style={{ fontSize: '12px', fontWeight: '700', color: getStatusBadge(selectedReport.status).color }}>
                  {selectedReport.status}
                </div>
              </div>
            </div>

            {/* Submitter & Timestamp */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10px', color: '#D6C6A5', fontFamily: 'monospace' }}>
              <div>
                <span style={{ color: '#9FB5A4' }}>SUBMITTED BY: </span>
                <strong>{selectedReport.submitterCallsign || selectedReport.submitterName || 'Field Operator'}</strong>
              </div>
              <div>
                <span style={{ color: '#9FB5A4' }}>TIME: </span>
                <span>{formatReportTime(selectedReport.createdAt)}</span>
              </div>
            </div>

            {/* Description Body */}
            <div>
              <div className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4', marginBottom: '4px' }}>
                OBSERVATION DESCRIPTION
              </div>
              <div style={{
                background: 'rgba(8, 13, 10, 0.8)',
                border: '1px solid rgba(214, 198, 165, 0.15)',
                borderRadius: '4px',
                padding: '12px',
                color: '#EAE5D8',
                fontSize: '12px',
                lineHeight: 1.5
              }}>
                {selectedReport.description}
              </div>
            </div>

            {/* Status Command Actions (for authorized roles) */}
            {canReview && (
              <div style={{ borderTop: '1px solid rgba(214, 198, 165, 0.12)', paddingTop: '12px' }}>
                <span className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4', display: 'block', marginBottom: '8px' }}>
                  OPERATIONAL COMMAND ACTIONS:
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedReport.status !== 'REVIEWED' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedReport.reportId || selectedReport._id, 'REVIEWED')}
                      style={{
                        background: 'rgba(234, 179, 8, 0.15)',
                        border: '1px solid rgba(234, 179, 8, 0.4)',
                        color: '#FBBF24',
                        padding: '4px 10px',
                        borderRadius: '3px',
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Eye size={12} />
                      <span>[ MARK REVIEWED ]</span>
                    </button>
                  )}

                  {selectedReport.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedReport.reportId || selectedReport._id, 'RESOLVED')}
                      style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        color: '#6EE7B7',
                        padding: '4px 10px',
                        borderRadius: '3px',
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Check size={12} />
                      <span>[ RESOLVE REPORT ]</span>
                    </button>
                  )}

                  {selectedReport.status !== 'DISMISSED' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedReport.reportId || selectedReport._id, 'DISMISSED')}
                      style={{
                        background: 'rgba(156, 163, 175, 0.15)',
                        border: '1px solid rgba(156, 163, 175, 0.4)',
                        color: '#9CA3AF',
                        padding: '4px 10px',
                        borderRadius: '3px',
                        fontSize: '10px',
                        fontFamily: 'monospace',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Ban size={12} />
                      <span>[ DISMISS ]</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
