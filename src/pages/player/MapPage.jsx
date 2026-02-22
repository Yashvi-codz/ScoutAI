// ═══════════════════════════════════════════════════════
//  ScoutAI — Find Coaching Page
//  Map + coaching centres + verified time slots
// ═══════════════════════════════════════════════════════

import { useState } from 'react';
import { MapPin, Clock, CheckCircle, Star, Filter, Calendar, Phone, Users, Navigation, ChevronRight, Shield } from 'lucide-react';
import { Avatar, SectionHeader } from '../../components/ui/SharedComponents';

// Mock coaching centres with coordinates (for a visual SVG map)
const COACHING_CENTRES = [
  {
    id: 'cc1', name: 'Delhi Football Academy', city: 'Delhi', region: 'Delhi',
    coach: 'Coach Ramesh Sharma', specialty: 'Speed & Agility', rating: 4.9, reviews: 128,
    verified: true, address: 'Jawaharlal Nehru Stadium, Delhi',
    distance: '2.4 km', students: 34, tierAccepted: ['A','B','C'],
    slots: [
      { day:'Mon', times: ['07:00','09:00','16:00','18:00'] },
      { day:'Wed', times: ['07:00','09:00','16:00'] },
      { day:'Fri', times: ['07:00','16:00','18:00'] },
      { day:'Sat', times: ['08:00','10:00','14:00'] },
    ],
    x: 62, y: 28,  // SVG % positions
  },
  {
    id: 'cc2', name: 'Chandigarh Sports Hub', city: 'Chandigarh', region: 'Punjab',
    coach: 'Coach Gurpreet Singh', specialty: 'Defensive Tactics', rating: 4.7, reviews: 86,
    verified: true, address: 'Sector 42, Chandigarh',
    distance: '8.1 km', students: 22, tierAccepted: ['B','C','D'],
    slots: [
      { day:'Tue', times: ['06:00','08:00','17:00'] },
      { day:'Thu', times: ['06:00','08:00','17:00'] },
      { day:'Sat', times: ['07:00','09:00','15:00'] },
    ],
    x: 55, y: 22,
  },
  {
    id: 'cc3', name: 'Kerala Football School', city: 'Kochi', region: 'Kerala',
    coach: 'Coach Pradeep Nair', specialty: 'Technical Skills & Passing', rating: 4.8, reviews: 201,
    verified: true, address: 'Marine Drive Ground, Kochi',
    distance: '5.8 km', students: 41, tierAccepted: ['A','B','C','D'],
    slots: [
      { day:'Mon', times: ['06:30','08:30','16:30','18:30'] },
      { day:'Wed', times: ['06:30','16:30','18:30'] },
      { day:'Fri', times: ['06:30','08:30','16:30'] },
      { day:'Sun', times: ['07:00','09:00','11:00'] },
    ],
    x: 57, y: 80,
  },
  {
    id: 'cc4', name: 'Mumbai FC Academy', city: 'Mumbai', region: 'Maharashtra',
    coach: 'Coach Anita Verma', specialty: 'Attacking Play & Technique', rating: 4.6, reviews: 94,
    verified: true, address: 'Cooperage Ground, Mumbai',
    distance: '12.3 km', students: 28, tierAccepted: ['A','B'],
    slots: [
      { day:'Tue', times: ['07:00','09:00','18:00'] },
      { day:'Thu', times: ['07:00','18:00'] },
      { day:'Sat', times: ['08:00','10:00','14:00','16:00'] },
    ],
    x: 46, y: 68,
  },
  {
    id: 'cc5', name: 'Kolkata School of Football', city: 'Kolkata', region: 'West Bengal',
    coach: 'Coach Subhas Mondal', specialty: 'Youth Development', rating: 4.5, reviews: 73,
    verified: true, address: 'Salt Lake Stadium, Kolkata',
    distance: '4.2 km', students: 19, tierAccepted: ['C','D'],
    slots: [
      { day:'Mon', times: ['08:00','10:00','17:00'] },
      { day:'Wed', times: ['08:00','17:00'] },
      { day:'Fri', times: ['08:00','10:00'] },
    ],
    x: 78, y: 52,
  },
];

const DAY_COLORS = { Mon:'var(--green)', Tue:'var(--cyan)', Wed:'var(--purple)', Thu:'var(--amber)', Fri:'var(--green)', Sat:'var(--gold)', Sun:'var(--red)' };

export default function MapPage({ user }) {
  const [selected,   setSelected]   = useState(COACHING_CENTRES[0]);
  const [activeDay,  setActiveDay]   = useState(null);
  const [bookedSlot, setBookedSlot]  = useState(null);
  const [filterTier, setFilterTier]  = useState('ALL');
  const [filterReg,  setFilterReg]   = useState('ALL');
  const [showBookConfirm, setShowBookConfirm] = useState(false);

  const regions = ['ALL', ...new Set(COACHING_CENTRES.map(c => c.region))];

  const filtered = COACHING_CENTRES.filter(c => {
    const tierOk = filterTier === 'ALL' || c.tierAccepted.includes(filterTier);
    const regOk  = filterReg  === 'ALL' || c.region === filterReg;
    return tierOk && regOk;
  });

  const handleBookSlot = (slot) => {
    setBookedSlot(slot);
    setShowBookConfirm(true);
    setTimeout(() => setShowBookConfirm(false), 2500);
  };

  const availableDays = selected?.slots.map(s => s.day) || [];

  return (
    <div className="page-pad">
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 36 }}>
        <h1 className="section-title">FIND COACHING</h1>
        <p className="section-subtitle">Verified coaching centres near you — browse locations, view slots, and book a session</p>
      </div>

      {/* Verification note */}
      <div className="fade-up card" style={{ marginBottom: 24, padding: '14px 20px', background: 'rgba(0,212,255,0.04)', borderColor: 'rgba(0,212,255,0.18)', animationDelay: '0.05s', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Shield size={18} color="var(--cyan)" />
        <span style={{ fontSize: 14, color: 'var(--text2)' }}>
          All coaching centres are <strong style={{ color: 'var(--cyan)' }}>verified by ScoutAI</strong>. Time slots are confirmed directly with coaches and updated in real-time.
        </span>
      </div>

      {/* Filters */}
      <div className="fade-up" style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', animationDelay: '0.08s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={14} color="var(--muted2)" />
          <span style={{ fontSize: 13, color: 'var(--muted2)', fontWeight: 600 }}>Filter:</span>
        </div>
        <select className="select-field" value={filterTier} onChange={e => setFilterTier(e.target.value)} style={{ width: 150 }}>
          <option value="ALL">All Tiers</option>
          {['A','B','C','D'].map(t => <option key={t} value={t}>Tier {t}</option>)}
        </select>
        <select className="select-field" value={filterReg} onChange={e => setFilterReg(e.target.value)} style={{ width: 180 }}>
          {regions.map(r => <option key={r} value={r}>{r === 'ALL' ? 'All Regions' : r}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--muted2)', alignSelf: 'center' }}>
          {filtered.length} centres found
        </div>
      </div>

      {/* Main grid: Map + Sidebar */}
      <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 20, marginBottom: 24, animationDelay: '0.12s' }}>

        {/* SVG Map */}
        <div className="map-container" style={{ height: 460, position: 'relative' }}>
          {/* India outline SVG placeholder — stylised grid map */}
          <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0 }}>
            {/* Grid lines */}
            {[20,40,60,80].map(v => (
              <g key={v}>
                <line x1={v} y1={0} x2={v} y2={100} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                <line x1={0} y1={v} x2={100} y2={v} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
              </g>
            ))}
            {/* India rough outline */}
            <path d="M45,10 L65,8 L72,18 L78,30 L82,45 L80,58 L72,68 L65,78 L60,88 L57,95 L53,90 L48,80 L42,72 L36,62 L30,50 L28,38 L32,25 L38,15 Z"
              fill="rgba(0,212,255,0.04)" stroke="rgba(0,212,255,0.15)" strokeWidth="0.8" />
          </svg>

          {/* Coach pins */}
          {COACHING_CENTRES.filter(c => filtered.some(f => f.id === c.id)).map(centre => {
            const isSelected = selected?.id === centre.id;
            const color = isSelected ? 'var(--green)' : 'var(--cyan)';
            return (
              <div
                key={centre.id}
                className="map-dot"
                style={{ left: `${centre.x}%`, top: `${centre.y}%`, transform: 'translate(-50%,-50%)', zIndex: isSelected ? 10 : 5 }}
                onClick={() => setSelected(centre)}
              >
                {/* Pulse ring for selected */}
                {isSelected && (
                  <div style={{ position: 'absolute', width: 36, height: 36, borderRadius: '50%', border: `2px solid ${color}`, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', animation: 'pulseGreen 1.8s ease-in-out infinite', opacity: 0.5 }} />
                )}
                <div style={{ width: isSelected ? 18 : 13, height: isSelected ? 18 : 13, borderRadius: '50%', background: color, border: `2px solid ${isSelected ? 'var(--bg)' : 'rgba(0,0,0,0.5)'}`, transition: 'all 0.25s', boxShadow: isSelected ? `0 0 14px ${color}` : 'none' }} />
                {/* Label */}
                {isSelected && (
                  <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 6, background: 'var(--card2)', border: '1px solid var(--green)', borderRadius: 6, padding: '4px 10px', whiteSpace: 'nowrap', fontSize: 11, fontWeight: 700, color: 'var(--green)', zIndex: 20 }}>
                    {centre.city}
                  </div>
                )}
              </div>
            );
          })}

          {/* Map legend */}
          <div style={{ position: 'absolute', bottom: 16, left: 16, background: 'rgba(7,9,15,0.85)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px' }}>
            <div style={{ fontSize: 10, color: 'var(--muted2)', fontWeight: 700, letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>Legend</div>
            {[{ color: 'var(--green)', label: 'Selected' }, { color: 'var(--cyan)', label: 'Verified Centre' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.color }} />
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>{l.label}</span>
              </div>
            ))}
          </div>

          {/* Zoom note */}
          <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 11, color: 'var(--muted)', background: 'rgba(7,9,15,0.7)', padding: '5px 10px', borderRadius: 6 }}>
            Click a pin to view details
          </div>
        </div>

        {/* Centre detail panel */}
        {selected && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', maxHeight: 460 }}>
            {/* Info card */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                <Avatar initials={selected.coach.split(' ').map(w=>w[0]).join('').slice(0,2)} size={48} color="var(--green)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, letterSpacing: 1, marginBottom: 2 }}>{selected.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted2)', marginBottom: 4 }}>{selected.coach}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {selected.verified && (
                      <span style={{ fontSize: 11, color: 'var(--green)', background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.25)', padding: '2px 8px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle size={10} /> Verified
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: 'var(--amber)' }}>{'★'.repeat(Math.floor(selected.rating))} {selected.rating} ({selected.reviews})</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                {[
                  { label: 'Specialty', value: selected.specialty, icon: Star },
                  { label: 'Distance', value: selected.distance, icon: Navigation },
                  { label: 'Students', value: `${selected.students} active`, icon: Users },
                  { label: 'Address', value: selected.address, icon: MapPin },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} style={{ padding: '10px 12px', background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Icon size={10} /> {label}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Tiers accepted */}
              <div style={{ marginBottom: 0 }}>
                <div style={{ fontSize: 11, color: 'var(--muted2)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Accepts Tiers</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['A','B','C','D'].map(t => (
                    <div key={t} style={{
                      padding: '4px 12px', borderRadius: 99, fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                      opacity: selected.tierAccepted.includes(t) ? 1 : 0.2,
                      color: t==='A'?'var(--gold)':t==='B'?'var(--green)':t==='C'?'var(--cyan)':'var(--amber)',
                      background: selected.tierAccepted.includes(t) ? (t==='A'?'rgba(255,215,0,0.1)':t==='B'?'rgba(0,255,135,0.1)':t==='C'?'rgba(0,212,255,0.1)':'rgba(245,158,11,0.1)') : 'rgba(255,255,255,0.04)',
                      border: '1px solid currentColor',
                    }}>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking confirmation flash */}
            {showBookConfirm && (
              <div className="fade-in" style={{ padding: '14px 18px', background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.3)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle size={18} color="var(--green)" />
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--green)' }}>Slot {bookedSlot} booked! Coach will confirm shortly.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Time slots section */}
      {selected && (
        <div className="card fade-up" style={{ marginBottom: 24, animationDelay: '0.16s' }}>
          <SectionHeader title="AVAILABLE TIME SLOTS" subtitle={`${selected.name} — click a slot to book`} />

          {/* Day tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {selected.slots.map(s => (
              <button
                key={s.day}
                onClick={() => setActiveDay(activeDay === s.day ? null : s.day)}
                style={{
                  padding: '8px 20px', borderRadius: 99, border: '1px solid',
                  borderColor: activeDay === s.day ? DAY_COLORS[s.day] : 'var(--border)',
                  background: activeDay === s.day ? `${DAY_COLORS[s.day]}15` : 'var(--surface)',
                  color: activeDay === s.day ? DAY_COLORS[s.day] : 'var(--muted2)',
                  fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                }}
              >{s.day}</button>
            ))}
          </div>

          {/* Slots grid */}
          {activeDay ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px,1fr))', gap: 10 }}>
              {selected.slots.find(s => s.day === activeDay)?.times.map((t, i) => (
                <div
                  key={t}
                  className="time-slot"
                  style={{ borderColor: i % 3 === 0 ? 'var(--border2)' : 'var(--border)', textAlign: 'center' }}
                  onClick={() => handleBookSlot(`${activeDay} ${t}`)}
                >
                  <Clock size={12} color="var(--muted2)" style={{ display: 'inline', marginRight: 5 }} />
                  {t}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--muted2)', fontSize: 14 }}>
              Select a day above to view available time slots
            </div>
          )}
        </div>
      )}

      {/* All centres list */}
      <div className="fade-up" style={{ animationDelay: '0.20s' }}>
        <SectionHeader title="ALL CENTRES" subtitle={`${filtered.length} verified coaching centres`} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 14 }}>
          {filtered.map(c => (
            <div
              key={c.id}
              className={`coach-card ${selected?.id === c.id ? 'active' : ''}`}
              onClick={() => setSelected(c)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{c.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted2)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MapPin size={11} /> {c.city}, {c.region}
                  </div>
                </div>
                {c.verified && <CheckCircle size={16} color="var(--green)" />}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, color: 'var(--amber)' }}>★ {c.rating} · {c.students} students</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--cyan)', fontSize: 13 }}>
                  View Slots <ChevronRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
