// ═══════════════════════════════════════════════════════
//  ScoutAI — SWOT Analysis Engine
//  Implemented by: SHEquence Team
// ═══════════════════════════════════════════════════════
//
//  Generates SWOT from player metrics vs FIFA benchmarks.
//
//  Thresholds (from SHEquence PPT logic flow):
//    STRENGTH    → score ≥ 75
//    WEAKNESS    → score < 60
//    OPPORTUNITY → 60-74 AND +12 pts = potential tier jump
//    THREAT      → biomechanical imbalances → injury risk
// ═══════════════════════════════════════════════════════

import { METRIC_META } from './tierEngine';

/**
 * Generates a full SWOT analysis.
 * @param {object} metrics    - normalised 0-100 metrics
 * @param {object} benchmarks - benchmark scores for this age/position
 * @returns {object} { strengths, weaknesses, opportunities, threats }
 */
export function generateSWOT(metrics, benchmarks) {
  const swot = {
    strengths:     [],
    weaknesses:    [],
    opportunities: [],
    threats:       [],
  };

  Object.entries(metrics).forEach(([key, val]) => {
    const bench = benchmarks[key] || 70;
    const meta  = METRIC_META[key] || { label: key };
    const delta = val - bench;

    if (val >= 75) {
      swot.strengths.push({
        key,
        label:       meta.label,
        value:       val,
        benchmark:   bench,
        delta:       `+${delta}`,
        detail:      getStrengthDetail(key, val),
      });
    } else if (val < 60) {
      swot.weaknesses.push({
        key,
        label:     meta.label,
        value:     val,
        benchmark: bench,
        delta:     `${delta}`,
        detail:    getWeaknessDetail(key, val),
      });
    } else {
      // Opportunity zone: 60-74, could jump tier with +12 improvement
      swot.opportunities.push({
        key,
        label:     meta.label,
        value:     val,
        benchmark: bench,
        delta:     `${delta > 0 ? '+' : ''}${delta}`,
        gain:      `+${75 - val} pts → Tier upgrade possible`,
        detail:    getOpportunityDetail(key, val),
      });
    }
  });

  // ── THREAT DETECTION: biomechanical imbalances ──
  const { speed, balance, acceleration, stamina, agility } = metrics;

  if (speed > 80 && balance < 60) {
    swot.threats.push({
      label: 'ACL / Knee Injury Risk',
      desc:  'High sprint speed combined with low balance creates dangerous force vectors on knee joints.',
      icon:  'AlertTriangle',
    });
  }

  if (acceleration > 78 && balance < 65) {
    swot.threats.push({
      label: 'Ankle Sprain Risk',
      desc:  'Explosive acceleration without sufficient stability increases ankle rollover probability.',
      icon:  'AlertTriangle',
    });
  }

  if (stamina < 55) {
    swot.threats.push({
      label: 'Aerobic Base Deficiency',
      desc:  'Low stamina score indicates rapid intensity decay — unsustainable for 90-minute matches.',
      icon:  'TrendingDown',
    });
  }

  if (speed > 82 && agility < 62) {
    swot.threats.push({
      label: 'Directional Instability',
      desc:  'High speed without matching agility causes missed direction changes and recovery failures.',
      icon:  'AlertTriangle',
    });
  }

  return swot;
}

// ── Helper detail strings ──

function getStrengthDetail(key, val) {
  const details = {
    speed:        `Explosive max velocity of ${val}/100 — top percentile among peers.`,
    acceleration: `Rapid force production: ${val}/100 — excellent first 10m burst.`,
    agility:      `Strong directional fluidity: ${val}/100 — effective in tight spaces.`,
    balance:      `Excellent stability: ${val}/100 — maintains body control under pressure.`,
    technique:    `Strong ball mechanics: ${val}/100 — precise passing and shot contact.`,
    stamina:      `High endurance: ${val}/100 — maintains intensity across full match duration.`,
  };
  return details[key] || `Score: ${val}/100`;
}

function getWeaknessDetail(key, val) {
  const details = {
    speed:        `Below threshold at ${val}/100 — limited ability to beat defenders in space.`,
    acceleration: `Slow initial burst at ${val}/100 — poor off-the-mark reaction.`,
    agility:      `Restricted directional change: ${val}/100 — struggles in 1v1 scenarios.`,
    balance:      `Poor stability: ${val}/100 — possession loss risk under physical pressure.`,
    technique:    `Low ball accuracy: ${val}/100 — inconsistent contact and passing errors.`,
    stamina:      `Rapid intensity decay: ${val}/100 — significant performance drop after 60 minutes.`,
  };
  return details[key] || `Score: ${val}/100 — below performance threshold.`;
}

function getOpportunityDetail(key, val) {
  const ptsNeeded = 75 - val;
  const details = {
    speed:        `${val}/100 — focused sprint mechanics training can add ${ptsNeeded}+ points.`,
    acceleration: `${val}/100 — plyometric and resisted sprint sessions will improve rapidly.`,
    agility:      `${val}/100 — ladder and cone drill program shows fast gains in 4-6 weeks.`,
    balance:      `${val}/100 — proprioception training shows measurable improvement in 3 weeks.`,
    technique:    `${val}/100 — daily ball mastery circuits will push into strength territory.`,
    stamina:      `${val}/100 — structured aerobic base training over 6 weeks yields large gains.`,
  };
  return details[key] || `${val}/100 — targeted training can push this into strength range.`;
}
