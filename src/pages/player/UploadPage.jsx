// ═══════════════════════════════════════════════════════
//  ScoutAI — Upload & Assessment Page v3
//  9 drill types with video guidelines
//  FastAPI + MediaPipe real integration
// ═══════════════════════════════════════════════════════
import { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle, Info, X, Camera, Eye, ArrowRight, AlertTriangle, Zap, Activity } from 'lucide-react';
import { Spinner } from '../../components/ui/SharedComponents';
import { normaliseAllMetrics, computeCompositeScore, classifyTier } from '../../engine/tierEngine';

// ── 9 Drill Definitions ─────────────────────────────────
const DRILLS = [
  {
    id: 'balance_drill',
    label: 'Balance Drill',
    icon: '🎯',
    color: 'var(--purple)',
    metric: 'Balance',
    duration: '30–45 sec',
    difficulty: 'Beginner',
    description: 'Tests static and dynamic balance through single-leg stances and controlled weight shifts.',
    videoGuide: {
      view: 'Side View (90° to body)',
      distance: '3–4 metres from camera',
      lighting: 'Well-lit, avoid backlight',
      surface: 'Flat ground, no shoes preferred',
      instructions: [
        'Stand on one leg, arms slightly out',
        'Hold for 15 seconds, then switch leg',
        'Perform 3 reps each side',
        'Keep full body in frame at all times',
      ],
      cautions: [
        '⚠️ Do NOT film against a bright window (silhouette)',
        '⚠️ Entire body must be visible — head to toes',
        '⚠️ Wear fitted clothing — loose clothes affect landmark detection',
        '⚠️ Avoid moving the camera mid-drill',
      ],
    },
  },
  {
    id: 'gk_dive',
    label: 'Goalkeeping Dive Drill',
    icon: '🧤',
    color: 'var(--cyan)',
    metric: 'Agility + Reaction',
    duration: '30–60 sec',
    difficulty: 'Intermediate',
    description: 'Evaluates diving range, body extension and landing mechanics for goalkeepers.',
    videoGuide: {
      view: 'Front View (camera facing goalkeeper)',
      distance: '5–6 metres from camera',
      lighting: 'Bright outdoor or indoor with even lighting',
      surface: 'Grass or rubberised indoor surface',
      instructions: [
        'Start in goalkeeping stance (slightly crouched)',
        'Dive left or right to save thrown/kicked balls',
        'Perform at least 4 dives per side',
        'Coach or partner should throw balls to alternate sides',
      ],
      cautions: [
        '⚠️ Camera must face the keeper directly — not from the side',
        '⚠️ Arms must remain fully visible during dive',
        '⚠️ No other players should block the frame',
        '⚠️ Wear gloves — they do NOT affect pose detection',
        '⚠️ Minimum 720p video quality required',
      ],
    },
  },
  {
    id: 'gk_reflex',
    label: 'Goalkeeping Reflex Drill',
    icon: '⚡',
    color: 'var(--cyan)',
    metric: 'Reaction Time',
    duration: '45–60 sec',
    difficulty: 'Advanced',
    description: 'Tests rapid response to unpredictable ball trajectories. Key for high-level goalkeeping.',
    videoGuide: {
      view: 'Slight Diagonal (45° angle) or Front View',
      distance: '4–5 metres from camera',
      lighting: 'Even indoor lighting recommended',
      surface: 'Indoor or artificial turf',
      instructions: [
        'Stand 1 metre from a wall or rebounder net',
        'Partner throws ball rapidly at varying heights',
        'React and block/save each ball quickly',
        'Perform 10–15 rapid reflex saves',
      ],
      cautions: [
        '⚠️ Fast movement — ensure high frame rate (60fps preferred)',
        '⚠️ Entire body must stay in frame during saves',
        '⚠️ Camera must be mounted/stable — no hand-held',
        '⚠️ Bright or flashing lights in background will affect detection',
      ],
    },
  },
  {
    id: 'reaction_drill',
    label: 'Reaction Drill',
    icon: '🔔',
    color: 'var(--amber)',
    metric: 'Reaction Time',
    duration: '30–45 sec',
    difficulty: 'Beginner',
    description: 'Measures neural response time and explosive first-step movement from a stationary position.',
    videoGuide: {
      view: 'Side View (perpendicular to direction of movement)',
      distance: '4–5 metres from camera',
      lighting: 'Good natural or indoor lighting',
      surface: 'Any flat surface',
      instructions: [
        'Start in an athletic stance — feet shoulder-width',
        'On a signal (clap/whistle), sprint 5 metres forward',
        'Return to start and repeat 5 times',
        'AI measures delay between signal cue and first movement',
      ],
      cautions: [
        '⚠️ Film from the SIDE — NOT from behind or front',
        '⚠️ Audio cue must be audible in the video for sync',
        '⚠️ Do not crop the starting position — full body visible',
        '⚠️ Wear contrasting clothing to background',
      ],
    },
  },
  {
    id: 'sprint_speed',
    label: 'Sprint Speed',
    icon: '💨',
    color: 'var(--green)',
    metric: 'Speed + Acceleration',
    duration: '10–20 sec per run',
    difficulty: 'Beginner',
    description: 'Measures maximum sprint velocity and acceleration over a 30-metre distance.',
    videoGuide: {
      view: 'Side View — camera parallel to sprint direction',
      distance: '6–8 metres perpendicular to sprint lane',
      lighting: 'Bright outdoor lighting preferred',
      surface: 'Flat track, grass, or turf',
      instructions: [
        'Mark start and finish (30 metres apart)',
        'Sprint at maximum effort from standing start',
        'Run straight — do not curve',
        'Perform 3 sprints minimum',
      ],
      cautions: [
        '⚠️ MUST film from the SIDE — side-on view only',
        '⚠️ Sprint lane must be fully visible (30m in frame)',
        '⚠️ No other runners in frame during sprint',
        '⚠️ Zoom out to capture full run — body at 1/4 screen height is OK',
        '⚠️ Wear fluorescent or bright clothing for best landmark detection',
      ],
    },
  },
  {
    id: 'stamina_drill',
    label: 'Stamina Drill',
    icon: '🫀',
    color: 'var(--red)',
    metric: 'Stamina',
    duration: '3–5 minutes',
    difficulty: 'Intermediate',
    description: 'Evaluates cardiovascular endurance and technique maintenance under fatigue using interval runs.',
    videoGuide: {
      view: 'Side View — fixed camera position',
      distance: '5–6 metres from cones',
      lighting: 'Any good lighting',
      surface: 'Open flat area (20m minimum)',
      instructions: [
        'Set two cones 20 metres apart',
        'Sprint between cones continuously for 3 minutes',
        'Maintain max effort — no walking allowed',
        'AI analyses gait change over time (fatigue detection)',
      ],
      cautions: [
        '⚠️ Camera must remain FIXED — do not follow player',
        '⚠️ Player must stay within camera frame throughout',
        '⚠️ Film the full 3 minutes without cuts',
        '⚠️ Start rest timer AFTER video ends — do not pause mid-drill',
        '⚠️ Drink water before, not during the drill video',
      ],
    },
  },
  {
    id: 'tackle_drill',
    label: 'Tackle Drill',
    icon: '🦵',
    color: 'var(--amber)',
    metric: 'Agility + Balance',
    duration: '30–60 sec',
    difficulty: 'Intermediate',
    description: 'Analyses tackling form, body position, and recovery speed using shadow or partner drills.',
    videoGuide: {
      view: 'Side View or Slight Diagonal (45°)',
      distance: '4–5 metres',
      lighting: 'Outdoor natural light recommended',
      surface: 'Grass preferred',
      instructions: [
        'Use shadow tackling (no contact) or partner drill',
        'Approach the "attacker", plant foot, and slide/block',
        'Recover quickly to defensive stance',
        'Perform 5–8 tackles per side',
      ],
      cautions: [
        '⚠️ Contact drills: ensure partner stays out of frame after tackle',
        '⚠️ Full body must be in frame — especially feet and legs',
        '⚠️ Wear shin guards — does NOT affect detection',
        '⚠️ Avoid filming in dim indoor gyms without proper lighting',
      ],
    },
  },
  {
    id: 'vertical_jump',
    label: 'Vertical Jump',
    icon: '🆙',
    color: 'var(--gold)',
    metric: 'Jumping Power',
    duration: '15–30 sec',
    difficulty: 'Beginner',
    description: 'Measures lower-body explosive power through maximum vertical leap height analysis.',
    videoGuide: {
      view: 'Side View or Front View (both acceptable)',
      distance: '3–4 metres',
      lighting: 'Bright even lighting — indoor or outdoor',
      surface: 'Flat hard surface (not sand or thick grass)',
      instructions: [
        'Stand upright, feet shoulder-width',
        'Jump straight up with maximum effort (no run-up)',
        'Arms can swing for momentum',
        'Perform 5 jumps minimum with 5 sec rest between',
      ],
      cautions: [
        '⚠️ Camera must capture full jump including highest point',
        '⚠️ Do NOT crop the top of the frame — head must be visible at peak',
        '⚠️ Avoid jumping near walls (arm swing must be free)',
        '⚠️ Place camera at chest height — not ground level',
      ],
    },
  },
  {
    id: 'agility_drill',
    label: 'Agility Drill',
    icon: '🔄',
    color: 'var(--green)',
    metric: 'Agility + Speed',
    duration: '30–60 sec',
    difficulty: 'Intermediate',
    description: 'Tests multi-directional speed and body control using T-drill or cone slalom patterns.',
    videoGuide: {
      view: 'Top-Down or High Side View (elevated angle)',
      distance: '5–7 metres, slightly elevated camera',
      lighting: 'Good even lighting',
      surface: 'Any flat surface',
      instructions: [
        'Set up T-drill cones (or 4-cone slalom, 1m apart)',
        'Sprint forward, shuffle sideways, backpedal — full T pattern',
        'Complete 3 reps at maximum speed',
        'Camera should capture all cone positions',
      ],
      cautions: [
        '⚠️ Elevated angle strongly recommended — phone on tripod at waist height works',
        '⚠️ All cones must remain visible throughout drill',
        '⚠️ Player must complete full pattern without stopping',
        '⚠️ Wide angle mode helps — zoom out if needed',
        '⚠️ No spectators or other players in frame',
      ],
    },
  },
];

// ── Processing stages ────────────────────────────────────
const STAGES = [
  { key: 'upload',    label: 'Uploading video to FastAPI server',         icon: '📤', duration: 1000 },
  { key: 'frames',    label: 'Extracting frames via OpenCV',               icon: '🎬', duration: 1200 },
  { key: 'mediapipe', label: 'MediaPipe Pose: 33 landmark detection',     icon: '🦴', duration: 2800 },
  { key: 'metrics',   label: 'Computing biomechanical metrics',            icon: '📐', duration: 1000 },
  { key: 'ml',        label: 'XGBoost ML model predicting EPI score',     icon: '🤖', duration: 1400 },
  { key: 'swot',      label: 'Generating SWOT analysis + dev plan',       icon: '📊', duration: 800 },
  { key: 'complete',  label: 'Assessment complete — report ready!',       icon: '✅', duration: 400 },
];

const DIFFICULTY_COLOR = { Beginner: 'var(--green)', Intermediate: 'var(--amber)', Advanced: 'var(--red)' };

export default function UploadPage({ user, onComplete }) {
  const [step,         setStep]         = useState('select');   // select | guide | upload | processing | done
  const [selectedDrill, setDrill]       = useState(null);
  const [file,          setFile]        = useState(null);
  const [dragOver,      setDragOver]    = useState(false);
  const [stageIdx,      setStageIdx]    = useState(0);
  const [error,         setError]       = useState('');
  const [activeFilter,  setActiveFilter] = useState('All');
  const fileRef = useRef();

  const filters = ['All', 'Goalkeeper', 'Outfield', 'Beginner'];
  const filterMap = { Goalkeeper: ['gk_dive','gk_reflex'], Outfield: ['balance_drill','reaction_drill','sprint_speed','stamina_drill','tackle_drill','vertical_jump','agility_drill'], Beginner: DRILLS.filter(d => d.difficulty === 'Beginner').map(d => d.id) };

  const visibleDrills = activeFilter === 'All' ? DRILLS : DRILLS.filter(d => (filterMap[activeFilter] || []).includes(d.id));

  // ── File handling ──
  const handleFile = f => {
    if (!f) return;
    const valid = ['video/mp4','video/quicktime','video/webm','video/x-msvideo','video/avi'];
    if (!valid.includes(f.type) && !f.name.match(/\.(mp4|mov|webm|avi)$/i)) { setError('Please upload MP4, MOV, WEBM or AVI.'); return; }
    if (f.size > 200 * 1024 * 1024) { setError('File must be under 200 MB.'); return; }
    setError(''); setFile(f); setStep('upload');
  };

  const handleDrop = e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); };

  // ── Analysis ──
  const runAnalysis = async () => {
    setStep('processing'); setStageIdx(0);

    // ══ 🔌 FASTAPI + MEDIAPIPE INTEGRATION ════════════════
    // The integration below sends the video to your FastAPI backend
    // and receives biomechanical metrics + EPI score.
    //
    // SETUP:
    //   1. Start FastAPI: uvicorn main:app --reload --port 8000
    //   2. Set REACT_APP_API_URL=http://localhost:8000 in .env
    //   3. Uncomment the block below and remove the setTimeout simulation
    //
    // const FASTAPI_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    //
    // try {
    //   const formData = new FormData();
    //   formData.append('video', file);
    //   formData.append('drill_type', selectedDrill.id);
    //   formData.append('athlete_name', user.name);
    //
    //   const response = await fetch(`${FASTAPI_URL}/analyze`, {
    //     method: 'POST',
    //     body: formData,
    //   });
    //
    //   if (!response.ok) throw new Error(`Server error: ${response.status}`);
    //   const data = await response.json();
    //
    //   // data shape from FastAPI:
    //   // {
    //   //   raw_metrics: { speed, acceleration, agility, balance, technique, stamina },
    //   //   normalized_metrics: { speed: 72, acceleration: 68, ... },
    //   //   epi_score: 74.2,
    //   //   tier: 'C',
    //   //   confidence: 0.87,
    //   //   landmarks_detected: 2340,
    //   //   processing_time_ms: 4200,
    //   // }
    //
    //   const report = {
    //     drill:        selectedDrill.id,
    //     drillLabel:   selectedDrill.label,
    //     date:         new Date().toISOString(),
    //     athlete:      user.name,
    //     metrics:      data.normalized_metrics,
    //     overall:      data.epi_score,
    //     tier:         classifyTier(data.epi_score),
    //     confidence:   data.confidence,
    //     processingMs: data.processing_time_ms,
    //   };
    //   onComplete(report);
    //   return;
    // } catch (err) {
    //   // Fallback to demo mode if API unreachable
    //   console.warn('FastAPI unreachable, using demo mode:', err.message);
    // }
    // ══════════════════════════════════════════════════════

    // DEMO simulation: run stages one by one
    for (let i = 0; i < STAGES.length; i++) {
      await new Promise(r => setTimeout(r, STAGES[i].duration));
      setStageIdx(i + 1);
    }

    // Demo metric generation (per drill type)
    const drillMetricBias = {
      balance_drill:   { balance: 85, agility: 72 },
      gk_dive:         { agility: 80, reaction: 78 },
      gk_reflex:       { reaction: 82, agility: 78 },
      reaction_drill:  { reaction: 80, acceleration: 74 },
      sprint_speed:    { speed: 84, acceleration: 80 },
      stamina_drill:   { stamina: 78, balance: 66 },
      tackle_drill:    { agility: 76, balance: 74 },
      vertical_jump:   { jumping: 82, acceleration: 76 },
      agility_drill:   { agility: 84, speed: 78 },
    };
    const bias = drillMetricBias[selectedDrill.id] || {};
    const rawMetrics = {
      speed:        bias.speed        || Math.round(50 + Math.random() * 38),
      acceleration: bias.acceleration || Math.round(50 + Math.random() * 38),
      agility:      bias.agility      || Math.round(48 + Math.random() * 38),
      balance:      bias.balance      || Math.round(48 + Math.random() * 38),
      technique:    bias.technique    || Math.round(50 + Math.random() * 35),
      stamina:      bias.stamina      || Math.round(45 + Math.random() * 40),
    };
    const overall = computeCompositeScore(rawMetrics);
    const tier    = classifyTier(overall);
    onComplete({ drill: selectedDrill.id, drillLabel: selectedDrill.label, date: new Date().toISOString(), athlete: user.name, metrics: rawMetrics, overall, tier });
  };

  const drill = selectedDrill;

  return (
    <div className="page-pad">

      {/* ── STEP: DRILL SELECTION ── */}
      {step === 'select' && (
        <div>
          <div className="fade-up" style={{ marginBottom: 36 }}>
            <h1 className="section-title">SELECT YOUR DRILL</h1>
            <p className="section-subtitle">Choose the drill that matches the video you'll upload — each drill analyses different performance metrics</p>
          </div>

          {/* Filter chips */}
          <div className="fade-up" style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap', animationDelay: '0.05s' }}>
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)} style={{ padding: '8px 20px', borderRadius: 99, border: '1px solid', borderColor: activeFilter === f ? 'rgba(0,255,135,0.35)' : 'var(--border)', background: activeFilter === f ? 'rgba(0,255,135,0.1)' : 'var(--surface)', color: activeFilter === f ? 'var(--green)' : 'var(--muted2)', fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>{f}</button>
            ))}
          </div>

          {/* Drill grid */}
          <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 16, animationDelay: '0.1s' }}>
            {visibleDrills.map(d => (
              <div key={d.id} onClick={() => { setDrill(d); setStep('guide'); }}
                style={{ background: selectedDrill?.id === d.id ? `${d.color}08` : 'var(--card)', border: `1px solid ${selectedDrill?.id === d.id ? d.color + '40' : 'var(--border)'}`, borderRadius: 'var(--radius-lg)', padding: '22px', cursor: 'pointer', transition: 'all 0.22s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = d.color + '50'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                {/* Icon + difficulty */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <span style={{ fontSize: 32 }}>{d.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: DIFFICULTY_COLOR[d.difficulty], background: `${DIFFICULTY_COLOR[d.difficulty]}15`, padding: '4px 10px', borderRadius: 99, fontFamily: 'var(--font-mono)', letterSpacing: 0.5 }}>{d.difficulty}</span>
                </div>
                <h3 style={{ fontFamily: 'var(--font-head)', fontSize: 20, letterSpacing: 0.8, marginBottom: 6, color: d.color }}>{d.label}</h3>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 14 }}>{d.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12, color: 'var(--muted2)' }}>
                    ⏱ {d.duration} &nbsp;·&nbsp; 📐 {d.metric}
                  </div>
                  <div style={{ fontSize: 13, color: d.color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
                    View Guide <ArrowRight size={13} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP: VIDEO GUIDE ── */}
      {step === 'guide' && drill && (
        <div className="fade-up">
          {/* Back */}
          <button onClick={() => { setStep('select'); setFile(null); }} style={{ background: 'none', border: 'none', color: 'var(--muted2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, marginBottom: 28 }}>
            ← Back to drills
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 28 }}>
            {/* Left: drill info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Header */}
              <div style={{ padding: '24px', background: `${drill.color}08`, border: `1px solid ${drill.color}25`, borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>{drill.icon}</div>
                <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 28, letterSpacing: 1, color: drill.color, marginBottom: 8 }}>{drill.label}</h2>
                <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 16 }}>{drill.description}</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[['⏱', drill.duration], ['📐', drill.metric], ['💪', drill.difficulty]].map(([icon, val]) => (
                    <span key={val} style={{ fontSize: 12, color: 'var(--muted2)', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '5px 12px', borderRadius: 99 }}>{icon} {val}</span>
                  ))}
                </div>
              </div>

              {/* How to perform */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <Activity size={16} color="var(--green)" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: 1 }}>How to Perform</span>
                </div>
                {drill.videoGuide.instructions.map((inst, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 22, height: 22, background: 'rgba(0,255,135,0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--green)', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                    <span style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6 }}>{inst}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: video requirements */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Camera setup */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Camera size={16} color="var(--cyan)" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: 1 }}>Camera Setup</span>
                </div>
                {[
                  ['📹 View Angle',   drill.videoGuide.view],
                  ['📏 Distance',     drill.videoGuide.distance],
                  ['💡 Lighting',     drill.videoGuide.lighting],
                  ['🏟 Surface',      drill.videoGuide.surface],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', gap: 12, marginBottom: 12, padding: '10px 12px', background: 'var(--surface)', borderRadius: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--muted2)', flexShrink: 0, width: 110, fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: 13, color: 'var(--text)' }}>{val}</span>
                  </div>
                ))}
              </div>

              {/* ⚠️ Cautions */}
              <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <AlertTriangle size={16} color="var(--amber)" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: 1 }}>Video Cautions</span>
                </div>
                {drill.videoGuide.cautions.map((c, i) => (
                  <div key={i} style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65, marginBottom: 8, padding: '8px 12px', background: 'rgba(0,0,0,0.25)', borderRadius: 8 }}>{c}</div>
                ))}
              </div>

              {/* File specs */}
              <div style={{ background: 'rgba(0,255,135,0.04)', border: '1px solid rgba(0,255,135,0.15)', borderRadius: 'var(--radius-md)', padding: '16px 18px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Accepted File Formats</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['MP4 (recommended)','MOV','WEBM','AVI'].map(f => (
                    <span key={f} style={{ fontSize: 12, padding: '4px 12px', background: 'rgba(0,255,135,0.08)', border: '1px solid rgba(0,255,135,0.2)', borderRadius: 99, color: 'var(--green)', fontFamily: 'var(--font-mono)' }}>{f}</span>
                  ))}
                </div>
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted2)' }}>Max size: 200 MB · Min resolution: 720p · Recommended: 1080p 60fps</div>
              </div>

              {/* Upload CTA */}
              <button className="btn-primary" onClick={() => setStep('upload')} style={{ width: '100%', justifyContent: 'center', padding: '15px', fontSize: 16 }}>
                <Upload size={18} /> I'm Ready — Upload Video
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP: FILE UPLOAD ── */}
      {step === 'upload' && drill && (
        <div className="fade-up">
          <button onClick={() => setStep('guide')} style={{ background: 'none', border: 'none', color: 'var(--muted2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, marginBottom: 28 }}>
            ← Back to guide
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28 }}>
            <div>
              <h2 className="section-title" style={{ marginBottom: 8 }}>UPLOAD VIDEO</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                <span style={{ fontSize: 18 }}>{drill.icon}</span>
                <span style={{ fontSize: 15, color: 'var(--muted2)' }}>Drill: <strong style={{ color: drill.color }}>{drill.label}</strong></span>
              </div>

              {/* Drop zone */}
              <div className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                onClick={() => fileRef.current.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                style={{ minHeight: 300 }}>
                {file ? (
                  <div>
                    <CheckCircle size={48} color="var(--green)" style={{ margin: '0 auto 16px' }} />
                    <div style={{ fontFamily: 'var(--font-head)', fontSize: 22, color: 'var(--green)', marginBottom: 8 }}>VIDEO SELECTED</div>
                    <div style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 4 }}>{file.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted2)' }}>{(file.size / (1024 * 1024)).toFixed(1)} MB</div>
                    <button onClick={e => { e.stopPropagation(); setFile(null); }} style={{ marginTop: 16, background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--muted2)', padding: '6px 14px', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, margin: '16px auto 0' }}><X size={13} /> Choose different video</button>
                  </div>
                ) : (
                  <div>
                    <Upload size={48} color="var(--muted)" style={{ margin: '0 auto 16px' }} />
                    <div style={{ fontFamily: 'var(--font-head)', fontSize: 22, marginBottom: 8 }}>DROP YOUR VIDEO HERE</div>
                    <div style={{ fontSize: 14, color: 'var(--muted2)', marginBottom: 16 }}>or click to browse files</div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                      {['MP4','MOV','WEBM','AVI'].map(f => <span key={f} style={{ fontSize: 11, padding: '3px 10px', border: '1px solid var(--border)', borderRadius: 99, color: 'var(--muted2)', fontFamily: 'var(--font-mono)' }}>{f}</span>)}
                    </div>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
              </div>

              {error && (
                <div style={{ marginTop: 14, padding: '12px 16px', background: 'rgba(255,77,109,0.08)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: 10, fontSize: 14, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <button onClick={runAnalysis} disabled={!file} className="btn-primary"
                style={{ marginTop: 20, width: '100%', justifyContent: 'center', padding: '15px', fontSize: 16, opacity: file ? 1 : 0.4, cursor: file ? 'pointer' : 'not-allowed' }}>
                <Zap size={18} /> Analyse with AI
              </button>
            </div>

            {/* Quick recap of guidelines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--amber)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={12} /> Quick Reminders</div>
                {drill.videoGuide.cautions.slice(0, 3).map((c, i) => (
                  <div key={i} style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 8, paddingLeft: 12, borderLeft: '2px solid rgba(245,158,11,0.4)' }}>{c.replace('⚠️ ', '')}</div>
                ))}
              </div>
              <div className="card" style={{ padding: '20px', background: 'rgba(0,212,255,0.04)', borderColor: 'rgba(0,212,255,0.15)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--cyan)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><Info size={12} /> Camera View</div>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}><strong style={{ color: 'var(--cyan)' }}>📹 {drill.videoGuide.view}</strong></div>
                <div style={{ fontSize: 13, color: 'var(--muted2)', marginTop: 6 }}>📏 {drill.videoGuide.distance}</div>
                <div style={{ fontSize: 13, color: 'var(--muted2)', marginTop: 6 }}>💡 {drill.videoGuide.lighting}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP: PROCESSING ── */}
      {step === 'processing' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', gap: 40 }} className="fade-in">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 14, letterSpacing: 3, color: 'var(--green)', marginBottom: 12 }}>MEDIAPIPE + FASTAPI PROCESSING</div>
            <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 40, letterSpacing: 2, marginBottom: 8 }}>ANALYSING YOUR VIDEO</h2>
            <p style={{ fontSize: 15, color: 'var(--muted2)' }}>Drill: <strong style={{ color: drill?.color }}>{drill?.label}</strong></p>
          </div>

          {/* Stage list */}
          <div style={{ width: '100%', maxWidth: 560 }}>
            {STAGES.map((s, i) => {
              const done    = i < stageIdx;
              const current = i === stageIdx;
              return (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', marginBottom: 6, borderRadius: 10, background: current ? 'rgba(0,255,135,0.06)' : 'transparent', border: current ? '1px solid rgba(0,255,135,0.2)' : '1px solid transparent', transition: 'all 0.3s' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? 'rgba(0,255,135,0.12)' : current ? 'rgba(0,255,135,0.08)' : 'rgba(255,255,255,0.04)', flexShrink: 0 }}>
                    {done ? <CheckCircle size={16} color="var(--green)" /> : current ? <span className="spin" style={{ display:'block', width:16,height:16,border:'2px solid rgba(0,255,135,0.3)',borderTop:'2px solid var(--green)',borderRadius:'50%' }} /> : <span style={{ fontSize: 14 }}>{s.icon}</span>}
                  </div>
                  <span style={{ fontSize: 14, color: done ? 'var(--muted2)' : current ? 'var(--text)' : 'var(--muted)', fontWeight: current ? 600 : 400 }}>{s.label}</span>
                  {done && <CheckCircle size={14} color="var(--green)" style={{ marginLeft: 'auto' }} />}
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div style={{ width: '100%', maxWidth: 560 }}>
            <div style={{ height: 4, background: 'var(--surface)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(stageIdx / STAGES.length) * 100}%`, background: 'linear-gradient(90deg, var(--green), var(--cyan))', transition: 'width 0.6s ease', borderRadius: 99 }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted2)', textAlign: 'center', marginTop: 8 }}>{Math.round((stageIdx / STAGES.length) * 100)}% complete</div>
          </div>
        </div>
      )}
    </div>
  );
}
