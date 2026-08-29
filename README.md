# 🎯 Number Clash — Real-Time Multiplayer Number Guessing Game

**Number Clash** is a modern, high-intensity numeric deduction and multiplayer strategy web application. Play solo across customizable difficulty tiers, duel adaptive AI personalities, challenge friends in live multiplayer war rooms, or test your deduction skills in daily synchronized puzzles.

---

## 🌐 Public Game Link (Play Without Code)

You can share the pure, full-screen game directly with friends, players, and family without any code editors or development interfaces:

👉 **[Play Number Clash Live](https://number-clash.ai.studio/)**

> **URL:** `https://ais-pre-k5pfwqhb63lrfmo7jal7hh-974727901905.asia-east1.run.app`  
> *Anyone with this link can open the game in their mobile or desktop browser, create/join multiplayer rooms with 6-character room codes, and play in real time.*

---

## 📱 Is It a Web App?

**Yes, 100%!** Number Clash is a progressive, responsive **Full-Stack Web Application (SPA + Real-Time Backend)**:
- **Instant Browser Access:** Runs natively in any modern browser (Chrome, Safari, Firefox, Edge) on desktop, laptop, tablet, and smartphone without needing app store downloads.
- **Mobile & Touch Optimized:** Responsive touch layouts, haptic audio feedback, and an on-screen tactical numeric keypad designed for one-handed mobile play.
- **Real-Time Multiplayer (WebSockets):** Synchronized multiplayer rooms powered by Socket.IO for low-latency live duels and battle royales.
- **Persistent Progression:** Automatically saves your match history, win rates, high scores, unlockable badges, and cosmetics locally and across sessions.

---

## 🎮 Game Modes

### 1. 🎯 Solo Arena
- **Customizable Ranges:** Easy (1–100), Medium (1–500), Hard (1–1,000), Expert (1–5,000), and Master (1–10,000).
- **Optional Timer:** Untimed practice or fast-paced 30s / 60s countdowns.
- **Visual Range Compression:** Real-time visual progress bar showing exact bounds and % of possibilities eliminated.
- **Proximity Radar:** Instant feedback (Very Hot 🔥, Hot ⚡, Warm 🟡, Cold ❄️) indicating proximity percentage.
- **Smart Mathematical Hints:** Divisibility, parity (even/odd), and hemisphere analysis after strategic attempt milestones.

### 2. ⚡ Live Multiplayer War Rooms
- **Battle Royale:** All players in the room guess simultaneously. Live hot/cold radar pings broadcast in real time. The first player to isolate the exact number wins!
- **Turn-Based Duel:** Players alternate taking turns. Each missed guess narrows the boundary for their opponent.
- **Sudden Death:** Each round, the player whose guess is farthest from the target is eliminated until one champion remains.
- **Room Code Lobby System:** Create a room with custom range/rules, share the 6-character code with friends, and start when everyone is ready.

### 3. 🤖 AI Duel Arena
- Battle against intelligent AI bots with distinct personalities and skill levels:
  - **Rookie Bot (Echo-1):** Random, erratic guessing patterns.
  - **Tactical Bot (Nova-4):** Balanced binary search algorithm.
  - **Grandmaster AI (A.I.D.A.):** Optimal logarithmic decision-making with high-speed precision.

### 4. 🧠 Reverse Mind Reader
- Think of a secret number in your head within a chosen range.
- The computer uses advanced binary search algorithms to deduce your number in the minimum theoretical mathematical steps while asking you "Too High", "Too Low", or "Correct".

### 5. 📅 Daily Synchronized Puzzle
- A new global target number generated every 24 hours for all players worldwide.
- Compete on equal footing and compare your daily score with friends.

---

## 🧱 Key Project Structure & Components

```
├── index.html                   # HTML entry point, meta tags, and font definitions
├── metadata.json                # App configuration, name, description, and permissions
├── server.ts                    # Express + Socket.IO real-time multiplayer server backend
├── src/
│   ├── main.tsx                 # React DOM client entry point
│   ├── App.tsx                  # Root state controller, navigation bar, hero section, and tab switcher
│   ├── types.ts                 # TypeScript interfaces for players, rooms, modes, and achievements
│   ├── index.css                # Tailwind CSS global stylesheet and game animations
│   ├── components/
│   │   ├── SoloArena.tsx        # Solo player arena with range visualization & hint system
│   │   ├── MultiplayerArena.tsx # Real-time lobby, room creation, chat, and multiplayer gameplay
│   │   ├── AiDuelArena.tsx      # VS Computer battle engine with selectable bot difficulties
│   │   ├── ReverseGuessArena.tsx# AI mind reader mode guessing the user's secret number
│   │   ├── DailyArena.tsx       # 24-hour synchronized daily challenge puzzle
│   │   ├── CyberKeypad.tsx      # On-screen tactile keypad with 1/2 midpoint shortcut calculation
│   │   ├── LeaderboardModal.tsx # Global and local leaderboards, stats, and match history
│   │   ├── ArmoryModal.tsx      # Cosmetic armory for custom titles, avatars, and visual themes
│   │   ├── HowToPlayModal.tsx   # Visual guide, binary search strategy tips, and rules
│   │   └── AuthModal.tsx        # Quick player profile setup and guest login
│   └── lib/
│       ├── socket.ts            # Socket.IO client connection manager and event handlers
│       ├── soundEngine.ts       # Web Audio API sound generator (beeps, success, buzzer, clicks)
│       └── storage.ts           # Local persistence for user profile, stats, and unlocked items
```

---

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide React (Icons), Canvas Confetti
- **Backend:** Node.js, Express, Socket.IO (WebSockets for real-time multiplayer)
- **Audio:** Native Web Audio API procedural sound synthesizer (zero external audio file dependencies)
- **Build Tool:** Vite, TSX, ESBuild

---

## 🚀 Local Development Setup

To run this project locally on your machine:

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```
   The dev server will boot at `http://localhost:3000`.

3. **Build for Production:**
   ```bash
   npm run build
   ```

4. **Start Production Server:**
   ```bash
   npm start
   ```

---

## 🏆 Tips & Strategy: The Binary Search Advantage
Always aim to guess the **exact mathematical midpoint** of your remaining range (use the handy **[½ Midpoint]** button on the keypad!). In a range from 1 to 1,000, guessing `500` immediately eliminates 50% of all possibilities in a single turn, allowing you to find any secret number in 10 guesses or fewer!
