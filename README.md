<div align="center">

# ⚽ FIFA World Cup 2026 — Bracket Challenge

**Predict every match of the 2026 World Cup. Lock in your scores, climb the live leaderboard, and see results update in real time.**

🎥 **[Watch the full demo (1:52)](demo.mp4)**

*A full-stack prediction platform built with the MERN stack in TypeScript.*

</div>

---

## ✨ Features

| | Feature | What it does |
|---|---|---|
| ⚡ | **Match Predictor** | Pick the exact scoreline for any upcoming match — locked **server-side** the moment kickoff hits |
| 🏆 | **Automatic Scoring** | Finished matches are graded automatically: **3 pts** exact score · **1 pt** correct outcome · **0** otherwise |
| 📊 | **Live Leaderboard** | Global rankings computed from a MongoDB aggregation pipeline |
| 📡 | **Live Match Feed** | Scores and statuses pushed to the browser in real time via Socket.io |
| 🗂️ | **Live Group Standings** | Group tables derived on the fly from match results |
| 🔐 | **Secure Auth** | JWT access tokens + rotating, hashed refresh tokens (httpOnly cookies) |
| 🎵 | **Cinematic UI** | Animated splash, stadium audio, and a neon match-day theme |
| 🔓 | **Google Sign-In** | One-tap OAuth login via Google (find-or-link-or-create), issuing the same secure session |
| 🎯 | **Tournament Bracket Predictor** | Drag to order groups, pick the 8 best third-placed teams, then advance through the official FIFA Round-of-32 → Final and reveal your champion on a shareable poster |
---

## 🛠️ Stack

| Layer | Tech |
|---|---|
| **Frontend** | Next.js (App Router) · React · TypeScript · Tailwind CSS · Framer Motion |
| **Backend** | Node.js · Express · TypeScript · Socket.io · node-cron |
| **Database** | MongoDB Atlas (Mongoose) |
| **Infra** | Docker · deployment-ready: Vercel (frontend) + any container host (backend) |
| **Data** | football-data.org (fixtures & results) |

---

## 🏗️ Architecture

A **decoupled** frontend and backend, designed to deploy independently. Users only ever visit the frontend — it calls the API in the background.

```
┌────────────────────┐        ┌───────────────────────────┐        ┌──────────────┐
│  Next.js frontend  │  HTTPS  │   Express API + worker     │  TLS   │  MongoDB     │
│   (any web host)   │ ──────> │   (Docker container)       │ ─────> │  Atlas       │
│                    │ <────── │                            │ <───── │              │
│  • UI / pages      │  JSON   │  • REST routes · JWT auth  │        │  • users     │
│  • calls /api/*    │   WS    │  • Socket.io real-time     │        │  • matches   │
│                    │ <─────> │  • cron sync/score worker  │        │  • predictions│
└────────────────────┘  push   └───────────────────────────┘        └──────────────┘
                                            │ fixtures & results
                                            ▼
                                   football-data.org API
```

### 🔑 Key design decisions

- **🔒 Server-side kickoff lock** — whether a prediction is allowed is decided on the *server* by comparing request time to kickoff. The UI reflects it, but the server is the source of truth: a tampered request to predict on a started match is rejected with `403`. Trusting the client would let users predict after seeing results.

- **🎯 One prediction per user per match** — enforced by a **compound unique index** on `{ user, match }`. Re-saving before kickoff *updates* the existing pick (upsert), so the database guarantees a single record per user per match, even under concurrent requests.

- **♻️ Refresh-token rotation** — short-lived access tokens (15 min) paired with longer-lived refresh tokens (7 days) stored hashed in httpOnly cookies, rotated on each use to limit the blast radius of a leaked token.

- **🛡️ Hardened endpoints** — Helmet sets security HTTP headers on every response, and auth routes are rate-limited (20 attempts per IP per 15 min) against brute-force.

- **⏱️ Autonomous worker** — a node-cron job runs every minute to sync results and grade finished matches, with an **overlap guard** (skips if the previous run is still going) and crash-proof error handling. Left running, it keeps data fresh around the clock.

- **🧪 Pure, tested scoring** — the points logic is a pure function with **Jest unit tests**, verifiable independently of the database or HTTP layer.

- **🛡️ Graceful degradation** — frontend data fetches fall back to empty state if the backend is briefly unreachable, so pages render instead of crashing.

---

## 🚀 Local Development

**Prerequisites:** Node.js 20+ · a MongoDB connection string · a free [football-data.org](https://www.football-data.org) API key

```bash
# 1. Clone
git clone https://github.com/nisithSaranga/fifa26-bracket-challenge.git
cd fifa26-bracket-challenge

# 2. Backend (terminal 1)
cd server
npm install
cp .env.example .env        # fill in the values below
npm run dev                 # API + worker -> http://localhost:5000

# 3. Frontend (terminal 2)
cd client
npm install
cp .env.example .env.local  # set NEXT_PUBLIC_API_URL=http://localhost:5000
npm run dev                 # site -> http://localhost:3000
```

**`server/.env`:**
```env
PORT=5000
NODE_ENV=development
MONGO_URI=<your MongoDB connection string>
JWT_ACCESS_SECRET=<random string>
JWT_REFRESH_SECRET=<different random string>
FOOTBALL_DATA_KEY=<your football-data.org key>
CLIENT_ORIGIN=http://localhost:3000
```

**Backend scripts:**
```bash
npm run build   # compile TypeScript -> dist/
npm start       # run the compiled server
npm run sync    # one-off: pull latest fixtures/results
npm run score   # one-off: grade finished matches
npm test        # run scoring unit tests
```

---

## 📦 Deployment guide

> ☁️ A hosted deployment is planned — the stack below is what the project is built for.

- **Frontend → Vercel** — root directory `client`, `NEXT_PUBLIC_API_URL` pointed at the backend.
- **Backend → any container host** — built from `server/Dockerfile` (multi-stage: compile TS, then a lean production image).
- **Database → MongoDB Atlas.**
- **CORS** restricted to the deployed frontend origin via `CLIENT_ORIGIN`.

---

<div align="center">

Built by **Nisith Saranga** · © 2026 · All rights reserved

*Not affiliated with, endorsed by, or sponsored by FIFA. Team names and crests are used for identification only. Match data via football-data.org.*

</div>