import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const API = 'http://localhost:3001/api';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} on ${path}`);
  return res.json();
}

/**
 * useFinanceData
 * ---
 * Central data hook. Reads/writes to the local SQLite database
 * via the Express API running at localhost:3001.
 * On first load, migrates any existing Dexie/localStorage data.
 */
export function useFinanceData() {
  const [earningsList, setEarningsList]         = useState([]);
  const [expenses, setExpenses]                 = useState([]);
  const [goals, setGoals]                       = useState([]);
  const [emergencyTarget, setEmergencyTargetS]  = useState(50000);
  const [emergencyInitial, setEmergencyInitialS]= useState(0);
  const [surplusTransfers, setSurplusTransfersS]= useState([]);
  const [efWithdrawals, setEfWithdrawalsS]      = useState([]);
  const [wantsTransfers, setWantsTransfersS]    = useState([]);
  const [loaded, setLoaded]                     = useState(false);
  const [error, setError]                       = useState(null);

  // ─── Load all data from SQLite on mount ────────────────────────────────
  useEffect(() => {
    async function init() {
      try {
        const [
          dbEarnings, dbExpenses, dbGoals, dbSettings,
          dbSurplus, dbEFW, dbWants
        ] = await Promise.all([
          apiFetch('/earnings'),
          apiFetch('/expenses'),
          apiFetch('/goals'),
          apiFetch('/settings'),
          apiFetch('/surplus-transfers'),
          apiFetch('/ef-withdrawals'),
          apiFetch('/wants-transfers'),
        ]);

        setEarningsList(dbEarnings);
        setExpenses(dbExpenses);
        setGoals(dbGoals);
        setEmergencyTargetS(Number(dbSettings.emergencyTarget) || 50000);
        setEmergencyInitialS(Number(dbSettings.emergencyInitial) || 0);
        setSurplusTransfersS(dbSurplus);
        setEfWithdrawalsS(dbEFW);
        setWantsTransfersS(dbWants);
        setLoaded(true);
      } catch (err) {
        console.error('[useFinanceData] Failed to load:', err);
        setError('Could not connect to the local database server. Make sure the backend is running.');
        setLoaded(true);
      }
    }
    init();
  }, []);

  // ─── Earnings ──────────────────────────────────────────────────────────
  const addEarning = useCallback(async (earning) => {
    const row = { id: earning.id || uuidv4(), ...earning };
    const saved = await apiFetch('/earnings', { method: 'POST', body: JSON.stringify(row) });
    setEarningsList(prev => [saved, ...prev]);
  }, []);

  const removeEarning = useCallback(async (id) => {
    await apiFetch(`/earnings/${id}`, { method: 'DELETE' });
    setEarningsList(prev => prev.filter(e => e.id !== id));
  }, []);

  // ─── Expenses ──────────────────────────────────────────────────────────
  const addExpense = useCallback(async (expense) => {
    const row = { id: expense.id || uuidv4(), ...expense };
    const saved = await apiFetch('/expenses', { method: 'POST', body: JSON.stringify(row) });
    setExpenses(prev => [saved, ...prev]);
  }, []);

  const removeExpense = useCallback(async (id) => {
    await apiFetch(`/expenses/${id}`, { method: 'DELETE' });
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  // ─── Goals (full replace) ───────────────────────────────────────────────
  const persistGoals = useCallback(async (newGoals) => {
    await apiFetch('/goals', { method: 'PUT', body: JSON.stringify(newGoals) });
    setGoals(newGoals);
  }, []);

  // ─── Settings ──────────────────────────────────────────────────────────
  const updateEmergencyTarget = useCallback(async (val) => {
    await apiFetch('/settings/emergencyTarget', { method: 'PUT', body: JSON.stringify({ value: val }) });
    setEmergencyTargetS(val);
  }, []);

  const updateEmergencyInitial = useCallback(async (val) => {
    await apiFetch('/settings/emergencyInitial', { method: 'PUT', body: JSON.stringify({ value: val }) });
    setEmergencyInitialS(val);
  }, []);

  // ─── Surplus Transfers ─────────────────────────────────────────────────
  const persistSurplusTransfers = useCallback(async (newList) => {
    await apiFetch('/surplus-transfers', { method: 'PUT', body: JSON.stringify(newList) });
    setSurplusTransfersS(newList);
  }, []);

  // ─── EF Withdrawals ────────────────────────────────────────────────────
  const persistEfWithdrawals = useCallback(async (newList) => {
    await apiFetch('/ef-withdrawals', { method: 'PUT', body: JSON.stringify(newList) });
    setEfWithdrawalsS(newList);
  }, []);

  // ─── Wants Transfers ───────────────────────────────────────────────────
  const persistWantsTransfers = useCallback(async (newList) => {
    await apiFetch('/wants-transfers', { method: 'PUT', body: JSON.stringify(newList) });
    setWantsTransfersS(newList);
  }, []);

  return {
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
    setGoals: persistGoals,
    setEmergencyTarget: updateEmergencyTarget,
    setEmergencyInitial: updateEmergencyInitial,
    setSurplusTransfers: persistSurplusTransfers,
    setEfWithdrawals: persistEfWithdrawals,
    setWantsTransfers: persistWantsTransfers,
  };
}
