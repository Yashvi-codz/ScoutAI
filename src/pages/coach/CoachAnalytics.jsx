// ═══════════════════════════════════════════════════════
//  ScoutAI — Coach Analytics Page
// ═══════════════════════════════════════════════════════

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Cell,
} from 'recharts';
import { computeCompositeScore, classifyTier } from '../../engine/tierEngine';
import { SectionHeader } from '../../components/ui/SharedComponents';
import { MOCK_ATHLETES } from '../../data/mockAthletes';

export default function CoachAnalytics() {
  const enriched = MOCK_ATHLETES.map(a => ({
    ...a,
    score: computeCompositeScore(a.metrics),
    tier: classifyTier(computeCompositeScore(a.metrics)),
  }));

  // Average metrics across all athletes
  const avgMetrics = Object.fromEntries(
    ['speed','acceleration','agility','balance','technique','stamina'].map(m => [
      m,
      Math.round(enriched.reduce((s, a) => s + a.metrics[m], 0) / enriched.length),
    ])
  );

  const radarData = Object.entries(avgMetrics).map(([key, val]) => ({
    metric: { speed:'Speed', acceleration:'Accel', agility:'Agility', balance:'Balance', technique:'Technique', stamina:'Stamina' }[key],
    value: val,
  }));

  const scoreData = enriched.map(a => ({
    name: a.name.split(' ')[0],
    EPI: a.score,
    color: a.tier.color,
  }));

  const regionData = [...new Set(enriched.map(a => a.region))].map(r => ({
    region: r,
    count: enriched.filter(a => a.region === r).length,
    avgEPI: Math.round(enriched.filter(a => a.region === r).reduce((s, a) => s + a.score, 0) / enriched.filter(a => a.region === r).length),
  }));

  return (
    <div className="page-pad">
      <div className="fade-up" style={{ marginBottom: 36 }}>
        <h1 className="section-title">ANALYTICS</h1>
        <p className="section-subtitle">Performance insights across your entire athlete pool</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* EPI comparison */}
        <div className="card fade-up" style={{ animationDelay: '0.06s' }}>
          <SectionHeader title="EPI SCORES" subtitle="All athletes ranked" />
          <div style={{ height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={scoreData} barSize={28} layout="vertical">
                <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" domain={[0,100]} tick={{ fill: 'var(--muted2)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill: 'var(--muted2)', fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                <Tooltip contentStyle={{ background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 8 }} />
                <Bar dataKey="EPI" radius={[0,6,6,0]}>
                  {scoreData.map((e, i) => <Cell key={i} fill={e.color} fillOpacity={0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team average radar */}
        <div className="card fade-up" style={{ animationDelay: '0.10s' }}>
          <SectionHeader title="TEAM AVERAGE METRICS" />
          <div style={{ height: 220 }}>
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.07)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--muted2)', fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Average" dataKey="value" stroke="var(--cyan)" fill="var(--cyan)" fillOpacity={0.12} strokeWidth={2} dot={{ fill: 'var(--cyan)', r: 3 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Region breakdown */}
      <div className="card fade-up" style={{ animationDelay: '0.14s' }}>
        <SectionHeader title="REGIONAL BREAKDOWN" subtitle="Athletes and average EPI by state/region" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
          {regionData.map(r => (
            <div key={r.region} className="card-sm" style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>📍 {r.region}</div>
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 28, color: 'var(--cyan)', marginBottom: 4 }}>{r.avgEPI}</div>
              <div style={{ fontSize: 12, color: 'var(--muted2)' }}>Avg EPI · {r.count} athlete{r.count > 1 ? 's' : ''}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
