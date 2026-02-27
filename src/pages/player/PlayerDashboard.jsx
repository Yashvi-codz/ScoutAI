// ═══════════════════════════════════════════════════════
//  ScoutAI — Player Dashboard
//  Layout: main content + right profile sidebar; quote center; tier sections on scroll
// ═══════════════════════════════════════════════════════

import { Activity, Target, Award, TrendingUp, Video, User, Ruler, FileUp, Trophy } from 'lucide-react';
import { computeCompositeScore, classifyTier } from '../../engine/tierEngine';
import { ScoreRing, TierBadge, StatCard, SectionHeader, Avatar } from '../../components/ui/SharedComponents';
import { DEMO_REPORT } from '../../data/mockAthletes';

const DASHBOARD_QUOTE = "Excellence is not a destination; it's a continuous journey.";
const TIER_DETAILS = [
  { id: 'tier-d', tier: 'D', label: 'Grassroots', range: '< 60', color: '#f59e0b', desc: 'Foundation phase. Focus on consistent training, basic technique, and building fitness. Ideal for entry-level athletes building their first performance profile.' },
  { id: 'tier-c', tier: 'C', label: 'Developing', range: '60–74', color: '#00d4ff', desc: 'Structured development. Refine skills, increase volume, and target weak metrics. You\'re building toward high potential with measurable progress.' },
  { id: 'tier-b', tier: 'B', label: 'High Potential', range: '75–89', color: '#00ff87', desc: 'Elite pathway. Performance is above average; focus on consistency, position-specific work, and exposure to higher-level competition.' },
  { id: 'tier-a', tier: 'A', label: 'Elite Pro', range: '≥ 90', color: '#ffd700', desc: 'Elite tier. Pro-ready profile. Maintain peak metrics, leadership, and specialist refinement. Target professional trials and national exposure.' },
];

export default function PlayerDashboard({ user, onNavigate, report }) {
  const activeReport = report || DEMO_REPORT;
  const score = computeCompositeScore(activeReport.metrics);
  const tier = classifyTier(score);

  const profileAge = user.age ?? '—';
  const profileHeight = user.height ?? '—';
  const pastCompetitions = user.pastCompetitions ?? ['State U-18 (2024)', 'District League (2023)'];

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100%' }}>
      {/* ── Main scrollable content ── */}
      <div className="page-pad" style={{ flex: 1, minWidth: 0 }}>
        {/* Greeting + CTA ── */}
        <div className="fade-up" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--muted2)', marginBottom: 6, letterSpacing: 0.5 }}>Welcome back,</div>
              <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 38, letterSpacing: 2, lineHeight: 1 }}>
                {user.name.toUpperCase()}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>Last assessed: {activeReport.date}</span>
              </div>
            </div>
            <button className="btn-primary" onClick={() => onNavigate('upload')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Video size={16} /> New Assessment
            </button>
          </div>
        </div>

        {/* ── Dashboard image (below welcome, above quote) ── */}
        <div style={{ marginBottom: 32, borderRadius: 16, overflow: 'hidden',display:'block' }}>
          <img
            src="/dashboard.webp"
            alt="ScoutAI Dashboard"
            style={{ paddingLeft:'200px',width: 'auto', height: '470px', display: 'block', objectFit: 'cover' ,alignItems:'center'}}
          />
        </div>

        {/* ── Quote (center of page) ── */}
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: 40, padding: '32px 24px' }}>
          <p style={{
            fontFamily: 'var(--font-head)',
            fontSize: 'clamp(22px, 3vw, 28px)',
            letterSpacing: 1.5,
            color: 'var(--text2)',
            lineHeight: 1.4,
            maxWidth: 560,
            margin: '0 auto',
            borderLeft: '4px solid var(--green)',
            paddingLeft: 20,
          }}>
            "{DASHBOARD_QUOTE}"
          </p>
        </div>

        {/* ── Top row: Score + stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 20, marginBottom: 32 }}>
          <div className="card fade-up" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 16, padding: '32px 40px', animationDelay: '0.05s',
            borderColor: tier.border, background: tier.bg,
          }}>
            <ScoreRing score={score} size={150} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 14, letterSpacing: 2, color: tier.color, marginBottom: 4 }}>
                TIER {tier.tier} — {tier.label.toUpperCase()}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted2)', maxWidth: 200 }}>{tier.recommendation}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <StatCard label="Assessments" value="1" sub="Total completed" icon={Activity} delay={0.08} />
            <StatCard label="Best Metric" value="76" sub="Technique score" icon={Target} color="var(--cyan)" delay={0.12} />
            <StatCard label="Rank (Peers)" value="Top 28%" sub="Based on EPI score" icon={Award} color="var(--amber)" delay={0.16} />
            <StatCard label="Tier Progress" value={`${score}/75`} sub="Points to Tier B" icon={TrendingUp} color="var(--purple)" delay={0.20} />
          </div>
        </div>

        {/* ── Tier A/B/C/D details (scroll sections) ── */}
        <div className="fade-up" style={{ animationDelay: '0.34s' }}>
          <SectionHeader title="TIER GUIDE" subtitle="Understand each tier as you scroll" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {TIER_DETAILS.map(({ id, tier: t, label, range, color, desc }) => {
              const isActive = tier.tier === t;
              return (
                <section
                  key={t}
                  id={id}
                  style={{
                    padding: '20px 22px',
                    border: `1px solid ${isActive ? color : 'var(--border)'}`,
                    borderRadius: 12,
                    background: isActive ? `${color}12` : 'var(--card)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <span style={{ fontFamily: 'var(--font-head)', fontSize: 24, color, letterSpacing: 1 }}>TIER {t}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text2)' }}>{label}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{range} pts</span>
                    {isActive && (
                      <span style={{ marginLeft: 'auto', fontSize: 11, color, background: `${color}18`, padding: '4px 10px', borderRadius: 6 }}>You are here</span>
                    )}
                  </div>
                  <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.65, margin: 0 }}>{desc}</p>
                </section>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Right sidebar: Profile (like navbar on right) ── */}
      <aside
        style={{
          width: 280,
          minWidth: 280,
          background: 'var(--bg2)',
          borderLeft: '1px solid var(--border)',
          padding: '24px 20px',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        {/* Name + profile icon at top ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
          <Avatar initials={(user.name || 'U').slice(0, 2).toUpperCase()} size={48} color="var(--green)" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, letterSpacing: 1.2, color: 'var(--text)', lineHeight: 1.2 }}>{user.name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 2 }}>Athlete · {user.region || 'India'}</div>
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: 'var(--muted2)', marginBottom: 16, textTransform: 'uppercase' }}>Profile</div>

        {/* Current tier ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>Current tier</div>
          <TierBadge score={score} />
        </div>

        {/* Age ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={18} color="var(--muted2)" />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>Age</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{profileAge}</div>
          </div>
        </div>

        {/* Height ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ruler size={18} color="var(--muted2)" />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>Height</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{profileHeight}</div>
          </div>
        </div>

        {/* Certificates upload ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>Certificates</div>
          <div
            className="upload-zone"
            style={{ padding: 16, fontSize: 12, cursor: 'pointer' }}
            onClick={() => {}}
          >
            <FileUp size={18} style={{ color: 'var(--muted2)', marginBottom: 6 }} />
            <div style={{ color: 'var(--text2)' }}>Upload certificate</div>
          </div>
        </div>

        {/* Past competitions ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Trophy size={14} color="var(--amber)" />
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>Past competitions</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>
            {pastCompetitions.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
