// ═══════════════════════════════════════════════════════
//  ScoutAI — Compare Athletes (Coach)
//  Side-by-side comparison of 2 athletes
// ═══════════════════════════════════════════════════════

import { useState } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from 'recharts';
import { computeCompositeScore, classifyTier, METRIC_META } from '../../engine/tierEngine';
import { Avatar, TierBadge, ScoreRing, SectionHeader } from '../../components/ui/SharedComponents';
import { MOCK_ATHLETES } from '../../data/mockAthletes';

export default function CompareAthletes() {
  const [leftId,  setLeftId]  = useState(MOCK_ATHLETES[0].id);
  const [rightId, setRightId] = useState(MOCK_ATHLETES[1].id);

  const getAthlete = (id) => {
    const a = MOCK_ATHLETES.find(x => x.id === id);
    if (!a) return null;
    return { ...a, score: computeCompositeScore(a.metrics), tier: classifyTier(computeCompositeScore(a.metrics)) };
  };

  const left  = getAthlete(leftId);
  const right = getAthlete(rightId);

  if (!left || !right) return null;

  const radarData = Object.keys(left.metrics).map(key => ({
    metric: { speed:'Speed', acceleration:'Accel', agility:'Agility', balance:'Balance', technique:'Technique', stamina:'Stamina' }[key],
    left:  left.metrics[key],
    right: right.metrics[key],
  }));

  const metrics = Object.keys(METRIC_META);

  return (
    <div className="page-pad">
      <div className="fade-up" style={{ marginBottom: 36 }}>
        <h1 className="section-title">COMPARE ATHLETES</h1>
        <p className="section-subtitle">Side-by-side biomechanical performance comparison</p>
      </div>

      {/* Selectors — exactly 2 athletes, equal width */}
      <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center', marginBottom: 28, animationDelay: '0.06s' }}>
        <div>
          <label className="form-label">Athlete A</label>
          <select className="select-field" value={leftId} onChange={e => setLeftId(e.target.value)}>
            {MOCK_ATHLETES.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Athlete B</label>
          <select className="select-field" value={rightId} onChange={e => setRightId(e.target.value)}>
            {MOCK_ATHLETES.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
      </div>

      {/* Hero comparison — equal 50/50 ratio */}
      <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24, animationDelay: '0.10s' }}>
        {[left, right].map((ath) => (
          <div key={ath.id} className="card" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 14, padding: '28px', minWidth: 0,
            background: ath.tier.bg, borderColor: ath.tier.border,
            textAlign: 'center',
          }}>
            <Avatar initials={ath.avatar} size={56} color={ath.tier.color} />
            <div>
              <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 22, letterSpacing: 1, marginBottom: 4 }}>{ath.name}</h3>
              <div style={{ fontSize: 12, color: 'var(--muted2)', marginBottom: 10 }}>{ath.position} · {ath.region} · Age {ath.age}</div>
              <TierBadge score={ath.score} />
            </div>
            <ScoreRing score={ath.score} size={110} />
          </div>
        ))}
      </div>

      {/* Radar overlay */}
      <div className="card fade-up" style={{ marginBottom: 24, animationDelay: '0.14s' }}>
        <SectionHeader title="RADAR OVERLAY" subtitle="Both athletes on the same chart" />
        <div style={{ height: 280 }}>
          <ResponsiveContainer>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.07)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--muted2)', fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name={left.name.split(' ')[0]} dataKey="left" stroke={left.tier.color} fill={left.tier.color} fillOpacity={0.12} strokeWidth={2.5} dot={{ fill: left.tier.color, r: 4 }} />
              <Radar name={right.name.split(' ')[0]} dataKey="right" stroke={right.tier.color} fill={right.tier.color} fillOpacity={0.12} strokeWidth={2.5} dot={{ fill: right.tier.color, r: 4 }} />
            </RadarChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
            {[left, right].map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 3, background: a.tier.color, borderRadius: 2 }} />
                <span style={{ fontSize: 12, color: 'var(--muted2)' }}>{a.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metric-by-metric — equal columns for Athlete A and Athlete B */}
      <div className="card fade-up" style={{ animationDelay: '0.18s' }}>
        <SectionHeader title="METRIC COMPARISON" subtitle="Head-to-head: two athletes only" />
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'right', padding: '8px 12px', fontSize: 10, color: 'var(--muted)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', width: '40%', borderBottom: '1px solid var(--border)' }}>{left.name.split(' ')[0]}</th>
              <th style={{ textAlign: 'center', padding: '8px 12px', fontSize: 10, color: 'var(--muted)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', width: '20%', borderBottom: '1px solid var(--border)' }}>METRIC</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 10, color: 'var(--muted)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', width: '40%', borderBottom: '1px solid var(--border)' }}>{right.name.split(' ')[0]}</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => {
              const lv = left.metrics[m];
              const rv = right.metrics[m];
              const lc = lv > rv ? 'var(--green)' : lv === rv ? 'var(--muted2)' : 'var(--text2)';
              const rc = rv > lv ? 'var(--green)' : rv === lv ? 'var(--muted2)' : 'var(--text2)';
              const label = METRIC_META[m]?.label || m;
              return (
                <tr key={m} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 12px', textAlign: 'right', width: '40%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
                      <div style={{ flex: 1, maxWidth: 120, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', direction: 'rtl' }}>
                        <div style={{ height: '100%', width: `${lv}%`, background: lc, borderRadius: 4, transition: 'width 1s ease' }} />
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: lc, minWidth: 28 }}>{lv}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'center', width: '20%' }}>
                    <span style={{ fontSize: 12, color: 'var(--muted2)', fontWeight: 600 }}>{label}</span>
                  </td>
                  <td style={{ padding: '14px 12px', width: '40%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: rc, minWidth: 28 }}>{rv}</span>
                      <div style={{ flex: 1, maxWidth: 120, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${rv}%`, background: rc, borderRadius: 4, transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
