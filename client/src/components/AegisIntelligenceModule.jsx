import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  HelpCircle,
  RefreshCw,
  AlertTriangle,
  Layers,
  Activity,
  X,
  FileText,
  CloudRain,
  Radio,
  CheckCircle2,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { getMissionIntelligence } from '../services/api';

function getRiskColor(level) {
  switch (level) {
    case 'CRITICAL': return '#EF4444';
    case 'HIGH': return '#F97316';
    case 'MEDIUM': return '#FBBF24';
    case 'LOW': return '#10B981';
    default: return '#9FB5A4';
  }
}

function getConfidenceBadge(level) {
  switch (level) {
    case 'HIGH':
      return { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.35)', color: '#6EE7B7' };
    case 'MEDIUM':
      return { bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.35)', color: '#FBBF24' };
    default:
      return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.35)', color: '#F87171' };
  }
}

function getGapBadge(level) {
  switch (level) {
    case 'HIGH':
      return { bg: 'rgba(239, 68, 68, 0.18)', border: 'rgba(239, 68, 68, 0.4)', color: '#F87171' };
    case 'MEDIUM':
      return { bg: 'rgba(249, 115, 22, 0.18)', border: 'rgba(249, 115, 22, 0.4)', color: '#FB923C' };
    default:
      return { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.35)', color: '#6EE7B7' };
  }
}

export default function AegisIntelligenceModule({
  missionId,
  activeMission = null,
  onIntelligenceLoaded = null,
  compact = false,
  style = {}
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState(false);

  const fetchIntelligence = useCallback(async (forceRefresh = false) => {
    if (!missionId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await getMissionIntelligence(missionId, forceRefresh);
      setData(res);
      if (onIntelligenceLoaded) onIntelligenceLoaded(res);
    } catch (err) {
      console.warn(`[AEGIS-INTELLIGENCE] Fetch failed for ${missionId}:`, err.message);
      setError(err.message || 'INTELLIGENCE SYSTEM UNAVAILABLE');
    } finally {
      setLoading(false);
    }
  }, [missionId, onIntelligenceLoaded]);

  useEffect(() => {
    fetchIntelligence(false);
  }, [fetchIntelligence]);

  const risk = data?.overallRisk;
  const confidence = data?.confidence;
  const gap = data?.informationGap;
  const riskColor = getRiskColor(risk?.level);
  const confBadge = getConfidenceBadge(confidence?.level);
  const gapBadge = getGapBadge(gap?.level);

  return (
    <div
      className="aegis-card-glass"
      style={{
        background: 'linear-gradient(175deg, rgba(14, 27, 21, 0.95) 0%, rgba(8, 13, 10, 0.95) 100%)',
        border: '1px solid rgba(214, 198, 165, 0.22)',
        borderRadius: '6px',
        padding: compact ? '10px 14px' : '14px 16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(214, 198, 165, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        ...style
      }}
    >
      {/* Top Header Rail */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(214, 198, 165, 0.12)', paddingBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: error ? '#EF4444' : loading ? '#38BDF8' : riskColor,
            boxShadow: `0 0 6px ${error ? '#EF4444' : loading ? '#38BDF8' : riskColor}`
          }} />
          <span className="font-hud" style={{ fontSize: '11px', letterSpacing: '0.1em', color: '#D6C6A5', textTransform: 'uppercase' }}>
            AEGIS INTELLIGENCE // FUSED WORLD STATE
          </span>
          <span style={{
            fontSize: '9px',
            padding: '1px 5px',
            borderRadius: '2px',
            background: 'rgba(214, 198, 165, 0.12)',
            border: '1px solid rgba(214, 198, 165, 0.25)',
            color: '#D6C6A5',
            fontFamily: 'monospace'
          }}>
            DERIVED
          </span>
        </div>

        <button
          onClick={() => fetchIntelligence(true)}
          disabled={loading}
          title="Recompute multi-source data fusion"
          style={{
            background: 'rgba(214, 198, 165, 0.08)',
            border: '1px solid rgba(214, 198, 165, 0.2)',
            borderRadius: '3px',
            color: loading ? '#38BDF8' : '#D6C6A5',
            cursor: loading ? 'not-allowed' : 'pointer',
            padding: '2px 7px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '9px',
            fontFamily: 'monospace'
          }}
        >
          <RefreshCw size={10} className={loading ? 'spin' : ''} />
          <span>{loading ? 'FUSING...' : '[ REFRESH INTELLIGENCE ]'}</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && !data && (
        <div style={{ padding: '16px 8px', textAlign: 'center', color: '#38BDF8', fontSize: '11px', fontFamily: 'monospace' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Cpu size={14} className="pulse" />
            <span>FUSING MULTI-SOURCE THEATER TELEMETRY...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !data && (
        <div style={{
          background: 'rgba(217, 83, 79, 0.12)',
          border: '1px solid rgba(217, 83, 79, 0.3)',
          borderRadius: '4px',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F87171', fontSize: '11px', fontFamily: 'monospace', fontWeight: '700' }}>
            <AlertTriangle size={14} />
            <span>INTELLIGENCE SYSTEM UNAVAILABLE</span>
          </div>
          <button
            onClick={() => fetchIntelligence(true)}
            style={{
              alignSelf: 'flex-start',
              background: 'rgba(217, 83, 79, 0.25)',
              border: '1px solid rgba(217, 83, 79, 0.4)',
              color: '#FCA5A5',
              padding: '3px 8px',
              borderRadius: '2px',
              fontSize: '9px',
              fontFamily: 'monospace',
              cursor: 'pointer'
            }}
          >
            [ RETRY ]
          </button>
        </div>
      )}

      {/* Primary Readout Bar */}
      {data && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div>
              <div className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4', letterSpacing: '0.08em' }}>
                CURRENT RISK
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span className="font-hud" style={{ fontSize: '32px', fontWeight: '800', color: riskColor, lineHeight: 1 }}>
                  {risk?.score ?? '--'}
                </span>
                <span className="font-hud" style={{ fontSize: '14px', fontWeight: '800', color: riskColor, letterSpacing: '0.08em' }}>
                  {risk?.level}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsWhyModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, rgba(201, 154, 69, 0.25) 0%, rgba(14, 27, 21, 0.8) 100%)',
                border: '1px solid rgba(214, 198, 165, 0.45)',
                color: '#EAE5D8',
                borderRadius: '4px',
                padding: '6px 14px',
                fontFamily: 'monospace',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
              }}
            >
              <HelpCircle size={13} color="#D6C6A5" />
              <span>[ WHY? ]</span>
            </button>
          </div>

          {/* Assessment Badges: Confidence & Uncertainty Gaps */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            background: 'rgba(8, 13, 10, 0.7)',
            padding: '8px 10px',
            borderRadius: '4px',
            border: '1px solid rgba(214, 198, 165, 0.12)',
            marginBottom: '10px'
          }}>
            <div>
              <div className="font-mono" style={{ fontSize: '8px', color: '#9FB5A4' }}>CONFIDENCE</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span style={{
                  fontSize: '9px',
                  fontFamily: 'monospace',
                  fontWeight: '700',
                  color: confBadge.color,
                  background: confBadge.bg,
                  border: `1px solid ${confBadge.border}`,
                  padding: '1px 5px',
                  borderRadius: '2px'
                }}>
                  {confidence?.level}
                </span>
                <span className="font-mono" style={{ fontSize: '9px', color: '#D6C6A5' }}>
                  {confidence?.score}%
                </span>
              </div>
            </div>

            <div>
              <div className="font-mono" style={{ fontSize: '8px', color: '#9FB5A4' }}>INFORMATION GAP</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <span style={{
                  fontSize: '9px',
                  fontFamily: 'monospace',
                  fontWeight: '700',
                  color: gapBadge.color,
                  background: gapBadge.bg,
                  border: `1px solid ${gapBadge.border}`,
                  padding: '1px 5px',
                  borderRadius: '2px'
                }}>
                  {gap?.level}
                </span>
                <span className="font-mono" style={{ fontSize: '9px', color: '#D6C6A5' }}>
                  {gap?.count} FLAG{gap?.count === 1 ? '' : 'S'}
                </span>
              </div>
            </div>
          </div>

          {/* Source Indicators Strip */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '9px',
            fontFamily: 'monospace',
            color: '#D6C6A5',
            background: 'rgba(25, 58, 42, 0.25)',
            border: '1px solid rgba(214, 198, 165, 0.1)',
            padding: '5px 8px',
            borderRadius: '3px',
            marginBottom: '6px'
          }}>
            <span>● {data.zones?.critical || 0} CRITICAL SECTORS</span>
            <span>● {data.reports?.total || 0} FIELD REPORTS</span>
            <span>● {data.weather ? `${Math.round(data.weather.temperature)}°C` : 'WEATHER OFFLINE'}</span>
          </div>

          {/* Footer Metadata */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '8px', color: '#6F947D', fontFamily: 'monospace' }}>
            <span>ENGINE: DETERMINISTIC FUSION</span>
            <span>FUSED: {data.fusedAt ? new Date(data.fusedAt).toLocaleTimeString() : 'RECENT'}</span>
          </div>
        </div>
      )}

      {/* WHY INTELLIGENCE DOSSIER MODAL */}
      {isWhyModalOpen && data && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
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
              width: '560px',
              maxWidth: '95vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: 'linear-gradient(175deg, rgba(14, 27, 21, 0.98) 0%, rgba(8, 13, 10, 0.98) 100%)',
              border: '1px solid rgba(214, 198, 165, 0.35)',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.9)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(214, 198, 165, 0.15)', paddingBottom: '12px' }}>
              <div>
                <span className="font-mono" style={{ fontSize: '10px', color: '#9FB5A4', letterSpacing: '0.1em' }}>
                  XAI INTELLIGENCE DOSSIER
                </span>
                <div className="font-hud" style={{ fontSize: '18px', fontWeight: '800', color: '#EAE5D8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>WHY IS OVERALL RISK</span>
                  <span style={{ color: riskColor }}>{risk?.level} ({risk?.score}/100)?</span>
                </div>
              </div>
              <button
                onClick={() => setIsWhyModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#9FB5A4', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Contributing Factor Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.why?.map((item, idx) => {
                const impactColor = item.impact === 'HIGH' ? '#EF4444' : item.impact === 'MEDIUM' ? '#FBBF24' : '#10B981';

                return (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(8, 13, 10, 0.75)',
                      border: '1px solid rgba(214, 198, 165, 0.14)',
                      borderLeft: `3px solid ${impactColor}`,
                      borderRadius: '4px',
                      padding: '10px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="font-mono" style={{ fontSize: '10px', fontWeight: '700', color: '#D6C6A5' }}>
                        0{idx + 1} // {item.factor}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {item.contribution && (
                          <span className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4' }}>
                            {item.contribution}
                          </span>
                        )}
                        <span style={{
                          fontSize: '8px',
                          fontFamily: 'monospace',
                          fontWeight: '800',
                          color: impactColor,
                          background: 'rgba(0, 0, 0, 0.5)',
                          border: `1px solid ${impactColor}`,
                          padding: '1px 5px',
                          borderRadius: '2px'
                        }}>
                          {item.impact} IMPACT
                        </span>
                      </div>
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#EAE5D8', lineHeight: 1.4 }}>
                      {item.reason}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Information Gaps & Uncertainty Section */}
            {gap?.gaps?.length > 0 && (
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '4px', padding: '10px 14px' }}>
                <span className="font-mono" style={{ fontSize: '10px', color: '#F87171', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                  ACTIVE SURVEILLANCE &amp; INFORMATION GAPS:
                </span>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '10px', color: '#FCA5A5', fontFamily: 'monospace' }}>
                  {gap.gaps.map((g, i) => (
                    <li key={i}>{g.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Data Source Provenance Breakdown */}
            <div style={{
              background: 'rgba(8, 13, 10, 0.8)',
              border: '1px solid rgba(214, 198, 165, 0.12)',
              borderRadius: '4px',
              padding: '12px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <span className="font-mono" style={{ fontSize: '10px', color: '#9FB5A4', letterSpacing: '0.08em' }}>
                TELEMETRY DATA PROVENANCE
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '9px', fontFamily: 'monospace' }}>
                <div>
                  <div style={{ color: '#6F947D' }}>LIVE EXTERNAL</div>
                  <div style={{ color: '#D6C6A5', fontWeight: '700' }}>{data.dataSources?.weather}</div>
                </div>
                <div>
                  <div style={{ color: '#6F947D' }}>HUMAN FIELD</div>
                  <div style={{ color: '#D6C6A5', fontWeight: '700' }}>{data.dataSources?.reports}</div>
                </div>
                <div>
                  <div style={{ color: '#6F947D' }}>SYSTEM MATRIX</div>
                  <div style={{ color: '#D6C6A5', fontWeight: '700' }}>{data.dataSources?.zones}</div>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsWhyModalOpen(false)}
              style={{
                alignSelf: 'flex-end',
                background: 'rgba(214, 198, 165, 0.15)',
                border: '1px solid rgba(214, 198, 165, 0.3)',
                color: '#D6C6A5',
                padding: '6px 16px',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              DISMISS DOSSIER
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
