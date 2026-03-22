import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.NODE_ENV === 'production' ? '*' : 'http://localhost:5173' }));
app.use(express.json());

// ── Earnings ──────────────────────────────────────────────────────────────
app.get('/api/earnings', (req, res) => {
  const rows = db.prepare('SELECT * FROM earnings ORDER BY date DESC').all();
  res.json(rows);
});

app.post('/api/earnings', (req, res) => {
  const { id, desc, amount, date } = req.body;
  const rowId = id || uuidv4();
  db.prepare('INSERT INTO earnings (id, desc, amount, date) VALUES (?, ?, ?, ?)').run(rowId, desc, amount, date);
  res.json({ id: rowId, desc, amount, date });
});

app.delete('/api/earnings/:id', (req, res) => {
  db.prepare('DELETE FROM earnings WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ── Expenses ──────────────────────────────────────────────────────────────
app.get('/api/expenses', (req, res) => {
  const rows = db.prepare('SELECT * FROM expenses ORDER BY date DESC').all();
  res.json(rows);
});

app.post('/api/expenses', (req, res) => {
  const { id, desc, amount, category, date } = req.body;
  const rowId = id || uuidv4();
  db.prepare('INSERT INTO expenses (id, desc, amount, category, date) VALUES (?, ?, ?, ?, ?)').run(rowId, desc, amount, category, date);
  res.json({ id: rowId, desc, amount, category, date });
});

app.delete('/api/expenses/:id', (req, res) => {
  db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ── Goals (full replace) ──────────────────────────────────────────────────
app.get('/api/goals', (req, res) => {
  const rows = db.prepare('SELECT * FROM goals').all();
  res.json(rows);
});

app.put('/api/goals', (req, res) => {
  const goals = req.body;
  const replaceAll = db.transaction((list) => {
    db.prepare('DELETE FROM goals').run();
    const insert = db.prepare('INSERT INTO goals (id, name, targetAmount, months, plannedSavings, priority, savedAmount) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const g of list) {
      insert.run(g.id || uuidv4(), g.name, g.targetAmount, g.months, g.plannedSavings, g.priority || 'Medium', g.savedAmount || 0);
    }
  });
  replaceAll(goals);
  res.json({ success: true });
});

// ── Settings ──────────────────────────────────────────────────────────────
app.get('/api/settings', (req, res) => {
  const rows = db.prepare('SELECT * FROM settings').all();
  const settings = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  res.json(settings);
});

app.put('/api/settings/:key', (req, res) => {
  const { value } = req.body;
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(req.params.key, String(value));
  res.json({ success: true });
});

// ── Surplus Transfers (full replace) ──────────────────────────────────────
app.get('/api/surplus-transfers', (req, res) => {
  const rows = db.prepare('SELECT * FROM surplus_transfers').all();
  res.json(rows);
});

app.put('/api/surplus-transfers', (req, res) => {
  const list = req.body;
  const replaceAll = db.transaction((items) => {
    db.prepare('DELETE FROM surplus_transfers').run();
    const insert = db.prepare('INSERT INTO surplus_transfers (id, month, amount) VALUES (?, ?, ?)');
    for (const t of items) { insert.run(t.id || uuidv4(), t.month, t.amount); }
  });
  replaceAll(list);
  res.json({ success: true });
});

// ── EF Withdrawals (full replace) ─────────────────────────────────────────
app.get('/api/ef-withdrawals', (req, res) => {
  const rows = db.prepare('SELECT * FROM ef_withdrawals').all();
  res.json(rows);
});

app.put('/api/ef-withdrawals', (req, res) => {
  const list = req.body;
  const replaceAll = db.transaction((items) => {
    db.prepare('DELETE FROM ef_withdrawals').run();
    const insert = db.prepare('INSERT INTO ef_withdrawals (id, amount, date, reason) VALUES (?, ?, ?, ?)');
    for (const w of items) { insert.run(w.id || uuidv4(), w.amount, w.date, w.reason); }
  });
  replaceAll(list);
  res.json({ success: true });
});

// ── Wants Transfers (full replace) ────────────────────────────────────────
app.get('/api/wants-transfers', (req, res) => {
  const rows = db.prepare('SELECT * FROM wants_transfers').all();
  res.json(rows);
});

app.put('/api/wants-transfers', (req, res) => {
  const list = req.body;
  const replaceAll = db.transaction((items) => {
    db.prepare('DELETE FROM wants_transfers').run();
    const insert = db.prepare('INSERT INTO wants_transfers (id, month, amount, mode) VALUES (?, ?, ?, ?)');
    for (const t of items) { insert.run(t.id || uuidv4(), t.month, t.amount, t.mode || 'equal'); }
  });
  replaceAll(list);
  res.json({ success: true });
});

// ── Health check ──────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Finance Tracker API running' });
});

// ── Serve built frontend in production ───────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const distPath = join(__dirname, '..', 'dist');

  app.use(express.static(distPath));

  app.get('/:path(.*)', (req, res) => {
  res.sendFile(join(distPath, 'index.html'));
});
}

app.listen(PORT, () => {
  console.log(`\n🗄️  SQLite database: finance.db`);
  console.log(`🚀 API server running at http://localhost:${PORT}\n`);
});
