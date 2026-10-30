import React, { useState } from 'react';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Target, 
  Radio, 
  AlertTriangle, 
  Cpu, 
  Sparkles, 
  BarChart3, 
  Sliders, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Plus,
  Check,
  Globe,
  Zap,
  Activity,
  Layers,
  UserCheck,
  Lock
} from 'lucide-react';
import { getHazardConfig } from '../services/hazardConfig';

const FALLBACK_MISSIONS = [
  { missionId: '027', name: 'Flash Flood Cascade', disasterType: 'FLOOD', locationDisplayName: 'Chandigarh, Sector 17' },
  { missionId: '104', name: 'Ridge Fault Seismic Rupture', disasterType: 'EARTHQUAKE', locationDisplayName: 'LA Basin / San Fernando' },
  { missionId: '209', name: 'Supercell Vortex Corridor', disasterType: 'TORNADO', locationDisplayName: 'Moore / OKC Metro' },
  { missionId: '315', name: 'Canyon Firestorm Front', disasterType: 'WILDFIRE', locationDisplayName: 'Sonoma Ridge' },
  { missionId: '418', name: 'Escarpment Debris Flow', disasterType: 'LANDSLIDE', locationDisplayName: 'Cascade Pass' },
  { missionId: '522', name: 'Coastal Surge & Eyewall Array', disasterType: 'CYCLONE', locationDisplayName: 'Biscayne Bay' }
];

export default function AegisSidebar({
  activePage = 'live-ops',
  onSelectPage,
  collapsed = false,
  onToggleCollapse,
  currentUser = null,
  currentOrg = null,
  mode = 'DEMO',
  onToggleMode,
  onOpenProfile,
  onOpenAuth,
  alertCount = 7,
  criticalIncidentsCount = 2,
  activeMissionId = '027',
  activeMission = null,
  missionsList = [],
  onSelectMission = () => {},
  onOpenNewOperation = () => {}
}) {
  const [isOpSelectorOpen, setIsOpSelectorOpen] = useState(false);

  // Unified missions list
  const availableMissions = missionsList && missionsList.length > 0 ? missionsList : FALLBACK_MISSIONS;
  const currentHazard = getHazardConfig(activeMission?.disasterType || 'FLOOD');
  const currentMissionName = activeMission?.name || (availableMissions.find(m => (m.missionId || m.id) === activeMissionId)?.name) || 'Flash Flood Cascade';

  const navSections = [
    {
      group: 'COMMAND',
      items: [
        {
          id: 'overview',
          label: 'Overview',
          icon: LayoutDashboard,
          badge: null,
          desc: 'Main command centre overview'
        },
        {
          id: 'mission-control',
          label: 'Mission Control',
          icon: Target,
          badge: 'DEFCON 2',
          badgeColor: '#EF4444',
          desc: 'Operational directive & multi-stage cycle'
        },
        {
          id: 'live-ops',
          label: 'Live Operations',
          icon: Radio,
          badge: 'LIVE',
          badgeColor: '#00F0FF',
          pulse: true,
          desc: 'Unified interactive disaster map & resource deployment'
        }
      ]
    },
    {
      group: 'OPERATIONS',
      items: [
        {
          id: 'incidents',
          label: 'Incidents',
          icon: AlertTriangle,
          badge: alertCount > 0 ? `${alertCount}` : null,
          badgeColor: '#F59E0B',
          desc: 'Incident investigation & signal correlation'
        },
        {
          id: 'simulations',
          label: 'Simulations',
          icon: Cpu,
          badge: null,
          desc: 'Butterfly effect forward projections & tactical chess'
        },
        {
          id: 'recommendations',
          label: 'Recommendations',
          icon: Sparkles,
          badge: 'AI',
          badgeColor: '#A855F7',
          desc: 'Explainable AI attribution & decision support'
        }
      ]
    },
    {
      group: 'SYSTEM',
      items: [
        {
          id: 'analytics',
          label: 'Analytics',
          icon: BarChart3,
          badge: null,
          desc: 'Fleet telemetry & operational metrics'
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: Sliders,
          badge: null,
          desc: 'Operator credentials & system configuration'
        }
      ]
    }
  ];

  return (
    <aside 
      className={`aegis-sidebar ${collapsed ? 'collapsed' : ''}`}
      aria-label="Tactical Navigation Sidebar"
    >
      {/* Top Header / Brand Mark */}
      <div style={{
        padding: collapsed ? '16px 8px' : '16px 18px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '5px',
            background: 'rgba(0, 240, 255, 0.12)',
            border: '1px solid rgba(0, 240, 255, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-cyan)',
            flexShrink: 0,
            boxShadow: '0 0 12px rgba(0, 240, 255, 0.2)'
          }}>
            <ShieldAlert size={18} />
          </div>

          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="font-hud" style={{
                  fontSize: '17px',
                  fontWeight: '800',
                  letterSpacing: '0.12em',
                  color: '#FFFFFF',
                  lineHeight: 1
                }}>
                  AEGIS
                </span>
                <span style={{
                  fontSize: '9px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: '700',
                  color: 'var(--color-cyan)',
                  background: 'rgba(0, 240, 255, 0.1)',
                  padding: '1px 4px',
                  borderRadius: '2px',
                  letterSpacing: '0.06em'
                }}>
                  v2.0
                </span>
              </div>
              <span className="font-mono" style={{
                fontSize: '9.5px',
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase'
              }}>
                COMMAND SYSTEM
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle button on desktop */}
        <button
          onClick={onToggleCollapse}
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '4px',
            color: 'var(--text-secondary)',
            padding: '5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease'
          }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Operation / Theater Switcher HUD */}
      <div style={{
        position: 'relative',
        padding: collapsed ? '10px 8px' : '10px 14px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'rgba(5, 10, 20, 0.65)'
      }}>
        {collapsed ? (
          <button
            onClick={() => setIsOpSelectorOpen(!isOpSelectorOpen)}
            title={`Active: OP #${activeMissionId} (${currentHazard.badge}) - Click to switch`}
            style={{
              width: '100%',
              height: '32px',
              borderRadius: '4px',
              background: 'rgba(0, 240, 255, 0.08)',
              border: `1px solid ${currentHazard.badgeColor}66`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: currentHazard.badgeColor
            }}
          >
            <Globe size={15} />
          </button>
        ) : (
          <div style={{ position: 'relative' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '5px'
            }}>
              <span className="font-mono" style={{
                fontSize: '9px',
                color: 'var(--text-muted)',
                letterSpacing: '0.12em',
                fontWeight: '700'
              }}>
                ACTIVE THEATER
              </span>
              <span style={{
                fontSize: '8.5px',
                fontFamily: 'var(--font-mono)',
                fontWeight: '800',
                padding: '1px 5px',
                borderRadius: '2px',
                background: `${currentHazard.badgeColor}22`,
                color: currentHazard.badgeColor,
                border: `1px solid ${currentHazard.badgeColor}55`,
                letterSpacing: '0.08em'
              }}>
                {currentHazard.badge}
              </span>
            </div>

            <button
              onClick={() => setIsOpSelectorOpen(!isOpSelectorOpen)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 9px',
                borderRadius: '4px',
                background: 'var(--bg-surface-elevated)',
                border: isOpSelectorOpen ? '1px solid var(--color-cyan)' : '1px solid var(--border-subtle)',
                color: '#FFFFFF',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ minWidth: 0, flex: 1, marginRight: '6px' }}>
                <div className="font-mono" style={{ fontSize: '10px', color: 'var(--color-cyan)', fontWeight: '700' }}>
                  OP #{activeMission?.missionId || activeMissionId || '027'}
                </div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#FFFFFF',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {currentMissionName}
                </div>
              </div>
              <ChevronDown 
                size={14} 
                color="var(--color-cyan)" 
                style={{
                  transform: isOpSelectorOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease',
                  flexShrink: 0
                }}
              />
            </button>
          </div>
        )}

        {/* Floating Mission Switcher Dropdown */}
        {isOpSelectorOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: collapsed ? '60px' : '10px',
            width: '280px',
            background: 'rgba(8, 14, 24, 0.98)',
            border: '1px solid var(--color-cyan)',
            borderRadius: '6px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.75), 0 0 15px rgba(0, 240, 255, 0.2)',
            backdropFilter: 'blur(16px)',
            zIndex: 10000,
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease'
          }}>
            <div style={{
              padding: '10px 12px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(0, 240, 255, 0.05)'
            }}>
              <span className="font-mono" style={{ fontSize: '10px', fontWeight: '800', color: 'var(--color-cyan)', letterSpacing: '0.1em' }}>
                SWITCH DISASTER THEATER
              </span>
              <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {availableMissions.length} THEATERS
              </span>
            </div>

            <div style={{ maxHeight: '280px', overflowY: 'auto', padding: '6px' }}>
              {availableMissions.map((m) => {
                const mId = m.missionId || m.id || m._id;
                const isSelected = (mId === (activeMission?.missionId || activeMissionId));
                const hz = getHazardConfig(m.disasterType);

                return (
                  <button
                    key={mId}
                    onClick={() => {
                      onSelectMission(m);
                      setIsOpSelectorOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '4px',
                      background: isSelected ? 'rgba(0, 240, 255, 0.12)' : 'transparent',
                      border: isSelected ? '1px solid rgba(0, 240, 255, 0.4)' : '1px solid transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      marginBottom: '3px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span className="font-mono" style={{ fontSize: '10px', fontWeight: '700', color: isSelected ? 'var(--color-cyan)' : '#FFFFFF' }}>
                          #{mId}
                        </span>
                        <span style={{
                          fontSize: '8px',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: '800',
                          padding: '1px 4px',
                          borderRadius: '2px',
                          background: `${hz.badgeColor}22`,
                          color: hz.badgeColor,
                          border: `1px solid ${hz.badgeColor}44`,
                          lineHeight: 1
                        }}>
                          {hz.badge}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: isSelected ? '#FFFFFF' : '#CBD5E1',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {m.name}
                      </div>
                      <div style={{ fontSize: '9px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.locationDisplayName || m.locationName || 'Global Theater'}
                      </div>
                    </div>

                    {isSelected && (
                      <Check size={14} color="var(--color-cyan)" style={{ marginTop: '4px', flexShrink: 0 }} />
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{
              padding: '8px 10px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'rgba(0, 0, 0, 0.3)'
            }}>
              <button
                onClick={() => {
                  setIsOpSelectorOpen(false);
                  onOpenNewOperation();
                }}
                className="aegis-btn aegis-btn-primary"
                style={{
                  width: '100%',
                  fontSize: '10px',
                  padding: '6px 10px',
                  justifyContent: 'center'
                }}
              >
                <Plus size={12} />
                <span>+ COMMISSION NEW OPERATION</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nav Sections List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '12px 0'
      }}>
        {navSections.map((sec, idx) => (
          <div key={idx} style={{ marginBottom: '16px' }}>
            {!collapsed ? (
              <div style={{
                padding: '4px 18px 6px',
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                fontWeight: '700',
                letterSpacing: '0.14em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase'
              }}>
                {sec.group}
              </div>
            ) : (
              <div style={{
                height: '1px',
                background: 'var(--border-subtle)',
                margin: '8px 12px'
              }} />
            )}

            <nav>
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectPage(item.id)}
                    className={`aegis-sidebar-nav-item ${isActive ? 'active' : ''}`}
                    title={collapsed ? `${item.label} — ${item.desc}` : item.desc}
                    style={{
                      width: collapsed ? '48px' : 'calc(100% - 16px)',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      padding: collapsed ? '9px 0' : '9px 12px'
                    }}
                  >
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <Icon 
                        size={17} 
                        color={isActive ? 'var(--color-cyan)' : '#111827'}
                      />
                      {item.pulse && (
                        <span style={{
                          position: 'absolute',
                          top: -2,
                          right: -2,
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: isActive ? 'var(--color-cyan)' : '#0284c7',
                          boxShadow: isActive ? '0 0 6px var(--color-cyan)' : '0 0 4px #0284c7',
                          animation: 'pulse 1.8s infinite ease-in-out'
                        }} />
                      )}
                    </div>

                    {!collapsed && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flex: 1,
                        minWidth: 0
                      }}>
                        <span style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: isActive ? 'var(--color-cyan)' : '#111827',
                          fontWeight: '600'
                        }}>
                          {item.label}
                        </span>

                        {item.badge && (
                          <span style={{
                            fontSize: '9px',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: '700',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            background: isActive ? `${item.badgeColor || '#00F0FF'}22` : '#0f172a',
                            color: item.badgeColor || '#00F0FF',
                            border: `1px solid ${isActive ? `${item.badgeColor || '#00F0FF'}44` : `${item.badgeColor || '#00F0FF'}88`}`,
                            lineHeight: 1,
                            letterSpacing: '0.04em'
                          }}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Footer: Operator & System Connectivity */}
      <div style={{
        padding: collapsed ? '12px 8px' : '12px 14px',
        borderTop: '1px solid var(--border-subtle)',
        background: 'rgba(7, 11, 18, 0.75)'
      }}>
        {collapsed ? (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={currentUser ? onOpenProfile : onOpenAuth}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '4px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: currentUser ? '#10B981' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title={currentUser ? `Operator: ${currentUser.name}` : "Click to authenticate"}
            >
              {currentUser ? <UserCheck size={16} /> : <Lock size={14} />}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Operator Card */}
            {currentUser ? (
              <div 
                onClick={onOpenProfile}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '6px 10px',
                  cursor: 'pointer'
                }}
                title="View Operator Profile & Dossier"
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '3px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <UserCheck size={13} />
                </div>
                <div style={{ minWidth: 0, flex: 1, lineHeight: 1.2 }}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {currentUser.name}
                  </div>
                  <div className="font-mono" style={{ fontSize: '9px', color: '#10B981' }}>
                    {currentUser.role}
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="aegis-btn aegis-btn-secondary"
                style={{ width: '100%', fontSize: '10px', padding: '5px 8px' }}
              >
                <Lock size={12} />
                <span>OPERATOR AUTH</span>
              </button>
            )}

            {/* Mode & Live link */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)'
            }}>
              <button
                onClick={onToggleMode}
                style={{
                  background: 'none',
                  border: 'none',
                  color: mode === 'LIVE' ? '#10B981' : '#F59E0B',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: 'pointer',
                  padding: 0
                }}
                title="Toggle Mode (LIVE / DEMO)"
              >
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: mode === 'LIVE' ? '#10B981' : '#F59E0B',
                  boxShadow: `0 0 6px ${mode === 'LIVE' ? '#10B981' : '#F59E0B'}`
                }} />
                <span>{mode} THEATER</span>
              </button>

              <span style={{ color: 'var(--text-muted)' }}>
                {currentOrg?.name ? currentOrg.name.slice(0, 10) : 'AEGIS REOC'}
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
