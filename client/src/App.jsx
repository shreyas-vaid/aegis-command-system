import React, { useState, useEffect, useCallback } from 'react';
import MissionNavBar from './components/MissionNavBar';
import MissionBriefingScreen from './components/MissionBriefingScreen';
import IncidentInvestigationScreen from './components/IncidentInvestigationScreen';
import IncidentFusionScreen from './components/IncidentFusionScreen';
import DigitalTwinScreen from './components/DigitalTwinScreen';
import UnknownZoneScreen from './components/UnknownZoneScreen';
import ExplainableAIScreen from './components/ExplainableAIScreen';
import CommandCenterScreen from './components/CommandCenterScreen';
import StrategyScreen from './components/StrategyScreen';
import DisasterSimulationScreen from './components/DisasterSimulationScreen';
import TacticalChessScreen from './components/TacticalChessScreen';
import DeploymentAnimationScreen from './components/DeploymentAnimationScreen';
import OutcomeScreen from './components/OutcomeScreen';
import { AegisSystemFeedback } from './components/aegis-controls';
import { AegisCursor, AegisLivingCanvas, AegisCinematicTransition } from './components/aegis-interactive';
import AegisAuthModal from './components/AegisAuthModal';
import AegisProfileDrawer from './components/AegisProfileDrawer';
import AegisOperationsDeck from './components/AegisOperationsDeck';
import AegisNewOperationModal from './components/AegisNewOperationModal';
import AegisSidebar from './components/AegisSidebar';
import LiveOperationsScreen from './components/LiveOperationsScreen';
import AnalyticsScreen from './components/AnalyticsScreen';
import SettingsScreen from './components/SettingsScreen';
import { 
  getState, 
  resetState, 
  getHealth, 
  getMissions, 
  getMission,
  getZones, 
  getIncidents, 
  getResources,
  getMe,
  logoutUser,
  getAuthToken
} from './services/api';
import { WifiOff, Radio, Cpu, RefreshCw } from 'lucide-react';

export default function App() {
  // 12-Stage Mission State Machine
  // 1. briefing -> 2. investigate -> 3. fuse -> 4. map -> 5. unknown -> 6. explain
  // -> 7. command -> 8. strategy -> 9. simulate -> 10. chess -> 11. deploy -> 12. outcome
  const [currentStage, setCurrentStage] = useState('briefing');
  const [worldState, setWorldState] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const [syncState, setSyncState] = useState(null); // 'MISSION SYNCING' | 'ZONE TELEMETRY SYNCING' | 'FUSION ENGINE ACTIVE' | 'SIMULATION PROCESSING'

  // AEGIS 2.0 Modes: 'DEMO' | 'LIVE'
  const [mode, setMode] = useState('DEMO');
  const [currentUser, setCurrentUser] = useState(null);
  const [currentOrg, setCurrentOrg] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  // Operations Deck & Multi-Mission Selection
  const [activeView, setActiveView] = useState('MISSION'); // 'DECK' | 'MISSION'
  const [activePage, setActivePage] = useState('live-ops'); // 'overview' | 'mission-control' | 'live-ops' | 'incidents' | 'simulations' | 'recommendations' | 'analytics' | 'settings'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeMissionId, setActiveMissionId] = useState('027');
  const [activeMission, setActiveMission] = useState(null);
  const [missionsList, setMissionsList] = useState([]);
  const [isNewOpModalOpen, setIsNewOpModalOpen] = useState(false);
  
  // Tactical State across mission
  const [activeStrategy, setActiveStrategy] = useState('ai');
  const [activeExplanation, setActiveExplanation] = useState(null);
  const [activeZoneId, setActiveZoneId] = useState('D');
  const [deployedPiece, setDeployedPiece] = useState({
    callsign: "AMBULANCE 02",
    type: "Advanced Life Support EMS",
    from: "BASE STAGING (ZONE A)",
    via: "ROAD 12 ELEVATED BYPASS",
    to: "ZONE D (SOUTH GENERAL TRAUMA CENTER)",
    etaMinutes: 14
  });

  const showToast = (msg, type = "info") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3800);
  };

  // Fetch world state and telemetries from backend via centralized API service
  const fetchWorldState = useCallback(async (isInitial = false, targetMissionId = null) => {
    const mId = targetMissionId || activeMissionId || '027';
    try {
      if (isInitial) {
        setSyncState('MISSION DATA SYNCING...');
      } else {
        setSyncState('ZONE DATA SYNCING...');
      }

      // Check backend health & connectivity
      const health = await getHealth().catch(() => null);

      // Load primary mission state and REST resources
      const [stateData, missionsData, zonesData, incidentsData, resourcesData, singleMission] = await Promise.all([
        getState().catch(() => null),
        getMissions().catch(() => null),
        getZones(mId).catch(() => null),
        getIncidents(mId).catch(() => null),
        getResources(mId).catch(() => null),
        getMission(mId).catch(() => null)
      ]);

      if (singleMission) {
        setActiveMission(singleMission);
      }
      if (Array.isArray(missionsData)) {
        setMissionsList(missionsData);
      }

      if (health || stateData || zonesData) {
        setWorldState({
          ...stateData,
          missions: missionsData || stateData?.missions || [],
          zones: (zonesData && zonesData.length > 0) ? zonesData : (stateData?.zones || []),
          incidents: (incidentsData && incidentsData.length > 0) ? incidentsData : (stateData?.incidents || []),
          resources: (resourcesData && resourcesData.length > 0) ? resourcesData : (stateData?.resources || []),
          cityHealth: stateData?.cityHealth ?? 70,
          activeAlerts: stateData?.activeAlerts ?? 7,
          hospitalLoad: stateData?.hospitalLoad ?? 72,
          unknownZones: stateData?.unknownZones ?? 1
        });
        setIsOffline(false);
      } else {
        setIsOffline(true);
      }
    } catch (err) {
      console.warn("[AEGIS-API] Backend unavailable — operating in graceful OFFLINE / DEMO MODE.", err.message);
      setIsOffline(true);
    } finally {
      setTimeout(() => {
        setSyncState(null);
      }, 700);
    }
  }, [activeMissionId]);

  const fetchMissionsList = useCallback(async () => {
    try {
      const list = await getMissions();
      if (Array.isArray(list)) {
        setMissionsList(list);
      }
    } catch (err) {
      console.warn('[AEGIS-API] Missions fetch fallback:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchWorldState(true);

    // Check for existing valid operator token
    const token = getAuthToken();
    if (token) {
      getMe()
        .then((res) => {
          if (res?.user) {
            setCurrentUser(res.user);
            setCurrentOrg(res.organization || null);
            setMode('LIVE');
            setActiveView('DECK');
            fetchMissionsList();
          }
        })
        .catch(() => {
          // Token expired or invalid
          setCurrentUser(null);
          setCurrentOrg(null);
          setMode('DEMO');
        });
    }
  }, [fetchWorldState, fetchMissionsList]);

  const handleToggleMode = () => {
    if (mode === 'DEMO') {
      if (!currentUser) {
        setIsAuthModalOpen(true);
        showToast("OPERATOR AUTHENTICATION REQUIRED FOR LIVE OPERATION", "info");
      } else {
        setMode('LIVE');
        setActiveView('DECK');
        fetchMissionsList();
        showToast(`> LIVE OPERATION ENGAGED // ${currentUser.role} ${currentUser.name}`, "success");
      }
    } else {
      setMode('DEMO');
      setActiveView('MISSION');
      setActiveMissionId('027');
      setActiveMission(null);
      fetchWorldState(true, '027');
      showToast("> DEMO / SIMULATION MODE ENGAGED // SCENARIO #027", "info");
    }
  };

  const handleAuthSuccess = (user, organization) => {
    setCurrentUser(user);
    setCurrentOrg(organization || null);
    setMode('LIVE');
    setActiveView('DECK');
    fetchMissionsList();
    showToast(`> CLEARANCE VERIFIED // OPERATOR: ${user.role} ${user.name}`, "success");
  };

  const handleSelectOperation = (mission) => {
    const mId = mission.missionId || mission.id || mission._id;
    setActiveMissionId(mId);
    setActiveMission(mission);
    setActiveView('MISSION');
    setCurrentStage('briefing');
    fetchWorldState(true, mId);
    showToast(`> THEATER ENGAGED // OPERATION #${mId}: ${mission.name}`, "success");
  };

  const handleOperationCreated = (newMission) => {
    fetchMissionsList();
    handleSelectOperation(newMission);
    showToast(`> OPERATION COMMISSIONED // #${newMission.missionId}`, "success");
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.warn('Logout API error:', err);
    }
    setCurrentUser(null);
    setCurrentOrg(null);
    setMode('DEMO');
    setActiveView('MISSION');
    setActiveMissionId('027');
    setActiveMission(null);
    showToast("> SESSION TERMINATED // REVERTED TO DEMO MODE", "info");
  };

  // Trigger contextual loading banners on major stage changes
  const handleStageSelect = (stageId) => {
    if (stageId === 'fuse') {
      setSyncState('FUSION ENGINE ACTIVE');
      setTimeout(() => setSyncState(null), 900);
    } else if (stageId === 'simulate') {
      setSyncState('SIMULATION PROCESSING');
      setTimeout(() => setSyncState(null), 900);
    } else if (stageId === 'map') {
      setSyncState('ZONE TELEMETRY SYNCING');
      setTimeout(() => setSyncState(null), 700);
    }
    setCurrentStage(stageId);
  };

  const handleReset = async () => {
    try {
      setSyncState('MISSION DATA SYNCING...');
      await resetState().catch(() => null);
      setCurrentStage('briefing');
      await fetchWorldState();
      showToast("> SYSTEM RESET // BASELINE SCENARIO RESTORED", "info");
    } catch (err) {
      console.warn("Reset executed in offline mode", err);
      setCurrentStage('briefing');
      showToast("> SYSTEM RESET // LOCAL BASELINE RESTORED", "info");
    } finally {
      setTimeout(() => setSyncState(null), 600);
    }
  };

  const STAGE_ORDER = [
    'briefing',
    'investigate',
    'fuse',
    'map',
    'unknown',
    'explain',
    'command',
    'strategy',
    'simulate',
    'chess',
    'deploy',
    'outcome'
  ];

  const handleBack = () => {
    const idx = STAGE_ORDER.indexOf(currentStage);
    if (idx > 0) {
      handleStageSelect(STAGE_ORDER[idx - 1]);
    }
  };

  const zones = worldState?.zones || [];

  return (
    <div className="aegis-app-shell">
      
      {/* Tactical Custom Pointer Cursor */}
      <AegisCursor />

      {/* Subtle Atmospheric Grain Overlay */}
      <div className="aegis-grain-overlay" />

      {/* Living Environment Background Canvas */}
      <AegisLivingCanvas currentStage={currentStage} isCritical={currentStage === 'explain'} />

      {/* Tactical Operational Feedback HUD */}
      <AegisSystemFeedback activeLog={notification} />

      {/* Collapsible Left Tactical Navigation Sidebar */}
      <AegisSidebar
        activePage={activePage}
        onSelectPage={(pageId) => {
          setActivePage(pageId);
          if (pageId === 'overview') handleStageSelect('command');
          else if (pageId === 'mission-control') handleStageSelect('briefing');
          else if (pageId === 'incidents') handleStageSelect('investigate');
          else if (pageId === 'simulations') handleStageSelect('simulate');
          else if (pageId === 'recommendations') handleStageSelect('explain');
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentUser={currentUser}
        currentOrg={currentOrg}
        mode={mode}
        onToggleMode={handleToggleMode}
        onOpenProfile={() => setIsProfileDrawerOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        alertCount={worldState?.activeAlerts || 7}
        criticalIncidentsCount={2}
      />

      {/* Main Viewport Container */}
      <div className="aegis-main-viewport">

        {/* Subtle Telemetry Sync / Offline Status Bar */}
        <div style={{
          position: 'fixed',
          bottom: '14px',
          left: sidebarCollapsed ? '82px' : '264px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'none',
          transition: 'left 0.22s ease'
        }}>
          {isOffline ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '4px',
              background: 'rgba(23, 20, 16, 0.88)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} />
              <WifiOff size={11} color="#f59e0b" />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <span className="font-mono" style={{ fontSize: '9px', color: '#fcd34d', fontWeight: '700', letterSpacing: '0.08em' }}>
                  API OFFLINE
                </span>
                <span className="font-mono" style={{ fontSize: '8px', color: '#d6c6a5', letterSpacing: '0.06em' }}>
                  LOCAL SIMULATION ACTIVE
                </span>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 9px',
              borderRadius: '4px',
              background: 'rgba(10, 20, 15, 0.75)',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00F0FF', boxShadow: '0 0 6px #00F0FF' }} />
              <Radio size={10} color="#00F0FF" />
              <span className="font-mono" style={{ fontSize: '9px', color: '#a7f3d0', letterSpacing: '0.08em' }}>
                API CONNECTED
              </span>
            </div>
          )}

          {/* Dynamic Loading HUD State */}
          {syncState && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '4px 12px',
              borderRadius: '4px',
              background: 'rgba(15, 23, 42, 0.92)',
              border: '1px solid rgba(0, 240, 255, 0.5)',
              boxShadow: '0 0 15px rgba(0, 240, 255, 0.25)',
              animation: 'pulse 1.8s infinite ease-in-out'
            }}>
              <Cpu size={12} color="#00F0FF" />
              <span className="font-mono" style={{ fontSize: '10px', color: '#00F0FF', fontWeight: '800', letterSpacing: '0.12em' }}>
                ● {syncState}
              </span>
            </div>
          )}
        </div>

        {/* Persistent Mission Progress Ribbon Header */}
        <MissionNavBar
          currentStage={currentStage}
          onSelectStage={(stageId) => {
            handleStageSelect(stageId);
            if (stageId === 'command') setActivePage('overview');
            else if (stageId === 'briefing') setActivePage('mission-control');
            else if (stageId === 'investigate' || stageId === 'fuse') setActivePage('incidents');
            else if (stageId === 'strategy' || stageId === 'simulate' || stageId === 'chess' || stageId === 'deploy' || stageId === 'outcome') setActivePage('simulations');
            else if (stageId === 'explain' || stageId === 'unknown') setActivePage('recommendations');
            else if (stageId === 'map') setActivePage('live-ops');
          }}
          onReset={handleReset}
          onBack={handleBack}
          cityHealth={currentStage === 'outcome' ? 78 : currentStage === 'simulate' ? 61 : (worldState?.cityHealth || 70)}
          activeAlerts={currentStage === 'outcome' ? 2 : (worldState?.activeAlerts || 7)}
          hospitalLoad={currentStage === 'outcome' ? 64 : currentStage === 'simulate' ? 91 : (worldState?.hospitalLoad || 72)}
          mode={mode}
          onToggleMode={handleToggleMode}
          currentUser={currentUser}
          currentOrg={currentOrg}
          activeMission={activeMission}
          missionsList={missionsList}
          onSelectMission={(mId) => {
            const m = missionsList.find(x => (x.missionId || x.id || x._id) === mId);
            if (m) handleSelectOperation(m);
          }}
          activeView={activeView}
          onNavigateToDeck={() => setActiveView(activeView === 'DECK' ? 'MISSION' : 'DECK')}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenProfile={() => setIsProfileDrawerOpen(true)}
        />

        {/* Dedicated Interactive Screen Content Area */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>
          {activeView === 'DECK' ? (
            <AegisOperationsDeck
              missions={missionsList}
              currentOrg={currentOrg}
              currentUser={currentUser}
              onSelectOperation={handleSelectOperation}
              onOpenNewOperationModal={() => setIsNewOpModalOpen(true)}
              onRefreshMissions={fetchMissionsList}
              onEnterDemoMode={() => {
                setMode('DEMO');
                setActiveView('MISSION');
                setActiveMissionId('027');
                fetchWorldState(true, '027');
                showToast("> PROTOTYPE DEMO MODE ENGAGED // SCENARIO #027", "info");
              }}
            />
          ) : (
            <>
              {/* PAGE 1: MERGED LIVE OPERATIONS (CENTRAL DISASTER MAP & RESOURCE DEPLOYMENT) */}
              {activePage === 'live-ops' && (
                <LiveOperationsScreen
                  activeMission={activeMission}
                  currentUser={currentUser}
                  onResourceAssigned={(unit, targetZone) => {
                    showToast(`> FLEET DEPLOYED // ${unit.callsign || unit.name} ASSIGNED TO ZONE ${targetZone}`, "success");
                    fetchWorldState();
                  }}
                  onNavigateStage={(stageId) => {
                    if (stageId === 'command') setActivePage('overview');
                    else if (stageId === 'briefing') setActivePage('mission-control');
                    else if (stageId === 'unknown') {
                      setActivePage('incidents');
                      handleStageSelect('unknown');
                    } else {
                      handleStageSelect(stageId);
                    }
                  }}
                  showToast={showToast}
                />
              )}

              {/* PAGE 2: COMMAND OVERVIEW */}
              {activePage === 'overview' && (
                <CommandCenterScreen
                  currentUser={currentUser}
                  currentOrg={currentOrg}
                  activeMission={activeMission}
                  worldState={worldState}
                  zones={zones}
                  incidents={worldState?.incidents || []}
                  resources={worldState?.resources || []}
                  onNavigateStage={(stageId) => {
                    if (stageId === 'map') setActivePage('live-ops');
                    else if (stageId === 'strategy') {
                      setActivePage('simulations');
                      handleStageSelect('strategy');
                    } else if (stageId === 'investigate') {
                      setActivePage('incidents');
                      handleStageSelect('investigate');
                    } else if (stageId === 'unknown') {
                      setActivePage('incidents');
                      handleStageSelect('unknown');
                    } else {
                      handleStageSelect(stageId);
                    }
                  }}
                  onSelectZone={(zoneId, exp) => {
                    if (zoneId) setActiveZoneId(zoneId);
                    if (exp) setActiveExplanation(exp);
                    setActivePage('recommendations');
                    handleStageSelect('explain');
                  }}
                  onResourceAssigned={(unit, targetZone) => {
                    showToast(`> RESOURCE STAGED // ${unit.callsign || unit.name} ASSIGNED TO ZONE ${targetZone}`, "success");
                  }}
                  onCreatePlan={() => {
                    setActivePage('simulations');
                    handleStageSelect('strategy');
                    showToast("> FLEET 14/14 DISPATCH READY // DUAL RESPONSE FORMULATION ACTIVE", "info");
                  }}
                />
              )}

              {/* PAGE 3: MISSION CONTROL */}
              {activePage === 'mission-control' && (
                <AegisCinematicTransition stage={currentStage}>
                  <MissionBriefingScreen
                    cityHealth={worldState?.cityHealth || 70}
                    activeAlerts={worldState?.activeAlerts || 7}
                    unknownZones={worldState?.unknownZones || 1}
                    activeMission={activeMission}
                    missionsList={missionsList}
                    resources={worldState?.resources || []}
                    onSelectMission={(mId) => {
                      const m = missionsList.find(x => (x.missionId || x.id || x._id) === mId);
                      if (m) handleSelectOperation(m);
                    }}
                    onBeginOperation={() => {
                      setActivePage('incidents');
                      handleStageSelect('investigate');
                      showToast(`> OPERATION #${activeMission?.missionId || '027'} INITIATED // LIVE SENSOR ARRAYS ONLINE`, "info");
                    }}
                  />
                </AegisCinematicTransition>
              )}

              {/* PAGE 4: INCIDENTS */}
              {activePage === 'incidents' && (
                <AegisCinematicTransition stage={currentStage}>
                  {currentStage === 'unknown' ? (
                    <UnknownZoneScreen
                      onProceedToExplain={() => {
                        setActivePage('recommendations');
                        handleStageSelect('explain');
                        showToast("> ZONE E BLACKOUT UNMASKED // ATTRIBUTION BREAKDOWN READY", "info");
                      }}
                      onZoneUpdated={(updatedZone) => {
                        showToast(`> SECTOR ${updatedZone.id} STATUS UPDATED // ${updatedZone.status}`, "warning");
                        fetchWorldState();
                      }}
                    />
                  ) : currentStage === 'fuse' ? (
                    <IncidentFusionScreen
                      onRevealDigitalTwin={() => {
                        setActivePage('live-ops');
                        showToast("> DIGITAL TWIN MATRIX ONLINE // 5 SECTORS SYNCHRONIZED", "success");
                      }}
                    />
                  ) : (
                    <IncidentInvestigationScreen
                      onFuseIncident={() => {
                        handleStageSelect('fuse');
                        showToast("> MULTI-SIGNAL SYNTHESIS // 5 SOURCES CORRELATED", "success");
                      }}
                    />
                  )}
                </AegisCinematicTransition>
              )}

              {/* PAGE 5: SIMULATIONS */}
              {activePage === 'simulations' && (
                <AegisCinematicTransition stage={currentStage}>
                  {currentStage === 'strategy' ? (
                    <StrategyScreen
                      onRunHumanPlan={() => {
                        setActiveStrategy('human');
                        handleStageSelect('simulate');
                        showToast("> HUMAN MANUAL OVERRIDE ENGAGED // TEMPORAL PROJECTION COMMENCED", "info");
                      }}
                      onRunAiPlan={() => {
                        setActiveStrategy('ai');
                        handleStageSelect('simulate');
                        showToast("> AEGIS BAYESIAN OPTIMIZATION ENGAGED // TEMPORAL PROJECTION COMMENCED", "success");
                      }}
                    />
                  ) : currentStage === 'chess' ? (
                    <TacticalChessScreen
                      onProceedToDeploy={(piece) => {
                        setDeployedPiece({
                          callsign: piece.name,
                          type: piece.type,
                          from: piece.current,
                          via: piece.route,
                          to: piece.target,
                          etaMinutes: piece.etaMinutes || 14
                        });
                        handleStageSelect('deploy');
                        showToast(`> DISPATCH CONFIRMED // ${piece.name} IN TRANSIT VIA ${piece.route}`, "success");
                      }}
                    />
                  ) : currentStage === 'deploy' ? (
                    <DeploymentAnimationScreen
                      deployedUnit={deployedPiece}
                      onCompleteDeployment={() => {
                        handleStageSelect('outcome');
                        showToast("> ON-SCENE ARRIVAL CONFIRMED // SYNTHESIZING AFTER ACTION REPORT", "success");
                      }}
                    />
                  ) : currentStage === 'outcome' ? (
                    <OutcomeScreen
                      onReplay={() => {
                        setActivePage('mission-control');
                        handleStageSelect('briefing');
                        showToast("> OPERATION #027 REINITIALIZING TO BASELINE BRIEFING", "info");
                      }}
                      onTryDifferentStrategy={() => {
                        handleStageSelect('strategy');
                        showToast("> STRATEGY CONSOLE RESTORED // FORMULATING ALTERNATE DISPATCH", "info");
                      }}
                      onReturnToCommand={() => {
                        setActivePage('overview');
                        handleStageSelect('command');
                        showToast("> RETURNING TO INCIDENT COMMAND FLEET MATRIX", "info");
                      }}
                    />
                  ) : (
                    <DisasterSimulationScreen
                      onProceedToChess={() => {
                        handleStageSelect('chess');
                        showToast("> PROJECTION VERIFIED // DISASTER CHESS TACTICAL BOARD ACTIVE", "info");
                      }}
                    />
                  )}
                </AegisCinematicTransition>
              )}

              {/* PAGE 6: RECOMMENDATIONS */}
              {activePage === 'recommendations' && (
                <AegisCinematicTransition stage="explain">
                  <ExplainableAIScreen
                    explanation={activeExplanation}
                    zoneId={activeZoneId}
                    onEnterCommandCenter={() => {
                      setActivePage('overview');
                      handleStageSelect('command');
                      showToast("> XAI ATTRIBUTION LOGGED // COMMAND TERMINAL OPENED", "info");
                    }}
                  />
                </AegisCinematicTransition>
              )}

              {/* PAGE 7: ANALYTICS */}
              {activePage === 'analytics' && (
                <AnalyticsScreen
                  worldState={worldState}
                  activeMission={activeMission}
                />
              )}

              {/* PAGE 8: SETTINGS */}
              {activePage === 'settings' && (
                <SettingsScreen
                  currentUser={currentUser}
                  currentOrg={currentOrg}
                  mode={mode}
                  onToggleMode={handleToggleMode}
                  onReset={handleReset}
                  onOpenAuth={() => setIsAuthModalOpen(true)}
                  onLogout={handleLogout}
                  showToast={showToast}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* AEGIS 2.0 Identification & Authentication Portal */}
      <AegisAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* AEGIS Operator Dossier & Session Drawer */}
      <AegisProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        currentUser={currentUser}
        currentOrg={currentOrg}
        onLogout={handleLogout}
        mode={mode}
        onToggleMode={handleToggleMode}
      />

      {/* AEGIS 2.0 New Operation Provisioning Modal */}
      <AegisNewOperationModal
        isOpen={isNewOpModalOpen}
        onClose={() => setIsNewOpModalOpen(false)}
        onOperationCreated={handleOperationCreated}
        currentOrg={currentOrg}
      />

    </div>
  );
}
