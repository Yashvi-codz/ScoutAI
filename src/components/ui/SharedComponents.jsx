// ═══════════════════════════════════════════════════════
//  ScoutAI — Shared UI Components
//  ScoreRing | MetricBar | TierBadge | Avatar | StatCard
// ═══════════════════════════════════════════════════════

import { classifyTier, METRIC_META } from '../../engine/tierEngine';
import {
  Wind, Zap, Activity, Shield, Target, Heart,
  TrendingUp, TrendingDown, Minus
} from 'lucide-react';

// ── Icon map for metrics ──
const METRIC_ICONS = { Wind, Zap, Activity, Shield, Target, Heart };

// ──────────────────────────────────────
//  SCORE RING — circular EPI display
// ──────────────────────────────────────
export function ScoreRing({ score, size = 140 }) {
  const tier = classifyTier(score);
  const r    = size * 0.37;
  const cx   = size / 2;
  const circ = 2 * Math.PI * r;
  const pct  = score / 100;
  const strokeW = size * 0.072;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={cx} cy={cx} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeW}
        />
        <circle
          cx={cx} cy={cx} r={r}
          fill="none"
          stroke={tier.color}
          strokeWidth={strokeW}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          fontFamily: 'var(--font-head)',
          fontSize: size * 0.27,
          color: tier.color,
          lineHeight: 1,
          animation: 'countUp 0.7s cubic-bezier(0.34,1.56,0.64,1)',
        }}>{score}</div>
        <div style={{ fontSize: size * 0.08, color: 'var(--muted2)', marginTop: 4, letterSpacing: 1 }}>EPI SCORE</div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────
//  TIER BADGE
// ──────────────────────────────────────
export function TierBadge({ score, size = 'md' }) {
  const tier = classifyTier(score);
  const sizes = {
    sm: { padding: '3px 10px', fontSize: 10 },
    md: { padding: '5px 14px', fontSize: 12 },
    lg: { padding: '8px 20px', fontSize: 15 },
  };
  return (
    <span style={{
      background: tier.bg,
      border: `1px solid ${tier.border}`,
      color: tier.color,
      borderRadius: 99,
      fontFamily: 'var(--font-mono)',
      fontWeight: 700,
      letterSpacing: 1,
      display: 'inline-block',
      ...sizes[size],
    }}>
      TIER {tier.tier} · {tier.label}
    </span>
  );
}

// ──────────────────────────────────────
//  METRIC BAR — animated progress bar
// ──────────────────────────────────────
export function MetricBar({ metricKey, value, benchmark }) {
  const meta  = METRIC_META[metricKey] || { label: metricKey, icon: 'Activity' };
  const Icon  = METRIC_ICONS[meta.icon] || Activity;
  const color = value >= 75 ? 'var(--green)' : value >= 60 ? 'var(--cyan)' : 'var(--amber)';
  const delta = benchmark ? value - benchmark : null;

  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={14} color={color} />
          <span style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 500 }}>{meta.label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {benchmark && (
            <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              avg {benchmark}
            </span>
          )}
          {delta !== null && (
            <span style={{
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              color: delta >= 0 ? 'var(--green)' : 'var(--red)',
              display: 'flex', alignItems: 'center', gap: 2,
            }}>
              {delta > 0 ? <TrendingUp size={10} /> : delta < 0 ? <TrendingDown size={10} /> : <Minus size={10} />}
              {delta > 0 ? `+${delta}` : delta}
            </span>
          )}
          <span style={{ fontSize: 14, fontWeight: 700, color, fontFamily: 'var(--font-mono)', minWidth: 28, textAlign: 'right' }}>
            {value}
          </span>
        </div>
      </div>

      {/* Track */}
      <div style={{ position: 'relative', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'visible' }}>
        {/* Fill */}
        <div style={{
          height: '100%',
          width: `${value}%`,
          background: color,
          borderRadius: 4,
          transition: 'width 1.1s cubic-bezier(0.34,1.56,0.64,1)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            animation: 'shimmer 2s infinite',
          }} />
        </div>
        {/* Benchmark tick */}
        {benchmark && (
          <div style={{
            position: 'absolute',
            left: `${benchmark}%`,
            top: -4, bottom: -4,
            width: 2,
            background: 'rgba(255,255,255,0.25)',
            borderRadius: 1,
          }} />
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────
//  AVATAR — initials circle
// ──────────────────────────────────────
export function Avatar({ initials, size = 40, color = 'var(--green)' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `${color}18`,
      border: `2px solid ${color}40`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-head)',
      fontSize: size * 0.35,
      color,
      flexShrink: 0,
      letterSpacing: 1,
    }}>
      {initials}
    </div>
  );
}

// ──────────────────────────────────────
//  STAT CARD — compact number card
// ──────────────────────────────────────
export function StatCard({ label, value, sub, icon: Icon, color = 'var(--green)', delay = 0 }) {
  return (
    <div className="card fade-up" style={{ animationDelay: `${delay}s` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <span style={{
          fontSize: 11, color: 'var(--muted2)', fontWeight: 700,
          letterSpacing: 1.2, textTransform: 'uppercase',
        }}>{label}</span>
        {Icon && (
          <div style={{
            width: 36, height: 36,
            background: `${color}15`, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={18} color={color} />
          </div>
        )}
      </div>
      <div style={{ fontFamily: 'var(--font-head)', fontSize: 40, color, lineHeight: 1, letterSpacing: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

// ──────────────────────────────────────
//  INFO CHIP — small labelled value
// ──────────────────────────────────────
export function InfoChip({ label, value, color = 'var(--muted2)' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 2,
      padding: '10px 16px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 10,
    }}>
      <span style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color }}>{value}</span>
    </div>
  );
}

// ──────────────────────────────────────
//  LOADING SPINNER
// ──────────────────────────────────────
export function Spinner({ size = 32, color = 'var(--green)' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `3px solid rgba(255,255,255,0.08)`,
      borderTop: `3px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
  );
}

// ──────────────────────────────────────
//  SECTION HEADER
// ──────────────────────────────────────
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
