# 🏆 ScoutAI — AI-Powered Football Talent Identification Platform
### SYNAPSE.AI × IGDTUW | SHEquence Team

---

## 📁 Project Structure

```
scoutai/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx                          ← Root router (all navigation)
│   ├── index.js                         ← React entry point
│   ├── styles/
│   │   └── globals.css                  ← All global styles & CSS variables
│   │
│   ├── engine/                          ← ✅ OUR TEAM'S CORE LOGIC
│   │   ├── tierEngine.js                ← Composite score, tier classification, positions, dev plan
│   │   └── swotEngine.js                ← SWOT generator with biomechanical threat detection
│   │
│   ├── data/
│   │   └── mockAthletes.js              ← Demo athlete data (replace with Firebase)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── PlayerLayout.jsx         ← Player sidebar + nav
│   │   │   └── CoachLayout.jsx          ← Coach sidebar + nav
│   │   └── ui/
│   │       └── SharedComponents.jsx     ← ScoreRing, MetricBar, TierBadge, Avatar, etc.
│   │
│   └── pages/
│       ├── LandingPage.jsx              ← Role selection (Player / Coach)
│       ├── AuthPage.jsx                 ← Login + Sign Up
│       ├── player/
│       │   ├── PlayerDashboard.jsx      ← Player home with EPI, metrics, positions
│       │   ├── UploadPage.jsx           ← ⚙️ MediaPipe + ML integration points here
│       │   ├── ResultsPage.jsx          ← Full SWOT + Dev plan report
│       │   └── ProgressPage.jsx         ← Historical trend charts
│       └── coach/
│           ├── CoachDashboard.jsx       ← Athlete table, tier dist, top picks
│           ├── AthleteDetail.jsx        ← Individual athlete deep-dive
│           ├── CoachAnalytics.jsx       ← EPI charts, regional breakdown
│           └── CompareAthletes.jsx      ← Side-by-side athlete comparison
```

---

## 🚀 Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm start

# 3. Open in browser
# http://localhost:3000
```

**Demo:** Any email + any password will work on the auth page.

---

## ⚙️ MediaPipe Integration (Your Teammate's Code)

In `src/pages/player/UploadPage.jsx`, find the comment:

```js
// ⚙️ INTEGRATION POINT 1 — MediaPipe Video Analysis
```

Replace the demo simulation with:

```js
const rawMetrics = await runMediaPipeAnalysis(file);
// rawMetrics shape:
// {
//   speed:        <float m/s>,          e.g. 8.2
//   acceleration: <float m/s²>,         e.g. 4.1
//   agility:      <float rad/s>,        e.g. 3.2
//   balance:      <float sway variance>,e.g. 0.03
//   technique:    <float 0-1 accuracy>, e.g. 0.78
//   stamina:      <float 0-1 intensity>,e.g. 0.72
// }

// Normalise raw values to 0-100 FIFA-style scores
const normMetrics = normaliseAllMetrics(rawMetrics);
```

The `normaliseAllMetrics()` function in `src/engine/tierEngine.js` handles all conversion.

---

## ⚙️ ML Model Integration (Your Teammate's Code)

In `src/pages/player/UploadPage.jsx`, find the comment:

```js
// ⚙️ INTEGRATION POINT 2 — ML Model Prediction
```

**If running via FastAPI:**
```js
const res = await fetch('http://localhost:8000/api/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sprint_speed:  normMetrics.speed,
    agility:       normMetrics.agility,
    balance:       normMetrics.balance,
    reactions:     normMetrics.technique,
    jumping:       normMetrics.acceleration,
    stamina:       normMetrics.stamina,
    tackle:        normMetrics.balance,
    gk_diving:     0,
    gk_reflexes:   0,
  }),
});
const { overall_rating } = await res.json();
const tier = classifyTier(overall_rating);
```

**If using pickle model in browser (via Pyodide or similar):**
```js
const overall_rating = await mlModel.predict([
  normMetrics.speed, normMetrics.agility, normMetrics.balance,
  normMetrics.technique, normMetrics.acceleration, normMetrics.stamina,
  normMetrics.balance, 0, 0
]);
```

---

## ✅ What Our Team Built (SHEquence)

| Feature | File | Status |
|---------|------|--------|
| Composite Score (EPI) formula | `tierEngine.js` | ✅ Done |
| Tier A/B/C/D classification | `tierEngine.js` | ✅ Done |
| Raw → 0-100 normalisation | `tierEngine.js` | ✅ Done |
| Position recommendation engine | `tierEngine.js` | ✅ Done |
| SWOT analysis engine | `swotEngine.js` | ✅ Done |
| Injury/threat detection | `swotEngine.js` | ✅ Done |
| Development blueprint generator | `tierEngine.js` | ✅ Done |
| Opportunity mapping | `tierEngine.js` | ✅ Done |
| Age+position benchmarks | `tierEngine.js` | ✅ Done |
| Full Player UI | `pages/player/` | ✅ Done |
| Full Coach UI | `pages/coach/` | ✅ Done |
| All charts & visualisations | Multiple pages | ✅ Done |
| Auth flow (Firebase-ready) | `AuthPage.jsx` | ✅ Done |

---

## 🔗 Firebase Integration (Production)

Replace mock auth in `AuthPage.jsx` with:
```js
import { signInWithEmailAndPassword } from 'firebase/auth';

// On login:
const userCred = await signInWithEmailAndPassword(auth, form.email, form.password);
```

Replace mock athlete data in `mockAthletes.js` with Firestore queries:
```js
const snapshot = await getDocs(collection(db, 'athletes'));
const athletes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

---

## 🎯 Tier Classification Formula

```
CompositeScore = (0.20 × Speed) + (0.18 × Acceleration) + (0.17 × Agility)
              + (0.15 × Balance) + (0.20 × Technique) + (0.10 × Stamina)

Tier A  ≥ 90   → Elite Pro
Tier B  75-89  → High Potential  
Tier C  60-74  → Developing
Tier D  < 60   → Grassroots
```

---

*Team SHEquence — Anushka Saroha · Yashvi · Shivangini Gupta · Vartika Malik*
