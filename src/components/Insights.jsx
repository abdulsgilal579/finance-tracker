import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Target, TrendingUp, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils';
import './components.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color, margin: 0, fontWeight: 500 }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Insights({ allocation, expenses, goals, selectedMonth, setSelectedMonth, surplusTransfers, setSurplusTransfers }) {
  
  // Aggregate expenses for the pie chart
  const spentNeeds = expenses.filter(e => e.category === 'needs').reduce((sum, e) => sum + e.amount, 0);
  const spentWants = expenses.filter(e => e.category === 'wants').reduce((sum, e) => sum + e.amount, 0);
  const spentSavings = expenses.filter(e => e.category === 'savings').reduce((sum, e) => sum + e.amount, 0);

  const requiredGoals = goals ? goals.reduce((sum, g) => sum + (g.plannedSavings || 0), 0) : 0;
  
  const needsSurplus = Math.max(0, allocation.needs - spentNeeds);
  const wantsSurplus = Math.max(0, allocation.wants - spentWants - requiredGoals);
  const totalSurplus = needsSurplus + wantsSurplus;

  const handleLockMonth = () => {
    // 1. Record the surplus permanently
    setSurplusTransfers([...surplusTransfers, { month: selectedMonth, amount: totalSurplus }]);
    
    // 2. Roll to next calendar month (YYYY-MM)
    const [year, month] = selectedMonth.split('-');
    let nextMonth = parseInt(month, 10) + 1;
    let nextYear = parseInt(year, 10);
    
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    
    const nextMonthStr = `${nextYear}-${nextMonth.toString().padStart(2, '0')}`;
    setSelectedMonth(nextMonthStr);
  };

  const isLocked = surplusTransfers.some(t => t.month === selectedMonth);

  const pieData = [
    { name: 'Needs', value: spentNeeds },
    { name: 'Wants', value: spentWants },
    { name: 'Savings', value: spentSavings },
  ].filter(d => d.value > 0);

  const COLORS = ['var(--accent-needs)', 'var(--accent-wants)', 'var(--accent-savings)'];

  // Bar chart comparing allocation vs spent
  const barData = [
    { name: 'Needs', Allocated: allocation.needs, Spent: spentNeeds },
    { name: 'Wants', Allocated: allocation.wants, Spent: spentWants },
    { name: 'Savings', Allocated: allocation.savings, Spent: spentSavings },
  ];

  return (
    <div className="glass-panel insights-panel h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={24} color="var(--accent-needs)" />
          <h3>Insights & Analytics</h3>
        </div>

        {pieData.length === 0 ? (
          <div className="empty-state">Add some expenses to see your spending insights.</div>
        ) : (
          <div className="charts-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            <div className="chart-wrapper">
               <h4 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-muted)' }}>Spending Breakdown</h4>
               <ResponsiveContainer width="100%" height={250}>
                 <PieChart>
                   <Pie
                     data={pieData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                     stroke="none"
                   >
                     {pieData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip content={<CustomTooltip />} />
                   <Legend wrapperStyle={{ fontSize: '12px' }} />
                 </PieChart>
               </ResponsiveContainer>
             </div>
             
             <div className="chart-wrapper">
               <h4 style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--text-muted)' }}>Budget vs Actual</h4>
               <ResponsiveContainer width="100%" height={250}>
                 <BarChart data={barData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                   <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                   <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => formatCurrency(val)} />
                   <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                   <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                   <Bar dataKey="Allocated" fill="var(--glass-border-hover)" radius={[4, 4, 0, 0]} />
                   <Bar dataKey="Spent" fill="var(--accent-needs)" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
          </div>
        )}
      </div>

      {/* Lock Month action panel */}
      <div className="insights-card mt-6 p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>Lock Earnings</h4>
            <div className="text-muted text-sm">
              Current Surplus: <strong className="text-wants">{formatCurrency(totalSurplus)}</strong>
            </div>
          </div>
          <button 
            className="primary" 
            onClick={handleLockMonth}
            disabled={isLocked}
            style={{ 
              background: isLocked ? 'var(--bg-card)' : 'var(--accent-wants)', 
              borderColor: isLocked ? 'var(--glass-border)' : 'var(--accent-wants)',
              cursor: isLocked ? 'not-allowed' : 'pointer'
            }}
          >
            {isLocked ? 'Month Locked' : `Lock ${selectedMonth}`}
          </button>
        </div>
        <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {isLocked 
            ? "You have already locked this month and transferred the surplus!" 
            : "Locking will auto-transfer all unused Needs/Wants/Savings to your Emergency Fund and roll you into the next month."}
        </p>
      </div>

    </div>
  );
}
