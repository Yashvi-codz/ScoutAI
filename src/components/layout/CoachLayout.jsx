// ═══════════════════════════════════════════════════════
//  ScoutAI — Coach Layout v3
//  Removed: Coaching Locations (map)
//  Updated: Meetings → Coach Meetings
// ═══════════════════════════════════════════════════════
import { Home, Users, GitCompare, LogOut, Calendar, HelpCircle } from 'lucide-react';
import { Avatar } from '../ui/SharedComponents';

const NAV_MAIN = [
  { id: 'dashboard',     icon: Home,        label: 'Dashboard' },
  { id: 'teamBuilding',  icon: Users,       label: 'Team Building' },
  { id: 'compare',       icon: GitCompare,  label: 'Compare Athletes' },
];

const NAV_TOOLS = [
  { id: 'meetings',   icon: Calendar,    label: 'Meetings & Requests' },
  { id: 'faq',        icon: HelpCircle,  label: 'Coach FAQ & Guide' },
];

export default function CoachLayout({ user, activePage, setPage, onLogout, children }) {
  return (
    <div className="app-shell">
      {/* ── Fixed Sidebar ── */}
      <aside className="app-sidebar">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 26, padding: '0 4px' }}>
          <img
            src="/logo.jpeg"
            alt="ScoutAI logo"
            style={{ height:40, width:'auto', borderRadius:10, display:'block', flexShrink:0 }}
          />
          <div>
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, letterSpacing: 2.5, lineHeight: 1 }}>SCOUT AI</div>
            <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: 1.5, marginTop: 2 }}>COACH PORTAL</div>
          </div>
        </div>

        {/* Coach card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px', marginBottom: 6, background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.14)', borderRadius: 12 }}>
          <Avatar initials={(user.name || 'CO').slice(0, 2).toUpperCase()} size={40} color="var(--cyan)" />
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted2)', marginTop: 1 }}>Coach · {user.region || user.specialty || 'India'}</div>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingTop: 4 }}>
          <div className="nav-section-label">SCOUTING</div>
          {NAV_MAIN.map(({ id, icon: Icon, label }) => (
            <div key={id} className={`nav-link nav-link-cyan ${activePage === id ? 'active' : ''}`} onClick={() => setPage(id)}>
              <Icon size={17} /> {label}
            </div>
          ))}

          <div className="nav-section-label">TOOLS</div>
          {NAV_TOOLS.map(({ id, icon: Icon, label }) => (
            <div key={id} className={`nav-link nav-link-cyan ${activePage === id ? 'active' : ''}`} onClick={() => setPage(id)}>
              <Icon size={17} /> {label}
            </div>
          ))}
        </nav>

        <button onClick={onLogout} className="btn-danger" style={{ marginTop: 12 }}>
          <LogOut size={15} /> Sign Out
        </button>
      </aside>

      <main className="app-main">{children}</main>
    </div>
  );
}
