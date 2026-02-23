// ═══════════════════════════════════════════════════════
//  ScoutAI — Team Building (Coach)
//  Add 11 members by position; players placed on field image
// ═══════════════════════════════════════════════════════

import { useState } from 'react';
import { Users } from 'lucide-react';
import { computeCompositeScore, classifyTier } from '../../engine/tierEngine';
import { Avatar, TierBadge, SectionHeader } from '../../components/ui/SharedComponents';
import { MOCK_ATHLETES } from '../../data/mockAthletes';

// Slot index -> position label and placement on field (percent from left/top). Formation 4-3-3.
const SLOT_CONFIG = [
  { label: 'GK',  left: 50,  top: 90 },   // goalkeeper
  { label: 'RB',  left: 78,  top: 76 },   // right back
  { label: 'CB',  left: 62,  top: 76 },   // center back R
  { label: 'CB',  left: 38,  top: 76 },   // center back L
  { label: 'LB',  left: 22,  top: 76 },   // left back
  { label: 'CM',  left: 75,  top: 52 },   // central mid R
  { label: 'CM',  left: 50,  top: 52 },   // central mid C
  { label: 'CM',  left: 25,  top: 52 },   // central mid L
  { label: 'RW',  left: 78,  top: 18 },   // right wing
  { label: 'ST',  left: 50,  top: 10 },   // striker
  { label: 'LW',  left: 22,  top: 18 },   // left wing
];

const emptySlot = { id: null, name: '', avatar: '—' };

export default function TeamBuildingPage() {
  const [slots, setSlots] = useState(() =>
    Array(11).fill(null).map(() => ({ ...emptySlot }))
  );

  const setSlot = (index, athleteId) => {
    if (!athleteId) {
      setSlots(prev => {
        const next = [...prev];
        next[index] = { ...emptySlot };
        return next;
      });
      return;
    }
    const a = MOCK_ATHLETES.find(x => x.id === athleteId);
    if (!a) return;
    setSlots(prev => {
      const next = [...prev];
      next[index] = { id: a.id, name: a.name, avatar: a.avatar, position: a.position, region: a.region, age: a.age, metrics: a.metrics };
      return next;
    });
  };

  const usedIds = slots.map(s => s.id).filter(Boolean);
  const selectedCount = slots.filter(s => s.id).length;

  return (
    <div className="page-pad">
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <h1 className="section-title">TEAM BUILDING</h1>
        <p className="section-subtitle">Add players by position. Select an athlete for each slot — they appear on the field at that position.</p>
      </div>

      <div className="card fade-up" style={{ marginBottom: 24, animationDelay: '0.06s', padding: 20 }}>
        <SectionHeader
          title="FORMATION"
          subtitle="11 slots — place players on the field by position"
        />
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: 700,
            margin: '0 auto',
            borderRadius: 12,
            overflow: 'hidden',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
        >
          {/* Field image from public folder */}
          <img
            src="/field.svg"
            alt="Football field"
            style={{
              display: 'block',
              width: '100%',
              height: 'auto',
              verticalAlign: 'middle',
            }}
          />
          {/* Player slots positioned on field (percent-based) */}
          {slots.map((slot, idx) => {
            const pos = SLOT_CONFIG[idx];
            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: `${pos.left}%`,
                  top: `${pos.top}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 'clamp(72px, 14vw, 100px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    border: '2px solid var(--border2)',
                    borderRadius: 12,
                    padding: '8px 10px',
                    background: 'rgba(7,9,15,0.92)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    minWidth: 0,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: 0.5 }}>
                    {pos.label}
                  </div>
                  <select
                    className="select-field"
                    value={slot.id || ''}
                    onChange={e => setSlot(idx, e.target.value || null)}
                    style={{ width: '100%', fontSize: 10, padding: '4px 6px', minHeight: 28 }}
                  >
                    <option value="">— Select —</option>
                    {MOCK_ATHLETES.map(a => (
                      <option
                        key={a.id}
                        value={a.id}
                        disabled={usedIds.includes(a.id) && slot.id !== a.id}
                      >
                        {a.name}
                      </option>
                    ))}
                  </select>
                  {slot.id ? (
                    <>
                      <Avatar
                        initials={slot.avatar}
                        size={32}
                        color={classifyTier(computeCompositeScore(slot.metrics)).color}
                      />
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                        {slot.name.split(' ')[0]}
                      </div>
                    </>
                  ) : (
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--muted)' }}>
                      —
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--muted2)' }}>
          <Users size={16} />
          {selectedCount} / 11 members selected
        </div>
      </div>
    </div>
  );
}
