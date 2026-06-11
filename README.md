# ⚽ FIFA World Cup 2026 — Bracket Challenge

A full-stack tournament prediction platform for the 2026 FIFA World Cup (48 teams, 104 matches).
Built with the MERN stack (MongoDB, Express, React via Next.js, Node) in TypeScript.

## Features
- 🏆 **Tournament Predictor** — predict all 12 group standings, the Round of 32 bracket, through to the champion
- ⚡ **Match Predictor** — independent per-match score predictions, locked server-side at kickoff
- 📡 **Live match feed** — real-time scores via Socket.io
- 🥉 **Third-place tracker** — live race for the 8 best third-placed teams (unique to the 2026 format)
- 👥 **Private leagues**, global leaderboards, badges & streaks
- 🎵 FIFA-style cinematic UI with stadium audio

## Stack
| Layer    | Tech                                        |
|----------|---------------------------------------------|
| Frontend | Next.js (React), TypeScript, Tailwind CSS   |
| Backend  | Node.js, Express, TypeScript, Socket.io     |
| Database | MongoDB Atlas (Mongoose)                    |
| Data     | football-data.org (fixtures/scores), API-Football (squads/photos) |

## Local setup
```bash
# 1. Backend
cd server
cp .env.example .env   # fill in your secrets
npm install
npm run dev

# 2. Sync real World Cup fixtures into MongoDB
npm run sync
```

*(Frontend setup arrives in Phase 2 of the build.)*
