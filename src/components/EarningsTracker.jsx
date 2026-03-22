import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TrendingUp, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils';
import './components.css';

export default function EarningsTracker({ earnings, addEarning, removeEarning, selectedMonth }) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');

  const activeEarnings = earnings.filter(e => e.date.startsWith(selectedMonth));
  const monthTotal = activeEarnings.reduce((sum, e) => sum + e.amount, 0);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!desc.trim() || !amount) return;
    await addEarning({
      id: uuidv4(),
      desc,
      amount: Number(amount),
      date: new Date(`${selectedMonth}-01T12:00:00Z`).toISOString()
    });
    setDesc('');
    setAmount('');
  };

  return (
    <div className="glass-panel animate-fade-in">
      {/* Header */}
      <div className="section-header">
        <div className="section-header-left">
          <TrendingUp size={22} color="var(--accent-needs)" />
          <h2>Manage Earnings</h2>
        </div>
        {monthTotal > 0 && (
          <div className="tracker-total">
            Total: <strong style={{ color: 'var(--accent-needs)' }}>{formatCurrency(monthTotal)}</strong>
          </div>
        )}
      </div>

      {/* Add form */}
      <form className="mb-6" onSubmit={handleAdd}>
        <div className="earnings-form-grid">
          <input
            type="text"
            placeholder="Income source (e.g. Freelance project)"
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          <button type="submit" className="primary" style={{ background: 'linear-gradient(135deg, var(--accent-needs), #059669)' }}>
            + Add Income
          </button>
        </div>
      </form>

      {/* List */}
      <div className="expense-list">
        {activeEarnings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💰</div>
            <p>No earnings added for this month. Add your first income!</p>
          </div>
        ) : (
          activeEarnings.map(earning => (
            <div key={earning.id} className="expense-row animate-fade-in">
              <div className="expense-info">
                <span className="expense-desc">{earning.desc}</span>
                <span className="expense-date">
                  {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(earning.date))}
                </span>
              </div>
              <div className="expense-meta">
                <span className="expense-amount" style={{ color: 'var(--accent-needs)' }}>
                  +{formatCurrency(earning.amount)}
                </span>
                <button type="button" className="icon-btn text-warning" onClick={() => removeEarning(earning.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
