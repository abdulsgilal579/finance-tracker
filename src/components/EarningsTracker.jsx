import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DollarSign, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils';
import './components.css';

export default function EarningsTracker({ earnings, addEarning, removeEarning, selectedMonth }) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');

  const activeEarnings = earnings.filter(e => e.date.startsWith(selectedMonth));

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
    <div className="glass-panel expense-tracker animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <DollarSign size={24} color="var(--success, #10b981)" />
        <h2>Manage Earnings</h2>
      </div>

      <form className="expense-form mb-8" onSubmit={handleAdd}>
        <div className="form-grid" style={{ gridTemplateColumns: 'minmax(200px, 2fr) minmax(120px, 1fr) auto' }}>
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
          <button type="submit" className="primary" style={{ backgroundColor: 'var(--success, #10b981)', borderColor: 'var(--success, #10b981)' }}>Add Income</button>
        </div>
      </form>

      <div className="expense-list">
        {activeEarnings.length === 0 ? (
          <div className="empty-state">No earnings added for this month.</div>
        ) : (
          activeEarnings.map(earning => (
            <div key={earning.id} className="expense-row animate-fade-in">
              <div className="expense-info">
                <span className="expense-desc">{earning.desc}</span>
                <span className="expense-date">
                  {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(earning.date))}
                </span>
              </div>
              <div className="expense-meta">
                <span className="expense-amount" style={{ color: 'var(--success, #10b981)', fontWeight: 'bold' }}>
                  +{formatCurrency(earning.amount)}
                </span>
                <button type="button" className="icon-btn text-warning" onClick={() => removeEarning(earning.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
