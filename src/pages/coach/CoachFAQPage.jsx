// ═══════════════════════════════════════════════════════
//  ScoutAI — Coach FAQ Page
//  Coach-specific: scouting, platform, verification, AI
// ═══════════════════════════════════════════════════════
import { useState } from 'react';
import { HelpCircle, ChevronDown, Search, BookOpen, Zap, Users, Shield, MessageCircle, BarChart2, Settings, CheckCircle } from 'lucide-react';

const COACH_FAQ_SECTIONS = [
  {
    title: 'GETTING STARTED',
    color: 'var(--cyan)',
    icon: Settings,
    faqs: [
      {
        q: 'How do I get verified as a coach on ScoutAI?',
        a: 'After completing your profile, your account enters a 24–48 hour verification process. Our team validates your AIFF license number, coaching certifications, or institutional affiliation. Verified coaches get a green checkmark, appear in athlete search results, and can accept meeting requests from athletes. If you face delays, contact us via GitHub at Anushka232-22/Scout-AI.',
        icon: Shield,
      },
      {
        q: 'What is the EPI score and how should I interpret it?',
        a: 'EPI (Elite Potential Index) is a 0-100 composite score derived from 6 biomechanical metrics: Speed (20%), Acceleration (18%), Agility (17%), Balance (15%), Technique (20%), Stamina (10%). Tier A (≥90) = Elite Pro potential, Tier B (75–89) = High Potential, Tier C (60–74) = Developing, Tier D (<60) = Grassroots. Use the SWOT panel on each athlete\'s detail page to understand the breakdown behind the score.',
        icon: BarChart2,
      },
      {
        q: 'How do I add athletes to my roster?',
        a: 'Coaches cannot manually add athletes — athletes must sign up and submit a drill assessment first. You will see all athletes in your region and tier range in the "All Athletes" section. You can also send or approve meeting requests to begin a coaching relationship. In future updates, direct invitations via email will be supported.',
        icon: Users,
      },
      {
        q: 'Can I filter athletes by specific metrics?',
        a: 'Yes! In the "All Athletes" view, use the filter panel to sort by: Overall EPI score, Tier (A/B/C/D), Region/State, Preferred Position, Age Category, and individual metric scores. The Compare feature lets you do side-by-side breakdown of up to 3 athletes simultaneously using the radar chart overlay.',
        icon: Zap,
      },
    ],
  },
  {
    title: 'ATHLETE ASSESSMENT & AI',
    color: 'var(--green)',
    icon: BarChart2,
    faqs: [
      {
        q: 'Which drills give the most accurate results?',
        a: 'Accuracy depends on video quality, not just drill type. That said, for overall assessment: Sprint Speed gives the most reliable speed/acceleration data; Agility Drill is best for multidirectional movement; Balance Drill gives clean balance data with minimal noise. For goalkeepers, GK Dive Drill is purpose-built. Combined multi-drill assessments (multiple uploads averaged) give the most holistic profile.',
        icon: Zap,
      },
      {
        q: 'What does the SWOT analysis tell me as a coach?',
        a: 'SWOT is generated per athlete automatically: Strengths (metrics ≥75 — ready to deploy), Weaknesses (metrics <60 — need targeted work), Opportunities (60–74 — a +12pt gain = tier jump, addressable in 4–8 weeks), Threats (biomechanical imbalances — e.g. high speed + low balance = ACL risk flag). Use the Threat section especially — it helps you design injury-prevention sessions.',
        icon: Shield,
      },
      {
        q: 'How does MediaPipe work behind the scenes?',
        a: 'The athlete uploads a video which is sent to the FastAPI server. OpenCV extracts frames at 30fps. Google MediaPipe Pose runs on each frame, detecting 33 body landmarks (joints, limbs) in 3D. From landmark movement over time, we extract: velocity vectors (speed), angular momentum (agility), CoM trajectory (balance), limb displacement (technique), stride frequency over time (stamina). These raw values are normalized to 0–100 using FIFA 23 dataset benchmarks.',
        icon: BarChart2,
      },
      {
        q: 'Can I upload a video on behalf of an athlete I\'m coaching in-person?',
        a: 'Yes. Coaches can upload assessment videos for athletes in two ways: (1) Ask the athlete to log in and upload from their own account — recommended for data ownership. (2) Use the "Upload for Athlete" button in the AthleteDetail page (coming in next update) — video will be tagged to that athlete\'s profile with a coach-submitted label. Either approach triggers the same MediaPipe + ML pipeline.',
        icon: Users,
      },
    ],
  },
  {
    title: 'MEETINGS & SCHEDULING',
    color: 'var(--amber)',
    icon: MessageCircle,
    faqs: [
      {
        q: 'How do athletes request a session with me?',
        a: 'Athletes browse the "Find Coaching" section (available to them as players), view your profile, and submit a session request with their preferred date, time, and session type (video/in-person). You receive a notification under Meetings → Athlete Requests. You can approve, decline, or message the athlete before deciding.',
        icon: MessageCircle,
      },
      {
        q: 'What happens when I approve a request?',
        a: 'Approving a request automatically: adds the session to your "My Schedule" view, notifies the athlete (they see it in their Meetings page as "Upcoming"), and creates a calendar entry visible in the Calendar View. You can add session notes (e.g. drill focus areas) before the meeting. For video sessions, a meeting link (Google Meet/Zoom) should be shared separately via the Message button.',
        icon: CheckCircle,
      },
      {
        q: 'Can I propose a different time to the athlete?',
        a: 'Yes — use the "Message" button on the request card to suggest a different slot. Type the alternate time and the athlete receives the message in their Community/Meetings inbox. You can then approve the revised request once they confirm. Full rescheduling automation is on the roadmap for a future release.',
        icon: Settings,
      },
    ],
  },
  {
    title: 'SCOUTING & OPPORTUNITIES',
    color: 'var(--purple)',
    icon: Users,
    faqs: [
      {
        q: 'How do I nominate an athlete for a trial or camp?',
        a: 'In the AthleteDetail page, go to "Development Plan" → "Opportunities". If an athlete qualifies for a listed trial (AIFF, Khelo India, SAI, etc.), you\'ll see a "Nominate" button. This generates a downloadable PDF report pre-formatted for scouting submissions. You can also export the full EPI report for any athlete using the download button.',
        icon: Zap,
      },
      {
        q: 'Can I compare athletes from different regions?',
        a: 'Yes — the Compare Athletes tool supports any combination of athletes in your roster, regardless of region. Load up to 3 athletes and the radar chart overlays their 6 biomechanical metrics. The summary table below highlights which athlete leads in each metric. This is useful for identifying position-specific strengths across a trial shortlist.',
        icon: BarChart2,
      },
      {
        q: 'How is the position recommendation generated?',
        a: 'Position recommendations use threshold logic: Speed ≥78 + Technique ≥72 → Winger; Speed ≥80 + Acceleration ≥78 → Striker; Stamina ≥72 + Balance ≥68 → Central Midfielder; Balance ≥74 + Speed <68 → Centre-Back; Agility ≥75 + Technique ≥74 → Attacking Midfielder; All-round balance → Full-Back. For goalkeepers, a dedicated GK assessment drill is required.',
        icon: Shield,
      },
    ],
  },
  {
    title: 'TECHNICAL & DATA',
    color: 'var(--red)',
    icon: Settings,
    faqs: [
      {
        q: 'How is athlete data stored and kept private?',
        a: 'Athlete profiles and assessment reports are stored in Firebase Firestore with row-level security rules — athletes can only see their own data, coaches can only see athletes who have approved the coaching relationship. Video files are processed server-side and not permanently stored after analysis. Firebase Auth handles all authentication with industry-standard security.',
        icon: Shield,
      },
      {
        q: 'What video quality gives the best assessment?',
        a: '1080p at 60fps is ideal. 720p at 30fps is the minimum acceptable. Poor lighting, motion blur, partial body occlusion, or other people in frame are the top causes of low-confidence assessments. The confidence score (0–1.0) on each report tells you how reliable that assessment is — below 0.7, recommend the athlete re-submit.',
        icon: BarChart2,
      },
      {
        q: 'Can I integrate ScoutAI with my own systems?',
        a: 'The FastAPI backend exposes REST endpoints that can be integrated into external scouting databases or club management systems. The /analyze endpoint returns JSON with full metric data. Contact the team via GitHub for API documentation and partnership integrations.',
        icon: Settings,
      },
    ],
  },
];

// CheckCircle is imported at the top of this file

function FAQItem({ q, a, icon: Icon, color }) {
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

export default function CoachFAQPage() {
  const [search, setSearch] = useState('');
  const [activeSection, setActiveSection] = useState('ALL');

  const sections = ['ALL', ...COACH_FAQ_SECTIONS.map(s => s.title)];

  const filteredSections = COACH_FAQ_SECTIONS.map(section => ({
    ...section,
    faqs: section.faqs.filter(f =>
      !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(section =>
    (activeSection === 'ALL' || section.title === activeSection) && section.faqs.length > 0
  );

  return (
    <div className="page-pad">
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: 36 }}>
        <h1 className="section-title">COACH FAQ & GUIDE</h1>
        <p className="section-subtitle">Platform guide, AI explained, scouting workflows and best practices for coaches</p>
      </div>

      {/* Banner */}
      <div className="fade-up card" style={{ marginBottom: 32, padding: '20px 24px', background: 'rgba(0,212,255,0.04)', borderColor: 'rgba(0,212,255,0.2)', animationDelay: '0.05s' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, background: 'rgba(0,212,255,0.12)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <HelpCircle size={24} color="var(--cyan)" />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 20, letterSpacing: 1, color: 'var(--cyan)', marginBottom: 4 }}>COACH KNOWLEDGE BASE</div>
            <div style={{ fontSize: 14, color: 'var(--text2)' }}>
              {COACH_FAQ_SECTIONS.reduce((sum, s) => sum + s.faqs.length, 0)} articles covering scouting, AI analysis, meetings, and data privacy.
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="fade-up" style={{ marginBottom: 24, position: 'relative', maxWidth: 540, animationDelay: '0.08s' }}>
        <Search size={16} color="var(--muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
        <input className="input-field" placeholder="Search coach FAQ..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 44 }} />
      </div>

      {/* Section filter pills */}
      <div className="fade-up" style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap', animationDelay: '0.1s' }}>
        {sections.map(s => (
          <button key={s} onClick={() => setActiveSection(s)} style={{
            padding: '8px 16px', borderRadius: 99, border: '1px solid',
            borderColor: activeSection === s ? 'rgba(0,212,255,0.35)' : 'var(--border)',
            background: activeSection === s ? 'rgba(0,212,255,0.1)' : 'var(--surface)',
            color: activeSection === s ? 'var(--cyan)' : 'var(--muted2)',
            fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}>{s === 'ALL' ? 'All Topics' : s}</button>
        ))}
      </div>

      {/* FAQ sections */}
      {filteredSections.map((section, si) => (
        <div key={section.title} className="fade-up" style={{ marginBottom: 40, animationDelay: `${0.1 + si * 0.05}s` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{ width: 34, height: 34, background: `${section.color}15`, border: `1px solid ${section.color}30`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <section.icon size={18} color={section.color} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: section.color, letterSpacing: 1.2, textTransform: 'uppercase' }}>{section.title}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>{section.faqs.length} article{section.faqs.length !== 1 ? 's' : ''}</div>
            </div>
          </div>
          {section.faqs.map((f, i) => (
            <FAQItem key={i} q={f.q} a={f.a} icon={f.icon} color={section.color} />
          ))}
        </div>
      ))}

      {filteredSections.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
          No results for "{search}". Try a different search term.
        </div>
      )}

      {/* Support footer */}
      <div className="fade-up card" style={{ marginTop: 40, padding: '24px', background: 'rgba(167,139,250,0.04)', borderColor: 'rgba(167,139,250,0.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <MessageCircle size={18} color="var(--purple)" />
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--purple)' }}>Need more help?</span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 12 }}>
          For platform bugs, API integration queries, or feature requests, reach out via our GitHub repository. For athlete-specific questions, use the Message feature in the Meetings section.
        </p>
        <div style={{ fontSize: 13, color: 'var(--muted2)' }}>
          🔗 <span style={{ color: 'var(--purple)' }}>github.com/Anushka232-22/Scout-AI</span> &nbsp;·&nbsp;
          Built by SHEquence Team · SYNAPSE.AI × IGDTUW
        </div>
      </div>
    </div>
  );
}
