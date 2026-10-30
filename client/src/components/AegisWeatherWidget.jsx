import React, { useState, useEffect, useCallback } from 'react';
import { 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  Sun, 
  CloudSun, 
  Snowflake, 
  Wind, 
  Droplets, 
  RefreshCw, 
  AlertTriangle, 
  Cpu
} from 'lucide-react';
import { getMissionWeather } from '../services/api';

/**
 * Helper to pick the appropriate Lucide icon based on condition category
 */
function getWeatherIcon(category, size = 18, color = '#6F947D') {
  switch (category) {
    case 'FAIR':
      return <Sun size={size} color="#F59E0B" />;
    case 'CLOUDY':
      return <CloudSun size={size} color="#9FB5A4" />;
    case 'RAIN':
      return <CloudRain size={size} color="#38BDF8" />;
    case 'HEAVY_RAIN':
      return <CloudRain size={size} color="#D9534F" />;
    case 'STORM':
      return <CloudLightning size={size} color="#EAB308" />;
    case 'SNOW':
      return <Snowflake size={size} color="#A7F3D0" />;
    default:
      return <Cloud size={size} color={color} />;
  }
}

/**
 * Format relative time since fetchedAt
 */
function formatTimeAgo(isoString) {
  if (!isoString) return 'just now';
  try {
    const diffSeconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diffSeconds < 60) return 'just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours} hr ago`;
  } catch (e) {
    return 'recently';
  }
}

export default function AegisWeatherWidget({
  missionId,
  locationName = 'THEATER',
  onWeatherLoaded = null,
  compact = false,
  style = {}
}) {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchWeather = useCallback(async (forceRefresh = false) => {
    if (!missionId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await getMissionWeather(missionId, forceRefresh);
      setWeatherData(data);
      setLastRefreshed(new Date());
      if (onWeatherLoaded) {
        onWeatherLoaded(data);
      }
    } catch (err) {
      console.warn(`[AEGIS-WEATHER] Fetch failed for mission ${missionId}:`, err.message);
      setError(err.message || 'WEATHER PROVIDER TEMPORARILY UNAVAILABLE');
    } finally {
      setLoading(false);
    }
  }, [missionId, onWeatherLoaded]);

  // Initial load when missionId changes
  useEffect(() => {
    fetchWeather(false);
  }, [fetchWeather]);

  const current = weatherData?.current;
  const isCached = weatherData?.isCached;
  const isDemoFallback = weatherData?.isDemoFallback;
  const fetchedAt = weatherData?.fetchedAt;

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
            background: error ? '#EF4444' : loading ? '#38BDF8' : isCached ? '#FBBF24' : '#10B981',
            boxShadow: error ? '0 0 6px #EF4444' : loading ? '0 0 6px #38BDF8' : isCached ? '0 0 6px #FBBF24' : '0 0 6px #10B981'
          }} />
          <span className="font-hud" style={{ fontSize: '11px', letterSpacing: '0.1em', color: '#D6C6A5', textTransform: 'uppercase' }}>
            {isDemoFallback ? 'WEATHER' : (isCached ? 'WEATHER DATA' : 'LIVE WEATHER')} // {locationName}
          </span>
          <span style={{
            fontSize: '9px',
            padding: '1px 6px',
            borderRadius: '2px',
            background: isDemoFallback ? 'rgba(234, 179, 8, 0.15)' : isCached ? 'rgba(214, 198, 165, 0.12)' : 'rgba(16, 185, 129, 0.15)',
            border: `1px solid ${isDemoFallback ? 'rgba(234, 179, 8, 0.3)' : isCached ? 'rgba(214, 198, 165, 0.25)' : 'rgba(16, 185, 129, 0.3)'}`,
            color: isDemoFallback ? '#FBBF24' : isCached ? '#D6C6A5' : '#6EE7B7',
            fontFamily: 'monospace',
            fontWeight: '600'
          }}>
            {isDemoFallback ? 'DEMO DATA' : (isCached ? 'CACHED' : 'LIVE')}
          </span>
        </div>

        <button
          onClick={() => fetchWeather(true)}
          disabled={loading}
          title="Force refresh weather intelligence"
          style={{
            background: 'rgba(214, 198, 165, 0.08)',
            border: '1px solid rgba(214, 198, 165, 0.2)',
            borderRadius: '3px',
            color: loading ? '#38BDF8' : '#D6C6A5',
            cursor: loading ? 'not-allowed' : 'pointer',
            padding: '3px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '9px',
            fontFamily: 'monospace',
            letterSpacing: '0.05em'
          }}
        >
          <RefreshCw size={10} className={loading ? 'spin' : ''} />
          <span>{loading ? 'SYNCING...' : '[ REFRESH WEATHER ]'}</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && !weatherData && (
        <div style={{ padding: '16px 8px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#38BDF8', fontSize: '11px', fontFamily: 'monospace' }}>
            <Cpu size={14} className="pulse" />
            <span>WEATHER INTELLIGENCE SYNCING...</span>
          </div>
          <div style={{ fontSize: '9px', color: '#9FB5A4', marginTop: '4px', fontFamily: 'monospace' }}>
            QUERYING ATMOSPHERIC TELEMETRY FROM OPEN-METEO
          </div>
        </div>
      )}

      {/* Error / Unavailable State */}
      {error && !weatherData && (
        <div style={{
          background: 'rgba(217, 83, 79, 0.12)',
          border: '1px solid rgba(217, 83, 79, 0.3)',
          borderRadius: '4px',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#F87171', fontSize: '11px', fontFamily: 'monospace', fontWeight: '700' }}>
            <AlertTriangle size={14} />
            <span>WEATHER DATA UNAVAILABLE</span>
          </div>
          <div style={{ fontSize: '10px', color: '#FCA5A5', fontFamily: 'monospace' }}>
            Possible reason: WEATHER PROVIDER TEMPORARILY UNAVAILABLE
          </div>
          <button
            onClick={() => fetchWeather(true)}
            style={{
              alignSelf: 'flex-start',
              background: 'rgba(217, 83, 79, 0.25)',
              border: '1px solid rgba(217, 83, 79, 0.5)',
              color: '#FCA5A5',
              padding: '4px 10px',
              borderRadius: '3px',
              fontSize: '10px',
              fontFamily: 'monospace',
              cursor: 'pointer',
              marginTop: '4px',
              fontWeight: '600'
            }}
          >
            [ RETRY ]
          </button>
        </div>
      )}

      {/* Live Data Display */}
      {current && (
        <div>
          {/* Primary Readout Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                background: 'rgba(8, 13, 10, 0.8)',
                border: '1px solid rgba(214, 198, 165, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {getWeatherIcon(current.category, 24)}
              </div>
              <div>
                <div className="font-hud" style={{ fontSize: '26px', fontWeight: '800', color: '#EAE5D8', lineHeight: 1 }}>
                  {current.temperature !== null ? `${Math.round(current.temperature)}°C` : '--°C'}
                </div>
                <div className="font-hud" style={{ fontSize: '11px', color: '#D6C6A5', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {current.conditionLabel || current.condition}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4' }}>FEELS LIKE</div>
              <div className="font-mono" style={{ fontSize: '14px', fontWeight: '700', color: '#D6C6A5' }}>
                {current.apparentTemperature !== null ? `${Math.round(current.apparentTemperature)}°C` : '--'}
              </div>
            </div>
          </div>

          {/* Environmental Telemetry Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            background: 'rgba(8, 13, 10, 0.7)',
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid rgba(214, 198, 165, 0.12)',
            marginBottom: '10px'
          }}>
            <div>
              <div className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4', letterSpacing: '0.06em' }}>RAINFALL</div>
              <div className="font-mono" style={{ fontSize: '13px', fontWeight: '700', color: current.rainfall > 0 ? '#38BDF8' : '#EAE5D8' }}>
                {current.rainfall !== null ? `${current.rainfall} mm` : '0 mm'}
              </div>
            </div>

            <div>
              <div className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4', letterSpacing: '0.06em' }}>WIND SPEED</div>
              <div className="font-mono" style={{ fontSize: '13px', fontWeight: '700', color: '#EAE5D8' }}>
                {current.windSpeed !== null ? `${current.windSpeed} km/h` : '--'}
              </div>
            </div>

            <div>
              <div className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4', letterSpacing: '0.06em' }}>HUMIDITY</div>
              <div className="font-mono" style={{ fontSize: '13px', fontWeight: '700', color: '#EAE5D8' }}>
                {current.humidity !== null ? `${current.humidity}%` : '--'}
              </div>
            </div>
          </div>

          {/* Compact Hourly Forecast Strip */}
          {weatherData.forecast && weatherData.forecast.length > 0 && !compact && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4', letterSpacing: '0.08em' }}>
                  PRECIPITATION &amp; THERMAL OUTLOOK (HOURLY)
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(6, weatherData.forecast.length)}, 1fr)`,
                gap: '4px'
              }}>
                {weatherData.forecast.slice(0, 6).map((item, idx) => (
                  <div 
                    key={idx}
                    style={{
                      background: 'rgba(8, 13, 10, 0.6)',
                      border: '1px solid rgba(214, 198, 165, 0.1)',
                      borderRadius: '3px',
                      padding: '5px 2px',
                      textAlign: 'center'
                    }}
                  >
                    <div className="font-mono" style={{ fontSize: '8px', color: '#9FB5A4' }}>
                      {item.time}
                    </div>
                    <div style={{ margin: '3px 0' }}>
                      {getWeatherIcon(item.condition, 12)}
                    </div>
                    <div className="font-mono" style={{ fontSize: '10px', fontWeight: '700', color: '#EAE5D8' }}>
                      {item.temperature !== null ? `${Math.round(item.temperature)}°` : '--'}
                    </div>
                    {item.precipitationProbability > 0 && (
                      <div className="font-mono" style={{ fontSize: '8px', color: '#38BDF8' }}>
                        {item.precipitationProbability}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Metadata */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '9px', color: '#9FB5A4', fontFamily: 'monospace', borderTop: '1px solid rgba(214, 198, 165, 0.1)', paddingTop: '6px' }}>
            <span>DATA SOURCE: <span style={{ color: '#D6C6A5' }}>{weatherData.source || 'Open-Meteo'}</span></span>
            <span>
              {isCached ? `Updated ${formatTimeAgo(fetchedAt)}` : `LAST UPDATED: ${formatTimeAgo(fetchedAt)}`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
