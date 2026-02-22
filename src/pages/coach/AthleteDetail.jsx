// ═══════════════════════════════════════════════════════
//  ScoutAI — Athlete Detail Page (Coach View)
// ═══════════════════════════════════════════════════════

import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { ArrowLeft, MapPin, Calendar, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { computeCompositeScore, classifyTier, recommendPositions, generateDevelopmentPlan, getBenchmarks } from '../../engine/tierEngine';
import { generateSWOT } from '../../engine/swotEngine';
import { ScoreRing, TierBadge, MetricBar, Avatar, SectionHeader } from '../../components/ui/SharedComponents';

export default function AthleteDetail({ athlete, onBack }) {
  if (!athlete) return null;

  const score      = computeCompositeScore(athlete.metrics);
  const tier       = classifyTier(score);
  const benchmarks = getBenchmarks(athlete.age, athlete.position);
  const swot       = generateSWOT(athlete.metrics, benchmarks);
  const positions  = recommendPositions(athlete.metrics);
  const devPlan    = generateDevelopmentPlan(athlete.metrics, tier);

  const radarData  = Object.entries(athlete.metrics).map(([key, val]) => ({
    metric: { speed: 'Speed', acceleration: 'Accel', agility: 'Agility', balance: 'Balance', technique: 'Technique', stamina: 'Stamina' }[key] || key,
    score: val,
    benchmark: benchmarks[key] || 70,
  }));

  return (
    <div className="page-pad">
      {/* Back */}
      <button
        onClick={onBack}
        style={{
          background: 'none', border: 'none', color: 'var(--muted2)',
          cursor: 'pointer', fontSize: 13,
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28,
        }}
      >
        <ArrowLeft size={14} /> Back to Athletes
      </button>

      {/* Hero */}
      <div className="fade-up" style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36, flexWrap: 'wrap' }}>
        <Avatar initials={athlete.avatar} size={68} color={tier.color} />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: 'var(--font-head)', fontSize: 36, letterSpacing: 2, marginBottom: 6 }}>{athlete.name.toUpperCase()}</h1>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <TierBadge score={score} />
            <span style={{ fontSize: 13, color: 'var(--muted2)', display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={12} /> {athlete.region}</span>
            <span style={{ fontSize: 13, color: 'var(--muted2)' }}>Age {athlete.age}</span>
            <span style={{ fontSize: 13, color: 'var(--muted2)' }}>{athlete.position}</span>
            <span style={{ fontSize: 13, color: 'var(--muted2)', display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={12} /> {athlete.assessmentDate}</span>
          </div>
        </div>
        <ScoreRing score={score} size={130} />
      </div>

      {/* Radar + Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card fade-up" style={{ animationDelay: '0.08s' }}>
          <SectionHeader title="SKILL RADAR" />
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.07)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--muted2)', fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Benchmark" dataKey="benchmark" stroke="rgba(255,255,255,0.15)" fill="rgba(255,255,255,0.04)" strokeWidth={1} />
                <Radar name="Athlete" dataKey="score" stroke={tier.color} fill={tier.color} fillOpacity={0.18} strokeWidth={2.5} dot={{ fill: tier.color, r: 4 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card fade-up" style={{ animationDelay: '0.11s' }}>
          <SectionHeader title="METRICS vs BENCHMARK" />
          {Object.entries(athlete.metrics).map(([key, val]) => (
            <MetricBar key={key} metricKey={key} value={val} benchmark={benchmarks[key]} />
          ))}
        </div>
      </div>

      {/* Progress chart (if available) */}
      {athlete.history && athlete.history.length > 1 && (
        <div className="card fade-up" style={{ marginBottom: 24, animationDelay: '0.14s' }}>
          <SectionHeader title="PROGRESS HISTORY" subtitle={`${athlete.history.length} assessments`} />
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={athlete.history}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: 'var(--muted2)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[40, 100]} tick={{ fill: 'var(--muted2)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 8, fontSize: 12 }} />
                {['speed','technique','stamina','balance'].map((m, i) => (
                  <Line key={m} type="monotone" dataKey={m} stroke={['#00ff87','#00d4ff','#a78bfa','#ffd700'][i]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* SWOT */}
      <div className="fade-up" style={{ marginBottom: 24, animationDelay: '0.18s' }}>
        <SectionHeader title="SWOT ANALYSIS" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 14 }}>
          {[
            { title: 'Strengths', items: swot.strengths, color: 'var(--green)', Icon: CheckCircle, cls: 'swot-strength' },
            { title: 'Weaknesses', items: swot.weaknesses, color: 'var(--red)', Icon: AlertTriangle, cls: 'swot-weakness' },
            { title: 'Opportunities', items: swot.opportunities, color: 'var(--cyan)', Icon: TrendingUp, cls: 'swot-opportunity' },
            { title: 'Threats', items: swot.threats, color: 'var(--amber)', Icon: AlertTriangle, cls: 'swot-threat' },
          ].map(({ title, items, color, Icon, cls }) => (
            <div key={title} className={cls}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Icon size={14} color={color} />
                <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</span>
              </div>
              {items.length === 0
                ? <p style={{ fontSize: 12, color: 'var(--muted)' }}>—</p>
                : items.map((item, i) => (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{item.label || item.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted2)', lineHeight: 1.5 }}>{item.detail || item.desc}</div>
                    </div>
                  ))
              }
            </div>
          ))}
        </div>
      </div>

      {/* Positions + Plan */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: 20 }}>
        <div className="card fade-up" style={{ animationDelay: '0.22s' }}>
          <SectionHeader title="BEST POSITIONS" />
          {positions.map((pos, i) => (
            <div key={pos} style={{
              padding: '12px 14px', marginBottom: 8,
              background: i === 0 ? 'rgba(0,255,135,0.06)' : 'var(--surface)',
              border: `1px solid ${i === 0 ? 'rgba(0,255,135,0.2)' : 'var(--border)'}`,
              borderRadius: 10,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{pos}</span>
              {i === 0 && <span style={{ fontSize: 10, color: 'var(--green)' }}>Best fit</span>}
            </div>
          ))}
        </div>

        <div className="card fade-up" style={{ animationDelay: '0.25s' }}>
          <SectionHeader title="DEVELOPMENT PLAN" />
          {devPlan.map((p, i) => (
            <div key={i} style={{
              display: 'flex', gap: 14, paddingBottom: 14, marginBottom: 14,
              borderBottom: i < devPlan.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{
                width: 32, height: 32, flexShrink: 0,
                background: p.priority === 'HIGH' ? 'rgba(255,77,109,0.1)' : 'rgba(245,158,11,0.1)',
                borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700,
                color: p.priority === 'HIGH' ? 'var(--red)' : 'var(--amber)',
                fontFamily: 'var(--font-mono)',
              }}>{p.weeks}w</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{p.area}</div>
                {p.drills.map(d => (
                  <div key={d} style={{ fontSize: 12, color: 'var(--muted2)', marginBottom: 2 }}>· {d}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
