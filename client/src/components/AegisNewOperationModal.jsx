import React, { useState } from 'react';
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
  Activity
} from 'lucide-react';
import { createMission } from '../services/api';

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
  const [locationName, setLocationName] = useState('Chandigarh');
  const [latitude, setLatitude] = useState('30.7333');
  const [longitude, setLongitude] = useState('76.7794');
  const [status, setStatus] = useState('PLANNING');
  const [severity, setSeverity] = useState('HIGH');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        disasterType,
        locationName: locationName.trim(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
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
          maxWidth: '540px',
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(214, 198, 165, 0.16)',
          background: 'rgba(111, 148, 125, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '4px',
              background: 'rgba(111, 148, 125, 0.2)',
              border: '1px solid rgba(214, 198, 165, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D6C6A5'
            }}>
              <ShieldAlert size={17} />
            </div>
            <div>
              <div className="font-hud" style={{ fontSize: '14px', letterSpacing: '0.12em', color: '#EAE5D8', fontWeight: '800' }}>
                COMMISSION NEW OPERATION
              </div>
              <div className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4' }}>
                ORGANIZATION: {currentOrg?.name || 'Chandigarh Emergency Response'}
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
              display: 'flex'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '22px 24px', maxHeight: '80vh', overflowY: 'auto' }}>
          
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              marginBottom: '16px',
              borderRadius: '4px',
              background: 'rgba(217, 83, 79, 0.18)',
              border: '1px solid rgba(217, 83, 79, 0.5)',
              color: '#FCA5A5',
              fontSize: '11px',
              fontFamily: 'monospace'
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Operation Name */}
          <div style={{ marginBottom: '14px' }}>
            <label className="font-mono" style={{ display: 'block', fontSize: '10px', color: '#9FB5A4', marginBottom: '5px', letterSpacing: '0.06em' }}>
              OPERATION CODENAME / TITLE *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Flash Flood Cascade or Industrial Sector Breach"
              style={{
                width: '100%',
                padding: '9px 12px',
                background: 'rgba(8, 13, 10, 0.8)',
                border: '1px solid rgba(214, 198, 165, 0.25)',
                borderRadius: '4px',
                color: '#EAE5D8',
                fontSize: '13px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '14px' }}>
            <label className="font-mono" style={{ display: 'block', fontSize: '10px', color: '#9FB5A4', marginBottom: '5px', letterSpacing: '0.06em' }}>
              TACTICAL DESCRIPTION & OBJECTIVE
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Rising water levels affecting low-lying urban sectors and key hospital corridor..."
              style={{
                width: '100%',
                padding: '8px 12px',
                background: 'rgba(8, 13, 10, 0.8)',
                border: '1px solid rgba(214, 198, 165, 0.25)',
                borderRadius: '4px',
                color: '#EAE5D8',
                fontSize: '12px',
                outline: 'none',
                boxSizing: 'border-box',
                resize: 'none'
              }}
            />
          </div>

          {/* Disaster Type & Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label className="font-mono" style={{ display: 'block', fontSize: '10px', color: '#9FB5A4', marginBottom: '5px', letterSpacing: '0.06em' }}>
                DISASTER TYPE *
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
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-mono" style={{ display: 'block', fontSize: '10px', color: '#9FB5A4', marginBottom: '5px', letterSpacing: '0.06em' }}>
                INITIAL OPERATIONAL STATUS
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
                <option value="PLANNING">● PLANNING (STAGING)</option>
                <option value="ACTIVE">● ACTIVE (DEPLOYED)</option>
                <option value="PAUSED">Ⅱ PAUSED</option>
                <option value="COMPLETED">✓ COMPLETED</option>
              </select>
            </div>
          </div>

          {/* Location & Coordinates */}
          <div style={{ marginBottom: '14px' }}>
            <label className="font-mono" style={{ display: 'block', fontSize: '10px', color: '#9FB5A4', marginBottom: '5px', letterSpacing: '0.06em' }}>
              PRIMARY THEATER LOCATION *
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={14} color="#6F947D" style={{ position: 'absolute', left: '10px', top: '11px' }} />
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Chandigarh, Punjab/Haryana Region"
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 32px',
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
          </div>

          {/* Latitude & Longitude Coordinates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
            <div>
              <label className="font-mono" style={{ display: 'block', fontSize: '10px', color: '#9FB5A4', marginBottom: '5px', letterSpacing: '0.06em' }}>
                LATITUDE (DECIMAL) *
              </label>
              <input
                type="number"
                step="0.0001"
                required
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="30.7333"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'rgba(8, 13, 10, 0.8)',
                  border: '1px solid rgba(214, 198, 165, 0.25)',
                  borderRadius: '4px',
                  color: '#EAE5D8',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label className="font-mono" style={{ display: 'block', fontSize: '10px', color: '#9FB5A4', marginBottom: '5px', letterSpacing: '0.06em' }}>
                LONGITUDE (DECIMAL) *
              </label>
              <input
                type="number"
                step="0.0001"
                required
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="76.7794"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: 'rgba(8, 13, 10, 0.8)',
                  border: '1px solid rgba(214, 198, 165, 0.25)',
                  borderRadius: '4px',
                  color: '#EAE5D8',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-command-primary"
            style={{
              width: '100%',
              padding: '11px 16px',
              fontSize: '12px',
              letterSpacing: '0.12em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <span>INITIALIZING OPERATION IN DATABASE...</span>
            ) : (
              <>
                <span>COMMISSION & ENTER THEATER</span>
                <ChevronRight size={14} />
              </>
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <span className="font-mono" style={{ fontSize: '9px', color: '#6F947D' }}>
              STRICTLY BOUND TO {currentOrg?.name || 'ORGANIZATION'} · ENFORCED DATA ISOLATION
            </span>
          </div>

        </form>
      </div>
    </div>
  );
}
