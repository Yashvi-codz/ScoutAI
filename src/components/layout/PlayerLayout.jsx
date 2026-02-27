// ═══════════════════════════════════════════════════════
//  ScoutAI — Player Layout v2 (full-screen sidebar)
// ═══════════════════════════════════════════════════════

import { Home, Video, FileText, TrendingUp, LogOut, Users, Calendar, HelpCircle, MapPin } from 'lucide-react';
import { Avatar } from '../ui/SharedComponents';

const NAV_ITEMS_MAIN = [
  { id: 'dashboard', icon: Home,       label: 'Dashboard' },
  { id: 'upload',    icon: Video,      label: 'New Assessment' },
  { id: 'reports',   icon: FileText,   label: 'My Reports' },
  { id: 'progress',  icon: TrendingUp, label: 'Progress' },
];

const NAV_ITEMS_COMMUNITY = [
  { id: 'community', icon: Users,    label: 'Community Groups' },
  { id: 'meetings',  icon: Calendar, label: 'Meetings' },
  { id: 'map',       icon: MapPin,   label: 'Find Coaching' },
  { id: 'faq',       icon: HelpCircle, label: 'FAQ & Help' },
];

export default function PlayerLayout({ user, activePage, setPage, onLogout, children }) {
  return (
    <div className="app-shell">
      {/* ── Fixed Sidebar ── */}
      <aside className="app-sidebar">
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:26, padding:'0 4px' }}>
          <img
            src="/logo.jpeg"
            alt="ScoutAI logo"
            style={{ height:40, width:'auto', borderRadius:10, display:'block', flexShrink:0 }}
          />
          <div>
            <div style={{ fontFamily:'var(--font-head)', fontSize:18, letterSpacing:2.5, lineHeight:1 }}>SCOUT AI</div>
            <div style={{ fontSize:9, color:'var(--muted)', letterSpacing:1.5, marginTop:2 }}>ATHLETE PORTAL</div>
          </div>
        </div>

        {/* User card */}
        <div style={{ display:'flex', alignItems:'center', gap:11, padding:'12px 12px', marginBottom:6, background:'rgba(0,255,135,0.05)', border:'1px solid rgba(0,255,135,0.12)', borderRadius:12 }}>
          <Avatar initials={user.name.slice(0,2).toUpperCase()} size={40} />
          <div style={{ flex:1, overflow:'hidden' }}>
            <div style={{ fontSize:14, fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.name}</div>
            <div style={{ fontSize:11, color:'var(--muted2)', marginTop:1 }}>Athlete · {user.region || 'India'}</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, display:'flex', flexDirection:'column', overflowY:'auto' }}>
          <div className="nav-section-label">PERFORMANCE</div>
          {NAV_ITEMS_MAIN.map(({ id, icon: Icon, label }) => (
            <div key={id} className={`nav-link ${activePage===id ? 'active' : ''}`} onClick={() => setPage(id)}>
              <Icon size={17} /> {label}
            </div>
          ))}

          <div className="nav-section-label">CONNECT</div>
          {NAV_ITEMS_COMMUNITY.map(({ id, icon: Icon, label }) => (
            <div key={id} className={`nav-link ${activePage===id ? 'active' : ''}`} onClick={() => setPage(id)}>
              <Icon size={17} /> {label}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <button onClick={onLogout} className="btn-danger" style={{ marginTop:12 }}>
          <LogOut size={15} /> Sign Out
        </button>
      </aside>

      {/* ── Main area ── */}
      <main className="app-main">{children}</main>
    </div>
  );
}
