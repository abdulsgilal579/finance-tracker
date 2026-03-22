import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Store the database file inside the project folder so it's easy to find and back up
const DB_PATH = join(__dirname, '..', 'finance.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create all tables
db.exec(`
  CREATE TABLE IF NOT EXISTS earnings (
    id TEXT PRIMARY KEY,
    desc TEXT NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    desc TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    targetAmount REAL NOT NULL,
    months INTEGER NOT NULL,
    plannedSavings REAL NOT NULL,
    priority TEXT NOT NULL DEFAULT 'Medium',
    savedAmount REAL NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS surplus_transfers (
    id TEXT PRIMARY KEY,
    month TEXT NOT NULL,
    amount REAL NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ef_withdrawals (
    id TEXT PRIMARY KEY,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    reason TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS wants_transfers (
    id TEXT PRIMARY KEY,
    month TEXT NOT NULL,
    amount REAL NOT NULL,
    mode TEXT NOT NULL DEFAULT 'equal'
  );
`);

// Seed default settings if empty
const settingCount = db.prepare('SELECT COUNT(*) as c FROM settings').get().c;
if (settingCount === 0) {
  db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('emergencyTarget', '50000')").run();
  db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES ('emergencyInitial', '0')").run();
}

export default db;
