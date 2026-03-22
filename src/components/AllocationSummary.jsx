import React from 'react';
import { formatCurrency } from '../utils';
import { PieChart, Wallet, Target, PiggyBank } from 'lucide-react';
import './components.css';

function MiniProgressBar({ spent, total, color }) {
  const pct = total > 0 ? Math.min(100, (spent / total) * 100) : 0;
  const remaining = Math.max(0, total - spent);
  const isOver = spent > total;
  return (
    <div style={{ marginTop: '0.6rem' }}>
      <div style={{ height: '5px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: isOver ? 'var(--error, #ef4444)' : color, borderRadius: '4px', transition: 'width 0.4s ease' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.3rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
        <span>Spent: <strong style={{ color: isOver ? 'var(--error, #ef4444)' : color }}>{formatCurrency(spent)}</strong></span>
        <span>Left: <strong style={{ color: isOver ? 'var(--error, #ef4444)' : 'var(--text-primary)' }}>{formatCurrency(remaining)}</strong></span>
      </div>
    </div>
  );
}

export default function AllocationSummary({ allocation, spentNeeds, spentWants, spentSavings }) {
  return (
    <div className="glass-panel summary-container">
      <div className="summary-header">
        <div className="flex items-center gap-2">
          <PieChart className="text-primary" size={24} />
          <h2>50-30-20 Allocation</h2>
        </div>
        <p>Based on your total monthly earnings.</p>
      </div>

      <div className="summary-cards">
        <div className="summary-card needs-card">
          <div className="card-icon"><Wallet size={20} /></div>
          <div className="card-info" style={{ flex: 1 }}>
            <span className="card-label">Needs (50%)</span>
            <span className="card-value">{formatCurrency(allocation.needs)}</span>
            <MiniProgressBar spent={spentNeeds || 0} total={allocation.needs} color="var(--accent-needs)" />
          </div>
        </div>

        <div className="summary-card wants-card">
          <div className="card-icon"><Target size={20} /></div>
          <div className="card-info" style={{ flex: 1 }}>
            <span className="card-label">Wants/Goals (30%)</span>
            <span className="card-value">{formatCurrency(allocation.wants)}</span>
            <MiniProgressBar spent={spentWants || 0} total={allocation.wants} color="var(--accent-wants)" />
          </div>
        </div>

        <div className="summary-card savings-card">
          <div className="card-icon"><PiggyBank size={20} /></div>
          <div className="card-info" style={{ flex: 1 }}>
            <span className="card-label">Savings/Debt (20%)</span>
            <span className="card-value">{formatCurrency(allocation.savings)}</span>
            <MiniProgressBar spent={spentSavings || 0} total={allocation.savings} color="var(--accent-savings)" />
          </div>
        </div>
      </div>
    </div>
  );
}
