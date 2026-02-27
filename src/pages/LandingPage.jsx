// ═══════════════════════════════════════════════════════
//  ScoutAI — Landing Page v2 (full-screen, bigger fonts)
// ═══════════════════════════════════════════════════════

import { useState } from 'react';
import { User, Users, ArrowRight, Crosshair, Activity, Target, Shield } from 'lucide-react';

export default function LandingPage({ onChooseRole }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ minHeight:'100vh', width:'100vw', background:'var(--bg)', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' }}>

      {/* BG decoration */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'-15%', right:'-8%', width:900, height:900, background:'radial-gradient(circle, rgba(0,255,135,0.06) 0%, transparent 70%)', borderRadius:'50%' }} />
        <div style={{ position:'absolute', bottom:'-20%', left:'-10%', width:700, height:700, background:'radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)', borderRadius:'50%' }} />
        <div className="grid-dots" style={{ position:'absolute', inset:0, opacity:0.5 }} />
        <div style={{ position:'absolute', top:0, right:'22%', width:1, height:'100%', background:'linear-gradient(to bottom, transparent, rgba(0,255,135,0.08), transparent)' }} />
      </div>

      {/* Header */}
      <header style={{ padding:'24px 60px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'relative', zIndex:1, borderBottom:'1px solid var(--border)', background:'rgba(7,9,15,0.7)', backdropFilter:'blur(12px)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <img
            src="/logo.jpeg"
            alt="ScoutAI logo"
            style={{ height:48, width:'auto', borderRadius:12, display:'block' }}
          />
          <div>
            <div style={{ fontFamily:'var(--font-head)', fontSize:26, letterSpacing:3, lineHeight:1 }}>SCOUT AI</div>
            <div style={{ fontSize:10, color:'var(--muted)', letterSpacing:2 }}>SYNAPSE.AI × IGDTUW</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
          <span style={{ fontSize:13, color:'var(--green)', background:'rgba(0,255,135,0.08)', border:'1px solid rgba(0,255,135,0.2)', padding:'5px 16px', borderRadius:99, fontFamily:'var(--font-mono)', letterSpacing:1 }}>
            OPEN INNOVATION
          </span>
          <span style={{ fontSize:13, color:'var(--muted2)' }}>Khelo India · AIFF Compatible</span>
        </div>
      </header>

      {/* Hero */}
      <main style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 60px', gap:64, position:'relative', zIndex:1 }}>

        {/* Headline */}
        <div className="fade-up" style={{ textAlign:'center', maxWidth:860 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:'rgba(0,255,135,0.06)', border:'1px solid rgba(0,255,135,0.18)', borderRadius:99, padding:'8px 22px', marginBottom:36 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--green)', animation:'pulseGreen 2s ease-in-out infinite' }} />
            <span style={{ fontSize:14, color:'var(--green)', fontFamily:'var(--font-mono)', letterSpacing:1.5 }}>AI · POSE ESTIMATION · BIOMECHANICS · ML</span>
          </div>

          <h1 className="glow-text" style={{ fontFamily:'var(--font-head)', fontSize:'clamp(72px, 10vw, 130px)', lineHeight:0.9, letterSpacing:3, marginBottom:32 }}>
            DISCOVER YOUR<br />
            <span style={{ background:'linear-gradient(90deg,var(--green) 0%,var(--cyan) 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>FOOTBALL</span>
            <br />POTENTIAL
          </h1>

          <p style={{ fontSize:20, color:'var(--text2)', lineHeight:1.75, maxWidth:600, margin:'0 auto' }}>
            Upload a short drill video. Our AI uses MediaPipe pose estimation &amp; biomechanical analysis to evaluate your performance — objectively, instantly, from anywhere in India.
          </p>
        </div>

        {/* Role Cards */}
        <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, maxWidth:960, width:'100%', animationDelay:'0.12s' }}>
          {[
            {
              role:'player', label:"I'm an Athlete", icon:User, color:'var(--green)',
              borderHov:'rgba(0,255,135,0.35)', bgHov:'rgba(0,255,135,0.04)',
              desc:"Upload your drill video, receive your Elite Potential Index score, discover your strengths, join community groups and get a personalised development plan.",
              cta:'Start My Assessment',
              features:['Video-based AI analysis','EPI Score + Tier badge','SWOT + Dev plan','Community Groups','Meeting scheduler','Coaching map'],
            },
            {
              role:'coach', label:"I'm a Coach / Scout", icon:Users, color:'var(--cyan)',
              borderHov:'rgba(0,212,255,0.35)', bgHov:'rgba(0,212,255,0.04)',
              desc:"Access athlete profiles, compare performance data, filter by tier and region, schedule sessions and manage your coaching locations.",
              cta:'Open Coach Dashboard',
              features:['Athlete roster management','Tier & region filtering','Side-by-side comparison','Schedule sessions','Coaching location listings','FAQ & resources'],
            },
          ].map(({ role, label, icon:Icon, color, borderHov, bgHov, desc, cta, features }) => (
            <div
              key={role}
              onClick={() => onChooseRole(role)}
              onMouseEnter={() => setHovered(role)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: hovered===role ? 'var(--card2)' : 'var(--card)',
                border: `1px solid ${hovered===role ? borderHov : 'var(--border)'}`,
                borderRadius:24, padding:36, cursor:'pointer',
                transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
                transform: hovered===role ? 'translateY(-6px)' : 'none',
                boxShadow: hovered===role ? '0 24px 60px rgba(0,0,0,0.5)' : 'none',
              }}
            >
              <div style={{ width:64, height:64, background:`${color}14`, border:`1px solid ${color}30`, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:22 }}>
                <Icon size={32} color={color} />
              </div>
              <h3 style={{ fontFamily:'var(--font-head)', fontSize:32, letterSpacing:1.5, marginBottom:12 }}>{label}</h3>
              <p style={{ fontSize:16, color:'var(--text2)', lineHeight:1.7, marginBottom:24 }}>{desc}</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:28 }}>
                {features.map(f => (
                  <div key={f} style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:5, height:5, borderRadius:'50%', background:color, flexShrink:0 }} />
                    <span style={{ fontSize:13, color:'var(--muted2)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8, color, fontSize:16, fontWeight:700 }}>
                {cta} <ArrowRight size={18} />
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="fade-up" style={{ display:'flex', gap:56, flexWrap:'wrap', justifyContent:'center', animationDelay:'0.24s', padding:'24px 48px', borderRadius:18, background:'var(--card)', border:'1px solid var(--border)' }}>
          {[['35,000+','Players Scouted',Activity],['100+','Towns Covered',Target],['4-Tier','Classification',Shield],['6','Biomechanical Metrics',Crosshair]].map(([val,lbl,Icon]) => (
            <div key={lbl} style={{ textAlign:'center' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:6 }}>
                <Icon size={16} color="var(--green)" />
                <span style={{ fontFamily:'var(--font-head)', fontSize:32, color:'var(--green)', letterSpacing:1 }}>{val}</span>
              </div>
              <div style={{ fontSize:14, color:'var(--muted)' }}>{lbl}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding:'18px 60px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'relative', zIndex:1 }}>
        <span style={{ fontSize:13, color:'var(--muted)' }}>SHEquence Team · Department of Software Engineering · IGDTUW</span>
        <span style={{ fontSize:13, color:'var(--muted)' }}>Anushka Saroha · Yashvi · Shivangini Gupta · Vartika Malik</span>
      </footer>
    </div>
  );
}
