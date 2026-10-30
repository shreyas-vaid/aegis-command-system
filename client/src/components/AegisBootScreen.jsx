import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShieldAlert, Terminal, CheckCircle2, AlertTriangle, ArrowRight, FastForward, Lock } from 'lucide-react';

export default function AegisBootScreen({
  isOffline = false,
  currentUser = null,
  onComplete,
  onOpenAuth
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const terminalBottomRef = useRef(null);

  // Terminal sequence lines definition
  const sequence = [
    { type: 'header', text: 'AEGIS COMMAND SYSTEM // DEFCON TACTICAL OS v2.0' },
    { type: 'cmd', text: '> INITIALIZING COMMAND ENVIRONMENT...' },
    { type: 'ok', text: '[OK] CORE TACTICAL KERNEL INITIALIZED' },
    { type: 'cmd', text: '> ESTABLISHING SECURE CONNECTION...' },
    { 
      type: isOffline ? 'warn' : 'ok', 
      text: isOffline 
        ? '[WARN] REMOTE API OFFLINE // LOCAL DEMO SIMULATION PROTOCOL ACTIVE' 
        : '[OK] SECURE TELEMETRY LINK VERIFIED // 256-BIT ENCRYPTED REST SERVICE' 
    },
    { type: 'cmd', text: '> VERIFYING OPERATOR CREDENTIALS...' },
    { 
      type: 'ok', 
      text: currentUser 
        ? `[OK] OPERATOR VERIFIED // ${currentUser.role} ${currentUser.name}` 
        : '[OK] IDENTITY VERIFICATION COMPLETE // TACTICAL GUEST CLEARANCE' 
    },
    { type: 'cmd', text: '> SYNCHRONIZING OPERATIONAL MODULES...' },
    { type: 'sub', text: '  [OK] MISSION CONTROL & ESCALATION DIRECTIVES' },
    { type: 'sub', text: '  [OK] DISASTER INTELLIGENCE & SENSOR MATRIX' },
    { type: 'sub', text: '  [OK] RESOURCE FLEET DISPATCH & TELEMETRY' },
    { type: 'sub', text: '  [OK] BAYESIAN SIMULATION & CASUALTY PROJECTION ENGINE' },
    { type: 'ready', text: '> ALL SYSTEMS NOMINAL // AEGIS COMMAND SYSTEM READY' }
  ];

  const handleFinish = useCallback(() => {
    try {
      sessionStorage.setItem('aegis_boot_completed', 'true');
    } catch {
      // Ignore storage errors in restricted iframe
    }
    setIsExiting(true);
    setTimeout(() => {
      onComplete?.();
    }, 380);
  }, [onComplete]);

  // Fast skip function
  const handleSkip = useCallback(() => {
    handleFinish();
  }, [handleFinish]);

  // Auto-advance terminal lines sequentially
  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (prefersReducedMotion) {
      setStepIndex(sequence.length);
      setProgress(100);
      setIsReady(true);
      return;
    }

    if (stepIndex < sequence.length) {
      const delay = stepIndex === 0 ? 160 : stepIndex === sequence.length - 1 ? 260 : 120;
      const timer = setTimeout(() => {
        setStepIndex((prev) => prev + 1);
        setProgress(Math.min(100, Math.round(((stepIndex + 1) / sequence.length) * 100)));
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setIsReady(true);
      setProgress(100);
    }
  }, [stepIndex, sequence.length]);

  // Keyboard navigation: Enter or Space to enter, Escape to skip immediately
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (isReady) {
          handleFinish();
        } else {
          // Fast-forward to end on Enter
          setStepIndex(sequence.length);
          setProgress(100);
          setIsReady(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReady, handleFinish, handleSkip, sequence.length]);

  // Auto-scroll terminal lines smoothly
  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [stepIndex]);

  return (
    <div 
      className={`aegis-boot-container ${isExiting ? 'boot-exit' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="AEGIS Command System Initialization"
    >
      {/* Subtle CRT / Cyber scanline effect */}
      <div className="aegis-boot-scanlines" />

      {/* Top Controls Header */}
      <div className="aegis-boot-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', boxShadow: '0 0 8px #EF4444' }} />
          <span className="font-mono" style={{ fontSize: '11px', color: '#94A3B8', letterSpacing: '0.12em' }}>
            AEGIS-OS // BOOT_SEQUENCE.SYS
          </span>
        </div>

        <button
          onClick={handleSkip}
          className="aegis-boot-skip-btn"
          title="Skip initialization [ESC]"
        >
          <FastForward size={12} />
          <span>SKIP [ESC]</span>
        </button>
      </div>

      {/* Main Terminal Shell */}
      <div className="aegis-boot-window">
        {/* Decorative Corner Brackets */}
        <div className="boot-corner-tl" />
        <div className="boot-corner-tr" />
        <div className="boot-corner-bl" />
        <div className="boot-corner-br" />

        {/* Shield Emblem & Header */}
        <div className="aegis-boot-hero">
          <div className="aegis-boot-shield-wrap">
            <ShieldAlert size={36} color="#00F0FF" />
            <div className="boot-shield-glow" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="font-hud" style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '0.15em', color: '#FFFFFF' }}>
                AEGIS COMMAND
              </span>
              <span style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                fontWeight: '700',
                color: '#EF4444',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                padding: '1px 6px',
                borderRadius: '2px',
                letterSpacing: '0.08em'
              }}>
                DEFCON 2
              </span>
            </div>
            <span className="font-mono" style={{ fontSize: '11px', color: '#94A3B8', letterSpacing: '0.1em' }}>
              AI EMERGENCY GOVERNANCE & TACTICAL INTELLIGENCE
            </span>
          </div>
        </div>

        {/* Terminal Screen Console */}
        <div className="aegis-boot-terminal-body">
          {sequence.slice(0, stepIndex).map((line, idx) => {
            let textColor = '#CBD5E1';
            let icon = null;

            if (line.type === 'header') {
              textColor = '#00F0FF';
            } else if (line.type === 'cmd') {
              textColor = '#94A3B8';
            } else if (line.type === 'ok') {
              textColor = '#10B981';
              icon = <CheckCircle2 size={13} style={{ display: 'inline', marginRight: '6px' }} />;
            } else if (line.type === 'warn') {
              textColor = '#F59E0B';
              icon = <AlertTriangle size={13} style={{ display: 'inline', marginRight: '6px' }} />;
            } else if (line.type === 'sub') {
              textColor = '#38BDF8';
            } else if (line.type === 'ready') {
              textColor = '#00F0FF';
            }

            return (
              <div 
                key={idx} 
                className="aegis-boot-line" 
                style={{ color: textColor }}
              >
                {icon}
                <span>{line.text}</span>
              </div>
            );
          })}

          {/* Active blinking terminal cursor */}
          {!isReady && (
            <div className="aegis-boot-cursor-line">
              <span style={{ color: '#00F0FF' }}>&gt;</span>
              <span className="aegis-boot-cursor">█</span>
            </div>
          )}

          <div ref={terminalBottomRef} />
        </div>

        {/* Minimal Progress Indicator */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span className="font-mono" style={{ fontSize: '10px', color: '#64748B', letterSpacing: '0.1em' }}>
              INITIALIZATION_PROGRESS:
            </span>
            <span className="font-mono" style={{ fontSize: '10px', color: progress === 100 ? '#00F0FF' : '#94A3B8', fontWeight: '700' }}>
              {progress}% {progress === 100 ? '// NOMINAL' : ''}
            </span>
          </div>

          <div className="aegis-boot-progress-track">
            <div 
              className="aegis-boot-progress-fill" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>

        {/* Action Prompt when Ready */}
        <div className="aegis-boot-actions">
          {isReady ? (
            <div style={{ display: 'flex', gap: '12px', width: '100%', flexWrap: 'wrap' }}>
              <button
                onClick={handleFinish}
                className="aegis-boot-enter-btn"
                autoFocus
              >
                <span>[ ENTER COMMAND CENTRE ]</span>
                <ArrowRight size={16} />
              </button>

              {!currentUser && onOpenAuth && (
                <button
                  onClick={() => {
                    handleFinish();
                    onOpenAuth();
                  }}
                  className="aegis-boot-auth-btn"
                >
                  <Lock size={14} />
                  <span>OPERATOR LOGIN</span>
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <span className="aegis-pulse-dot" />
              <span>SYNCHRONIZING TACTICAL DATA ARRAYS... (PRESS ENTER TO FAST-FORWARD)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
