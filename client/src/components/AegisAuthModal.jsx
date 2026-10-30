import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Key, 
  AlertCircle, 
  X, 
  ChevronRight, 
  CheckCircle2, 
  Building2, 
  BadgeAlert,
  Radio
} from 'lucide-react';
import { loginUser, registerUser } from '../services/api';

export default function AegisAuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  defaultTab = 'login' // 'login' | 'register'
}) {
  const [tab, setTab] = useState(defaultTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('COMMANDER');
  const [organization, setOrganization] = useState('Chandigarh Emergency Response Corps');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await loginUser({ email, password });
        if (res.token && res.user) {
          localStorage.setItem('aegis_auth_token', res.token);
          setSuccessMsg(`Welcome back, ${res.user.role} ${res.user.name}`);
          setTimeout(() => {
            onAuthSuccess(res.user, res.organization);
            onClose();
          }, 800);
        }
      } else {
        const res = await registerUser({
          name,
          email,
          password,
          role,
          organizationId: organization
        });
        if (res.token && res.user) {
          localStorage.setItem('aegis_auth_token', res.token);
          setSuccessMsg(`Commission complete. Logged in as ${res.user.name}`);
          setTimeout(() => {
            onAuthSuccess(res.user, res.organization);
            onClose();
          }, 800);
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (type) => {
    setError(null);
    if (type === 'commander') {
      setEmail('commander.vaid@aegis.gov');
      setPassword('AegisTacticalPass2026');
      setName('Commander Shreyas Vaid');
      setRole('COMMANDER');
    } else if (type === 'analyst') {
      setEmail('analyst.sharma@aegis.gov');
      setPassword('AegisTacticalPass2026');
      setName('Analyst Priya Sharma');
      setRole('ANALYST');
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
          maxWidth: '480px',
          background: 'linear-gradient(175deg, rgba(14, 27, 21, 0.95) 0%, rgba(8, 13, 10, 0.98) 100%)',
          border: '1px solid rgba(214, 198, 165, 0.28)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(214, 198, 165, 0.2)',
          borderRadius: '8px',
          overflow: 'hidden',
          animation: 'fadeIn 0.25s ease-out'
        }}
      >
        {/* Header Ribbon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid rgba(214, 198, 165, 0.16)',
          background: 'rgba(111, 148, 125, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              background: 'rgba(111, 148, 125, 0.2)',
              border: '1px solid rgba(214, 198, 165, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D6C6A5'
            }}>
              <ShieldCheck size={16} />
            </div>
            <div>
              <div className="font-hud" style={{ fontSize: '13px', letterSpacing: '0.12em', color: '#EAE5D8', fontWeight: '800' }}>
                AEGIS 2.0 ACCESS PORTAL
              </div>
              <div className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4' }}>
                EMERGENCY INTELLIGENCE SECURITY CLEARANCE
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
              borderRadius: '4px',
              display: 'flex'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderBottom: '1px solid rgba(214, 198, 165, 0.14)',
          background: 'rgba(0, 0, 0, 0.25)'
        }}>
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); }}
            style={{
              padding: '10px 14px',
              background: tab === 'login' ? 'rgba(111, 148, 125, 0.14)' : 'transparent',
              border: 'none',
              borderBottom: tab === 'login' ? '2px solid #D6C6A5' : '2px solid transparent',
              color: tab === 'login' ? '#EAE5D8' : '#6F947D',
              fontSize: '11px',
              fontFamily: 'monospace',
              fontWeight: tab === 'login' ? '700' : '500',
              cursor: 'pointer',
              letterSpacing: '0.08em',
              transition: 'all 0.18s ease'
            }}
          >
            OPERATOR LOGIN
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(null); }}
            style={{
              padding: '10px 14px',
              background: tab === 'register' ? 'rgba(111, 148, 125, 0.14)' : 'transparent',
              border: 'none',
              borderBottom: tab === 'register' ? '2px solid #D6C6A5' : '2px solid transparent',
              color: tab === 'register' ? '#EAE5D8' : '#6F947D',
              fontSize: '11px',
              fontFamily: 'monospace',
              fontWeight: tab === 'register' ? '700' : '500',
              cursor: 'pointer',
              letterSpacing: '0.08em',
              transition: 'all 0.18s ease'
            }}
          >
            REGISTER OPERATOR
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 22px' }}>
          
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 12px',
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

          {successMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 12px',
              marginBottom: '16px',
              borderRadius: '4px',
              background: 'rgba(111, 148, 125, 0.22)',
              border: '1px solid rgba(111, 148, 125, 0.6)',
              color: '#D1FAE5',
              fontSize: '11px',
              fontFamily: 'monospace'
            }}>
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {tab === 'register' && (
            <>
              <div style={{ marginBottom: '14px' }}>
                <label className="font-mono" style={{ display: 'block', fontSize: '10px', color: '#9FB5A4', marginBottom: '5px', letterSpacing: '0.06em' }}>
                  OPERATOR CALLSIGN / FULL NAME
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={14} color="#6F947D" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Commander Shreyas Vaid"
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 32px',
                      background: 'rgba(8, 13, 10, 0.75)',
                      border: '1px solid rgba(214, 198, 165, 0.22)',
                      borderRadius: '4px',
                      color: '#EAE5D8',
                      fontSize: '12px',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <div>
                  <label className="font-mono" style={{ display: 'block', fontSize: '10px', color: '#9FB5A4', marginBottom: '5px', letterSpacing: '0.06em' }}>
                    OPERATIONAL ROLE
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: 'rgba(8, 13, 10, 0.85)',
                      border: '1px solid rgba(214, 198, 165, 0.22)',
                      borderRadius: '4px',
                      color: '#D6C6A5',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="COMMANDER">COMMANDER</option>
                    <option value="ANALYST">ANALYST</option>
                    <option value="FIELD_OPERATOR">FIELD OPERATOR</option>
                    <option value="VIEWER">VIEWER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="font-mono" style={{ display: 'block', fontSize: '10px', color: '#9FB5A4', marginBottom: '5px', letterSpacing: '0.06em' }}>
                    ORGANIZATION / JURISDICTION
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Building2 size={13} color="#6F947D" style={{ position: 'absolute', left: '8px', top: '10px' }} />
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 8px 8px 26px',
                        background: 'rgba(8, 13, 10, 0.75)',
                        border: '1px solid rgba(214, 198, 165, 0.22)',
                        borderRadius: '4px',
                        color: '#EAE5D8',
                        fontSize: '11px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label className="font-mono" style={{ display: 'block', fontSize: '10px', color: '#9FB5A4', marginBottom: '5px', letterSpacing: '0.06em' }}>
              SECURE EMAIL / CLEARANCE IDENTIFIER
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} color="#6F947D" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="commander.vaid@aegis.gov"
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  background: 'rgba(8, 13, 10, 0.75)',
                  border: '1px solid rgba(214, 198, 165, 0.22)',
                  borderRadius: '4px',
                  color: '#EAE5D8',
                  fontSize: '12px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label className="font-mono" style={{ display: 'block', fontSize: '10px', color: '#9FB5A4', marginBottom: '5px', letterSpacing: '0.06em' }}>
              OPERATOR PASSKEY (MIN 6 CHARS)
            </label>
            <div style={{ position: 'relative' }}>
              <Key size={14} color="#6F947D" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 32px',
                  background: 'rgba(8, 13, 10, 0.75)',
                  border: '1px solid rgba(214, 198, 165, 0.22)',
                  borderRadius: '4px',
                  color: '#EAE5D8',
                  fontSize: '12px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Quick-Fill Helper for Testing & Demos */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            padding: '8px 10px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '4px',
            border: '1px dashed rgba(214, 198, 165, 0.18)'
          }}>
            <span className="font-mono" style={{ fontSize: '9px', color: '#9FB5A4' }}>
              DEMO CREDENTIALS:
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => handleQuickFill('commander')}
                className="font-mono"
                style={{
                  fontSize: '9px',
                  padding: '3px 8px',
                  background: 'rgba(111, 148, 125, 0.15)',
                  border: '1px solid rgba(111, 148, 125, 0.35)',
                  color: '#D6C6A5',
                  borderRadius: '2px',
                  cursor: 'pointer'
                }}
              >
                COMMANDER
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('analyst')}
                className="font-mono"
                style={{
                  fontSize: '9px',
                  padding: '3px 8px',
                  background: 'rgba(111, 148, 125, 0.15)',
                  border: '1px solid rgba(111, 148, 125, 0.35)',
                  color: '#D6C6A5',
                  borderRadius: '2px',
                  cursor: 'pointer'
                }}
              >
                ANALYST
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className="btn-command-primary"
            style={{
              width: '100%',
              padding: '10px 14px',
              fontSize: '12px',
              letterSpacing: '0.1em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <span>VERIFYING CREDENTIALS...</span>
            ) : tab === 'login' ? (
              <>
                <span>AUTHENTICATE & ENTER SYSTEM</span>
                <ChevronRight size={14} />
              </>
            ) : (
              <>
                <span>COMMISSION & ISSUE CLEARANCE</span>
                <ChevronRight size={14} />
              </>
            )}
          </button>

          {/* Security Notice */}
          <div style={{ textAlign: 'center', marginTop: '14px' }}>
            <span className="font-mono" style={{ fontSize: '9px', color: '#6F947D' }}>
              AUTHENTICATED VIA CRYPTOGRAPHIC HASH · ROLE-ENFORCED ACCESS
            </span>
          </div>

        </form>
      </div>
    </div>
  );
}
