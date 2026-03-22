import { useState } from 'react';
import { calculate503020 } from './utils';
import { useFinanceData } from './hooks/useFinanceData';
import AllocationSummary from './components/AllocationSummary';
import GoalsManager from './components/GoalsManager';
import EmergencyFund from './components/EmergencyFund';
import ExpenseTracker from './components/ExpenseTracker';
import EarningsTracker from './components/EarningsTracker';
import Insights from './components/Insights';
import './App.css';

function App() {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().substring(0, 7));

  const {
    loaded,
    error,
    earningsList,
    expenses,
    goals,
    emergencyTarget,
    emergencyInitial,
    surplusTransfers,
    efWithdrawals,
    wantsTransfers,
    addEarning,
    removeEarning,
    addExpense,
    removeExpense,
    setGoals,
    setEmergencyTarget,
    setEmergencyInitial,
    setSurplusTransfers,
    setEfWithdrawals,
    setWantsTransfers,
  } = useFinanceData();

  // ── Derived calculations ──────────────────────────────────────────────────
  const currentMonthEarnings = earningsList.filter(e => e.date.startsWith(selectedMonth));
  const totalEarningsAmount  = currentMonthEarnings.reduce((sum, e) => sum + e.amount, 0);
  const allocation           = calculate503020(totalEarningsAmount);
  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(selectedMonth));

  const currentMonthSpentNeeds   = currentMonthExpenses.filter(e => e.category === 'needs').reduce((sum, e) => sum + e.amount, 0);
  const currentMonthSpentWants   = currentMonthExpenses.filter(e => e.category === 'wants').reduce((sum, e) => sum + e.amount, 0);
  const currentMonthSpentSavings = currentMonthExpenses.filter(e => e.category === 'savings').reduce((sum, e) => sum + e.amount, 0);
  const currentMonthGoalsPlanned = goals.reduce((sum, g) => sum + (g.plannedSavings || 0), 0);
  const wantsRemaining = Math.max(0, allocation.wants - currentMonthSpentWants - currentMonthGoalsPlanned);

  const globalTotalEarnings   = earningsList.reduce((sum, e) => sum + e.amount, 0);
  const totalSavings           = globalTotalEarnings * 0.2;
  const totalSurplusTransfers  = surplusTransfers.reduce((sum, t) => sum + t.amount, 0);
  const spentSavings           = expenses.filter(e => e.category === 'savings').reduce((sum, e) => sum + e.amount, 0);
  const totalEFWithdrawals     = efWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  const cumulativeEFBalance    = emergencyInitial + totalSavings + totalSurplusTransfers - spentSavings - totalEFWithdrawals;

  // ── Error state ───────────────────────────────────────────────────────────
  if (loaded && error) {
    return (
      <div className="state-screen">
        <div className="state-card">
          <span className="state-icon">⚠️</span>
          <h2>Backend Not Running</h2>
          <p>{error}</p>
          <code>npm run dev:server</code>
        </div>
      </div>
    );
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (!loaded) {
    return (
      <div className="state-screen">
        <div className="state-card">
          <div className="spinner" />
          <p>Loading your finance data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header glass-panel">
        <div className="header-left">
          <h1>Financial <span className="text-gradient">Tracker</span></h1>
          <p>Master your money with the 50-30-20 rule.</p>
        </div>
        <div className="month-picker-group">
          <label>Selected Month</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
      </header>

      <main className="dashboard-grid">
        <div className="col-span-full animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <AllocationSummary
            allocation={allocation}
            spentNeeds={currentMonthSpentNeeds}
            spentWants={currentMonthSpentWants + currentMonthGoalsPlanned}
            spentSavings={currentMonthSpentSavings}
          />
        </div>

        <div className="col-span-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Insights
            allocation={allocation}
            expenses={currentMonthExpenses}
            goals={goals}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            surplusTransfers={surplusTransfers}
            setSurplusTransfers={setSurplusTransfers}
          />
        </div>

        <div className="col-span-4 flex-col gap-6 animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <EmergencyFund
            accumulatedBalance={cumulativeEFBalance}
            rawBalance={cumulativeEFBalance}
            target={emergencyTarget}
            initial={emergencyInitial}
            setTarget={setEmergencyTarget}
            setInitial={setEmergencyInitial}
            efWithdrawals={efWithdrawals}
            setEfWithdrawals={setEfWithdrawals}
          />
          <GoalsManager
            goals={goals}
            setGoals={setGoals}
            wantsTotal={allocation.wants}
            wantsRemaining={wantsRemaining}
            selectedMonth={selectedMonth}
            wantsTransfers={wantsTransfers}
            setWantsTransfers={setWantsTransfers}
          />
        </div>

        <div className="col-span-full animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <EarningsTracker
            earnings={earningsList}
            addEarning={addEarning}
            removeEarning={removeEarning}
            selectedMonth={selectedMonth}
          />
        </div>

        <div className="col-span-full animate-fade-in" style={{ animationDelay: '0.25s' }}>
          <ExpenseTracker
            expenses={expenses}
            addExpense={addExpense}
            removeExpense={removeExpense}
            selectedMonth={selectedMonth}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
