// ═══════════════════════════════════════════════════════
//  ScoutAI — Tier Classification Engine
//  Implemented by: SHEquence Team
//  SYNAPSE.AI × IGDTUW
// ═══════════════════════════════════════════════════════
//
//  This file handles ALL classification logic:
//  - Composite Score (EPI) computation
//  - Tier A/B/C/D classification
//  - Score normalisation (raw → 0-100)
//  - Position recommendation
//  - Development plan generation
//  - Metric percentile computation
// ═══════════════════════════════════════════════════════

// ──────────────────────────────────────
//  1. COMPOSITE SCORE (Elite Potential Index)
//  Formula from SHEquence PPT:
//  CompositeScore = (0.20×Speed) + (0.18×Accel) + (0.17×Agility)
//                + (0.15×Balance) + (0.20×Technique) + (0.10×Stamina)
// ──────────────────────────────────────
export function computeCompositeScore(metrics) {
  const { speed, acceleration, agility, balance, technique, stamina } = metrics;
  const score =
    0.20 * speed        +
    0.18 * acceleration +
    0.17 * agility      +
    0.15 * balance      +
    0.20 * technique    +
    0.10 * stamina;
  return Math.round(score);
}

// ──────────────────────────────────────
//  2. TIER CLASSIFICATION
//  Tier A  ≥ 90  → Elite Pro
//  Tier B  75-89 → High Potential
//  Tier C  60-74 → Developing
//  Tier D  < 60  → Grassroots
// ──────────────────────────────────────
export function classifyTier(score) {
  if (score >= 90) {
    return {
      tier: 'A',
      label: 'Elite Pro',
      color: '#ffd700',
      bg: 'rgba(255,215,0,0.08)',
      border: 'rgba(255,215,0,0.25)',
      recommendation: 'National trials, elite academy placement & position specialization.',
      plan: '8-week elite conditioning program with sport-science monitoring.',
    };
  }
  if (score >= 75) {
    return {
      tier: 'B',
      label: 'High Potential',
      color: '#00ff87',
      bg: 'rgba(0,255,135,0.08)',
      border: 'rgba(0,255,135,0.25)',
      recommendation: 'Academy access & 3-month targeted skill refinement program.',
      plan: '3-month structured development with coach supervision.',
    };
  }
  if (score >= 60) {
    return {
      tier: 'C',
      label: 'Developing',
      color: '#00d4ff',
      bg: 'rgba(0,212,255,0.08)',
      border: 'rgba(0,212,255,0.25)',
      recommendation: '3-month structured training plan with local coaching support.',
      plan: '12-week improvement plan targeting your lowest-scoring metrics.',
    };
  }
  return {
    tier: 'D',
    label: 'Grassroots',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
    recommendation: '6-month foundation training at local coaching centres.',
    plan: '24-week foundation program: endurance, coordination & technical drills.',
  };
}

// ──────────────────────────────────────
//  3. RAW VALUE → 0-100 NORMALISATION
//  Used AFTER MediaPipe extracts raw biomechanical data
//  Formula: score = (value - min) / (max - min) * 100
// ──────────────────────────────────────
export const METRIC_RANGES = {
  speed:        { min: 3,    max: 11,   unit: 'm/s' },
  acceleration: { min: 1,    max: 6,    unit: 'm/s²' },
  agility:      { min: 0,    max: 5,    unit: 'rad/s' },
  balance:      { min: 0,    max: 0.12, unit: 'sway variance' },  // inverted: lower variance = better
  technique:    { min: 0.3,  max: 0.95, unit: 'accuracy ratio' },
  stamina:      { min: 0.2,  max: 1.0,  unit: 'intensity ratio' },
};

/**
 * Normalises a raw biomechanical value to 0-100 FIFA-style score.
 * @param {string} metricKey - one of the keys in METRIC_RANGES
 * @param {number} rawValue  - raw value from MediaPipe analysis
 * @returns {number} score 0-100
 */
export function normaliseMetric(metricKey, rawValue) {
  const range = METRIC_RANGES[metricKey];
  if (!range) return 0;

  // Balance is inverted — lower body sway = higher score
  if (metricKey === 'balance') {
    const score = (1 - (rawValue - range.min) / (range.max - range.min)) * 100;
    return Math.round(Math.min(100, Math.max(0, score)));
  }

  const score = ((rawValue - range.min) / (range.max - range.min)) * 100;
  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Normalises ALL 6 raw metrics at once.
 * @param {object} rawMetrics - { speed: 8.2, acceleration: 4.1, ... }
 * @returns {object} normalised metrics { speed: 82, acceleration: 76, ... }
 */
export function normaliseAllMetrics(rawMetrics) {
  return Object.fromEntries(
    Object.entries(rawMetrics).map(([key, val]) => [key, normaliseMetric(key, val)])
  );
}

// ──────────────────────────────────────
//  4. POSITION RECOMMENDATION ENGINE
// ──────────────────────────────────────
export function recommendPositions(metrics) {
  const { speed, agility, technique, balance, stamina, acceleration } = metrics;
  const positions = [];

  if (speed >= 78 && technique >= 72)                      positions.push('Winger');
  if (speed >= 80 && acceleration >= 78 && technique >= 70) positions.push('Striker');
  if (stamina >= 72 && technique >= 68 && balance >= 68)   positions.push('Central Midfielder');
  if (stamina >= 74 && balance >= 72 && speed < 70)        positions.push('Defensive Midfielder');
  if (agility >= 75 && technique >= 74)                    positions.push('Attacking Midfielder');
  if (balance >= 74 && speed < 68)                         positions.push('Centre-Back');
  if (agility >= 72 && speed >= 70)                        positions.push('Full-Back');
  if (speed >= 70 && agility >= 70 && stamina >= 68)       positions.push('Wing-Back');
  if (positions.length === 0)                              positions.push('Box-to-Box Midfielder');

  return [...new Set(positions)].slice(0, 3);
}

// ──────────────────────────────────────
//  5. OPPORTUNITY MAPPING
// ──────────────────────────────────────
export function getOpportunities(score, region) {
  const opportunities = [];

  if (score >= 90) {
    opportunities.push({ level: 'National', label: 'AIFF National Championships', type: 'trial' });
    opportunities.push({ level: 'Elite Academy', label: 'ISL Club Academy Trials', type: 'academy' });
  }
  if (score >= 75) {
    opportunities.push({ level: 'State', label: 'Santosh Trophy State Camp', type: 'trial' });
    opportunities.push({ level: 'Academy', label: 'AIFF Academy Selection Camp', type: 'academy' });
  }
  if (score >= 60) {
    opportunities.push({ level: 'District', label: 'District U-19 Tournament', type: 'trial' });
    opportunities.push({ level: 'Local Academy', label: `${region || 'Local'} Football Academy`, type: 'academy' });
  }
  opportunities.push({ level: 'Grassroots', label: 'Khelo India Youth Games', type: 'event' });

  return opportunities;
}

// ──────────────────────────────────────
//  6. PERSONALISED DEVELOPMENT BLUEPRINT
// ──────────────────────────────────────
export function generateDevelopmentPlan(metrics, tier) {
  const plan = [];

  const addDrill = (area, drills, weeks, priority) => {
    plan.push({ area, drills, weeks, priority });
  };

  if (metrics.balance < 65)
    addDrill('Balance & Stability', ['Single-leg squats × 3 sets', 'BOSU ball passes × 10 min', 'Proprioception board training'], 4, 'HIGH');

  if (metrics.stamina < 65)
    addDrill('Aerobic Base Building', ['5 km tempo run × 3/week', '10×100m interval sprints', 'Lactate threshold sessions'], 6, 'HIGH');

  if (metrics.agility < 68)
    addDrill('Agility & Change of Direction', ['T-drill × 5 sets', '5-10-5 shuttle runs', '6-cone lateral ladder drills'], 3, 'MEDIUM');

  if (metrics.technique < 72)
    addDrill('Technical Skill Development', ['Ball mastery circuits × 15 min daily', 'Passing accuracy wall drills', 'First-touch control exercises'], 6, 'HIGH');

  if (metrics.acceleration < 68)
    addDrill('Explosive Power', ['Box jumps × 4 sets', 'Resisted sled sprints', 'Plyometric bounding drills'], 4, 'MEDIUM');

  if (metrics.speed < 68)
    addDrill('Sprint Mechanics', ['Stride frequency drills', 'Hill sprints × 6 reps', 'Flying 30m sprints'], 4, 'MEDIUM');

  if (tier.tier === 'A')
    addDrill('Elite Conditioning', ['Sport-science periodization plan', 'Recovery & HRV monitoring', 'Position-specific pattern play'], 8, 'HIGH');

  if (tier.tier === 'D')
    addDrill('Foundation Fitness', ['6-month ABC running drills', 'Core strength baseline', 'Football coordination fundamentals'], 24, 'HIGH');

  return plan.slice(0, 5);
}

// ──────────────────────────────────────
//  7. METRIC META (Labels + Icons names)
// ──────────────────────────────────────
export const METRIC_META = {
  speed:        { label: 'Sprint Speed',  icon: 'Wind',     description: 'Maximum running velocity in a sprint drill' },
  acceleration: { label: 'Acceleration', icon: 'Zap',      description: 'Rate of speed increase from standing start' },
  agility:      { label: 'Agility',      icon: 'Activity', description: 'Directional change speed and fluidity' },
  balance:      { label: 'Balance',      icon: 'Shield',   description: 'Center-of-mass stability during movement' },
  technique:    { label: 'Technique',    icon: 'Target',   description: 'Shot and pass accuracy from motion analysis' },
  stamina:      { label: 'Stamina',      icon: 'Heart',    description: 'Intensity maintenance over drill duration' },
};

// ──────────────────────────────────────
//  8. AGE-GROUP BENCHMARKS
//  Based on FIFA 23 dataset percentiles
// ──────────────────────────────────────
export function getBenchmarks(age = 17, position = 'Midfielder') {
  const base = {
    speed: 74,
    acceleration: 71,
    agility: 72,
    balance: 68,
    technique: 73,
    stamina: 70,
  };

  // Age adjustment (younger players typically score lower in stamina)
  if (age <= 15) {
    base.stamina -= 5;
    base.speed -= 4;
    base.technique -= 6;
  } else if (age >= 19) {
    base.stamina += 4;
    base.speed += 3;
  }

  // Position adjustment
  const adjustments = {
    'Striker':             { speed: +6, acceleration: +5, technique: +4, stamina: -2 },
    'Winger':              { speed: +8, agility: +5, technique: +3 },
    'Midfielder':          { stamina: +6, technique: +3, balance: +3 },
    'Defensive Midfielder':{ balance: +5, stamina: +5, speed: -3, technique: +2 },
    'Defender':            { balance: +6, stamina: +4, speed: -3, technique: -2 },
    'Full-Back':           { speed: +4, agility: +4, stamina: +4 },
  };

  const adj = adjustments[position] || {};
  return Object.fromEntries(
    Object.entries(base).map(([k, v]) => [k, Math.min(99, v + (adj[k] || 0))])
  );
}
