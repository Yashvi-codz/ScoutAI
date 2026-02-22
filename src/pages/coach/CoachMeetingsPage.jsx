// ═══════════════════════════════════════════════════════
//  ScoutAI — Coach Meetings Page
//  View athlete requests, approve/decline, schedule sessions
// ═══════════════════════════════════════════════════════
import { useState } from 'react';
import { Calendar, Clock, CheckCircle, X, Video, MapPin, Users, Plus, ChevronLeft, ChevronRight, Send, User, Bell, Filter } from 'lucide-react';
import { Avatar, SectionHeader } from '../../components/ui/SharedComponents';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_OF_WEEK = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// Incoming requests from athletes
const INITIAL_REQUESTS = [
  { id: 'r1', athlete: 'Priya Verma',   avatar: 'PV', tier: 'B', region: 'Delhi',   epi: 78, requestedDate: 'Feb 24, 2026', time: '10:00 AM', type: 'video',     topic: 'Progress Review — Sprint improvement discussion', status: 'pending' },
  { id: 'r2', athlete: 'Riya Sharma',   avatar: 'RS', tier: 'C', region: 'Punjab',  epi: 64, requestedDate: 'Feb 25, 2026', time: '04:00 PM', type: 'in-person', topic: 'Agility drill coaching session', status: 'pending' },
  { id: 'r3', athlete: 'Aarav Singh',   avatar: 'AS', tier: 'A', region: 'Kerala',  epi: 91, requestedDate: 'Feb 26, 2026', time: '09:00 AM', type: 'video',     topic: 'National trial preparation — elite drills', status: 'pending' },
  { id: 'r4', athlete: 'Meera Nair',    avatar: 'MN', tier: 'D', region: 'UP',      epi: 52, requestedDate: 'Feb 23, 2026', time: '06:00 PM', type: 'in-person', topic: 'Foundation training plan discussion', status: 'approved' },
  { id: 'r5', athlete: 'Kavya Reddy',   avatar: 'KR', tier: 'B', region: 'Odisha',  epi: 81, requestedDate: 'Feb 22, 2026', time: '11:00 AM', type: 'video',     topic: 'SWOT analysis — technique improvement', status: 'approved' },
  { id: 'r6', athlete: 'Ankit Mishra',  avatar: 'AM', tier: 'C', region: 'Gujarat', epi: 67, requestedDate: 'Feb 28, 2026', time: '03:00 PM', type: 'in-person', topic: 'Balance drill feedback session', status: 'pending' },
];

const MY_SESSIONS = [
  { id: 's1', athlete: 'Meera Nair',  avatar: 'MN', date: 'Feb 23, 2026', time: '06:00 PM', type: 'in-person', status: 'upcoming', notes: 'Focus on stamina drills.' },
  { id: 's2', athlete: 'Kavya Reddy', avatar: 'KR', date: 'Feb 22, 2026', time: '11:00 AM', type: 'video',     status: 'upcoming', notes: 'Prepare SWOT analysis report before session.' },
  { id: 's3', athlete: 'Priya Verma', avatar: 'PV', date: 'Feb 18, 2026', time: '10:00 AM', type: 'video',     status: 'done',     notes: 'Completed — good progress on acceleration.' },
];

const TIER_COLORS = { A: 'var(--gold)', B: 'var(--green)', C: 'var(--cyan)', D: 'var(--amber)' };

export default function CoachMeetingsPage({ user }) {
  const [requests,  setRequests]  = useState(INITIAL_REQUESTS);
  const [sessions,  setSessions]  = useState(MY_SESSIONS);
  const [tab,       setTab]       = useState('requests');
  const [filterSt,  setFilterSt]  = useState('pending');
  const [viewDay,   setViewDay]   = useState(22);
  const [viewMonth, setViewMonth] = useState(1);
  const [viewYear,  setViewYear]  = useState(2026);
  const [note,      setNote]      = useState('');
  const [msgOpen,   setMsgOpen]   = useState(null);
  const [msgText,   setMsgText]   = useState('');

  const today = new Date(2026, 1, 22);
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonth = () => { if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else{setViewMonth(m=>m-1);} };
  const nextMonth = () => { if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else{setViewMonth(m=>m+1);} };

  const approvedDays = [22, 23, 26];

  const approve = (id) => {
    setRequests(rs => rs.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    const req = requests.find(r => r.id === id);
    if (req) setSessions(s => [{ id: `s${Date.now()}`, athlete: req.athlete, avatar: req.avatar, date: req.requestedDate, time: req.time, type: req.type, status: 'upcoming', notes: req.topic }, ...s]);
  };
  const decline = (id) => setRequests(rs => rs.map(r => r.id === id ? { ...r, status: 'declined' } : r));

  const filtered = requests.filter(r => filterSt === 'all' || r.status === filterSt);

  const pendingCount  = requests.filter(r => r.status === 'pending').length;
  const approvedCount = sessions.filter(s => s.status === 'upcoming').length;

  return (
    <div className="page-pad">
      {/* Header */}
      <div className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="section-title">MEETINGS & REQUESTS</h1>
          <p className="section-subtitle">Manage athlete session requests and your upcoming schedule</p>
        </div>
        {pendingCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12 }}>
            <Bell size={16} color="var(--amber)" />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--amber)' }}>{pendingCount} pending request{pendingCount > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28, animationDelay: '0.05s' }}>
        {[
          { label: 'Pending Requests', value: pendingCount,  color: 'var(--amber)',  icon: Bell },
          { label: 'Upcoming Sessions', value: approvedCount, color: 'var(--green)', icon: Calendar },
          { label: 'This Month',        value: sessions.length, color: 'var(--cyan)', icon: Users },
          { label: 'Completed',         value: sessions.filter(s=>s.status==='done').length, color: 'var(--muted2)', icon: CheckCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, background: `${color}14`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 30, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 2 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: 28 }}>
        {[['requests','Athlete Requests'],['schedule','My Schedule'],['calendar','Calendar View']].map(([id, lbl]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: tab === id ? 'var(--cyan)' : 'transparent', color: tab === id ? '#000' : 'var(--muted2)', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>{lbl}</button>
        ))}
      </div>

      {/* ── REQUESTS TAB ── */}
      {tab === 'requests' && (
        <div className="fade-in">
          {/* Filter */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {[['pending','Pending'],['approved','Approved'],['declined','Declined'],['all','All']].map(([v, lbl]) => (
              <button key={v} onClick={() => setFilterSt(v)} style={{ padding: '7px 18px', borderRadius: 99, border: '1px solid', borderColor: filterSt === v ? 'rgba(0,212,255,0.4)' : 'var(--border)', background: filterSt === v ? 'rgba(0,212,255,0.1)' : 'var(--surface)', color: filterSt === v ? 'var(--cyan)' : 'var(--muted2)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>{lbl}</button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map(req => (
              <div key={req.id} className="card" style={{ padding: '20px 24px', borderLeft: `3px solid ${req.status === 'pending' ? 'var(--amber)' : req.status === 'approved' ? 'var(--green)' : 'var(--muted)'}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  {/* Athlete info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 220 }}>
                    <Avatar initials={req.avatar} size={46} color={TIER_COLORS[req.tier]} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{req.athlete}</div>
                      <div style={{ fontSize: 13, color: 'var(--muted2)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: TIER_COLORS[req.tier], fontWeight: 700 }}>Tier {req.tier}</span>
                        <span>·</span><span>EPI {req.epi}</span>
                        <span>·</span><span>{req.region}</span>
                      </div>
                    </div>
                  </div>

                  {/* Session details */}
                  <div style={{ flex: 2, minWidth: 240 }}>
                    <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500, marginBottom: 8 }}>{req.topic}</div>
                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--muted2)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {req.requestedDate}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {req.time}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{req.type === 'video' ? <Video size={12} /> : <MapPin size={12} />} {req.type === 'video' ? 'Video Call' : 'In-Person'}</span>
                    </div>
                  </div>

                  {/* Status + actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                    <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', background: req.status === 'pending' ? 'rgba(245,158,11,0.1)' : req.status === 'approved' ? 'rgba(0,255,135,0.1)' : 'rgba(255,255,255,0.05)', color: req.status === 'pending' ? 'var(--amber)' : req.status === 'approved' ? 'var(--green)' : 'var(--muted2)' }}>
                      {req.status.toUpperCase()}
                    </span>
                    {req.status === 'pending' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => approve(req.id)} className="btn-primary btn-sm" style={{ background: 'linear-gradient(135deg,var(--green),var(--green-dim))', padding: '7px 14px', fontSize: 13 }}>
                          <CheckCircle size={13} /> Approve
                        </button>
                        <button onClick={() => decline(req.id)} style={{ padding: '7px 14px', border: '1px solid rgba(255,77,109,0.3)', borderRadius: 8, background: 'rgba(255,77,109,0.06)', color: 'var(--red)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <X size={13} /> Decline
                        </button>
                      </div>
                    )}
                    {req.status !== 'declined' && (
                      <button onClick={() => setMsgOpen(msgOpen === req.id ? null : req.id)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--cyan)', cursor: 'pointer', padding: '5px 12px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Send size={12} /> Message
                      </button>
                    )}
                  </div>
                </div>

                {/* Message box */}
                {msgOpen === req.id && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                    <input className="input-field" placeholder={`Message to ${req.athlete}...`} value={msgText} onChange={e => setMsgText(e.target.value)} style={{ flex: 1 }} />
                    <button className="btn-primary" onClick={() => { setMsgText(''); setMsgOpen(null); }} style={{ padding: '12px 16px', background: 'linear-gradient(135deg,var(--cyan),var(--cyan-dim))' }}>
                      <Send size={15} />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>No {filterSt} requests.</div>
            )}
          </div>
        </div>
      )}

      {/* ── SCHEDULE TAB ── */}
      {tab === 'schedule' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sessions.map(s => (
            <div key={s.id} className="meeting-pill" style={{ borderLeft: `3px solid ${s.status === 'upcoming' ? 'var(--green)' : 'var(--muted)'}` }}>
              <div style={{ width: 44, height: 44, background: s.type === 'video' ? 'rgba(0,212,255,0.1)' : 'rgba(0,255,135,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {s.type === 'video' ? <Video size={20} color="var(--cyan)" /> : <MapPin size={20} color="var(--green)" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Session with {s.athlete}</div>
                <div style={{ fontSize: 13, color: 'var(--muted2)', marginTop: 2 }}>{s.notes}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, display: 'flex', gap: 12 }}>
                  <span><Calendar size={11} style={{ display:'inline',marginRight:4 }} />{s.date}</span>
                  <span><Clock size={11} style={{ display:'inline',marginRight:4 }} />{s.time}</span>
                </div>
              </div>
              <span style={{ padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', background: s.status === 'upcoming' ? 'rgba(0,255,135,0.1)' : 'rgba(255,255,255,0.05)', color: s.status === 'upcoming' ? 'var(--green)' : 'var(--muted2)' }}>
                {s.status === 'upcoming' ? 'UPCOMING' : 'DONE'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── CALENDAR TAB ── */}
      {tab === 'calendar' && (
        <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24 }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <button onClick={prevMonth} style={{ background: 'none', border: 'none', color: 'var(--muted2)', cursor: 'pointer', padding: 6, borderRadius: 8 }}><ChevronLeft size={18} /></button>
              <span style={{ fontFamily: 'var(--font-head)', fontSize: 20, letterSpacing: 1 }}>{MONTHS[viewMonth]} {viewYear}</span>
              <button onClick={nextMonth} style={{ background: 'none', border: 'none', color: 'var(--muted2)', cursor: 'pointer', padding: 6, borderRadius: 8 }}><ChevronRight size={18} /></button>
            </div>
            <div className="cal-grid" style={{ marginBottom: 8 }}>
              {DAYS_OF_WEEK.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--muted)', padding: '4px 0' }}>{d}</div>)}
            </div>
            <div className="cal-grid">
              {Array(firstDay).fill(null).map((_,i) => <div key={`e${i}`} />)}
              {Array(daysInMonth).fill(null).map((_,i) => {
                const d = i + 1;
                const isToday = d === 22 && viewMonth === 1;
                const isSel   = d === viewDay && viewMonth === viewMonth;
                const hasEv   = approvedDays.includes(d);
                return (
                  <div key={d} className={`cal-day ${isToday?'today':''} ${isSel?'selected':''} ${hasEv&&!isSel?'has-event':''}`} onClick={() => setViewDay(d)}>
                    {d}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <SectionHeader title={`SESSIONS — ${MONTHS[viewMonth]} ${viewDay}`} subtitle="Approved sessions on this date" />
            {sessions.filter(() => approvedDays.includes(viewDay)).map(s => (
              <div key={s.id} className="meeting-pill">
                <Avatar initials={s.avatar} size={40} color="var(--cyan)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{s.athlete}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted2)' }}>{s.time} · {s.type === 'video' ? 'Video Call' : 'In-Person'}</div>
                </div>
              </div>
            ))}
            {!approvedDays.includes(viewDay) && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>No sessions on this date.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
