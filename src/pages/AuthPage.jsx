// ═══════════════════════════════════════════════════════
//  ScoutAI — Auth Page v3
//  Login  → Dashboard (directly)
//  Signup → ProfileSetupPage (step 2 of 3)
// ═══════════════════════════════════════════════════════
import { useState } from 'react';
import { User, Users, Eye, EyeOff, Shield } from 'lucide-react';

export default function AuthPage({ role, onSignupSuccess, onLoginSuccess, onBack }) {
  const [mode,     setMode]     = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [form,     setForm]     = useState({ name: '', email: '', password: '', confirmPass: '' });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const isPlayer = role === 'player';
  const color    = isPlayer ? 'var(--green)' : 'var(--cyan)';
  const colorDim = isPlayer ? 'var(--green-dim)' : 'var(--cyan-dim)';
  const upd = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const validate = () => {
    if (!form.email.trim() || !form.email.includes('@')) return 'Valid email required.';
    if (!form.password || form.password.length < 4)      return 'Password must be ≥ 4 characters.';
    if (mode === 'signup') {
      if (!form.name.trim())                             return 'Full name is required.';
      if (form.password !== form.confirmPass)            return 'Passwords do not match.';
    }
    return null;
  };

  const handleSubmit = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(''); setLoading(true);

    // ── 🔌 Firebase Auth Integration Point ──────────────
    // import { auth } from '../firebase';
    // import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
    //
    // if (mode === 'login') {
    //   signInWithEmailAndPassword(auth, form.email, form.password)
    //     .then(cred => onLoginSuccess({ uid: cred.user.uid, email: form.email, role }))
    //     .catch(err => { setError(err.message); setLoading(false); });
    // } else {
    //   createUserWithEmailAndPassword(auth, form.email, form.password)
    //     .then(cred => onSignupSuccess({ uid: cred.user.uid, email: form.email, name: form.name, role }))
    //     .catch(err => { setError(err.message); setLoading(false); });
    // }
    // ────────────────────────────────────────────────────

    setTimeout(() => {
      setLoading(false);
      if (mode === 'login') {
        onLoginSuccess({ name: isPlayer ? 'Demo Athlete' : 'Demo Coach', email: form.email, role, region: 'Delhi', age: '17', position: 'Midfielder', height: '170', weight: '65', experience: '3' });
      } else {
        onSignupSuccess({ name: form.name, email: form.email, role });
      }
    }, 800);
  };

  const STEPS = ['Account', 'Profile', 'Dashboard'];

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 30%, ${isPlayer ? 'rgba(0,255,135,0.05)' : 'rgba(0,212,255,0.05)'} 0%, transparent 65%)`, pointerEvents: 'none' }} />
      <div className="grid-dots" style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none' }} />

      <div className="fade-up" style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 40, gap: 10 }}>
          <img
            src="/logo.jpeg"
            alt="ScoutAI logo"
            style={{ height:48, width:'auto', borderRadius:12, display:'block' }}
          />
          <span style={{ fontFamily: 'var(--font-head)', fontSize: 24, letterSpacing: 3 }}>SCOUT AI</span>
        </div>

        {/* Stepper — only on signup */}
        {mode === 'signup' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: i === 0 ? color : 'rgba(255,255,255,0.06)', border: `2px solid ${i === 0 ? color : 'var(--border2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: i === 0 ? '#000' : 'var(--muted)' }}>{i + 1}</div>
                  <span style={{ fontSize: 10, color: i === 0 ? color : 'var(--muted)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>{s}</span>
                </div>
                {i < STEPS.length - 1 && <div style={{ width: 56, height: 2, background: 'var(--border)', margin: '0 8px', marginBottom: 18 }} />}
              </div>
            ))}
          </div>
        )}

        {/* Portal badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, background: `${color}12`, border: `1px solid ${color}25`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isPlayer ? <User size={26} color={color} /> : <Users size={26} color={color} />}
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 30, letterSpacing: 1.5, lineHeight: 1 }}>
              {isPlayer ? 'ATHLETE PORTAL' : 'COACH PORTAL'}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--muted2)', marginTop: 4 }}>
              {mode === 'login' ? 'Welcome back — sign in to continue' : 'Step 1 of 3 — create your account'}
            </p>
          </div>
        </div>

        {/* Tab toggle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, marginBottom: 26 }}>
          {[['login','Sign In'], ['signup','Sign Up']].map(([m, lbl]) => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              style={{ background: mode === m ? color : 'transparent', color: mode === m ? '#000' : 'var(--muted2)', border: 'none', borderRadius: 8, padding: '11px', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}>
              {lbl}
            </button>
          ))}
        </div>

        {/* Form fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'signup' && (
            <div>
              <label className="form-label">Full Name</label>
              <input className="input-field" placeholder="Your full name" value={form.name} onChange={upd('name')} />
            </div>
          )}

          <div>
            <label className="form-label">Email Address</label>
            <input className="input-field" type="email" placeholder="your@email.com" value={form.email} onChange={upd('email')} />
          </div>

          <div>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="input-field" type={showPass ? 'text' : 'password'} placeholder="Min. 4 characters" value={form.password} onChange={upd('password')} style={{ paddingRight: 48 }} />
              <button onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted2)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input className="input-field" type={showConf ? 'text' : 'password'} placeholder="Re-enter password" value={form.confirmPass} onChange={upd('confirmPass')} style={{ paddingRight: 48 }} />
                <button onClick={() => setShowConf(p => !p)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted2)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.3)', borderRadius: 8, padding: '11px 14px', fontSize: 14, color: 'var(--red)' }}>
              {error}
            </div>
          )}

          <button className="btn-primary" onClick={handleSubmit} disabled={loading}
            style={{ marginTop: 4, background: `linear-gradient(135deg,${color},${colorDim})`, opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer', width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}>
            {loading
              ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="spin" style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,0.3)', borderTop: '2px solid #000', borderRadius: '50%', display: 'inline-block' }} /> Processing...</span>
              : mode === 'login' ? 'Sign In →' : 'Create Account → Setup Profile'
            }
          </button>
        </div>

        {/* Back */}
        <div style={{ textAlign: 'center', marginTop: 22 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--muted2)', cursor: 'pointer', fontSize: 14 }}>← Back to home</button>
        </div>

        {/* Demo note */}
        <div style={{ marginTop: 16, padding: '12px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 10, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
            <strong style={{ color }}>Demo mode active.</strong> Any email + any password works.{' '}
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 4 }}>
              <Shield size={11} /> Firebase Auth integration points are included in comments.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
