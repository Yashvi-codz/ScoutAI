// ═══════════════════════════════════════════════════════
//  ScoutAI — Results & Full Report Page
//  Shows EPI score, tier, SWOT, positions, and dev plan
// ═══════════════════════════════════════════════════════

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import {
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Download,
  Share2,
  ChevronRight,
} from "lucide-react";
import {
  computeCompositeScore,
  classifyTier,
  recommendPositions,
  generateDevelopmentPlan,
  getOpportunities,
  getBenchmarks,
} from "../../engine/tierEngine";
import { generateSWOT } from "../../engine/swotEngine";
import {
  ScoreRing,
  TierBadge,
  MetricBar,
  SectionHeader,
} from "../../components/ui/SharedComponents";

export default function ResultsPage({ user, report }) {
  if (!report) return null;

  const mergedMetrics = {
    speed: report.stations?.speed?.metrics?.speed_estimate || 70,
    acceleration: 70,
    agility: 70,
    balance: 70,
    technique: 70,
    stamina: 70,
  };

  const score = computeCompositeScore(mergedMetrics);
  const tier = classifyTier(score);
  const benchmarks = getBenchmarks(
    parseInt(user.age || 17),
    user.position || "Midfielder",
  );
  const swot = generateSWOT(report.metrics, benchmarks);
  const positions = recommendPositions(report.metrics);
  const devPlan = generateDevelopmentPlan(report.metrics, tier);
  const opps = getOpportunities(score, user.region);

  // Radar chart data
  const radarData = Object.entries(report.metrics).map(([key, val]) => ({
    metric:
      {
        speed: "Speed",
        acceleration: "Accel",
        agility: "Agility",
        balance: "Balance",
        technique: "Technique",
        stamina: "Stamina",
      }[key] || key,
    score: val,
    benchmark: benchmarks[key] || 70,
  }));

  return (
    <div className="page-pad">
      {/* ── Header ── */}
      <div
        className="fade-up"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 36,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h1 className="section-title">PERFORMANCE REPORT</h1>
          <p className="section-subtitle">
            {report.videoName} · {report.date} ·
            <span
              style={{
                color: "var(--green)",
                marginLeft: 4,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
              }}
            >
              {report.drill?.toUpperCase()} DRILL
            </span>
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn-ghost"
            style={{ padding: "10px 20px", fontSize: 13 }}
          >
            <Download size={14} /> Export PDF
          </button>
          <button
            className="btn-ghost"
            style={{ padding: "10px 20px", fontSize: 13 }}
          >
            <Share2 size={14} /> Share
          </button>
        </div>
      </div>

      {/* ── Hero row: Score + Radar + Metrics ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr 1fr",
          gap: 20,
          marginBottom: 24,
        }}
      >
        {/* Score */}
        <div
          className="card fade-up"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            padding: "32px 24px",
            background: tier.bg,
            borderColor: tier.border,
            animationDelay: "0.05s",
          }}
        >
          <ScoreRing score={score} size={140} />
          <TierBadge score={score} size="md" />
          <div style={{ textAlign: "center" }}>
            <div
              style={{ fontSize: 12, color: "var(--muted2)", lineHeight: 1.5 }}
            >
              {tier.recommendation}
            </div>
          </div>
        </div>

        {/* Radar */}
        <div className="card fade-up" style={{ animationDelay: "0.08s" }}>
          <SectionHeader
            title="SKILL RADAR"
            subtitle="Your scores vs age-group benchmark"
          />
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.07)" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{
                    fill: "var(--muted2)",
                    fontSize: 11,
                    fontFamily: "var(--font-body)",
                  }}
                />
                <PolarRadiusAxis
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name="Benchmark"
                  dataKey="benchmark"
                  stroke="rgba(255,255,255,0.15)"
                  fill="rgba(255,255,255,0.04)"
                  strokeWidth={1}
                />
                <Radar
                  name="Your Score"
                  dataKey="score"
                  stroke={tier.color}
                  fill={tier.color}
                  fillOpacity={0.15}
                  strokeWidth={2}
                  dot={{ fill: tier.color, r: 3 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metric bars */}
        <div className="card fade-up" style={{ animationDelay: "0.11s" }}>
          <SectionHeader
            title="METRIC BREAKDOWN"
            subtitle="Score vs benchmark (grey tick = avg)"
          />
          {Object.entries(report.metrics).map(([key, val]) => (
            <MetricBar
              key={key}
              metricKey={key}
              value={val}
              benchmark={benchmarks[key]}
            />
          ))}
        </div>
      </div>

      {/* ── SWOT Analysis ── */}
      <div
        className="fade-up"
        style={{ marginBottom: 24, animationDelay: "0.14s" }}
      >
        <SectionHeader
          title="SWOT ANALYSIS"
          subtitle="Data-driven strengths, weaknesses, opportunities & threats"
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 14,
          }}
        >
          {/* Strengths */}
          <div className="swot-strength">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <CheckCircle size={16} color="var(--green)" />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  color: "var(--green)",
                  textTransform: "uppercase",
                }}
              >
                Strengths
              </span>
            </div>
            {swot.strengths.length === 0 ? (
              <p style={{ fontSize: 12, color: "var(--muted)" }}>
                No metric above 75 yet — keep training!
              </p>
            ) : (
              swot.strengths.map((s) => (
                <div key={s.key} style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 3,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                      {s.label}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--green)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {s.value}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--muted2)",
                      lineHeight: 1.5,
                    }}
                  >
                    {s.detail}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Weaknesses */}
          <div className="swot-weakness">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <AlertTriangle size={16} color="var(--red)" />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  color: "var(--red)",
                  textTransform: "uppercase",
                }}
              >
                Weaknesses
              </span>
            </div>
            {swot.weaknesses.length === 0 ? (
              <p style={{ fontSize: 12, color: "var(--muted)" }}>
                No critical weaknesses! Great foundation.
              </p>
            ) : (
              swot.weaknesses.map((w) => (
                <div key={w.key} style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 3,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                      {w.label}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--red)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {w.value}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--muted2)",
                      lineHeight: 1.5,
                    }}
                  >
                    {w.detail}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Opportunities */}
          <div className="swot-opportunity">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <TrendingUp size={16} color="var(--cyan)" />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  color: "var(--cyan)",
                  textTransform: "uppercase",
                }}
              >
                Opportunities
              </span>
            </div>
            {swot.opportunities.length === 0 ? (
              <p style={{ fontSize: 12, color: "var(--muted)" }}>
                Excellent — all metrics in strength zone!
              </p>
            ) : (
              swot.opportunities.map((o) => (
                <div key={o.key} style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 3,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                      {o.label}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--cyan)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {o.value}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--muted2)",
                      lineHeight: 1.5,
                    }}
                  >
                    {o.detail}
                  </div>
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 10,
                      color: "var(--cyan)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {o.gain}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Threats */}
          <div className="swot-threat">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <AlertTriangle size={16} color="var(--amber)" />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  color: "var(--amber)",
                  textTransform: "uppercase",
                }}
              >
                Threats
              </span>
            </div>
            {swot.threats.length === 0 ? (
              <p style={{ fontSize: 12, color: "var(--muted)" }}>
                No biomechanical imbalances detected.
              </p>
            ) : (
              swot.threats.map((t, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 3,
                      color: "var(--amber)",
                    }}
                  >
                    {t.label}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--muted2)",
                      lineHeight: 1.5,
                    }}
                  >
                    {t.desc}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Positions + Opportunities + Dev Plan ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1.2fr",
          gap: 20,
        }}
      >
        {/* Positions */}
        <div className="card fade-up" style={{ animationDelay: "0.2s" }}>
          <SectionHeader title="BEST POSITIONS" />
          {positions.map((pos, i) => (
            <div
              key={pos}
              style={{
                padding: "14px 16px",
                marginBottom: 10,
                border: `1px solid ${i === 0 ? "rgba(0,255,135,0.25)" : "var(--border)"}`,
                background: i === 0 ? "rgba(0,255,135,0.05)" : "var(--surface)",
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 600 }}>{pos}</span>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "var(--font-mono)",
                    color: i === 0 ? "var(--green)" : "var(--muted)",
                    background:
                      i === 0
                        ? "rgba(0,255,135,0.1)"
                        : "rgba(255,255,255,0.04)",
                    padding: "2px 8px",
                    borderRadius: 4,
                  }}
                >
                  #{i + 1}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Opportunities */}
        <div className="card fade-up" style={{ animationDelay: "0.23s" }}>
          <SectionHeader
            title="OPPORTUNITIES"
            subtitle="Based on your EPI score"
          />
          {opps.map((o, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                marginBottom: 12,
                paddingBottom: 12,
                borderBottom:
                  i < opps.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  marginTop: 5,
                  flexShrink: 0,
                  background:
                    o.type === "trial"
                      ? "var(--green)"
                      : o.type === "academy"
                        ? "var(--cyan)"
                        : "var(--amber)",
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    fontFamily: "var(--font-mono)",
                    marginBottom: 2,
                  }}
                >
                  {o.level}
                </div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{o.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Development plan */}
        <div className="card fade-up" style={{ animationDelay: "0.26s" }}>
          <SectionHeader
            title="DEVELOPMENT PLAN"
            subtitle="Personalised training blueprint"
          />
          {devPlan.map((p, i) => (
            <div
              key={i}
              style={{
                marginBottom: 14,
                paddingBottom: 14,
                borderBottom:
                  i < devPlan.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700 }}>{p.area}</span>
                <span
                  style={{
                    fontSize: 10,
                    color:
                      p.priority === "HIGH" ? "var(--red)" : "var(--amber)",
                    background:
                      p.priority === "HIGH"
                        ? "rgba(255,77,109,0.1)"
                        : "rgba(245,158,11,0.1)",
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {p.priority}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  marginBottom: 6,
                }}
              >
                {p.drills.map((d) => (
                  <div
                    key={d}
                    style={{
                      display: "flex",
                      gap: 6,
                      alignItems: "flex-start",
                    }}
                  >
                    <ChevronRight
                      size={12}
                      color="var(--green)"
                      style={{ marginTop: 3, flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 12, color: "var(--text2)" }}>
                      {d}
                    </span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--muted)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                <Calendar
                  size={10}
                  style={{ display: "inline", marginRight: 4 }}
                />
                {p.weeks} week program
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
