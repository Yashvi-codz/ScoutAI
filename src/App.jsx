// ═══════════════════════════════════════════════════════
//  ScoutAI — Root App v3
//  Auth flow: Landing → Auth → ProfileSetup → Dashboard
//  New Coach features: CoachMeetings, CoachFAQ (no map)
// ═══════════════════════════════════════════════════════
import { useState } from 'react';

// ── Landing & Auth ──
import LandingPage       from './pages/LandingPage';
import AuthPage          from './pages/AuthPage';
import ProfileSetupPage  from './pages/ProfileSetupPage';

// ── Player Pages ──
import PlayerDashboard from './pages/player/PlayerDashboard';
import UploadPage      from './pages/player/UploadPage';
import ResultsPage     from './pages/player/ResultsPage';
import ProgressPage    from './pages/player/ProgressPage';
import CommunityPage   from './pages/player/CommunityPage';
import MeetingsPage    from './pages/player/MeetingsPage';
import FAQPage         from './pages/player/FAQPage';
import MapPage         from './pages/player/MapPage';

// ── Coach Pages ──
import CoachDashboard    from './pages/coach/CoachDashboard';
import AthleteDetail     from './pages/coach/AthleteDetail';
import TeamBuildingPage  from './pages/coach/TeamBuildingPage';
import CompareAthletes   from './pages/coach/CompareAthletes';
import CoachMeetingsPage from './pages/coach/CoachMeetingsPage';
import CoachFAQPage      from './pages/coach/CoachFAQPage';

// ── Layouts ──
import PlayerLayout from './components/layout/PlayerLayout';
import CoachLayout  from './components/layout/CoachLayout';

export default function App() {
  // ── View state machine ──
  // 'landing' | 'auth' | 'profile-setup' | 'app'
  const [view,            setView]           = useState('landing');
  const [role,            setRole]           = useState(null);
  const [partialUser,     setPartialUser]    = useState(null);  // after signup, before profile
  const [user,            setUser]           = useState(null);  // full user after profile setup
  const [report,          setReport]         = useState(null);
  const [playerPage,      setPlayerPage]     = useState('dashboard');
  const [coachPage,       setCoachPage]      = useState('dashboard');
  const [selectedAthlete, setSelectedAthlete] = useState(null);

  // ── Handlers ──
  const handleChooseRole = (r) => { setRole(r); setView('auth'); };

  // Signup → go to profile setup (step 2)
  const handleSignupSuccess = (partial) => {
    setPartialUser(partial);
    setView('profile-setup');
  };

  // Login → go straight to dashboard with demo profile
  const handleLoginSuccess = (userData) => {
    setUser({ ...userData, role });
    setView('app');
  };

  // Profile setup complete → go to dashboard
  const handleProfileComplete = (fullUser) => {
    setUser(fullUser);
    setView('app');
  };

  const handleLogout = () => {
    setUser(null); setRole(null); setPartialUser(null); setReport(null);
    setPlayerPage('dashboard'); setCoachPage('dashboard');
    setSelectedAthlete(null); setView('landing');
  };

  const handleAnalysisComplete = (r) => {
    setReport(r);
    setPlayerPage('reports');
  };

  const handleViewAthlete = (a) => {
    setSelectedAthlete(a);
    setCoachPage('athleteDetail');
  };

  // ── Routes ──

  if (view === 'landing')
    return <LandingPage onChooseRole={handleChooseRole} />;

  if (view === 'auth')
    return (
      <AuthPage
        role={role}
        onSignupSuccess={handleSignupSuccess}
        onLoginSuccess={handleLoginSuccess}
        onBack={() => setView('landing')}
      />
    );

  if (view === 'profile-setup')
    return (
      <ProfileSetupPage
        partialUser={partialUser}
        onComplete={handleProfileComplete}
      />
    );

  // ── Player App ──
  if (view === 'app' && user?.role === 'player') {
    const nav = (p) => setPlayerPage(p);
    return (
      <PlayerLayout user={user} activePage={playerPage} setPage={nav} onLogout={handleLogout}>
        {playerPage === 'dashboard' && <PlayerDashboard user={user} report={report} onNavigate={nav} />}
        {playerPage === 'upload'    && <UploadPage user={user} onComplete={handleAnalysisComplete} />}
        {playerPage === 'reports'   && <ResultsPage user={user} report={report} />}
        {playerPage === 'progress'  && <ProgressPage user={user} report={report} />}
        {playerPage === 'community' && <CommunityPage user={user} report={report} />}
        {playerPage === 'meetings'  && <MeetingsPage user={user} />}
        {playerPage === 'faq'       && <FAQPage user={user} report={report} />}
        {playerPage === 'map'       && <MapPage user={user} />}
      </PlayerLayout>
    );
  }

  // ── Coach App ──
  if (view === 'app' && user?.role === 'coach') {
    const nav = (p) => {
      setCoachPage(p);
      if (p !== 'athleteDetail') setSelectedAthlete(null);
    };
    const activeNavPage = coachPage === 'athleteDetail' ? 'dashboard' : coachPage;

    return (
      <CoachLayout user={user} activePage={activeNavPage} setPage={nav} onLogout={handleLogout}>
        {coachPage === 'dashboard'      && <CoachDashboard onViewAthlete={handleViewAthlete} />}
        {coachPage === 'athleteDetail'  && selectedAthlete && (
          <AthleteDetail athlete={selectedAthlete} onBack={() => { setSelectedAthlete(null); setCoachPage('dashboard'); }} />
        )}
        {coachPage === 'teamBuilding'  && <TeamBuildingPage />}
        {coachPage === 'compare'        && <CompareAthletes />}
        {coachPage === 'meetings'       && <CoachMeetingsPage user={user} />}
        {coachPage === 'faq'            && <CoachFAQPage />}
      </CoachLayout>
    );
  }

  return null;
}
