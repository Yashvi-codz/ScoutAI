// ═══════════════════════════════════════════════════════
//  ScoutAI — FAQ & Help Page
//  Tier-specific FAQ + general questions
// ═══════════════════════════════════════════════════════

import { useState } from 'react';
import { HelpCircle, ChevronDown, Search, Star, BookOpen, Zap, Shield, Heart, MessageCircle } from 'lucide-react';
import { computeCompositeScore, classifyTier } from '../../engine/tierEngine';
import { DEMO_REPORT } from '../../data/mockAthletes';

// ── FAQ data ──
const GENERAL_FAQ = [
  {
    q: 'What is the Elite Potential Index (EPI)?',
    a: 'The EPI is a composite score (0-100) calculated from your 6 biomechanical metrics: Sprint Speed, Acceleration, Agility, Balance, Technique, and Stamina. Formula: 0.20×Speed + 0.18×Acceleration + 0.17×Agility + 0.15×Balance + 0.20×Technique + 0.10×Stamina. It benchmarks you against FIFA 23 dataset standards.',
  },
  {
    q: 'How does the video analysis work?',
    a: 'You upload a short drill video (15-60 seconds). Our AI pipeline uses OpenCV to extract frames, then MediaPipe Pose Estimation detects 33 body landmarks per frame. From these landmarks, we compute your 6 biomechanical metrics, normalize them to 0-100, and feed them into our ML model for EPI prediction.',
  },
  {
    q: 'What type of video should I upload?',
    a: 'Any smartphone video works! Ideal conditions: film from the side with full body visible, good lighting, 15-60 seconds, full effort performance. Supported formats: MP4, MOV, WEBM, AVI. Max file size: 150MB.',
  },
  {
    q: 'How accurate is the assessment?',
    a: 'Our model is trained on the FIFA 23 Kaggle dataset with professional player attributes. Accuracy improves with video quality. Always film in good light, with the full body in frame, and at full effort for best results.',
  },
  {
    q: 'Can I retake the assessment?',
    a: 'Yes! You can submit new assessments anytime. We recommend retaking every 4-6 weeks to track your improvement. Your Progress page shows trends across all your assessments.',
  },
  {
    q: 'What is SWOT analysis?',
    a: 'SWOT stands for Strengths, Weaknesses, Opportunities, Threats. Strengths are metrics ≥75, Weaknesses are <60, Opportunities are metrics in the 60-74 range (a +12pt gain = tier jump), and Threats are biomechanical imbalances (e.g. high speed + low balance = ACL injury risk).',
  },
  {
    q: 'How do I join a community group?',
    a: 'Go to Community → Browse groups by tier, region or interest → Click any group → Hit "Join Group". Once joined, you can participate in the group chat and coordinate with other players.',
  },
  {
    q: 'How do I book a session with a coach?',
    a: 'Go to Meetings → "Book New Session" tab → Pick a date on the calendar → Choose an available time slot → Select a verified coach → Confirm your booking. The coach will be notified and the session will appear in your upcoming meetings.',
  },
];

const TIER_FAQ = {
  A: [
    {
      q: 'I\'m Tier A — what national opportunities are available?',
      a: 'Tier A players (EPI ≥90) are eligible for AIFF National Championships, ISL Club Academy Trials, and U-19/U-23 national camp nominations. We recommend contacting your State Football Association directly with your ScoutAI report.',
      icon: Star,
    },
    {
      q: 'How do I maintain my Tier A classification?',
      a: 'Tier A requires sustained performance across all 6 metrics. Focus on sport-science periodization, HRV monitoring, and position-specific pattern play. Even a 2-point drop in your weakest metrics can affect your composite score. Monthly reassessment is recommended.',
      icon: Zap,
    },
    {
      q: 'Should I focus on weaknesses or amplify strengths at this level?',
      a: 'At Tier A, the goal is rounding out — you can\'t have a critical weakness at elite level. However, your primary position strength (e.g. speed for wingers) should stay elite. Use the development plan to close the gap without disrupting top-scoring metrics.',
      icon: Shield,
    },
    {
      q: 'What elite programs are compatible with ScoutAI reports?',
      a: 'ScoutAI reports are aligned with AIFF scouting criteria and Khelo India performance benchmarks. Several ISL academies and SAI centres accept our standardized EPI report. We\'re actively expanding these partnerships.',
      icon: BookOpen,
    },
  ],
  B: [
    {
      q: 'I\'m Tier B — how do I reach Tier A (90+ EPI)?',
      a: 'To jump from Tier B to A, you need your composite score to reach 90. Focus on your two lowest metrics first — even a +5pt improvement in two areas can push you over. Use your development plan\'s recommended drills and retest after 6-8 weeks.',
      icon: Zap,
    },
    {
      q: 'What academy opportunities are available for Tier B players?',
      a: 'Tier B players (75-89 EPI) are eligible for AIFF Academy Selection Camps, State Football Association trials, Santosh Trophy State Camps, and many club-level trial events. Check the Opportunities section on your report for matches near your region.',
      icon: Star,
    },
    {
      q: 'How long does a Tier B → Tier A transition typically take?',
      a: 'With consistent targeted training (3-4 sessions/week, focused drills), most Tier B athletes see a 5-8pt EPI improvement in 6-10 weeks. Stamina and technique tend to respond fastest to targeted work. Agility and balance take longer (8-12 weeks) for sustainable gains.',
      icon: Shield,
    },
  ],
  C: [
    {
      q: 'I\'m Tier C — what should I prioritise first?',
      a: 'Look at your SWOT Weaknesses (red, <60). Fix those first — they drag your composite score most. Then look at your Opportunities (60-74 range). A +12pt gain in any metric in this range can tip you into Tier B. Use your development plan\'s HIGH priority drills.',
      icon: Zap,
    },
    {
      q: 'What competitions suit Tier C players?',
      a: 'Tier C athletes (60-74 EPI) are best matched for District-level tournaments, U-19 local leagues, state youth camps, and AIFF grassroots events. These serve as qualification pathways and are excellent for gaining match experience.',
      icon: Star,
    },
    {
      q: 'How important is coaching at this stage?',
      a: 'Very important. At Tier C, structured coaching can yield large gains quickly because there are clear, correctable weaknesses. Use the Coaching Map to find verified local coaches. Even weekly group sessions (1-2/week) make a significant difference at this stage.',
      icon: Heart,
    },
    {
      q: 'Can I join a Tier B group in the community?',
      a: 'Yes! Community groups are open to all tiers. Joining higher-tier groups exposes you to better training conversations and drills. The Tier B Warriors group is a popular one for aspiring Tier C players who want to level up.',
      icon: MessageCircle,
    },
  ],
  D: [
    {
      q: 'I\'m Tier D — where do I even start?',
      a: 'Welcome! Tier D means you\'re at the beginning of your journey. Start with the 6-month foundation training plan in your development blueprint. Focus on: aerobic base (stamina), coordination drills, and basic ball technique. Consistency beats intensity at this stage.',
      icon: Heart,
    },
    {
      q: 'Are there any opportunities for Tier D players?',
      a: 'Absolutely. Khelo India Youth Games are open to all levels. Local coaching centres, school-level tournaments, and grassroots events are your starting points. Use the Community\'s "Grassroots Village Connect" group to find other players near you to practice with.',
      icon: Star,
    },
    {
      q: 'How long before I reach Tier C?',
      a: 'With the 24-week foundation program and consistent training (3-5 times/week), most Tier D athletes reach Tier C within 4-6 months. The biggest gains come from stamina and agility improvements, which respond fastest to structured training.',
      icon: Zap,
    },
    {
      q: 'Can I connect with players from my village/area?',
      a: 'Yes! That\'s exactly what the Community feature is for. Join the "Grassroots Village Connect" group, enter your region, and find nearby players at your tier. You can organize joint practice sessions, share drills and motivate each other — you don\'t need a formal coach to start improving together.',
      icon: MessageCircle,
    },
  ],
};

function FAQItem({ q, a, icon: Icon, color = 'var(--green)' }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? 'open' : ''}`}>
      <div className="faq-question" onClick={() => setOpen(o => !o)}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          {Icon && (
            <div style={{ width: 28, height: 28, background: `${color}15`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              <Icon size={14} color={color} />
            </div>
          )}
          <span>{q}</span>
        </div>
        <ChevronDown size={18} color="var(--muted2)" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', flexShrink: 0 }} />
      </div>
      <div className={`faq-answer ${open ? 'open' : ''}`}>{a}</div>
    </div>
  );
}

export default function FAQPage({ user, report }) {
  const score = report ? computeCompositeScore(report.metrics) : computeCompositeScore(DEMO_REPORT.metrics);
  const tier  = classifyTier(score);
  const tierFAQs = TIER_FAQ[tier.tier] || [];

  const [search, setSearch] = useState('');

  const filteredGeneral = GENERAL_FAQ.filter(f =>
    !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );
  const filteredTier = tierFAQs.filter(f =>
    !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-pad">
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 36 }}>
        <h1 className="section-title">FAQ & HELP</h1>
        <p className="section-subtitle">Questions and answers tailored to your performance tier</p>
      </div>

      {/* Tier-specific banner */}
      <div className="fade-up card" style={{ marginBottom: 32, padding: '20px 24px', background: tier.bg, borderColor: tier.border, animationDelay: '0.05s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, background: `${tier.color}20`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <HelpCircle size={24} color={tier.color} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 20, letterSpacing: 1, color: tier.color, marginBottom: 4 }}>
              TIER {tier.tier} — {tier.label.toUpperCase()} GUIDE
            </div>
            <div style={{ fontSize: 14, color: 'var(--text2)' }}>
              Showing personalised answers for your tier. Your EPI score: <strong style={{ color: tier.color }}>{score}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="fade-up" style={{ marginBottom: 32, position: 'relative', maxWidth: 540, animationDelay: '0.08s' }}>
        <Search size={16} color="var(--muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          className="input-field"
          placeholder="Search questions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 44 }}
        />
      </div>

      {/* Tier-specific section */}
      {filteredTier.length > 0 && (
        <div className="fade-up" style={{ marginBottom: 40, animationDelay: '0.10s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ width: 32, height: 32, background: tier.bg, border: `1px solid ${tier.border}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={16} color={tier.color} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: tier.color, letterSpacing: 1, textTransform: 'uppercase' }}>
                Tier {tier.tier} · Personalised Questions
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted2)' }}>Based on your current performance level</div>
            </div>
          </div>
          {filteredTier.map((f, i) => (
            <FAQItem key={i} q={f.q} a={f.a} icon={f.icon} color={tier.color} />
          ))}
        </div>
      )}

      {/* General section */}
      <div className="fade-up" style={{ animationDelay: '0.14s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.05)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={16} color="var(--muted2)" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted2)', letterSpacing: 1, textTransform: 'uppercase' }}>General Questions</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Platform, assessments, and features</div>
          </div>
        </div>
        {filteredGeneral.map((f, i) => (
          <FAQItem key={i} q={f.q} a={f.a} />
        ))}
        {filteredGeneral.length === 0 && filteredTier.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
            No results for "{search}". Try different keywords.
          </div>
        )}
      </div>

      {/* Contact */}
      <div className="fade-up card" style={{ marginTop: 40, padding: '24px', background: 'rgba(0,212,255,0.04)', borderColor: 'rgba(0,212,255,0.18)', animationDelay: '0.18s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <MessageCircle size={18} color="var(--cyan)" />
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--cyan)' }}>Still have questions?</span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 16 }}>
          Ask in the Community groups — other athletes and coaches are very helpful. Or post in the Tier {tier.tier} group for targeted advice from peers at your level.
        </p>
        <div style={{ fontSize: 13, color: 'var(--muted2)' }}>
          Built by SHEquence Team · SYNAPSE.AI × IGDTUW · support via GitHub: <span style={{ color: 'var(--cyan)' }}>Anushka232-22/Scout-AI</span>
        </div>
      </div>
    </div>
  );
}
