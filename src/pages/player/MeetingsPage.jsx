// ═══════════════════════════════════════════════════════
//  ScoutAI — Meeting Scheduler
//  Schedule sessions with coaches or group members
// ═══════════════════════════════════════════════════════

import { useState } from 'react';
import { Calendar, Clock, User, Users, Video, MapPin, Plus, CheckCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, SectionHeader } from '../../components/ui/SharedComponents';

const DAYS_OF_WEEK = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// Mock data
const MOCK_COACHES = [
  { id:'c1', name:'Coach Ramesh Sharma', specialty:'Sprinting & Agility', rating:4.9, region:'Delhi', avatar:'RS', verified:true },
  { id:'c2', name:'Coach Pradeep Nair',  specialty:'Technical Skills',    rating:4.7, region:'Kerala', avatar:'PN', verified:true },
  { id:'c3', name:'Coach Anita Verma',   specialty:'Tactical Analysis',   rating:4.8, region:'UP', avatar:'AV', verified:true },
];

const MOCK_MEETINGS = [
  { id:'m1', title:'Progress Review',       with:'Coach Ramesh Sharma', date:'Feb 24, 2026', time:'10:00 AM', type:'video',    status:'upcoming' },
  { id:'m2', title:'Sprint Drill Session',  with:'Tier B Group Chat',   date:'Feb 23, 2026', time:'06:00 PM', type:'in-person', status:'upcoming' },
  { id:'m3', title:'EPI Score Discussion',  with:'Coach Pradeep Nair',  date:'Feb 20, 2026', time:'11:00 AM', type:'video',    status:'done' },
  { id:'m4', title:'Agility Workshop',      with:'Coach Anita Verma',   date:'Mar 02, 2026', time:'09:00 AM', type:'in-person', status:'pending' },
];

const TIME_SLOTS = [
  { time:'07:00 AM', available:true },
  { time:'08:00 AM', available:true },
  { time:'09:00 AM', available:false },
  { time:'10:00 AM', available:true },
  { time:'11:00 AM', available:true },
  { time:'12:00 PM', available:false },
  { time:'02:00 PM', available:true },
  { time:'03:00 PM', available:true },
  { time:'04:00 PM', available:true },
  { time:'05:00 PM', available:false },
  { time:'06:00 PM', available:true },
  { time:'07:00 PM', available:true },
];

const STATUS_STYLES = {
  upcoming: { color:'var(--green)',  bg:'rgba(0,255,135,0.1)',  label:'Upcoming' },
  pending:  { color:'var(--amber)',  bg:'rgba(245,158,11,0.1)', label:'Pending' },
  done:     { color:'var(--muted2)', bg:'rgba(255,255,255,0.05)', label:'Completed' },
};

export default function MeetingsPage({ user }) {
  const today  = new Date(2026, 1, 22); // Feb 22, 2026
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [selDay,    setSelDay]    = useState(today.getDate());
  const [selSlot,   setSelSlot]   = useState(null);
  const [selCoach,  setSelCoach]  = useState(null);
  const [meetType,  setMeetType]  = useState('video');
  const [showBook,  setShowBook]  = useState(false);
  const [meetings,  setMeetings]  = useState(MOCK_MEETINGS);
  const [booked,    setBooked]    = useState(false);
  const [tab,       setTab]       = useState('upcoming'); // upcoming | schedule

  // Calendar helpers
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
  const prevMonth = () => { if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else{setViewMonth(m=>m-1);} };
  const nextMonth = () => { if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else{setViewMonth(m=>m+1);} };

  const eventDays = [22, 24, 27, 3, 5]; // mock days with events

  const handleBook = () => {
    if (!selSlot || !selCoach) return;
    const newMeeting = {
      id: `m${Date.now()}`, title: 'Coaching Session',
      with: selCoach.name, date: `${MONTHS[viewMonth].slice(0,3)} ${selDay}, ${viewYear}`,
      time: selSlot, type: meetType, status: 'upcoming',
    };
    setMeetings(m => [newMeeting, ...m]);
    setBooked(true);
    setTimeout(() => { setBooked(false); setShowBook(false); setSelSlot(null); setSelCoach(null); setTab('upcoming'); }, 2000);
  };

  const upcomingCount = meetings.filter(m=>m.status==='upcoming').length;
  const pendingCount  = meetings.filter(m=>m.status==='pending').length;

  return (
    <div className="page-pad">
      <div className="fade-up" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:36, flexWrap:'wrap', gap:16 }}>
        <div>
          <h1 className="section-title">MEETINGS & SCHEDULE</h1>
          <p className="section-subtitle">Book sessions with coaches or coordinate group practice</p>
        </div>
        <button className="btn-primary" onClick={() => setTab('schedule')}>
          <Plus size={16} /> Book a Session
        </button>
      </div>

      {/* Stats row */}
      <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:28, animationDelay:'0.06s' }}>
        {[
          { label:'Upcoming Sessions', value:upcomingCount, color:'var(--green)', icon:Calendar },
          { label:'Pending Approval',  value:pendingCount,  color:'var(--amber)', icon:Clock },
          { label:'Completed',         value:meetings.filter(m=>m.status==='done').length, color:'var(--muted2)', icon:CheckCircle },
        ].map(({ label, value, color, icon:Icon }) => (
          <div key={label} className="card" style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ width:44, height:44, background:`${color}15`, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Icon size={22} color={color} />
            </div>
            <div>
              <div style={{ fontFamily:'var(--font-head)', fontSize:32, color, lineHeight:1 }}>{value}</div>
              <div style={{ fontSize:13, color:'var(--muted2)', marginTop:2 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:0, marginBottom:28, background:'var(--surface)', borderRadius:10, padding:4, width:'fit-content', border:'1px solid var(--border)' }}>
        {[{ id:'upcoming', label:'My Meetings' },{ id:'schedule', label:'Book New Session' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:'10px 28px', borderRadius:8, border:'none',
            background: tab===t.id ? 'var(--green)' : 'transparent',
            color: tab===t.id ? '#000' : 'var(--muted2)',
            fontFamily:'var(--font-body)', fontWeight:700, fontSize:14, cursor:'pointer', transition:'all 0.2s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── My Meetings Tab ── */}
      {tab === 'upcoming' && (
        <div className="fade-in">
          {meetings.map(m => {
            const s = STATUS_STYLES[m.status];
            return (
              <div key={m.id} className={`meeting-pill ${m.status}`}>
                <div style={{ width:44, height:44, background:`${m.type==='video' ? 'rgba(0,212,255,0.1)' : 'rgba(0,255,135,0.1)'}`, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {m.type==='video' ? <Video size={20} color="var(--cyan)" /> : <MapPin size={20} color="var(--green)" />}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:15, marginBottom:3 }}>{m.title}</div>
                  <div style={{ fontSize:13, color:'var(--muted2)', display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}><User size={12} /> {m.with}</span>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}><Calendar size={12} /> {m.date}</span>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}><Clock size={12} /> {m.time}</span>
                  </div>
                </div>
                <span style={{ padding:'5px 14px', borderRadius:99, fontSize:12, fontWeight:700, fontFamily:'var(--font-mono)', background:s.bg, color:s.color }}>
                  {s.label}
                </span>
                {m.status === 'upcoming' && (
                  <button onClick={() => setMeetings(ms => ms.filter(x=>x.id!==m.id))} style={{ background:'none', border:'none', color:'var(--muted)', cursor:'pointer', padding:4 }}>
                    <X size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Book Session Tab ── */}
      {tab === 'schedule' && (
        <div className="fade-in" style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:24 }}>
          {/* Left: Calendar + slots */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {/* Calendar */}
            <div className="card">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
                <button onClick={prevMonth} style={{ background:'none', border:'none', color:'var(--muted2)', cursor:'pointer', padding:6, borderRadius:8, transition:'background 0.2s' }}><ChevronLeft size={18} /></button>
                <span style={{ fontFamily:'var(--font-head)', fontSize:20, letterSpacing:1 }}>{MONTHS[viewMonth]} {viewYear}</span>
                <button onClick={nextMonth} style={{ background:'none', border:'none', color:'var(--muted2)', cursor:'pointer', padding:6, borderRadius:8, transition:'background 0.2s' }}><ChevronRight size={18} /></button>
              </div>
              {/* Day headers */}
              <div className="cal-grid" style={{ marginBottom:6 }}>
                {DAYS_OF_WEEK.map(d => <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:700, color:'var(--muted)', letterSpacing:0.5, padding:'4px 0' }}>{d}</div>)}
              </div>
              {/* Days */}
              <div className="cal-grid">
                {Array(firstDay).fill(null).map((_,i) => <div key={`e${i}`} />)}
                {Array(daysInMonth).fill(null).map((_,i) => {
                  const d = i+1;
                  const isToday   = d===today.getDate() && viewMonth===today.getMonth();
                  const isSel     = d===selDay && viewMonth===today.getMonth();
                  const hasEvent  = eventDays.includes(d);
                  return (
                    <div key={d} className={`cal-day ${isToday?'today':''} ${isSel?'selected':''} ${hasEvent&&!isSel?'has-event':''}`} onClick={() => setSelDay(d)}>
                      {d}
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop:16, display:'flex', gap:16, fontSize:12, color:'var(--muted2)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:5 }}><div style={{ width:6, height:6, borderRadius:'50%', background:'var(--cyan)' }} /> Has sessions</div>
                <div style={{ display:'flex', alignItems:'center', gap:5 }}><div style={{ width:12, height:12, borderRadius:3, background:'rgba(0,255,135,0.15)', border:'1px solid rgba(0,255,135,0.3)' }} /> Selected</div>
              </div>
            </div>

            {/* Time slots */}
            <div className="card">
              <SectionHeader title="AVAILABLE SLOTS" subtitle={`${MONTHS[viewMonth]} ${selDay}`} />
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                {TIME_SLOTS.map(slot => (
                  <div
                    key={slot.time}
                    className={`time-slot ${!slot.available?'unavailable':''} ${selSlot===slot.time?'booked':''}`}
                    onClick={() => slot.available && setSelSlot(slot.time)}
                  >
                    {slot.time}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Coach selection + booking form */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {/* Meeting type */}
            <div className="card">
              <SectionHeader title="MEETING TYPE" />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[{ id:'video', icon:Video, label:'Video Call', sub:'Google Meet / Zoom' },{ id:'in-person', icon:MapPin, label:'In-Person', sub:'At coaching venue' }].map(t => (
                  <div key={t.id} onClick={() => setMeetType(t.id)} style={{ padding:'16px', border:`1px solid ${meetType===t.id?'rgba(0,255,135,0.3)':'var(--border)'}`, background:meetType===t.id?'rgba(0,255,135,0.06)':'var(--surface)', borderRadius:12, cursor:'pointer', transition:'all 0.2s', textAlign:'center' }}>
                    <t.icon size={24} color={meetType===t.id?'var(--green)':'var(--muted2)'} style={{ marginBottom:8 }} />
                    <div style={{ fontSize:14, fontWeight:600, color:meetType===t.id?'var(--green)':'var(--text)' }}>{t.label}</div>
                    <div style={{ fontSize:11, color:'var(--muted)' }}>{t.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coach selection */}
            <div className="card">
              <SectionHeader title="SELECT COACH" subtitle="Verified coaches on ScoutAI" />
              {MOCK_COACHES.map(c => (
                <div key={c.id} className={`coach-card ${selCoach?.id===c.id?'active':''}`} onClick={() => setSelCoach(c)} style={{ display:'flex', gap:14, alignItems:'center' }}>
                  <div style={{ position:'relative' }}>
                    <Avatar initials={c.avatar} size={44} color="var(--cyan)" />
                    {c.verified && <div style={{ position:'absolute', bottom:-2, right:-2, width:16, height:16, background:'var(--green)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid var(--bg)' }}><CheckCircle size={10} color="#000" /></div>}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14 }}>{c.name}</div>
                    <div style={{ fontSize:12, color:'var(--muted2)', marginTop:2 }}>{c.specialty} · {c.region}</div>
                    <div style={{ fontSize:12, color:'var(--amber)', marginTop:2 }}>{'★'.repeat(Math.floor(c.rating))} {c.rating}</div>
                  </div>
                  {selCoach?.id===c.id && <CheckCircle size={18} color="var(--cyan)" />}
                </div>
              ))}
            </div>

            {/* Note */}
            <div className="card">
              <label className="form-label">ADD NOTE (optional)</label>
              <textarea className="input-field" placeholder="e.g. I want to work on my sprint mechanics and discuss my EPI score..." rows={3} />
            </div>

            {/* Book button */}
            <button
              className="btn-primary"
              onClick={handleBook}
              disabled={!selSlot || !selCoach}
              style={{ width:'100%', justifyContent:'center', padding:'15px', fontSize:16, opacity:(!selSlot||!selCoach)?0.5:1, cursor:(!selSlot||!selCoach)?'not-allowed':'pointer' }}
            >
              {booked ? <><CheckCircle size={18} /> Session Booked!</> : <><Calendar size={18} /> Confirm Booking</>}
            </button>

            {/* Summary */}
            {(selSlot || selCoach) && (
              <div className="card" style={{ background:'rgba(0,255,135,0.04)', borderColor:'rgba(0,255,135,0.2)', padding:'16px 20px' }}>
                <div style={{ fontSize:12, color:'var(--muted2)', fontWeight:700, letterSpacing:1, marginBottom:10, textTransform:'uppercase' }}>Booking Summary</div>
                {selCoach && <div style={{ fontSize:14, marginBottom:6 }}>👤 {selCoach.name}</div>}
                {selSlot  && <div style={{ fontSize:14, marginBottom:6 }}>🕐 {MONTHS[viewMonth]} {selDay} at {selSlot}</div>}
                <div style={{ fontSize:14 }}>{meetType === 'video' ? '📹 Video Call' : '📍 In-Person Session'}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
