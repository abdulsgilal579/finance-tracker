import React, { useState } from 'react';
import { ShieldCheck, Settings2 } from 'lucide-react';
import { formatCurrency } from '../utils';
import './components.css';

export default function EmergencyFund({ target, setTarget, accumulatedBalance, rawBalance, efWithdrawals, setEfWithdrawals }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTarget, setNewTarget] = useState(target);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawReason, setWithdrawReason] = useState('');

  const progressPercent = Math.min(100, Math.max(0, (accumulatedBalance / target) * 100)) || 0;
  const isGoalReached   = rawBalance >= target;

  const handleSave = () => {
    if (newTarget > 0) setTarget(Number(newTarget));
    setIsEditing(false);
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0) return;
    setEfWithdrawals([...(efWithdrawals || []), {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(),
      amount: Number(withdrawAmount),
      date: new Date().toISOString(),
      reason: withdrawReason || 'General Withdrawal'
    }]);
    setWithdrawAmount('');
    setWithdrawReason('');
  };

  return (
    <div className="glass-panel emergency-fund">
      {/* Header */}
      <div className="section-header">
        <div className="section-header-left">
          <ShieldCheck size={22} color="var(--accent-savings)" />
          <h2 style={{ fontSize: '1.1rem' }}>Emergency Fund</h2>
        </div>
        <button className="icon-btn text-muted" onClick={() => setIsEditing(!isEditing)} title="Edit target">
          <Settings2 size={17} />
        </button>
      </div>

      {/* Edit target */}
      {isEditing && (
        <div className="edit-settings">
          <label>Target Amount</label>
          <input
            type="number"
            value={newTarget}
            onChange={(e) => setNewTarget(Number(e.target.value))}
          />
          <button onClick={handleSave} className="primary mt-3" style={{ width: '100%' }}>Save</button>
        </div>
      )}

      {/* Stats */}
      <div className="ef-stats">
        <div className="ef-stat">
          <span className="label">Current</span>
          <span className="value text-savings">{formatCurrency(accumulatedBalance)}</span>
        </div>
        <div className="ef-stat" style={{ textAlign: 'right' }}>
          <span className="label">Target</span>
          <span className="value">{formatCurrency(target)}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-container">
        <div
          className={`progress-bar-fill ${isGoalReached ? 'full-fill' : 'savings-fill'}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="progress-text mt-2">
        {isGoalReached
          ? '🎉 Target reached! Excellent job building your safety net.'
          : `${progressPercent.toFixed(1)}% towards target. Keep it up!`}
      </p>

      {/* Withdrawal form */}
      <div className="ef-withdraw-section">
        <h4>Record Withdrawal</h4>
        <div className="ef-withdraw-form">
          <input
            type="text"
            placeholder="Reason (e.g., Medical)"
            value={withdrawReason}
            onChange={(e) => setWithdrawReason(e.target.value)}
            style={{ flex: '1.5' }}
          />
          <input
            type="number"
            placeholder="Amount"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          <button onClick={handleWithdraw} className="secondary">Withdraw</button>
        </div>
      </div>
    </div>
  );
}
