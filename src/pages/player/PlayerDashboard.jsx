// ═══════════════════════════════════════════════════════
//  ScoutAI — Player Dashboard
// ═══════════════════════════════════════════════════════

import { Activity, Target, Award, TrendingUp, Video, ArrowRight } from 'lucide-react';
import { computeCompositeScore, classifyTier, recommendPositions } from '../../engine/tierEngine';
import { ScoreRing, TierBadge, MetricBar, StatCard, SectionHeader } from '../../components/ui/SharedComponents';
import { DEMO_REPORT } from '../../data/mockAthletes';

export default function PlayerDashboard({ user, onNavigate, report }) {
  const activeReport = report || DEMO_REPORT;
  const score   = computeCompositeScore(activeReport.metrics);
  const tier    = classifyTier(score);
  const positions = recommendPositions(activeReport.metrics);

  const benchmarks = { speed: 74, acceleration: 71, agility: 72, balance: 68, technique: 73, stamina: 70 };

  return (
    <div className="page-pad">
      {/* ── Greeting ── */}
      <div className="fade-up" style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--muted2)', marginBottom: 6, letterSpacing: 0.5 }}>
              Welcome back,
            </div>
            <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 38, letterSpacing: 2, lineHeight: 1 }}>
              {user.name.toUpperCase()}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <TierBadge score={score} />
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                Last assessed: {activeReport.date}
              </span>
            </div>
          </div>
          <button className="btn-primary" onClick={() => onNavigate('upload')} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Video size={16} /> New Assessment
          </button>
        </div>
      </div>

      {/* ── Top row: Score + stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 20, marginBottom: 24 }}>
        {/* EPI Card */}
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
            <div style={{ fontSize: 12, color: 'var(--muted2)', maxWidth: 200 }}>
              {tier.recommendation}
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <StatCard label="Assessments"      value="1"         sub="Total completed"       icon={Activity} delay={0.08} />
          <StatCard label="Best Metric"      value="76"        sub={`Technique score`}      icon={Target}   color="var(--cyan)" delay={0.12} />
          <StatCard label="Rank (Peers)"     value="Top 28%"   sub={`Based on EPI score`}   icon={Award}    color="var(--amber)" delay={0.16} />
          <StatCard label="Tier Progress"    value={`${score}/75`} sub="Points to Tier B"   icon={TrendingUp} color="var(--purple)" delay={0.20} />
        </div>
      </div>

      {/* ── Metrics + Position ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Metrics */}
        <div className="card fade-up" style={{ animationDelay: '0.22s' }}>
          <SectionHeader
            title="PERFORMANCE METRICS"
            subtitle="Your 6 biomechanical scores vs age-group benchmark"
            action={
              <button onClick={() => onNavigate('reports')} style={{
                background: 'none', border: 'none', color: 'var(--green)',
                fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
              }}>
                Full Report <ArrowRight size={13} />
              </button>
            }
          />
          {Object.entries(activeReport.metrics).map(([key, val]) => (
            <MetricBar key={key} metricKey={key} value={val} benchmark={benchmarks[key]} />
          ))}
        </div>

        {/* Positions + recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Best positions */}
          <div className="card fade-up" style={{ animationDelay: '0.26s' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: 'var(--muted2)', marginBottom: 16, textTransform: 'uppercase' }}>
              Recommended Positions
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {positions.map((pos, i) => (
                <div key={pos} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px',
                  background: i === 0 ? 'rgba(0,255,135,0.06)' : 'var(--surface)',
                  border: `1px solid ${i === 0 ? 'rgba(0,255,135,0.2)' : 'var(--border)'}`,
                  borderRadius: 10,
                }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    color: i === 0 ? 'var(--green)' : 'var(--muted2)',
                    background: i === 0 ? 'rgba(0,255,135,0.1)' : 'rgba(255,255,255,0.04)',
                    padding: '2px 8px', borderRadius: 4,
                  }}>
                    #{i + 1}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: i === 0 ? 'var(--text)' : 'var(--text2)' }}>{pos}</span>
                  {i === 0 && <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--green)' }}>Best fit</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="card fade-up" style={{ animationDelay: '0.30s' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: 'var(--muted2)', marginBottom: 14, textTransform: 'uppercase' }}>
              Quick Actions
            </div>
            {[
              { label: 'View Full Report', page: 'reports', icon: Target, color: 'var(--green)' },
              { label: 'Track Progress',   page: 'progress', icon: TrendingUp, color: 'var(--cyan)' },
              { label: 'New Assessment',   page: 'upload', icon: Video, color: 'var(--amber)' },
            ].map(({ label, page, icon: Icon, color }) => (
              <div
                key={label}
                onClick={() => onNavigate(page)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 12px', borderRadius: 9,
                  cursor: 'pointer', transition: 'background 0.2s',
                  marginBottom: 4,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: 32, height: 32, background: `${color}14`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={15} color={color} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{label}</span>
                <ArrowRight size={14} color="var(--muted)" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tier roadmap ── */}
      <div className="card fade-up" style={{ animationDelay: '0.34s' }}>
        <SectionHeader title="TIER ROADMAP" subtitle="Your pathway to elite-level performance" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { tier: 'D', label: 'Grassroots', range: '< 60',  color: '#f59e0b' },
            { tier: 'C', label: 'Developing', range: '60–74', color: '#00d4ff' },
            { tier: 'B', label: 'High Potential', range: '75–89', color: '#00ff87' },
            { tier: 'A', label: 'Elite Pro',  range: '≥ 90',  color: '#ffd700' },
          ].map(({ tier: t, label, range, color }) => {
            const isActive = tier.tier === t;
            const isPast = (
              (t === 'D' && score >= 60) ||
              (t === 'C' && score >= 75) ||
              (t === 'B' && score >= 90)
            );
            return (
              <div key={t} style={{
                padding: '16px 18px',
                border: `1px solid ${isActive ? color : 'var(--border)'}`,
                borderRadius: 12,
                background: isActive ? `${color}10` : 'var(--surface)',
                position: 'relative',
                opacity: isPast ? 0.5 : 1,
              }}>
                {isActive && (
                  <div style={{
                    position: 'absolute', top: -1, left: -1, right: -1,
                    height: 3, background: color, borderRadius: '12px 12px 0 0',
                  }} />
                )}
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 22, color, letterSpacing: 1 }}>TIER {t}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', margin: '4px 0 2px' }}>{label}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{range} pts</div>
                {isActive && (
                  <div style={{ marginTop: 8, fontSize: 11, color, background: `${color}15`, padding: '3px 8px', borderRadius: 4, display: 'inline-block' }}>
                    ← You are here
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
