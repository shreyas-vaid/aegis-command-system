import React, { useState } from 'react';
import { 
  Swords, 
  X, 
  ShieldAlert, 
  ChevronRight, 
  AlertTriangle, 
  Play, 
  Activity, 
  RotateCcw,
  CheckCircle2,
  Wrench,
  Radio,
  Flame,
  Truck
} from 'lucide-react';

export default function DisasterChessModal({
  isOpen,
  onClose,
  chessState = {},
  onChessAction,
  onReset
}) {
  if (!isOpen) return null;

  const [selectedAction, setSelectedAction] = useState(null);
  const [targetZone, setTargetZone] = useState('D');
  const [loading, setLoading] = useState(false);

  const currentTurn = chessState?.turn || 1;
  const logs = chessState?.logs || [];

  const tacticalCards = [
    {
      id: "berm",
      title: "Deploy Mobile Levee Berm",
      unit: "Engineering",
      icon: Wrench,
      cost: "2 Command Points",
      effect: "Fortifies riverbank by +1.2m and prevents flood expansion into Zone B transit corridor.",
      bestZone: "C"
    },
    {
      id: "recon",
      title: "Airdrop Tactical Comms Relay & Drone",
      unit: "Fire / Rescue",
      icon: Radio,
      cost: "1 Command Point",
      effect: "Penetrates Zone E delta blackout, restores telemetry, and initiates amphibious civilian evacuation.",
      bestZone: "E"
    },
    {
      id: "triage",
      title: "Deploy Mobile Surgical Trauma Pod",
      unit: "Medical",
      icon: Activity,
      cost: "2 Command Points",
      effect: "Stabilizes South General Hospital trauma queue and cuts local mortality risk by 28%.",
      bestZone: "D"
    },
    {
      id: "evac",
      title: "Reverse-Flow Traffic Arterial Detour",
      unit: "Logistics",
      icon: Truck,
      cost: "1 Command Point",
      effect: "Clears congested Zone B bottlenecks to create dedicated rapid emergency vehicle corridor.",
      bestZone: "B"
    }
  ];

  const handleExecute = async () => {
    if (!selectedAction) return;
    setLoading(true);
    await onChessAction(selectedAction.title, targetZone);
    setLoading(false);
    setSelectedAction(null);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(4, 7, 12, 0.88)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="hud-panel hud-bracket" style={{ width: '920px', maxWidth: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', background: '#0a0e17', border: '1px solid rgba(6, 182, 212, 0.4)', borderRadius: '6px', overflow: 'hidden' }}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.9)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Swords size={20} color="#f59e0b" />
            <div>
              <h2 className="font-hud" style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '0.08em', color: '#f8fafc', margin: 0 }}>
                DISASTER CHESS // TACTICAL CRISIS SIMULATOR
              </h2>
              <span className="font-mono" style={{ fontSize: '11px', color: '#94a3b8' }}>
                TURN-BASED CRISIS EVOLUTION ENGINE · TURN {currentTurn} OF 5
              </span>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', padding: '16px', flex: 1, overflowY: 'auto' }}>
          
          {/* Left Column: Action Cards Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="font-hud" style={{ fontSize: '13px', fontWeight: '700', color: '#67e8f9' }}>
                SELECT COMMAND COUNTERMEASURE:
              </span>
              <span className="font-mono" style={{ fontSize: '11px', color: '#94a3b8' }}>
                Target:
                <select 
                  value={targetZone} 
                  onChange={(e) => setTargetZone(e.target.value)}
                  style={{ marginLeft: '6px', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '2px 6px', borderRadius: '3px', fontFamily: 'var(--font-mono)' }}
                >
                  <option value="A">Zone A</option>
                  <option value="B">Zone B</option>
                  <option value="C">Zone C</option>
                  <option value="D">Zone D</option>
                  <option value="E">Zone E</option>
                </select>
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tacticalCards.map(card => {
                const Icon = card.icon;
                const isSelected = selectedAction?.id === card.id;

                return (
                  <div
                    key={card.id}
                    onClick={() => { setSelectedAction(card); setTargetZone(card.bestZone); }}
                    style={{
                      background: isSelected ? 'rgba(6, 182, 212, 0.16)' : 'rgba(15, 23, 42, 0.75)',
                      border: isSelected ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '4px',
                      padding: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Icon size={16} color={isSelected ? '#22d3ee' : '#cbd5e1'} />
                        <span className="font-hud" style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc' }}>
                          {card.title}
                        </span>
                      </div>
                      <span className="badge-status badge-stable" style={{ fontSize: '9px', padding: '1px 6px' }}>
                        {card.unit}
                      </span>
                    </div>

                    <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#94a3b8', lineHeight: 1.3 }}>
                      {card.effect}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '10px', color: '#64748b' }}>
                      <span>Cost: {card.cost}</span>
                      <span style={{ color: '#38bdf8' }}>Recommended: Zone {card.bestZone}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Execute Turn Button */}
            <button
              className="btn-hud btn-hud-primary"
              onClick={handleExecute}
              disabled={!selectedAction || loading}
              style={{ padding: '10px', fontSize: '13px', marginTop: '6px' }}
            >
              <Play size={16} /> EXECUTE TURN {currentTurn} TACTICAL MOVE
            </button>
          </div>

          {/* Right Column: Disaster Board Logs & Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderLeft: '1px solid rgba(255,255,255,0.08)', paddingLeft: '16px' }}>
            <span className="font-hud" style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc' }}>
              CRISIS PROGRESSION LOGS:
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
              {logs.map((log, idx) => (
                <div key={idx} style={{ background: 'rgba(12, 17, 26, 0.9)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '4px', padding: '8px 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#67e8f9', marginBottom: '3px' }} className="font-mono">
                    <span>TURN {log.turn}</span>
                    <span>{log.playerAction ? "RESOLVED" : "IN PROGRESS"}</span>
                  </div>
                  {log.playerAction && (
                    <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#34d399', fontWeight: '600' }}>
                      ▶ {log.playerAction}
                    </p>
                  )}
                  <p style={{ margin: 0, fontSize: '11px', color: '#fca5a5' }}>
                    ⚡ {log.disasterEvolution || log.text}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                City state auto-evolves with each turn.
              </span>
              <button 
                className="btn-hud" 
                onClick={onReset} 
                style={{ fontSize: '11px', padding: '3px 8px' }}
              >
                Reset Match
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
