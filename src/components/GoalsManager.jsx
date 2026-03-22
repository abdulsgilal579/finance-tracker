import React, { useState } from 'react';
import { Target, Plus, Trash2, CheckCircle, TrendingUp, Lock, ChevronDown } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { formatCurrency } from '../utils';
import './components.css';

const PRIORITY_WEIGHTS = { High: 3, Medium: 2, Low: 1 };
const PRIORITY_STYLES = {
  High:   { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   emoji: '🔴' },
  Medium: { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)', emoji: '🟡' },
  Low:    { color: '#6b7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.3)', emoji: '🟢' },
};

function distributeWants(goals, amount, mode) {
  const active = goals.filter(g => (g.savedAmount || 0) < g.targetAmount);
  if (!active.length || amount <= 0) return goals;

  const alloc = {};
  if (mode === 'equal') {
    const share = amount / active.length;
    active.forEach(g => { alloc[g.id] = share; });
  } else if (mode === 'priority') {
    const totalW = active.reduce((s, g) => s + (PRIORITY_WEIGHTS[g.priority] || 2), 0);
    active.forEach(g => { alloc[g.id] = ((PRIORITY_WEIGHTS[g.priority] || 2) / totalW) * amount; });
  } else if (mode === 'remaining') {
    const totalR = active.reduce((s, g) => s + Math.max(0, g.targetAmount - (g.savedAmount || 0)), 0);
    if (totalR === 0) { active.forEach(g => { alloc[g.id] = amount / active.length; }); }
    else { active.forEach(g => { alloc[g.id] = (Math.max(0, g.targetAmount - (g.savedAmount || 0)) / totalR) * amount; }); }
  }
  return goals.map(g => alloc[g.id] == null ? g : { ...g, savedAmount: Math.min(g.targetAmount, (g.savedAmount || 0) + alloc[g.id]) });
}

export default function GoalsManager({ goals, setGoals, wantsTotal, wantsRemaining, selectedMonth, wantsTransfers, setWantsTransfers }) {
  const [newGoalName, setNewGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [months, setMonths] = useState('');
  const [plannedSavings, setPlannedSavings] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [distMode, setDistMode] = useState('equal');
  const [showForm, setShowForm] = useState(false);

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoalName.trim() || !targetAmount || !months || !plannedSavings) return;
    setGoals([...goals, {
      id: uuidv4(),
      name: newGoalName,
      targetAmount: Number(targetAmount),
      months: Number(months),
      plannedSavings: Number(plannedSavings),
      priority,
      savedAmount: 0
    }]);
    setNewGoalName(''); setTargetAmount(''); setMonths(''); setPlannedSavings(''); setPriority('Medium');
    setShowForm(false);
  };

  const removeGoal = (id) => setGoals(goals.filter(g => g.id !== id));
  const addFunds = (id) => setGoals(goals.map(g => g.id !== id ? g : { ...g, savedAmount: Math.min(g.targetAmount, (g.savedAmount || 0) + (g.plannedSavings || 0)) }));
  const withdrawFunds = (id) => setGoals(goals.filter(g => g.id !== id));

  const isWantsLocked = (wantsTransfers || []).some(t => t.month === selectedMonth);
  const activeGoalsCount = goals.filter(g => (g.savedAmount || 0) < g.targetAmount).length;
  const remainingDisplay = wantsRemaining || 0;

  const handleLockWants = () => {
    if (isWantsLocked || remainingDisplay <= 0 || goals.length === 0) return;
    setGoals(distributeWants(goals, remainingDisplay, distMode));
    setWantsTransfers([...(wantsTransfers || []), { month: selectedMonth, amount: remainingDisplay, mode: distMode }]);
  };

  const pStyles = PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium;

  return (
    <div className="glass-panel goals-manager">

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div className="flex items-center gap-2">
          <Target size={22} color="var(--accent-wants)" />
          <h3 style={{ margin: 0 }}>Goals</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Budget: <strong style={{ color: 'var(--accent-wants)' }}>{formatCurrency(wantsTotal)}</strong>
          </span>
          <button
            onClick={() => setShowForm(f => !f)}
            className="primary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <Plus size={14} /> New Goal
          </button>
        </div>
      </div>

      {/* ── Add Goal Form (collapsible) ── */}
      {showForm && (
        <form onSubmit={handleAddGoal} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '10px', marginBottom: '1rem', border: '1px solid var(--glass-border)' }}>
          <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>New Goal Details</h4>
          <input
            type="text"
            placeholder="Goal name (e.g., Laptop, Vacation)"
            value={newGoalName}
            onChange={(e) => setNewGoalName(e.target.value)}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Target Amount (PKR)</label>
              <input type="number" placeholder="e.g. 50000" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Months to achieve</label>
              <input type="number" placeholder="e.g. 6" value={months} onChange={(e) => setMonths(e.target.value)} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Monthly savings plan (PKR)</label>
              <input type="number" placeholder="e.g. 8000" value={plannedSavings} onChange={(e) => setPlannedSavings(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-card)', border: `1px solid ${pStyles.border}`, color: pStyles.color, borderRadius: '6px', padding: '0.6rem 0.75rem', cursor: 'pointer' }}
              >
                <option value="High">🔴 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <button type="button" onClick={() => setShowForm(false)} className="secondary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem' }}>Cancel</button>
            <button type="submit" className="primary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem' }}>Add Goal</button>
          </div>
        </form>
      )}

      {/* ── Goals List ── */}
      {goals.length === 0 ? (
        <div className="empty-state" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
          <Target size={32} style={{ opacity: 0.25, marginBottom: '0.5rem' }} />
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.88rem' }}>No goals yet. Hit "New Goal" to start saving!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: goals.length > 0 ? '1.25rem' : 0 }}>
          {goals.map(goal => {
            const requiredMonthly = goal.targetAmount / (goal.months || 1);
            const planned = goal.plannedSavings || 0;
            const saved = goal.savedAmount || 0;
            const pct = Math.min(100, (saved / goal.targetAmount) * 100) || 0;
            const completed = saved >= goal.targetAmount;
            const remaining = Math.max(0, goal.targetAmount - saved);
            const gp = PRIORITY_STYLES[goal.priority || 'Medium'];

            return (
              <div key={goal.id} style={{ padding: '0.9rem 1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                
                {/* Goal header row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{goal.name}</span>
                      <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem', borderRadius: '999px', background: gp.bg, color: gp.color, border: `1px solid ${gp.border}`, fontWeight: 600 }}>
                        {gp.emoji} {goal.priority || 'Medium'}
                      </span>
                      {completed && <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem', borderRadius: '999px', background: 'rgba(16,185,129,0.15)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.3)', fontWeight: 600 }}>✓ Done</span>}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem', display: 'block' }}>
                      {formatCurrency(saved)} saved · {formatCurrency(remaining)} to go
                    </span>
                  </div>
                  <button onClick={() => removeGoal(goal.id)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.2rem', opacity: 0.6, transition: 'opacity 0.2s' }} onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0.6}>
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{ height: '7px', borderRadius: '6px', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: completed ? 'var(--success)' : 'var(--accent-wants)', borderRadius: '6px', transition: 'width 0.4s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>{pct.toFixed(0)}% complete</span>
                    <span>Target: {formatCurrency(goal.targetAmount)}</span>
                  </div>
                </div>

                {/* Savings info + action row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', paddingTop: '0.25rem', borderTop: '1px solid var(--glass-border)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    <div>Required: <strong>{formatCurrency(requiredMonthly)}/mo</strong> over {goal.months}mo</div>
                    <div style={{ color: planned >= requiredMonthly ? 'var(--success)' : '#f59e0b' }}>
                      Planned: <strong>{formatCurrency(planned)}/mo</strong>
                      {planned >= requiredMonthly ? ' ✓ On track' : ' ⚠ Below target'}
                    </div>
                  </div>

                  {completed ? (
                    <button onClick={() => withdrawFunds(goal.id)} style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      <CheckCircle size={13} /> Claim
                    </button>
                  ) : (
                    <button onClick={() => addFunds(goal.id)} style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem', background: 'transparent', color: 'var(--accent-wants)', border: '1px solid var(--accent-wants)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600, whiteSpace: 'nowrap', transition: 'all 0.2s' }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.15)'; }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}>
                      <TrendingUp size={13} /> Deposit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Lock Wants into Goals panel ── */}
      {goals.length > 0 && (
        <div style={{ padding: '1rem', background: isWantsLocked ? 'var(--bg-secondary)' : 'rgba(139,92,246,0.07)', border: `1px solid ${isWantsLocked ? 'var(--glass-border)' : 'rgba(139,92,246,0.25)'}`, borderRadius: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ margin: '0 0 0.2rem 0', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Lock size={13} color="var(--accent-wants)" /> Lock Wants into Goals
              </h4>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {isWantsLocked
                  ? `Already distributed for ${selectedMonth}.`
                  : <>{formatCurrency(remainingDisplay)} remaining · {activeGoalsCount} active goal{activeGoalsCount !== 1 ? 's' : ''}</>}
              </p>
            </div>
            <button
              onClick={handleLockWants}
              disabled={isWantsLocked || remainingDisplay <= 0 || goals.length === 0}
              style={{ padding: '0.45rem 1rem', fontSize: '0.82rem', background: isWantsLocked ? 'var(--bg-card)' : 'var(--accent-wants)', color: isWantsLocked ? 'var(--text-muted)' : '#fff', border: 'none', borderRadius: '8px', cursor: isWantsLocked ? 'not-allowed' : 'pointer', fontWeight: 600, opacity: (remainingDisplay <= 0 && !isWantsLocked) ? 0.5 : 1 }}
            >
              {isWantsLocked ? '✓ Wants Locked' : 'Lock Wants'}
            </button>
          </div>

          {/* Mode selector */}
          {!isWantsLocked && remainingDisplay > 0 && (
            <div style={{ marginTop: '0.75rem' }}>
              <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Distribution mode</p>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {[
                  { key: 'equal',    label: 'Equal Split',  desc: 'Each goal gets the same amount' },
                  { key: 'priority', label: 'By Priority',  desc: 'High 3× · Medium 2× · Low 1×' },
                  { key: 'remaining',label: 'By Need',      desc: 'Goals furthest from target get more' },
                ].map(({ key, label, desc }) => (
                  <button
                    key={key}
                    onClick={() => setDistMode(key)}
                    title={desc}
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.78rem',
                      borderRadius: '7px',
                      border: `1px solid ${distMode === key ? 'var(--accent-wants)' : 'var(--glass-border)'}`,
                      background: distMode === key ? 'rgba(139,92,246,0.18)' : 'var(--bg-card)',
                      color: distMode === key ? 'var(--accent-wants)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      fontWeight: distMode === key ? 700 : 400,
                      transition: 'all 0.2s',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p style={{ margin: '0.4rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                {distMode === 'equal' ? 'Each goal gets the same amount.' : distMode === 'priority' ? 'High-priority goals get 3×, Medium 2×, Low 1× share.' : 'Goals with the most remaining balance get proportionally more.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
