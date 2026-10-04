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
import { 
  getState, 
  resetState, 
  getHealth, 
  getMissions, 
  getZones, 
  getIncidents, 
  getResources 
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
  const fetchWorldState = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setSyncState('MISSION DATA SYNCING...');
      } else {
        setSyncState('ZONE DATA SYNCING...');
      }

      // Check backend health & connectivity
      const health = await getHealth().catch(() => null);

      // Load primary mission state and REST resources
      const [stateData, missionsData, zonesData, incidentsData, resourcesData] = await Promise.all([
        getState().catch(() => null),
        getMissions().catch(() => null),
        getZones('027').catch(() => null),
        getIncidents('027').catch(() => null),
        getResources('027').catch(() => null)
      ]);

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
  }, []);

  useEffect(() => {
    fetchWorldState(true);
  }, [fetchWorldState]);

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', color: 'var(--color-off-white)', fontFamily: 'var(--font-body)', position: 'relative' }}>
      
      {/* Tactical Custom Pointer Cursor */}
      <AegisCursor />

      {/* Subtle Atmospheric Grain Overlay */}
      <div className="aegis-grain-overlay" />

      {/* Living Environment Background Canvas */}
      <AegisLivingCanvas currentStage={currentStage} isCritical={currentStage === 'explain'} />

      {/* Tactical Operational Feedback HUD */}
      <AegisSystemFeedback activeLog={notification} />

      {/* Subtle Telemetry Sync / Offline Status Bar */}
      <div style={{
        position: 'fixed',
        bottom: '14px',
        left: '18px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        pointerEvents: 'none'
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
            border: '1px solid rgba(111, 148, 125, 0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            <Radio size={10} color="#6F947D" />
            <span className="font-mono" style={{ fontSize: '9px', color: '#a7f3d0', letterSpacing: '0.08em' }}>
              API CONNECTED
            </span>
          </div>
        )}

        {/* Dynamic Premium Loading HUD State */}
        {syncState && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '4px 12px',
            borderRadius: '4px',
            background: 'rgba(15, 23, 42, 0.92)',
            border: '1px solid rgba(56, 189, 248, 0.5)',
            boxShadow: '0 0 15px rgba(56, 189, 248, 0.25)',
            animation: 'pulse 1.8s infinite ease-in-out'
          }}>
            <Cpu size={12} color="#38bdf8" />
            <span className="font-mono" style={{ fontSize: '10px', color: '#38bdf8', fontWeight: '800', letterSpacing: '0.12em' }}>
              ● {syncState}
            </span>
          </div>
        )}
      </div>

      {/* Persistent Mission Progress Ribbon Header */}
      <MissionNavBar
        currentStage={currentStage}
        onSelectStage={handleStageSelect}
        onReset={handleReset}
        onBack={handleBack}
        cityHealth={currentStage === 'outcome' ? 78 : currentStage === 'simulate' ? 61 : (worldState?.cityHealth || 70)}
        activeAlerts={currentStage === 'outcome' ? 2 : (worldState?.activeAlerts || 7)}
        hospitalLoad={currentStage === 'outcome' ? 64 : currentStage === 'simulate' ? 91 : (worldState?.hospitalLoad || 72)}
      />

      {/* Dedicated Interactive Stage Screen wrapped in Cinematic Transition */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10 }}>
        <AegisCinematicTransition stage={currentStage}>
        
        {/* STAGE 1: MISSION BRIEFING */}
        {currentStage === 'briefing' && (
          <MissionBriefingScreen
            cityHealth={worldState?.cityHealth || 70}
            activeAlerts={worldState?.activeAlerts || 7}
            unknownZones={worldState?.unknownZones || 1}
            onBeginOperation={() => {
              handleStageSelect('investigate');
              showToast("> OPERATION #027 INITIATED // LIVE SENSOR ARRAYS ONLINE", "info");
            }}
          />
        )}

        {/* STAGE 2: INCIDENT INVESTIGATION */}
        {currentStage === 'investigate' && (
          <IncidentInvestigationScreen
            onFuseIncident={() => {
              handleStageSelect('fuse');
              showToast("> MULTI-SIGNAL SYNTHESIS // 5 SOURCES CORRELATED", "success");
            }}
          />
        )}

        {/* STAGE 3: INCIDENT FUSION */}
        {currentStage === 'fuse' && (
          <IncidentFusionScreen
            onRevealDigitalTwin={() => {
              handleStageSelect('map');
              showToast("> DIGITAL TWIN MATRIX ONLINE // 5 SECTORS SYNCHRONIZED", "success");
            }}
          />
        )}

        {/* STAGE 4: DIGITAL TWIN HERO MAP */}
        {currentStage === 'map' && (
          <DigitalTwinScreen
            zones={zones}
            onExplainRisk={(exp, zid) => {
              if (exp) setActiveExplanation(exp);
              if (zid) setActiveZoneId(zid);
              handleStageSelect('explain');
              showToast("> TELEMETRY LINK ESTABLISHED // XAI FACTOR ATTRIBUTION LOADED", "info");
            }}
            onInvestigateUnknown={() => {
              handleStageSelect('unknown');
              showToast("> RECONNAISSANCE PROTOCOL ENGAGED // PROBING ZONE E BLACKOUT", "warning");
            }}
          />
        )}

        {/* STAGE 5: UNKNOWN ZONE INTELLIGENCE */}
        {currentStage === 'unknown' && (
          <UnknownZoneScreen
            onProceedToExplain={() => {
              handleStageSelect('explain');
              showToast("> ZONE E BLACKOUT UNMASKED // ATTRIBUTION BREAKDOWN READY", "info");
            }}
            onZoneUpdated={(updatedZone) => {
              showToast(`> SECTOR ${updatedZone.id} STATUS UPDATED // ${updatedZone.status}`, "warning");
              fetchWorldState();
            }}
          />
        )}

        {/* STAGE 6: EXPLAINABLE AI (XAI) */}
        {currentStage === 'explain' && (
          <ExplainableAIScreen
            explanation={activeExplanation}
            zoneId={activeZoneId}
            onEnterCommandCenter={() => {
              handleStageSelect('command');
              showToast("> XAI ATTRIBUTION LOGGED // COMMAND TERMINAL OPENED", "info");
            }}
          />
        )}

        {/* STAGE 7: COMMAND CENTER & AVAILABLE FLEET */}
        {currentStage === 'command' && (
          <CommandCenterScreen
            onResourceAssigned={(unit, targetZone) => {
              showToast(`> RESOURCE STAGED // ${unit.callsign || unit.name} ASSIGNED TO ZONE ${targetZone}`, "success");
            }}
            onCreatePlan={() => {
              handleStageSelect('strategy');
              showToast("> FLEET 14/14 DISPATCH READY // DUAL RESPONSE FORMULATION ACTIVE", "info");
            }}
          />
        )}

        {/* STAGE 8: HUMAN VS AI COMMAND STRATEGY */}
        {currentStage === 'strategy' && (
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
        )}

        {/* STAGE 9: BUTTERFLY EFFECT SIMULATION */}
        {currentStage === 'simulate' && (
          <DisasterSimulationScreen
            onProceedToChess={() => {
              handleStageSelect('chess');
              showToast("> PROJECTION VERIFIED // DISASTER CHESS TACTICAL BOARD ACTIVE", "info");
            }}
          />
        )}

        {/* STAGE 10: DISASTER CHESS TACTICAL BOARD */}
        {currentStage === 'chess' && (
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
        )}

        {/* STAGE 11: LIVE ASSET DEPLOYMENT ANIMATION */}
        {currentStage === 'deploy' && (
          <DeploymentAnimationScreen
            deployedUnit={deployedPiece}
            onCompleteDeployment={() => {
              handleStageSelect('outcome');
              showToast("> ON-SCENE ARRIVAL CONFIRMED // SYNTHESIZING AFTER ACTION REPORT", "success");
            }}
          />
        )}

        {/* STAGE 12: AFTER ACTION OUTCOME */}
        {currentStage === 'outcome' && (
          <OutcomeScreen
            onReplay={() => {
              handleStageSelect('briefing');
              showToast("> OPERATION #027 REINITIALIZING TO BASELINE BRIEFING", "info");
            }}
            onTryDifferentStrategy={() => {
              handleStageSelect('strategy');
              showToast("> STRATEGY CONSOLE RESTORED // FORMULATING ALTERNATE DISPATCH", "info");
            }}
            onReturnToCommand={() => {
              handleStageSelect('command');
              showToast("> RETURNING TO INCIDENT COMMAND FLEET MATRIX", "info");
            }}
          />
        )}

        </AegisCinematicTransition>
      </main>

    </div>
  );
}
