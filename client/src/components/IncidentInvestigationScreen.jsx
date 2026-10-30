import React, { useState, useMemo } from 'react';
import { 
  CloudRain, 
  Waves, 
  AlertTriangle, 
  Activity, 
  Radio, 
  PhoneCall, 
  CheckCircle2, 
  X, 
  Plus, 
  Sparkles,
  Terminal,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  ChevronRight,
  ShieldAlert,
  SlidersHorizontal,
  Flame,
  FileText
} from 'lucide-react';
import { AegisPrimaryCommand } from './aegis-controls';
import { Aegis3DCard } from './aegis-interactive';

export default function IncidentInvestigationScreen({
  onFuseIncident
}) {
  const [activeModalSignal, setActiveModalSignal] = useState(null);
  const [collectedEvidence, setCollectedEvidence] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'WARNING' | 'ELEVATED'
  const [sortBy, setSortBy] = useState('RISK_DESC'); // 'RISK_DESC' | 'CONFIDENCE_DESC' | 'TAG_ASC'
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  const signals = [
    {
      id: "weather",
      tag: "WEATHER",
      severity: "CRITICAL",
      headline: "Heavy Rainfall Convective Cell",
      value: "42 mm/hr",
      icon: CloudRain,
      color: "#00F0FF",
      source: "Weather Radar + METAR Station",
      confidence: "94%",
      confidenceNum: 94,
      risk: "+31",
      riskNum: 31,
      timestamp: "09:12 UTC",
      description: "Localized atmospheric activity detected over North-South drainage corridor. Soil absorption reached saturation with surface flash runoff.",
      rawTelemetry: [
        { label: "rainfall_intensity", value: "42 mm/hr" },
        { label: "trend", value: "increasing (+14% / hr)" },
        { label: "radar_reflectivity", value: "54 dBZ" },
        { label: "cell_velocity", value: "18 kt (Stationary Stall)" }
      ],
      history: [
        { time: "08:30 UTC", event: "Rainfall rate crossed 25 mm/h warning threshold" },
        { time: "09:00 UTC", event: "Flash flood advisory issued by Meteorological Bureau" },
        { time: "09:12 UTC", event: "Stationary convective cell locked over Sector 17 & 32" }
      ]
    },
    {
      id: "river",
      tag: "RIVER",
      severity: "CRITICAL",
      headline: "Water Expansion & Basin Breach",
      value: "+3.4m Crest",
      icon: Waves,
      color: "#38BDF8",
      source: "IoT River Basin Piezometers",
      confidence: "96%",
      confidenceNum: 96,
      risk: "+24",
      riskNum: 24,
      timestamp: "09:18 UTC",
      description: "Rapid water expansion cresting natural river banks by +3.4m. Inundating dual-carriageway and Levee Berm #2 with rapid scour.",
      rawTelemetry: [
        { label: "crest_delta", value: "+3.4m above baseline" },
        { label: "stream_flow", value: "410 m³/sec" },
        { label: "flood_stage", value: "Stage 3 (Major Inundation)" },
        { label: "berm_pore_pressure", value: "184 kPa (Warning)" }
      ],
      history: [
        { time: "08:15 UTC", event: "Berm hydro sensor telemetry normal (0.8m)" },
        { time: "08:50 UTC", event: "Water velocity surged to 320 m³/s" },
        { time: "09:18 UTC", event: "Major overflow reported across Levee Berm 2" }
      ]
    },
    {
      id: "road",
      tag: "ROAD",
      severity: "CRITICAL",
      headline: "Road 17 Culvert Failure",
      value: "Structural Washout",
      icon: AlertTriangle,
      color: "#EF4444",
      source: "DOT Inductive Loop Sensors & Satellite SAR",
      confidence: "98%",
      confidenceNum: 98,
      risk: "+28",
      riskNum: 28,
      timestamp: "09:22 UTC",
      description: "Culvert washout on arterial Road 17 completely blocks primary ambulance artery into South General Hospital.",
      rawTelemetry: [
        { label: "culvert_breach", value: "true (washout confirmed)" },
        { label: "vehicle_velocity", value: "0 km/h (complete stoppage)" },
        { label: "flow_degradation", value: "-98.4%" },
        { label: "bridge17_pylon_deflection", value: "14 cm lateral shift" }
      ],
      history: [
        { time: "08:45 UTC", event: "Inductive loops recorded traffic slowdown to 12 km/h" },
        { time: "09:10 UTC", event: "Structural acoustic sensor detected concrete shearing" },
        { time: "09:22 UTC", event: "Road officially closed; traffic diversion engaged" }
      ]
    },
    {
      id: "hospital",
      tag: "HOSPITAL",
      severity: "WARNING",
      headline: "Trauma Load & ICU Intake Surge",
      value: "72% Load & Rising",
      icon: Activity,
      color: "#F59E0B",
      source: "South General Emergency Intake Core",
      confidence: "99%",
      confidenceNum: 99,
      risk: "+26",
      riskNum: 26,
      timestamp: "09:25 UTC",
      description: "Level-1 emergency bay at 72% capacity. Ambulance queue stalled on flooded access road with urgent surgical transfers pending.",
      rawTelemetry: [
        { label: "ambulance_wait_time", value: "+38 minutes" },
        { label: "triage_beds_occupied", value: "72% (Critical Intake)" },
        { label: "trauma_queue_count", value: "18 emergency patients" },
        { label: "generator_substation_water_level", value: "0.4m (Risk Zone)" }
      ],
      history: [
        { time: "08:00 UTC", event: "Shift change; hospital load at 44% baseline" },
        { time: "09:05 UTC", event: "First ambulance divert requested due to road water" },
        { time: "09:25 UTC", event: "Hospital emergency power protocol placed on standby" }
      ]
    },
    {
      id: "comms",
      tag: "COMMUNICATION",
      severity: "WARNING",
      headline: "Zone E Sensor Grid Silence",
      value: "12% Connectivity",
      icon: Radio,
      color: "#8B7FA8",
      source: "Cellular Tower Grid Diagnostic",
      confidence: "97%",
      confidenceNum: 97,
      risk: "+20",
      riskNum: 20,
      timestamp: "09:28 UTC",
      description: "88% telecom blackout in East Delta. Zero emergency calls received despite severe localized radar cell and stalled vehicle pings.",
      rawTelemetry: [
        { label: "link_loss", value: "88% cellular blackout" },
        { label: "packet_drop", value: "99.4%" },
        { label: "gps_transponder_beacons", value: "140+ stalled units" },
        { label: "tower_grid_status", value: "Towers 4A & 4B offline" }
      ],
      history: [
        { time: "08:35 UTC", event: "Tower 4A backup generator battery fault" },
        { time: "09:00 UTC", event: "Tower 4B fiber uplink severed at railway bridge" },
        { time: "09:28 UTC", event: "Total RF telemetry blackout across Sector E" }
      ]
    },
    {
      id: "emergency",
      tag: "EMERGENCY",
      severity: "CRITICAL",
      headline: "E-911 Casualty Distress Influx",
      value: "14 Dispatch Reports",
      icon: PhoneCall,
      color: "#EF4444",
      source: "E-911 Emergency Telephony Dispatch",
      confidence: "98%",
      confidenceNum: 98,
      risk: "+18",
      riskNum: 18,
      timestamp: "09:30 UTC",
      description: "14 concurrent distress calls reporting trapped vehicles and rapid water infiltration along South General access corridor.",
      rawTelemetry: [
        { label: "active_calls", value: "14 distress lines open" },
        { label: "unanswered_queue", value: "6 callers waiting" },
        { label: "priority_level", value: "RED (Water Ingress / Trauma)" },
        { label: "cad_incident_id", value: "#027-EOC" }
      ],
      history: [
        { time: "09:02 UTC", event: "First stranded motorist report on Road 17" },
        { time: "09:15 UTC", event: "Call influx rate jumped from 3/hr to 28/hr" },
        { time: "09:30 UTC", event: "High priority rescue requests transferred to CAD" }
      ]
    }
  ];

  // Filter and sort signals
  const filteredSignals = useMemo(() => {
    return signals
      .filter(sig => {
        if (filterSeverity !== 'ALL' && sig.severity !== filterSeverity) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            sig.headline.toLowerCase().includes(q) ||
            sig.tag.toLowerCase().includes(q) ||
            sig.description.toLowerCase().includes(q) ||
            sig.source.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'RISK_DESC') return b.riskNum - a.riskNum;
        if (sortBy === 'CONFIDENCE_DESC') return b.confidenceNum - a.confidenceNum;
        if (sortBy === 'TAG_ASC') return a.tag.localeCompare(b.tag);
        return 0;
      });
  }, [signals, filterSeverity, searchQuery, sortBy]);

  const handleCollect = (signal) => {
    if (!collectedEvidence.includes(signal.id)) {
      setCollectedEvidence(prev => [...prev, signal.id]);
    }
    setActiveModalSignal(null);
  };

  const isCollected = (id) => collectedEvidence.includes(id);
  const canFuse = collectedEvidence.length >= 3;

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 28px 60px',
      maxWidth: '1380px',
      margin: '0 auto',
      width: '100%',
      position: 'relative'
    }}>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '16px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="aegis-badge badge-critical">
              <span className="aegis-badge-dot" />
              STAGE 02 // MULTI-SIGNAL INVESTIGATION
            </span>
            <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              ACTIVE CRISIS CORRELATION
            </span>
          </div>
          <h1 className="font-hud" style={{ fontSize: '26px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
            INCIDENT INVESTIGATION &amp; SIGNAL SYNTHESIS
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Probe multi-source sensory telemetries, dissect telemetry payloads, and collect key evidence to feed the Data Fusion Engine.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className="aegis-btn aegis-btn-secondary"
            style={{ fontSize: '11px' }}
          >
            <Clock size={13} />
            <span>INCIDENT AUDIT LOG ({signals.length})</span>
          </button>

          <span className="aegis-badge badge-sand" style={{ fontSize: '11px' }}>
            EVIDENCE COLLECTED: {collectedEvidence.length} / 6
          </span>
        </div>
      </div>

      {/* Search & Severity Filters Toolbar */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '6px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px', maxWidth: '420px' }}>
          <Search size={15} color="var(--text-muted)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search signals, telemetry variables, sensor sources..."
            className="aegis-input"
            style={{ padding: '6px 10px', fontSize: '12px' }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters & Sorting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700' }}>
              SEVERITY:
            </span>
            <button
              onClick={() => setFilterSeverity('ALL')}
              className={`aegis-filter-pill ${filterSeverity === 'ALL' ? 'active' : ''}`}
            >
              ALL ({signals.length})
            </button>
            <button
              onClick={() => setFilterSeverity('CRITICAL')}
              className={`aegis-filter-pill ${filterSeverity === 'CRITICAL' ? 'active' : ''}`}
            >
              CRITICAL (3)
            </button>
            <button
              onClick={() => setFilterSeverity('WARNING')}
              className={`aegis-filter-pill ${filterSeverity === 'WARNING' ? 'active' : ''}`}
            >
              WARNING (2)
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700' }}>
              SORT:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="aegis-select"
            >
              <option value="RISK_DESC">HIGHEST RISK IMPACT</option>
              <option value="CONFIDENCE_DESC">HIGHEST CONFIDENCE</option>
              <option value="TAG_ASC">CATEGORY ALPHABETICAL</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid: 6 Interactive Evidence Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '16px',
        width: '100%',
        marginBottom: '28px'
      }}>
        {filteredSignals.map(sig => {
          const Icon = sig.icon;
          const collected = isCollected(sig.id);

          return (
            <div
              key={sig.id}
              onClick={() => setActiveModalSignal(sig)}
              className="aegis-card"
              style={{
                padding: '20px',
                background: collected ? 'rgba(0, 240, 255, 0.05)' : 'var(--bg-surface)',
                border: collected ? '1px solid rgba(0, 240, 255, 0.45)' : '1px solid var(--border-subtle)',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                justifyContent: 'space-between',
                transition: 'all 0.16s ease',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '4px',
                      background: 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: sig.color
                    }}>
                      <Icon size={16} />
                    </div>
                    <span className="font-hud" style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '0.12em', color: sig.color }}>
                      [ {sig.tag} ]
                    </span>
                  </div>

                  {collected ? (
                    <span className="aegis-badge badge-normal" style={{ fontSize: '9px' }}>
                      ✓ EVIDENCE COLLECTED
                    </span>
                  ) : (
                    <span className={`aegis-badge ${sig.severity === 'CRITICAL' ? 'badge-critical' : 'badge-warning'}`} style={{ fontSize: '9px' }}>
                      {sig.severity}
                    </span>
                  )}
                </div>

                <h3 className="font-hud" style={{ fontSize: '17px', fontWeight: '800', color: '#FFFFFF', margin: '2px 0 6px 0' }}>
                  {sig.headline}
                </h3>

                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                  {sig.description}
                </p>
              </div>

              {/* Bottom Telemetry Strip */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '8px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  VAL: <strong style={{ color: sig.color }}>{sig.value}</strong>
                </span>

                <span style={{ color: 'var(--color-sand)' }}>
                  CONF: {sig.confidence}
                </span>

                <span style={{ color: '#EF4444', fontWeight: '700' }}>
                  RISK: {sig.risk}
                </span>

                <span style={{ color: 'var(--color-cyan)', fontWeight: '700' }}>
                  PROBE →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fuse Evidence Action Bar */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '6px',
        padding: '16px 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        marginTop: 'auto'
      }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '800', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="var(--color-cyan)" />
            <span>INCIDENT FUSION CORE: {canFuse ? 'READY TO SYNTHESIZE' : 'EVIDENCE REQUIRED'}</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {canFuse 
              ? `${collectedEvidence.length} signals collected. Ready to activate Bayesian Data Fusion matrix.` 
              : `Collect at least 3 telemetry signals by clicking "Collect Evidence" on modal probes to synthesize.`}
          </div>
        </div>

        <button
          onClick={onFuseIncident}
          disabled={!canFuse}
          className="aegis-btn aegis-btn-primary"
          style={{ padding: '10px 24px', fontSize: '12px' }}
        >
          <span>SYNTHESIZE SIGNALS ({collectedEvidence.length}/3)</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          TELEMETRY PROBE MODAL
      ────────────────────────────────────────────────────────────────── */}
      {activeModalSignal && (
        <div className="aegis-modal-backdrop" onClick={() => setActiveModalSignal(null)}>
          <div className="aegis-modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="aegis-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="font-hud" style={{ fontSize: '14px', fontWeight: '800', color: activeModalSignal.color }}>
                  [{activeModalSignal.tag}]
                </span>
                <span style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF' }}>
                  {activeModalSignal.headline}
                </span>
              </div>
              <button
                onClick={() => setActiveModalSignal(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="aegis-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                {activeModalSignal.description}
              </div>

              {/* Raw Telemetry Matrix */}
              <div>
                <span className="aegis-data-label">VERIFIED SENSOR TELEMETRY</span>
                <table className="aegis-table">
                  <tbody>
                    {activeModalSignal.rawTelemetry.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{row.label}</td>
                        <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--color-cyan)', fontFamily: 'var(--font-mono)' }}>
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Source & Diagnostics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '8px 10px', borderRadius: '4px' }}>
                  <div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>SOURCE INGESTION</div>
                  <div style={{ fontSize: '11px', color: '#FFFFFF' }}>{activeModalSignal.source}</div>
                </div>
                <div style={{ background: 'var(--bg-surface-elevated)', padding: '8px 10px', borderRadius: '4px' }}>
                  <div className="font-mono" style={{ fontSize: '9px', color: 'var(--text-muted)' }}>CONFIDENCE SCORE</div>
                  <div className="font-mono" style={{ fontSize: '11px', color: '#10B981', fontWeight: '700' }}>
                    {activeModalSignal.confidence} VERIFIED
                  </div>
                </div>
              </div>

              {/* Modal Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  onClick={() => setActiveModalSignal(null)}
                  className="aegis-btn aegis-btn-outline"
                >
                  DISMISS
                </button>
                <button
                  onClick={() => handleCollect(activeModalSignal)}
                  className="aegis-btn aegis-btn-primary"
                >
                  {isCollected(activeModalSignal.id) ? '✓ ALREADY IN EVIDENCE LOG' : 'COLLECT AS EVIDENCE'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────
          INCIDENT HISTORY LOG DRAWER
      ────────────────────────────────────────────────────────────────── */}
      {showHistoryDrawer && (
        <div className="aegis-modal-backdrop" onClick={() => setShowHistoryDrawer(false)}>
          <div className="aegis-modal-panel" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="aegis-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="var(--color-cyan)" />
                <span className="font-hud" style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF' }}>
                  INCIDENT TELEMETRY AUDIT LOG
                </span>
              </div>
              <button
                onClick={() => setShowHistoryDrawer(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="aegis-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {signals.map(s => (
                <div key={s.id} style={{ background: 'var(--bg-surface-elevated)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '700', color: s.color, fontSize: '12px' }}>{s.headline}</span>
                    <span className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{s.timestamp}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {(s.history || []).map((h, hIdx) => (
                      <div key={hIdx} style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', gap: '6px' }}>
                        <span className="font-mono" style={{ color: 'var(--color-sand)', flexShrink: 0 }}>{h.time}</span>
                        <span>{h.event}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
