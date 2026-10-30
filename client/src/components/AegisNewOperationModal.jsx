import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Flame, 
  Waves, 
  X, 
  ChevronRight, 
  AlertCircle, 
  Compass, 
  Layers,
  Activity,
  Search,
  CheckCircle2,
  RotateCcw,
  Crosshair,
  Cpu,
  Globe
} from 'lucide-react';
import { createMission, searchLocations } from '../services/api';

const DISASTER_TYPES = [
  { value: 'FLOOD', label: 'Flood / Flash Flooding', icon: Waves },
  { value: 'FIRE', label: 'Urban / Wildfire Outbreak', icon: Flame },
  { value: 'EARTHQUAKE', label: 'Seismic Shock / Collapse', icon: Activity },
  { value: 'STORM', label: 'Severe Cyclone / Storm Surge', icon: Compass },
  { value: 'INDUSTRIAL', label: 'Industrial Chemical Breach', icon: ShieldAlert },
  { value: 'LANDSLIDE', label: 'Mudslide / Geologic Slide', icon: Layers },
  { value: 'HEATWAVE', label: 'Critical Atmospheric Heatwave', icon: Activity },
  { value: 'OTHER', label: 'Compound Emergency Scenario', icon: ShieldAlert }
];

export default function AegisNewOperationModal({
  isOpen,
  onClose,
  onOperationCreated,
  currentOrg
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [disasterType, setDisasterType] = useState('FLOOD');
  const [status, setStatus] = useState('PLANNING');
  const [severity, setSeverity] = useState('HIGH');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Location Search & Selection State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Debounced Location Search Effect
  useEffect(() => {
    if (selectedLocation) return;

    const trimmed = searchQuery.trim();
    if (trimmed.length < 3) {
      setSearchResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const results = await searchLocations(trimmed);
        if (Array.isArray(results) && results.length > 0) {
          setSearchResults(results);
          setSearchError(null);
        } else {
          setSearchResults([]);
          setSearchError('NO LOCATIONS FOUND · Try another query or city name');
        }
      } catch (err) {
        setSearchResults([]);
        setSearchError('LOCATION SERVICE UNAVAILABLE · Check network connection');
      } finally {
        setIsSearching(false);
      }
    }, 380);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedLocation]);

  if (!isOpen) return null;

  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    setSearchResults([]);
    setSearchError(null);
  };

  const handleClearLocation = () => {
    setSelectedLocation(null);
    setSearchQuery('');
    setSearchResults([]);
    setSearchError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLocation) {
      setError('Please search and select a confirmed theater location');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        disasterType,
        locationName: selectedLocation.locationName,
        locationDisplayName: selectedLocation.displayName,
        locationCountry: selectedLocation.country,
        locationRegion: selectedLocation.region,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        status,
        severity
      };

      const res = await createMission(payload);
      if (res.mission) {
        onOperationCreated(res.mission);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to initialize new operation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(5, 10, 7, 0.85)',
      backdropFilter: 'blur(16px)',
      padding: '16px'
    }}>
      <div 
        className="aegis-card-glass"
        style={{
          width: '100%',
          maxWidth: '580px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(175deg, rgba(14, 27, 21, 0.98) 0%, rgba(8, 13, 10, 0.98) 100%)',
          border: '1px solid rgba(214, 198, 165, 0.3)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(214, 198, 165, 0.2)',
          borderRadius: '8px',
          overflow: 'hidden',
          animation: 'fadeIn 0.22s ease-out'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(214, 198, 165, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(10, 20, 15, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              background: 'rgba(111, 148, 125, 0.15)',
              border: '1px solid rgba(111, 148, 125, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Globe size={15} color="#6F947D" />
            </div>
            <div>
              <div className="font-hud" style={{ fontSize: '13px', color: '#EAE5D8', letterSpacing: '0.1em' }}>
                AEGIS 2.0 // COMMISSION NEW OPERATION
              </div>
              <div className="font-mono" style={{ fontSize: '9px', color: '#6F947D' }}>
                ORGANIZATION: {currentOrg?.name || 'REGIONAL COMMAND AUTHORITY'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#9FB5A4',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', overflowY: 'auto' }}>
          
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              marginBottom: '16px',
              background: 'rgba(217, 83, 79, 0.15)',
              border: '1px solid rgba(217, 83, 79, 0.4)',
              borderRadius: '4px',
              color: '#F87171',
              fontSize: '11px',
              fontFamily: 'monospace'
            }}>
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          {/* Operation Name */}
          <div style={{ marginBottom: '14px' }}>
            <label className="font-mono" style={{ display: 'block', fontSize: '10px', color: '#9FB5A4', marginBottom: '5px', letterSpacing: '0.06em' }}>
              OPERATION CODENAME *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Flash Flood Response / Sector Vigilance"
              style={{
                width: '100%',
                padding: '9px 12px',
                background: 'rgba(8, 13, 10, 0.8)',
                border: '1px solid rgba(214, 198, 165, 0.25)',
                borderRadius: '4px',
                color: '#EAE5D8',
                fontSize: '12px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Operation Description */}
          <div style={{ marginBottom: '14px' }}>
            <label className="font-mono" style={{ display: 'block', fontSize: '10px', color: '#9FB5A4', marginBottom: '5px', letterSpacing: '0.06em' }}>
              OPERATIONAL SITREP / CONTEXT
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefing summary of the threat vector and tactical objectives..."
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'rgba(8, 13, 10, 0.8)',
                border: '1px solid rgba(214, 198, 165, 0.25)',
                borderRadius: '4px',
                color: '#EAE5D8',
                fontSize: '11px',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Disaster Type & Severity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label className="font-mono" style={{ display: 'block', fontSize: '10px', color: '#9FB5A4', marginBottom: '5px', letterSpacing: '0.06em' }}>
                DISASTER VECTOR *
              </label>
              <select
                value={disasterType}
                onChange={(e) => setDisasterType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  background: 'rgba(8, 13, 10, 0.85)',
                  border: '1px solid rgba(214, 198, 165, 0.25)',
                  borderRadius: '4px',
                  color: '#D6C6A5',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                {DISASTER_TYPES.map(t => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-mono" style={{ display: 'block', fontSize: '10px', color: '#9FB5A4', marginBottom: '5px', letterSpacing: '0.06em' }}>
                ALERT SEVERITY
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 10px',
                  background: 'rgba(8, 13, 10, 0.85)',
                  border: '1px solid rgba(214, 198, 165, 0.25)',
                  borderRadius: '4px',
                  color: severity === 'CRITICAL' ? '#EF4444' : severity === 'HIGH' ? '#F59E0B' : '#6F947D',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontWeight: '700'
                }}
              >
                <option value="CRITICAL">🔴 CRITICAL</option>
                <option value="HIGH">🟠 HIGH</option>
                <option value="MODERATE">🟡 MODERATE</option>
                <option value="LOW">🟢 LOW</option>
              </select>
            </div>
          </div>

          {/* Initial Operational Status */}
          <div style={{ marginBottom: '16px' }}>
            <label className="font-mono" style={{ display: 'block', fontSize: '10px', color: '#9FB5A4', marginBottom: '5px', letterSpacing: '0.06em' }}>
              COMMISSIONING STATUS
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 10px',
                background: 'rgba(8, 13, 10, 0.85)',
                border: '1px solid rgba(214, 198, 165, 0.25)',
                borderRadius: '4px',
                color: '#D6C6A5',
                fontSize: '11px',
                fontFamily: 'monospace',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="PLANNING">● PLANNING (STAGE PREPARATION)</option>
              <option value="ACTIVE">● ACTIVE (THEATER LIVE)</option>
              <option value="PAUSED">Ⅱ PAUSED</option>
              <option value="COMPLETED">✓ COMPLETED</option>
            </select>
          </div>

          {/* ─── REAL LOCATION INTELLIGENCE & SELECTION ─── */}
          <div style={{
            background: 'rgba(9, 16, 12, 0.8)',
            border: '1px solid rgba(111, 148, 125, 0.25)',
            borderRadius: '6px',
            padding: '14px',
            marginBottom: '18px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Crosshair size={13} color="#6F947D" />
                <span className="font-hud" style={{ fontSize: '11px', color: '#D6C6A5', letterSpacing: '0.08em' }}>
                  LOCATION INTELLIGENCE // THEATER GEOGRAPHY *
                </span>
              </div>
              {isSearching && (
                <span className="font-mono" style={{ fontSize: '9px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Cpu size={10} className="pulse" />
                  SYNCING...
                </span>
              )}
            </div>

            {/* State A: Location Selected & Confirmed */}
            {selectedLocation ? (
              <div style={{
                background: 'rgba(14, 27, 21, 0.95)',
                border: '1px solid rgba(16, 185, 129, 0.45)',
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.1)',
                borderRadius: '5px',
                padding: '12px 14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <CheckCircle2 size={14} color="#10B981" />
                      <span className="font-hud" style={{ fontSize: '12px', color: '#EAE5D8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        {selectedLocation.locationName}
                      </span>
                      <span style={{
                        fontSize: '9px',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#6EE7B7',
                        fontFamily: 'monospace'
                      }}>
                        CONFIRMED
                      </span>
                    </div>

                    <div className="font-mono" style={{ fontSize: '10px', color: '#9FB5A4', marginBottom: '8px', lineHeight: 1.3 }}>
                      {selectedLocation.displayName}
                    </div>

                    {/* Coordinates Radar Badge */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 10px',
                      borderRadius: '3px',
                      background: 'rgba(8, 13, 10, 0.8)',
                      border: '1px solid rgba(214, 198, 165, 0.2)'
                    }}>
                      <Compass size={11} color="#D6C6A5" />
                      <span className="font-mono" style={{ fontSize: '10px', color: '#D6C6A5', fontWeight: '700' }}>
                        {selectedLocation.latitude.toFixed(4)}° {selectedLocation.latitude >= 0 ? 'N' : 'S'}
                        {' · '}
                        {selectedLocation.longitude.toFixed(4)}° {selectedLocation.longitude >= 0 ? 'E' : 'W'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleClearLocation}
                    className="font-mono"
                    style={{
                      background: 'rgba(214, 198, 165, 0.1)',
                      border: '1px solid rgba(214, 198, 165, 0.25)',
                      color: '#D6C6A5',
                      padding: '4px 8px',
                      borderRadius: '3px',
                      fontSize: '9px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <RotateCcw size={10} />
                    <span>CHANGE</span>
                  </button>
                </div>
              </div>
            ) : (
              /* State B: Search & Select Candidates */
              <div>
                <div style={{ position: 'relative', marginBottom: '8px' }}>
                  <Search size={13} color="#6F947D" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search target city, sector, or coordinate base (min 3 chars)..."
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 30px',
                      background: 'rgba(8, 13, 10, 0.9)',
                      border: '1px solid rgba(214, 198, 165, 0.25)',
                      borderRadius: '4px',
                      color: '#EAE5D8',
                      fontSize: '11px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Candidate Results Deck */}
                {searchResults.length > 0 && (
                  <div style={{
                    maxHeight: '160px',
                    overflowY: 'auto',
                    border: '1px solid rgba(111, 148, 125, 0.3)',
                    borderRadius: '4px',
                    background: 'rgba(8, 13, 10, 0.95)',
                    marginTop: '6px'
                  }}>
                    <div style={{ padding: '4px 8px', background: 'rgba(111, 148, 125, 0.15)', borderBottom: '1px solid rgba(111, 148, 125, 0.2)' }}>
                      <span className="font-hud" style={{ fontSize: '9px', color: '#9FB5A4', letterSpacing: '0.08em' }}>
                        LOCATION CANDIDATES ({searchResults.length})
                      </span>
                    </div>

                    {searchResults.map((loc, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectLocation(loc)}
                        style={{
                          padding: '8px 10px',
                          borderBottom: idx === searchResults.length - 1 ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(111, 148, 125, 0.18)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ overflow: 'hidden' }}>
                          <div className="font-hud" style={{ fontSize: '11px', color: '#EAE5D8', textTransform: 'uppercase' }}>
                            {loc.locationName}
                          </div>
                          <div className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {loc.displayName}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <span className="font-mono" style={{ fontSize: '9px', color: '#D6C6A5', background: 'rgba(214, 198, 165, 0.1)', padding: '2px 5px', borderRadius: '2px' }}>
                            {loc.latitude.toFixed(2)}°, {loc.longitude.toFixed(2)}°
                          </span>
                          <span className="font-hud" style={{ fontSize: '9px', color: '#10B981', fontWeight: '700' }}>
                            SELECT →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty / Error state */}
                {searchError && (
                  <div style={{
                    padding: '8px 10px',
                    marginTop: '4px',
                    borderRadius: '3px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    color: '#FCD34D',
                    fontSize: '10px',
                    fontFamily: 'monospace'
                  }}>
                    {searchError}
                  </div>
                )}

                {/* Quick Presets / Hint */}
                {!searchError && searchResults.length === 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                    <span className="font-mono" style={{ fontSize: '9px', color: '#6F947D' }}>
                      REGIONAL PRESETS:
                    </span>
                    {['Chandigarh', 'New Delhi', 'Mumbai', 'London', 'Tokyo'].map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setSearchQuery(city)}
                        style={{
                          background: 'rgba(111, 148, 125, 0.1)',
                          border: '1px solid rgba(111, 148, 125, 0.2)',
                          color: '#A7F3D0',
                          fontSize: '9px',
                          padding: '1px 6px',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          fontFamily: 'monospace'
                        }}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading || !selectedLocation}
            className="btn-command-primary"
            style={{
              width: '100%',
              padding: '11px 16px',
              fontSize: '12px',
              letterSpacing: '0.12em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: (!selectedLocation || loading) ? 0.6 : 1,
              cursor: (!selectedLocation || loading) ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <span>PROVISIONING OPERATION IN DATABASE...</span>
            ) : (
              <>
                <span>COMMISSION & ENTER THEATER</span>
                <ChevronRight size={14} />
              </>
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <span className="font-mono" style={{ fontSize: '9px', color: '#6F947D' }}>
              STRICTLY BOUND TO {currentOrg?.name?.toUpperCase() || 'ORGANIZATION'} · ENFORCED DATA ISOLATION
            </span>
          </div>

        </form>
      </div>
    </div>
  );
}
