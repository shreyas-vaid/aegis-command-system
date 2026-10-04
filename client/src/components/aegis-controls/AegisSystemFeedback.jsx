import React from 'react';
import { Terminal, ShieldAlert } from 'lucide-react';

export default function AegisSystemFeedback({
  activeLog = null
}) {
  if (!activeLog) return null;

  const isAlert = activeLog.type === 'alert' || activeLog.type === 'warning';

  return (
    <div style={{
      position: 'fixed',
      top: '68px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      background: isAlert ? 'rgba(42, 16, 16, 0.92)' : 'rgba(14, 27, 21, 0.92)',
      border: `1px solid ${isAlert ? 'rgba(217, 83, 79, 0.6)' : 'rgba(111, 148, 125, 0.5)'}`,
      borderLeft: `4px solid ${isAlert ? '#D9534F' : '#D6C6A5'}`,
      padding: '8px 16px',
      borderRadius: '4px',
      boxShadow: `0 8px 30px ${isAlert ? 'rgba(217, 83, 79, 0.35)' : 'rgba(14, 27, 21, 0.7)'}, inset 0 1px 1px rgba(234, 229, 216, 0.12)`,
      backdropFilter: 'blur(16px)',
      userSelect: 'none',
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <Terminal size={14} color={isAlert ? '#D9534F' : '#D6C6A5'} />
      <span className="font-mono" style={{
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '0.06em',
        color: isAlert ? '#FCA5A5' : '#EAE5D8'
      }}>
        {activeLog.msg.startsWith('>') ? activeLog.msg : `> ${activeLog.msg}`}
      </span>
      <span className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4' }}>
        [SYS_ACK]
      </span>
    </div>
  );
}
