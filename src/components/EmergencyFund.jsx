import React, { useState } from 'react';
import { ShieldCheck, TrendingUp, Settings2 } from 'lucide-react';
import { formatCurrency } from '../utils';
import './components.css';

export default function EmergencyFund({ target, setTarget, accumulatedBalance, rawBalance, efWithdrawals, setEfWithdrawals }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newTarget, setNewTarget] = useState(target);
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawReason, setWithdrawReason] = useState('');

  const progressPercent = Math.min(100, Math.max(0, (accumulatedBalance / target) * 100)) || 0;
  const isGoalReached = rawBalance >= target;

  const handleSave = () => {
    if (newTarget > 0) {
      setTarget(Number(newTarget));
    }
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
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 items-center">
          <ShieldCheck size={24} color="var(--accent-savings)" />
          <h3>Emergency Fund</h3>
        </div>
        <button className="icon-btn text-muted" onClick={() => setIsEditing(!isEditing)}>
          <Settings2 size={18} />
        </button>
      </div>

      {isEditing && (
        <div className="edit-target-panel mb-4 p-4 rounded bg-[var(--bg-secondary)]">
          <div className="flex-col gap-2">
            <label>Target Amount</label>
            <input 
              type="number" 
              value={newTarget} 
              onChange={(e) => setNewTarget(Number(e.target.value))} 
            />
          </div>
          <button onClick={handleSave} className="primary mt-3">Save</button>
        </div>
      )}

      <div className="flex justify-between items-end mb-2">
        <div>
          <span className="text-sm text-muted block mb-1">CURRENT</span>
          <span className="text-2xl font-bold text-savings">{formatCurrency(accumulatedBalance)}</span>
        </div>
        <div className="text-right">
          <span className="text-sm text-muted block mb-1">TARGET</span>
          <span className="text-lg font-bold">{formatCurrency(target)}</span>
        </div>
      </div>

      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill savings-fill" 
          style={{ width: `${progressPercent}%`, background: isGoalReached ? 'var(--success)' : 'var(--accent-savings)' }}
        ></div>
      </div>
      
      <p className="progress-text mt-2">
        {isGoalReached 
          ? "Target reached! Excellent job building your safety net."
          : <span>{progressPercent.toFixed(1)}% towards target. Keep up the good work!</span>
        }
      </p>

      <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)' }}>
        <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Record Withdrawal</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <input 
            type="text" 
            placeholder="Reason (e.g., Medical)" 
            value={withdrawReason}
            onChange={(e) => setWithdrawReason(e.target.value)}
            style={{ flex: 1.5, minWidth: '120px' }}
          />
          <input 
            type="number" 
            placeholder="Amount" 
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            style={{ flex: 1, minWidth: '80px' }}
          />
          <button onClick={handleWithdraw} className="secondary" style={{ padding: '0 1rem', whiteSpace: 'nowrap' }}>
            Withdraw
          </button>
        </div>
      </div>
    </div>
  );
}
