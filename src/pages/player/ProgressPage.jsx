// ═══════════════════════════════════════════════════════
//  ScoutAI — Player Progress Page
//  Shows historical performance trends
// ═══════════════════════════════════════════════════════

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { computeCompositeScore } from '../../engine/tierEngine';
import { SectionHeader } from '../../components/ui/SharedComponents';
import { MOCK_ATHLETES } from '../../data/mockAthletes';

const HISTORY = MOCK_ATHLETES[0].history; // Use demo history

const METRIC_COLORS = {
  speed: '#00ff87', acceleration: '#00d4ff',
  agility: '#a78bfa', balance: '#ffd700',
  technique: '#f59e0b', stamina: '#ff4d6d',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div style={{ background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 10, padding: '12px 16px' }}>
      <div style={{ fontSize: 12, color: 'var(--muted2)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ fontSize: 12, color: 'var(--text2)', textTransform: 'capitalize' }}>{p.dataKey}:</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: p.color, fontFamily: 'var(--font-mono)' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function ProgressPage({ report }) {
  // Combine historical data with current report
  const allHistory = report
    ? [...HISTORY, {
        date: 'Latest',
        ...report.metrics,
      }]
    : HISTORY;

  const compositeHistory = allHistory.map(h => ({
    date: h.date,
    EPI: computeCompositeScore({
      speed: h.speed, acceleration: h.acceleration,
      agility: h.agility, balance: h.balance,
      technique: h.technique, stamina: h.stamina,
    }),
  }));

  const latest  = allHistory[allHistory.length - 1];
  const prev    = allHistory[allHistory.length - 2];
  const metrics = Object.keys(METRIC_COLORS);

  const getDelta = (key) => {
    if (!prev) return 0;
    return (latest[key] || 0) - (prev[key] || 0);
  };

  return (
    <div className="page-pad">
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 36 }}>
        <h1 className="section-title">PROGRESS TRACKER</h1>
        <p className="section-subtitle">Your performance trend over time — {allHistory.length} assessments recorded</p>
      </div>

      {/* EPI trend */}
      <div className="card fade-up" style={{ marginBottom: 24, animationDelay: '0.06s' }}>
        <SectionHeader
          title="ELITE POTENTIAL INDEX — TREND"
          subtitle="Composite score across all assessments"
        />
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={compositeHistory}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'var(--muted2)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 100]} tick={{ fill: 'var(--muted2)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone" dataKey="EPI"
                stroke="var(--green)" strokeWidth={3}
                dot={{ fill: 'var(--green)', r: 5, strokeWidth: 0 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Individual metric trends */}
      <div className="card fade-up" style={{ marginBottom: 24, animationDelay: '0.12s' }}>
        <SectionHeader title="METRIC TRENDS" subtitle="All 6 biomechanical metrics over time" />
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={allHistory}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'var(--muted2)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[40, 100]} tick={{ fill: 'var(--muted2)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, color: 'var(--muted2)', textTransform: 'capitalize', paddingTop: 12 }}
              />
              {metrics.map(m => (
                <Line
                  key={m} type="monotone" dataKey={m}
                  stroke={METRIC_COLORS[m]} strokeWidth={2}
                  dot={{ fill: METRIC_COLORS[m], r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Delta cards */}
      <div className="fade-up" style={{ animationDelay: '0.18s' }}>
        <SectionHeader title="IMPROVEMENT SINCE LAST ASSESSMENT" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
          {metrics.map(m => {
            const delta = getDelta(m);
            const color = delta > 2 ? 'var(--green)' : delta < -2 ? 'var(--red)' : 'var(--muted2)';
            const Icon  = delta > 2 ? TrendingUp : delta < -2 ? TrendingDown : Minus;
            return (
              <div key={m} className="card" style={{ padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--muted2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, fontWeight: 700 }}>
                  {m.slice(0, 5)}
                </div>
                <Icon size={20} color={color} style={{ marginBottom: 8 }} />
                <div style={{ fontFamily: 'var(--font-head)', fontSize: 28, color, letterSpacing: 1 }}>
                  {delta > 0 ? `+${delta}` : delta}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
