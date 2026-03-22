import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Receipt, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils';
import './components.css';

export default function ExpenseTracker({ expenses, addExpense, removeExpense, selectedMonth }) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('needs');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!desc.trim() || !amount) return;
    await addExpense({
      id: uuidv4(),
      desc,
      amount: Number(amount),
      category,
      date: new Date(`${selectedMonth}-01T12:00:00Z`).toISOString()
    });
    setDesc('');
    setAmount('');
  };

  const getCategoryClass = (cat) => {
    switch (cat) {
      case 'needs':   return 'badge-needs';
      case 'wants':   return 'badge-wants';
      case 'savings': return 'badge-savings';
      default:        return '';
    }
  };

  const activeExpenses = expenses.filter(e => e.date.startsWith(selectedMonth));
  const monthTotal = activeExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="glass-panel">
      {/* Header */}
      <div className="section-header">
        <div className="section-header-left">
          <Receipt size={22} color="var(--accent-primary)" />
          <h2>Recent Expenses</h2>
        </div>
        {monthTotal > 0 && (
          <div className="tracker-total">
            Total: <strong>{formatCurrency(monthTotal)}</strong>
          </div>
        )}
      </div>

      {/* Add form */}
      <form className="mb-6" onSubmit={handleAdd}>
        <div className="form-grid">
          <input
            type="text"
            placeholder="What did you buy?"
            value={desc}
            onChange={e => setDesc(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="needs">Needs</option>
            <option value="wants">Wants/Goals</option>
            <option value="savings">Savings/Debt</option>
          </select>
          <button type="submit" className="primary">Add</button>
        </div>
      </form>

      {/* List */}
      <div className="expense-list">
        {activeExpenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🧾</div>
            <p>No expenses yet. Start tracking your spending!</p>
          </div>
        ) : (
          activeExpenses.map(expense => (
            <div key={expense.id} className="expense-row animate-fade-in">
              <div className="expense-info">
                <span className="expense-desc">{expense.desc}</span>
                <span className="expense-date">
                  {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(expense.date))}
                </span>
              </div>
              <div className="expense-meta">
                <span className={`badge ${getCategoryClass(expense.category)}`}>{expense.category}</span>
                <span className="expense-amount">{formatCurrency(expense.amount)}</span>
                <button className="icon-btn text-warning" onClick={() => removeExpense(expense.id)}>
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
