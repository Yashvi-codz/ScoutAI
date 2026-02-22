// ═══════════════════════════════════════════════════════
//  ScoutAI — Coach Dashboard
//  Overview of all athletes, tier distribution, top picks
// ═══════════════════════════════════════════════════════

import { useState } from 'react';
import { Users, Award, TrendingUp, MapPin, Search, ChevronRight, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { computeCompositeScore, classifyTier } from '../../engine/tierEngine';
import { Avatar, TierBadge, StatCard, SectionHeader } from '../../components/ui/SharedComponents';
import { MOCK_ATHLETES } from '../../data/mockAthletes';

export default function CoachDashboard({ onViewAthlete }) {
  const [search,    setSearch]    = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [regionFilter, setRegionFilter] = useState('ALL');

  // Compute scores for all athletes
  const enriched = MOCK_ATHLETES.map(a => ({
    ...a,
    score: computeCompositeScore(a.metrics),
    tier:  classifyTier(computeCompositeScore(a.metrics)),
  }));

  // Filter
  const filtered = enriched.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.region.toLowerCase().includes(search.toLowerCase());
    const matchTier   = tierFilter === 'ALL' || a.tier.tier === tierFilter;
    const matchRegion = regionFilter === 'ALL' || a.region === regionFilter;
    return matchSearch && matchTier && matchRegion;
  });

  // Tier distribution for chart
  const tierDist = ['A','B','C','D'].map(t => ({
    tier: `Tier ${t}`,
    count: enriched.filter(a => a.tier.tier === t).length,
    color: classifyTier(t === 'A' ? 95 : t === 'B' ? 80 : t === 'C' ? 65 : 50).color,
  }));

  // Top performer
  const topAthletes = [...enriched].sort((a, b) => b.score - a.score).slice(0, 3);
  const regions = [...new Set(MOCK_ATHLETES.map(a => a.region))];

  const avgScore = Math.round(enriched.reduce((s, a) => s + a.score, 0) / enriched.length);

  return (
    <div className="page-pad">
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 36 }}>
        <h1 className="section-title">COACH DASHBOARD</h1>
        <p className="section-subtitle">Overview of {enriched.length} athletes across {regions.length} regions</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Athletes"    value={enriched.length}                      icon={Users}     delay={0.04} />
        <StatCard label="Tier A Athletes"   value={enriched.filter(a=>a.tier.tier==='A').length} icon={Award} color="var(--gold)"  delay={0.08} />
        <StatCard label="Average EPI"       value={avgScore}                             icon={TrendingUp} color="var(--cyan)" delay={0.12} />
        <StatCard label="Regions Covered"   value={regions.length}                       icon={MapPin}    color="var(--purple)" delay={0.16} />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Tier distribution bar */}
        <div className="card fade-up" style={{ animationDelay: '0.18s' }}>
          <SectionHeader title="TIER DISTRIBUTION" subtitle="Athletes by performance tier" />
          <div style={{ height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tierDist} barSize={36}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="tier" tick={{ fill: 'var(--muted2)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--muted2)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 8 }}
                  labelStyle={{ color: 'var(--text2)', fontSize: 12 }}
                />
                <Bar dataKey="count" radius={[6,6,0,0]}>
                  {tierDist.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={0.85} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top picks */}
        <div className="card fade-up" style={{ animationDelay: '0.22s' }}>
          <SectionHeader title="TOP ATHLETES" subtitle="Highest EPI scores" />
          {topAthletes.map((a, i) => (
            <div
              key={a.id}
              onClick={() => onViewAthlete(a)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 10px', borderRadius: 10, cursor: 'pointer',
                transition: 'background 0.2s', marginBottom: 6,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontFamily: 'var(--font-head)', fontSize: 20, color: ['#ffd700','var(--green)','var(--cyan)'][i], width: 28, textAlign: 'center' }}>#{i+1}</div>
              <Avatar initials={a.avatar} size={38} color={a.tier.color} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{a.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted2)' }}>{a.position} · {a.region}</div>
              </div>
              <TierBadge score={a.score} size="sm" />
              <ChevronRight size={14} color="var(--muted)" />
            </div>
          ))}
        </div>
      </div>

      {/* Athlete table */}
      <div className="card fade-up" style={{ animationDelay: '0.26s' }}>
        {/* Filters */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <SectionHeader title="ALL ATHLETES" subtitle={`Showing ${filtered.length} of ${enriched.length}`} />
          <div style={{ display: 'flex', gap: 10 }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={14} color="var(--muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="input-field"
                placeholder="Search name or region..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 36, width: 220, padding: '9px 12px 9px 36px' }}
              />
            </div>
            {/* Tier filter */}
            <select className="select-field" value={tierFilter} onChange={e => setTierFilter(e.target.value)} style={{ width: 130 }}>
              <option value="ALL">All Tiers</option>
              {['A','B','C','D'].map(t => <option key={t} value={t}>Tier {t}</option>)}
            </select>
            {/* Region filter */}
            <select className="select-field" value={regionFilter} onChange={e => setRegionFilter(e.target.value)} style={{ width: 140 }}>
              <option value="ALL">All Regions</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Athlete', 'Age', 'Position', 'Region', 'Speed', 'Technique', 'Stamina', 'EPI Score', 'Tier', ''].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '10px 12px',
                    fontSize: 10, color: 'var(--muted)', fontWeight: 700,
                    letterSpacing: 1.2, textTransform: 'uppercase',
                    borderBottom: '1px solid var(--border)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  onClick={() => onViewAthlete(a)}
                  style={{ cursor: 'pointer', transition: 'background 0.15s', borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar initials={a.avatar} size={34} color={a.tier.color} />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{a.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: 13, color: 'var(--text2)' }}>{a.age}</td>
                  <td style={{ padding: '14px 12px', fontSize: 13, color: 'var(--text2)' }}>{a.position}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--muted2)' }}>
                      <MapPin size={11} /> {a.region}
                    </span>
                  </td>
                  {['speed','technique','stamina'].map(m => {
                    const v = a.metrics[m];
                    const c = v >= 75 ? 'var(--green)' : v >= 60 ? 'var(--cyan)' : 'var(--amber)';
                    return (
                      <td key={m} style={{ padding: '14px 12px' }}>
                        <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: c }}>{v}</span>
                      </td>
                    );
                  })}
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ fontFamily: 'var(--font-head)', fontSize: 22, color: a.tier.color }}>{a.score}</span>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <TierBadge score={a.score} size="sm" />
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--muted2)', fontSize: 12 }}>
                      <Eye size={13} /> View
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
              No athletes match your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
