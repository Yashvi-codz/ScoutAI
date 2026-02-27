// ═══════════════════════════════════════════════════════
//  ScoutAI — Profile Setup Page (Step 2 of 3)
//  Shown after signup — collects full profile details
//  Different fields for Player vs Coach
// ═══════════════════════════════════════════════════════
import { useState } from 'react';
import { User, Users, MapPin, Ruler, Weight, Calendar, Briefcase, ChevronRight, CheckCircle, Star } from 'lucide-react';

const INDIA_STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jammu & Kashmir','Jharkhand','Karnataka','Kerala','Ladakh','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'];

const POSITIONS = ['Striker','Centre-Forward','Winger','Attacking Midfielder','Central Midfielder','Defensive Midfielder','Full-Back','Wing-Back','Centre-Back','Goalkeeper'];
const CATEGORIES = ['U-13 (Under 13)','U-15 (Under 15)','U-17 (Under 17)','U-19 (Under 19)','U-21 (Under 21)','Senior (Open)'];
const EXPERIENCE_LEVELS = ['Beginner (< 1 year)','Developing (1–3 years)','Intermediate (3–5 years)','Advanced (5–8 years)','Semi-Professional (8+ years)'];
const COACH_SPECIALTIES = ['Sprint & Speed Training','Agility & Footwork','Goalkeeping','Defensive Tactics','Attacking Play','Ball Technique & Passing','Youth Development','Physical Conditioning','Match Analysis','General Football'];
const COACH_EXPERIENCE = ['0–2 years','3–5 years','6–10 years','10+ years'];
const LANGUAGES = ['Hindi','English','Bengali','Telugu','Marathi','Tamil','Gujarati','Kannada','Malayalam','Punjabi','Odia','Assamese'];

export default function ProfileSetupPage({ partialUser, onComplete }) {
  const isPlayer = partialUser.role === 'player';
  const color    = isPlayer ? 'var(--green)' : 'var(--cyan)';
  const colorDim = isPlayer ? 'var(--green-dim)' : 'var(--cyan-dim)';

  const [form, setForm] = useState({
    // Common
    region: '', city: '', language: 'Hindi',
    // Player specific
    age: '', dob: '', height: '', weight: '', position: '', category: '', experience: '',
    bio: '', school: '', playingFor: '', dominantFoot: 'Right',
    // Coach specific
    specialty: '', coachExperience: '', qualifications: '', currentClub: '', phone: '',
    coachBio: '',
  });
  const [loading, setLoading]   = useState(false);
  const [errors,  setErrors]    = useState({});
  const [step,    setInnerStep] = useState(1); // 1 = basic | 2 = athletic | 3 = additional

  const upd = f => e => setForm(p => ({ ...p, [f]: e.target.value }));
  const sel = f => v => setForm(p => ({ ...p, [f]: v }));

  const validateStep = () => {
    const errs = {};
    if (step === 1) {
      if (!form.region) errs.region = 'State is required';
      if (isPlayer && !form.age) errs.age = 'Age is required';
      if (!isPlayer && !form.specialty) errs.specialty = 'Specialty is required';
    }
    if (step === 2 && isPlayer) {
      if (!form.category) errs.category = 'Category is required';
      if (!form.position) errs.position = 'Position is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < 3) { setInnerStep(s => s + 1); return; }
    handleFinish();
  };

  const handleFinish = () => {
    setLoading(true);
    // ── Firestore Integration Point ──
    // import { db } from '../firebase';
    // import { doc, setDoc } from 'firebase/firestore';
    // await setDoc(doc(db, 'users', partialUser.uid), {
    //   ...partialUser, ...form, createdAt: new Date().toISOString()
    // });
    setTimeout(() => {
      setLoading(false);
      onComplete({ ...partialUser, ...form });
    }, 700);
  };

  const STEPS_LABELS = isPlayer
    ? ['Basic Info', 'Football Profile', 'Additional']
    : ['Basic Info', 'Coaching Details', 'Additional'];

  const FieldRow = ({ label, error, children }) => (
    <div>
      <label className="form-label">{label}</label>
      {children}
      {error && <span style={{ fontSize: 12, color: 'var(--red)', marginTop: 4, display: 'block' }}>{error}</span>}
    </div>
  );

  const Chip = ({ label, selected, onClick }) => (
    <div onClick={onClick} style={{ padding: '9px 18px', border: `1px solid ${selected ? color : 'var(--border2)'}`, borderRadius: 99, background: selected ? `${color}14` : 'var(--surface)', color: selected ? color : 'var(--text2)', fontSize: 13, fontWeight: selected ? 700 : 400, cursor: 'pointer', transition: 'all 0.2s', userSelect: 'none', whiteSpace: 'nowrap' }}>
      {label}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 20%, ${isPlayer ? 'rgba(0,255,135,0.04)' : 'rgba(0,212,255,0.04)'} 0%, transparent 65%)`, pointerEvents: 'none' }} />
      <div className="grid-dots" style={{ position: 'absolute', inset: 0, opacity: 0.25, pointerEvents: 'none' }} />

      <div className="fade-up" style={{ width: '100%', maxWidth: 600, position: 'relative', zIndex: 1 }}>

        {/* Logo + Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 36, gap: 10 }}>
          <img
            src="/logo.jpeg"
            alt="ScoutAI logo"
            style={{ height:44, width:'auto', borderRadius:12, display:'block' }}
          />
          <span style={{ fontFamily: 'var(--font-head)', fontSize: 22, letterSpacing: 3 }}>SCOUT AI</span>
        </div>

        {/* Outer stepper (Account → Profile → Dashboard) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
          {['Account', 'Profile', 'Dashboard'].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: i <= 1 ? color : 'rgba(255,255,255,0.06)', border: `2px solid ${i <= 1 ? color : 'var(--border2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: i <= 1 ? '#000' : 'var(--muted)' }}>
                  {i === 0 ? <CheckCircle size={16} /> : i + 1}
                </div>
                <span style={{ fontSize: 10, color: i <= 1 ? color : 'var(--muted)', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>{s}</span>
              </div>
              {i < 2 && <div style={{ width: 56, height: 2, background: i === 0 ? color : 'var(--border)', margin: '0 8px', marginBottom: 18 }} />}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '36px 40px' }}>
          {/* Card header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
            <div style={{ width: 50, height: 50, background: `${color}12`, border: `1px solid ${color}25`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isPlayer ? <User size={26} color={color} /> : <Users size={26} color={color} />}
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 26, letterSpacing: 1.5, lineHeight: 1 }}>
                SETUP YOUR PROFILE
              </h2>
              <p style={{ fontSize: 13, color: 'var(--muted2)', marginTop: 4 }}>
                Hello, {partialUser.name}! Complete your {isPlayer ? 'athlete' : 'coaching'} profile — Step 2 of 3
              </p>
            </div>
          </div>

          {/* Inner progress tabs */}
          <div style={{ display: 'flex', gap: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, marginBottom: 28 }}>
            {STEPS_LABELS.map((s, i) => (
              <button key={s} onClick={() => i < step && setInnerStep(i + 1)}
                style={{ flex: 1, padding: '9px 8px', borderRadius: 8, border: 'none', background: step === i + 1 ? color : 'transparent', color: step === i + 1 ? '#000' : step > i + 1 ? color : 'var(--muted)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 12, cursor: i < step ? 'pointer' : 'default', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                {step > i + 1 && <CheckCircle size={12} />}{s}
              </button>
            ))}
          </div>

          {/* ── PLAYER STEP 1: Basic Info ── */}
          {isPlayer && step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FieldRow label="Age" error={errors.age}>
                  <input className="input-field" type="number" placeholder="e.g. 17" min="8" max="40" value={form.age} onChange={upd('age')} />
                </FieldRow>
                <FieldRow label="Date of Birth">
                  <input className="input-field" type="date" value={form.dob} onChange={upd('dob')} />
                </FieldRow>
                <FieldRow label="Height (cm)">
                  <input className="input-field" type="number" placeholder="e.g. 170" value={form.height} onChange={upd('height')} />
                </FieldRow>
                <FieldRow label="Weight (kg)">
                  <input className="input-field" type="number" placeholder="e.g. 65" value={form.weight} onChange={upd('weight')} />
                </FieldRow>
              </div>
              <FieldRow label="State / Region" error={errors.region}>
                <select className="select-field" value={form.region} onChange={upd('region')}>
                  <option value="">Select state</option>
                  {INDIA_STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </FieldRow>
              <FieldRow label="City / District">
                <input className="input-field" placeholder="e.g. Gorakhpur" value={form.city} onChange={upd('city')} />
              </FieldRow>
              <FieldRow label="Preferred Language">
                <select className="select-field" value={form.language} onChange={upd('language')}>
                  {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                </select>
              </FieldRow>
            </div>
          )}

          {/* ── PLAYER STEP 2: Football Profile ── */}
          {isPlayer && step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
              <FieldRow label="Age Category" error={errors.category}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
                  {CATEGORIES.map(c => <Chip key={c} label={c} selected={form.category === c} onClick={() => sel('category')(c)} />)}
                </div>
              </FieldRow>

              <FieldRow label="Preferred Position" error={errors.position}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
                  {POSITIONS.map(p => <Chip key={p} label={p} selected={form.position === p} onClick={() => sel('position')(p)} />)}
                </div>
              </FieldRow>

              <FieldRow label="Dominant Foot">
                <div style={{ display: 'flex', gap: 10, marginTop: 2 }}>
                  {['Right', 'Left', 'Both'].map(f => <Chip key={f} label={f} selected={form.dominantFoot === f} onClick={() => sel('dominantFoot')(f)} />)}
                </div>
              </FieldRow>

              <FieldRow label="Experience Level">
                <select className="select-field" value={form.experience} onChange={upd('experience')}>
                  <option value="">Select experience</option>
                  {EXPERIENCE_LEVELS.map(e => <option key={e}>{e}</option>)}
                </select>
              </FieldRow>
            </div>
          )}

          {/* ── PLAYER STEP 3: Additional ── */}
          {isPlayer && step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <FieldRow label="School / College / Academy">
                <input className="input-field" placeholder="e.g. Delhi Public School" value={form.school} onChange={upd('school')} />
              </FieldRow>
              <FieldRow label="Currently Playing For (Team)">
                <input className="input-field" placeholder="e.g. Delhi FC U-17" value={form.playingFor} onChange={upd('playingFor')} />
              </FieldRow>
              <FieldRow label="Brief Bio (optional)">
                <textarea className="input-field" rows={3} placeholder="Tell coaches about yourself, your footballing journey..." value={form.bio} onChange={upd('bio')} />
              </FieldRow>
              <div style={{ padding: '14px 18px', background: `${color}08`, border: `1px solid ${color}20`, borderRadius: 12 }}>
                <div style={{ fontSize: 13, color, fontWeight: 700, marginBottom: 4 }}>✅ Almost there!</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>Your profile will be visible to verified coaches on ScoutAI. You can edit it anytime from your dashboard.</div>
              </div>
            </div>
          )}

          {/* ── COACH STEP 1: Basic Info ── */}
          {!isPlayer && step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <FieldRow label="State / Region" error={errors.region}>
                <select className="select-field" value={form.region} onChange={upd('region')}>
                  <option value="">Select state</option>
                  {INDIA_STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </FieldRow>
              <FieldRow label="City / District">
                <input className="input-field" placeholder="e.g. Chandigarh" value={form.city} onChange={upd('city')} />
              </FieldRow>
              <FieldRow label="Coaching Specialty" error={errors.specialty}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
                  {COACH_SPECIALTIES.map(s => <Chip key={s} label={s} selected={form.specialty === s} onClick={() => sel('specialty')(s)} />)}
                </div>
              </FieldRow>
              <FieldRow label="Preferred Language">
                <select className="select-field" value={form.language} onChange={upd('language')}>
                  {LANGUAGES.map(l => <option key={l}>{l}</option>)}
                </select>
              </FieldRow>
            </div>
          )}

          {/* ── COACH STEP 2: Coaching Details ── */}
          {!isPlayer && step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <FieldRow label="Years of Coaching Experience">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
                  {COACH_EXPERIENCE.map(e => <Chip key={e} label={e} selected={form.coachExperience === e} onClick={() => sel('coachExperience')(e)} />)}
                </div>
              </FieldRow>
              <FieldRow label="Qualifications / Certifications">
                <input className="input-field" placeholder="e.g. AIFF D-License, SAI Certified" value={form.qualifications} onChange={upd('qualifications')} />
              </FieldRow>
              <FieldRow label="Current Club / Academy">
                <input className="input-field" placeholder="e.g. Delhi FC Academy" value={form.currentClub} onChange={upd('currentClub')} />
              </FieldRow>
              <FieldRow label="Contact Phone (optional)">
                <input className="input-field" type="tel" placeholder="For athlete/parent inquiries" value={form.phone} onChange={upd('phone')} />
              </FieldRow>
            </div>
          )}

          {/* ── COACH STEP 3: Additional ── */}
          {!isPlayer && step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <FieldRow label="Coaching Bio">
                <textarea className="input-field" rows={4} placeholder="Describe your coaching philosophy, achievements, and what you look for in athletes..." value={form.coachBio} onChange={upd('coachBio')} />
              </FieldRow>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[['U-13','Under 13'],['U-15','Under 15'],['U-17','Under 17'],['U-19','Under 19'],['U-21','Under 21'],['Senior','Open']].map(([id, label]) => {
                  const key = `acceptsTier_${id}`;
                  return (
                    <div key={id} onClick={() => setForm(p => ({ ...p, [key]: !p[key] }))} style={{ padding: '10px', border: `1px solid ${form[key] ? 'rgba(0,212,255,0.35)' : 'var(--border)'}`, borderRadius: 10, cursor: 'pointer', background: form[key] ? 'rgba(0,212,255,0.06)' : 'var(--surface)', transition: 'all 0.2s', textAlign: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: form[key] ? 'var(--cyan)' : 'var(--text2)' }}>{id}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{label}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: '14px 18px', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.18)', borderRadius: 12 }}>
                <div style={{ fontSize: 13, color: 'var(--cyan)', fontWeight: 700, marginBottom: 4 }}>✅ Profile Ready!</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>Your coach profile will be reviewed and verified within 24–48 hours.</div>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 32 }}>
            <button onClick={() => step > 1 ? setInnerStep(s => s - 1) : null}
              style={{ visibility: step > 1 ? 'visible' : 'hidden' }}
              className="btn-ghost">← Previous</button>

            <button onClick={handleNext} className="btn-primary" disabled={loading}
              style={{ background: `linear-gradient(135deg,${color},${colorDim})`, padding: '13px 32px', opacity: loading ? 0.7 : 1 }}>
              {loading
                ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="spin" style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTop: '2px solid #000', borderRadius: '50%', display: 'inline-block' }} /> Saving...</span>
                : step < 3 ? <>Next <ChevronRight size={16} /></> : <>Go to Dashboard <ChevronRight size={16} /></>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
