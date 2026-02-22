// ═══════════════════════════════════════════════════════
//  ScoutAI — Community Groups Page
//  Tier-based + location-based + interest groups with chat
// ═══════════════════════════════════════════════════════

import { useState } from 'react';
import { Users, MessageCircle, MapPin, Star, Plus, Send, ArrowLeft, Lock, Globe, Hash, UserPlus, CheckCircle } from 'lucide-react';
import { Avatar, SectionHeader } from '../../components/ui/SharedComponents';
import { classifyTier, computeCompositeScore } from '../../engine/tierEngine';
import { DEMO_REPORT } from '../../data/mockAthletes';

// ── Mock groups data ──
const ALL_GROUPS = [
  // Tier-based
  { id:'g1', type:'tier', tierFilter:'B', name:'Tier B Warriors', desc:'High potential players sharing drills, tips and match updates.', members:142, region:'National', tags:['Training','Tactics','Motivation'], public:true, msgs:[
    { id:1, user:'Riya S.', avatar:'RS', text:'Anyone up for a joint virtual drill session this Sunday?', time:'2h ago', mine:false },
    { id:2, user:'You', avatar:'ME', text:'Count me in! What time works?', time:'1h ago', mine:true },
    { id:3, user:'Kavya R.', avatar:'KR', text:'10 AM IST is perfect for me 🙌', time:'45m ago', mine:false },
  ]},
  { id:'g2', type:'tier', tierFilter:'C', name:'Rising Stars (Tier C)', desc:'Developing players working together to reach Tier B.', members:89, region:'National', tags:['Improvement','Beginner Friendly'], public:true, msgs:[
    { id:1, user:'Meera N.', avatar:'MN', text:'Just got my report — 63 EPI. Stamina is my weakness.', time:'3h ago', mine:false },
    { id:2, user:'You', avatar:'ME', text:'Same! Let\'s do stamina challenges together.', time:'2h ago', mine:true },
  ]},
  // Location-based
  { id:'g3', type:'location', name:'Delhi Football Network', desc:'Connect with players and coaches in Delhi NCR for practice matches and trials.', members:67, region:'Delhi', tags:['Match Finder','Local Trials','Training Partner'], public:true, msgs:[
    { id:1, user:'Ankit M.', avatar:'AM', text:'Anyone near Dwarka looking for a winger for 5-a-side this Saturday?', time:'5h ago', mine:false },
    { id:2, user:'You', avatar:'ME', text:'I\'m in Rohini — happy to travel!', time:'4h ago', mine:true },
    { id:3, user:'Coach Sharma', avatar:'CS', text:'I\'ll be conducting free trials at JLN Stadium next Sunday. Details coming soon.', time:'1h ago', mine:false },
  ]},
  { id:'g4', type:'location', name:'Punjab Strikers', desc:'Football community for players across Punjab — practice, matches, tournaments.', members:38, region:'Punjab', tags:['Matches','Local League'], public:true, msgs:[
    { id:1, user:'Aarav S.', avatar:'AS', text:'Chandigarh district U19 trials on Feb 28. Anyone applying?', time:'1d ago', mine:false },
  ]},
  { id:'g5', type:'location', name:'Kerala United', desc:'Kerala players — from Thiruvananthapuram to Kozhikode.', members:54, region:'Kerala', tags:['Training','Networking'], public:true, msgs:[
    { id:1, user:'Meera N.', avatar:'MN', text:'KSFA trials next month! Let\'s prepare together.', time:'2d ago', mine:false },
  ]},
  // Interest-based
  { id:'g6', type:'interest', name:'Sprint & Speed Club', desc:'Dedicated to improving sprint mechanics, acceleration, and explosive pace.', members:201, region:'National', tags:['Speed','Drills','Science'], public:true, msgs:[
    { id:1, user:'Coach Patel', avatar:'CP', text:'New drill video uploaded: resisted sprint technique. Check pinned messages!', time:'6h ago', mine:false },
    { id:2, user:'You', avatar:'ME', text:'This helped me add 4 pts to my speed score last month!', time:'3h ago', mine:true },
  ]},
  { id:'g7', type:'interest', name:'Grassroots Village Connect', desc:'Rural athletes connecting for practice, sharing resources and finding opportunities.', members:312, region:'National', tags:['Rural','Grassroots','Opportunities'], public:true, msgs:[
    { id:1, user:'Rajesh K.', avatar:'RK', text:'Our village has 6 players, Tier C/D. Anyone near Gorakhpur want to join us for practice?', time:'8h ago', mine:false },
    { id:2, user:'Suresh M.', avatar:'SM', text:'We\'re 40km from Gorakhpur! Same situation. Let\'s connect!', time:'6h ago', mine:false },
  ]},
  { id:'g8', type:'interest', name:'Women\'s Football India', desc:'A safe space for women footballers across India to connect, collaborate and grow.', members:178, region:'National', tags:['Women\'s Football','Support','Community'], public:true, msgs:[
    { id:1, user:'Priya V.', avatar:'PV', text:'AIFF Women\'s League trials in March. Who\'s applying?', time:'12h ago', mine:false },
  ]},
];

const TYPE_META = {
  tier:     { label:'Tier-Based',     color:'var(--green)',  bg:'rgba(0,255,135,0.08)',  icon:Star },
  location: { label:'Location-Based', color:'var(--cyan)',   bg:'rgba(0,212,255,0.08)',  icon:MapPin },
  interest: { label:'Interest Group', color:'var(--purple)', bg:'rgba(167,139,250,0.08)', icon:Hash },
};

export default function CommunityPage({ user, report }) {
  const score = report ? computeCompositeScore(report.metrics) : computeCompositeScore(DEMO_REPORT.metrics);
  const tier  = classifyTier(score);

  const [activeTab,    setActiveTab]    = useState('all');
  const [joinedGroups, setJoinedGroups] = useState(['g1','g3','g6']);
  const [activeGroup,  setActiveGroup]  = useState(null);
  const [chatInput,    setChatInput]    = useState('');
  const [messages,     setMessages]     = useState({});

  const tabs = [
    { id:'all',      label:'All Groups' },
    { id:'tier',     label:'Tier-Based' },
    { id:'location', label:'Near Me' },
    { id:'interest', label:'Interests' },
    { id:'joined',   label:`My Groups (${joinedGroups.length})` },
  ];

  const filtered = ALL_GROUPS.filter(g => {
    if (activeTab==='joined') return joinedGroups.includes(g.id);
    if (activeTab==='all') return true;
    return g.type === activeTab;
  });

  const toggleJoin = (id) => {
    setJoinedGroups(j => j.includes(id) ? j.filter(x=>x!==id) : [...j, id]);
  };

  const sendMessage = () => {
    if (!chatInput.trim() || !activeGroup) return;
    const newMsg = { id: Date.now(), user:'You', avatar:'ME', text:chatInput.trim(), time:'Just now', mine:true };
    setMessages(m => ({ ...m, [activeGroup.id]: [...(m[activeGroup.id]||activeGroup.msgs), newMsg] }));
    setChatInput('');
  };

  const getGroupMessages = (g) => messages[g.id] || g.msgs;

  if (activeGroup) {
    const grpMsgs  = getGroupMessages(activeGroup);
    const meta     = TYPE_META[activeGroup.type];
    const Icon     = meta.icon;
    const isJoined = joinedGroups.includes(activeGroup.id);

    return (
      <div className="page-pad" style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 0px)' }}>
        {/* Back header */}
        <div className="fade-up" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <button onClick={() => setActiveGroup(null)} style={{ background:'none', border:'none', color:'var(--muted2)', cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:14 }}>
              <ArrowLeft size={16} /> Back
            </button>
            <div style={{ width:1, height:20, background:'var(--border)' }} />
            <div style={{ width:38, height:38, background:meta.bg, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon size={20} color={meta.color} />
            </div>
            <div>
              <div style={{ fontFamily:'var(--font-head)', fontSize:22, letterSpacing:1 }}>{activeGroup.name}</div>
              <div style={{ fontSize:12, color:'var(--muted2)' }}>{activeGroup.members} members · {activeGroup.region}</div>
            </div>
          </div>
          <button onClick={() => toggleJoin(activeGroup.id)} className={isJoined ? 'btn-ghost' : 'btn-primary'} style={{ padding:'10px 22px' }}>
            {isJoined ? <><CheckCircle size={15} /> Joined</> : <><UserPlus size={15} /> Join Group</>}
          </button>
        </div>

        {/* Tags */}
        <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
          {activeGroup.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>

        {/* Chat */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', overflow:'hidden', minHeight:0 }}>
          {/* Messages */}
          <div className="chat-window" style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:14 }}>
            {grpMsgs.map(msg => (
              <div key={msg.id} className={`message-row ${msg.mine ? 'mine' : ''}`}>
                {!msg.mine && <Avatar initials={msg.avatar} size={32} color={meta.color} />}
                <div style={{ display:'flex', flexDirection:'column', gap:4, alignItems:msg.mine?'flex-end':'flex-start' }}>
                  {!msg.mine && <span style={{ fontSize:11, color:'var(--muted2)', marginLeft:4 }}>{msg.user} · {msg.time}</span>}
                  <div className={`message-bubble ${msg.mine?'mine':'theirs'}`}>{msg.text}</div>
                  {msg.mine && <span style={{ fontSize:11, color:'var(--muted)', marginRight:4 }}>{msg.time}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          {isJoined ? (
            <div style={{ padding:'16px 20px', borderTop:'1px solid var(--border)', display:'flex', gap:10 }}>
              <input
                className="input-field"
                placeholder="Type a message..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key==='Enter' && sendMessage()}
                style={{ flex:1 }}
              />
              <button onClick={sendMessage} className="btn-primary" style={{ padding:'12px 18px' }}>
                <Send size={16} />
              </button>
            </div>
          ) : (
            <div style={{ padding:'16px 20px', borderTop:'1px solid var(--border)', textAlign:'center', color:'var(--muted2)', fontSize:14 }}>
              <Lock size={14} style={{ display:'inline', marginRight:6 }} />
              Join this group to send messages
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-pad">
      {/* Header */}
      <div className="fade-up" style={{ marginBottom:36 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:16 }}>
          <div>
            <h1 className="section-title">COMMUNITY</h1>
            <p className="section-subtitle">Connect with players at your level, near you, or sharing your interests</p>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <div style={{ padding:'8px 16px', background:tier.bg, border:`1px solid ${tier.border}`, borderRadius:99, fontSize:13, fontWeight:700, color:tier.color, fontFamily:'var(--font-mono)' }}>
              TIER {tier.tier} · {tier.label}
            </div>
          </div>
        </div>
      </div>

      {/* Tier recommendation banner */}
      <div className="fade-up card" style={{ marginBottom:28, padding:'16px 22px', background:'rgba(0,255,135,0.04)', borderColor:'rgba(0,255,135,0.18)', animationDelay:'0.06s' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <Star size={18} color="var(--green)" />
          <span style={{ fontSize:15, fontWeight:600 }}>Recommended for Tier {tier.tier} players: </span>
          <span style={{ fontSize:14, color:'var(--text2)' }}>Groups matched to your EPI score and region are highlighted below.</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="fade-up" style={{ display:'flex', gap:6, marginBottom:28, flexWrap:'wrap', animationDelay:'0.08s' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding:'9px 20px', borderRadius:99, border:'1px solid',
              borderColor: activeTab===t.id ? 'rgba(0,255,135,0.3)' : 'var(--border)',
              background: activeTab===t.id ? 'rgba(0,255,135,0.1)' : 'var(--surface)',
              color: activeTab===t.id ? 'var(--green)' : 'var(--muted2)',
              fontFamily:'var(--font-body)', fontWeight:600, fontSize:13, cursor:'pointer', transition:'all 0.2s',
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* Groups grid */}
      <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(340px,1fr))', gap:18, animationDelay:'0.12s' }}>
        {filtered.map(g => {
          const meta    = TYPE_META[g.type];
          const Icon    = meta.icon;
          const isJoined = joinedGroups.includes(g.id);
          return (
            <div key={g.id} className={`group-card ${isJoined?'joined':''}`} onClick={() => setActiveGroup(g)}>
              {/* Type pill + member count */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 12px', background:meta.bg, border:`1px solid ${meta.color}30`, borderRadius:99 }}>
                  <Icon size={12} color={meta.color} />
                  <span style={{ fontSize:11, fontWeight:700, color:meta.color, fontFamily:'var(--font-mono)', letterSpacing:0.8 }}>{meta.label}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                  {isJoined && <CheckCircle size={14} color="var(--green)" />}
                  <span style={{ fontSize:12, color:'var(--muted2)' }}><Users size={11} style={{ display:'inline', marginRight:4 }} />{g.members}</span>
                </div>
              </div>

              <h3 style={{ fontFamily:'var(--font-head)', fontSize:20, letterSpacing:1, marginBottom:8 }}>{g.name}</h3>
              <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.6, marginBottom:14 }}>{g.desc}</p>

              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {g.tags.slice(0,2).map(t => <span key={t} className="tag" style={{ fontSize:11 }}>{t}</span>)}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:5, color:meta.color, fontSize:13, fontWeight:600 }}>
                  <MessageCircle size={13} /> Chat <ArrowLeft size={12} style={{ transform:'rotate(180deg)' }} />
                </div>
              </div>

              {/* Region */}
              {g.region !== 'National' && (
                <div style={{ marginTop:10, fontSize:12, color:'var(--muted2)', display:'flex', alignItems:'center', gap:5 }}>
                  <MapPin size={11} /> {g.region}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign:'center', padding:'60px 0', color:'var(--muted)' }}>
          No groups in this category yet.
        </div>
      )}
    </div>
  );
}
