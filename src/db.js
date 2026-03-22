import Dexie from 'dexie';

// Define the database and its tables
export const db = new Dexie('FinanceTrackerDB');

db.version(1).stores({
  // Primary key is first field; indexed fields listed after
  earnings:          '++id, date, desc, amount',
  expenses:          '++id, date, category, desc, amount',
  goals:             '++id, name, targetAmount, months, plannedSavings, priority, savedAmount',
  settings:          'key',                                     // key-value store (emergencyTarget, etc.)
  surplus_transfers: '++id, month, amount',
  ef_withdrawals:    '++id, date, reason, amount',
  wants_transfers:   '++id, month, amount, mode',
});

export default db;
