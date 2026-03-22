# Finance Tracker

A personal finance web app based on the **50-30-20 rule** with a local SQLite database.

---

## Requirements

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

---

## Setup (First Time)

1. **Clone or download** the project folder
2. Open a terminal inside the project folder and run:

```bash
npm install
```

---

## Running the App

```bash
npm run dev
```

This starts **both** the backend API and the frontend together:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

---

## Your Data

All data is saved to a SQLite file in the project folder:

```
finance-tracker/finance.db
```

**To back up your data**, just copy `finance.db` somewhere safe.  
**To restore**, replace `finance.db` with your backup and restart the app.

---

## Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Start both frontend + backend (use this daily) |
| `npm run dev:frontend` | Start only the React frontend |
| `npm run dev:server` | Start only the Express/SQLite backend |
| `npm run build` | Build the app for production |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | SQLite via `better-sqlite3` |
| Charts | Recharts |
| Icons | Lucide React |

---

## Features

- **50-30-20 budget tracking** — Needs, Wants/Goals, Savings
- **Multiple income sources** per month
- **Goals** with priority levels (High / Medium / Low) and progress tracking
- **Lock Earnings** — transfers surplus to Emergency Fund and rolls to next month
- **Lock Wants into Goals** — distributes remaining Wants budget across active goals
- **Emergency Fund** with withdrawal tracking
- **Real-time** Spent / Remaining indicators per budget category
- Data persists in a local SQLite file — safe across browser clears and restarts
