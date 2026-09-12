# ⚔️ Life RPG — Gamified Habit & Productivity Command Center

> **Transform your real-life productivity into an immersive fantasy RPG adventure.**  
> Level up your life: embark on epic quests, earn XP and Gold, build unshakeable productivity streaks, unlock legendary achievements, explore the Guild Bazaar, equip custom adventurer avatars & titles, and monitor real-time progression via a high-performance futuristic command center.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS_3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Vercel](https://img.shields.io/badge/Vercel_Frontend-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://frontend-iota-amber-91.vercel.app)
[![Render](https://img.shields.io/badge/Render_Backend-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://life-rpg-backend-b61m.onrender.com)

---

### 🌐 Live Production Links
- **Frontend (Vercel)**: [https://frontend-iota-amber-91.vercel.app](https://frontend-iota-amber-91.vercel.app)
- **Backend API (Render)**: [https://life-rpg-backend-b61m.onrender.com](https://life-rpg-backend-b61m.onrender.com)
- **API Health Check**: [https://life-rpg-backend-b61m.onrender.com/api/health](https://life-rpg-backend-b61m.onrender.com/api/health)

---

## 🌟 Overview & Highlights

**Life RPG** bridges task management with RPG gamification. Every task you create is a quest yielding character experience, gold coins, and progression toward leveling up. Designed with visual polish, responsive ergonomics, robust error resilience, and real-time synchronization:

- 🎮 **Full RPG Engine**: Dynamic XP scaling formulas ($100 \times \text{level}^{1.5}$), attribute progression (STR, INT, AGI, VIT, PER), and level-up celebrations.
- ⚡ **Native Real-Time SSE**: Real-time event bus pushing quest updates, reward triggers, level-ups, and notifications without polling.
- 🏛️ **Guild Bazaar (Shop & Wardrobe)**: Buy badges, cosmetics, and legendary character skins (Cyber Knight, Shadow Assassin, Holy Paladin, Archmage Sorcerer).
- 🏆 **Hall of Champions (Leaderboard)**: Compare your level, total XP, and active streaks against fellow adventurers.
- 🔐 **Hybrid Security & Auth**: Full JWT authentication (secure HttpOnly refresh cookies + Bearer access tokens), CSRF resilience, IDOR protection, and optional One-Tap **Google OAuth 2.0**.
- 🛡️ **Offline & Network Resilience**: Automatic detection of offline status with dedicated banners, safe optimistic UI, and error boundaries.
- 📱 **100% Mobile Responsive**: Tested on smartphone, tablet, laptop, and ultra-wide viewports with dynamic collapsible navigation.

---

## 🗺️ Tech Stack

| Layer | Technology | Key Details |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite 5 | Fast HMR, tree-shaking, strict typing |
| **Styling & Visuals** | Tailwind CSS 3, Pure CSS 3D | Futuristic glassmorphism, hardware-accelerated 3D cube core, zero Three.js bundle overhead |
| **Real-Time Layer** | Server-Sent Events (SSE) | Native unidirectional event stream (`/api/events`) with auto-reconnect |
| **Backend API** | Node.js, Express, TypeScript | Modular router architecture, authoritative transactions |
| **Database & ORM** | PostgreSQL, Prisma ORM | ACID double-entry gold ledger, composite indexes for high-throughput reads |
| **Authentication** | JWT + Google OAuth 2.0 | Bcrypt password hashing, access/refresh token cycle, Google Client verification |
| **Security & Quality** | Helmet, Gzip, Rate Limiting, Zod | Input sanitization, brute-force mitigation, automated test suites |

---

## 📁 Repository Structure

```text
My_Project/
├── frontend/                     # React + TypeScript + Vite Single Page Application
│   ├── public/                   # Static assets, hero visuals & custom character skin avatars
│   │   └── avatars/              # High-resolution adventurer skins
│   └── src/
│       ├── components/           # 3D Core, QuestCard, OfflineBanner, UserMenuDropdown, etc.
│       ├── context/              # AuthContext, RpgContext (state, deduplication, SSE)
│       ├── layouts/              # Navbar, Footer, PageContainer
│       ├── pages/                # Dashboard, QuestBoard, Shop, Inventory, Leaderboard, etc.
│       ├── services/             # Typed API clients (auth, rpg, quests, shop, inventory)
│       └── types/                # End-to-end TypeScript interfaces
│
├── backend/                      # Node.js + Express REST API & SSE Server
│   ├── src/
│   │   ├── config/               # Environment variables, database client
│   │   ├── controllers/          # Auth, quest, rpg, shop, inventory, leaderboard
│   │   ├── middleware/           # authMiddleware, rateLimiter, error handling
│   │   ├── routes/               # Modular sub-routers + events.ts (SSE)
│   │   ├── services/             # Authoritative RPG engine, gold transactions, realtime
│   │   └── utils/                # JWT sign/verify, math formulas, hashing
│   └── tests/                    # Integration & security test suites
│
├── prisma/
│   ├── schema.prisma             # PostgreSQL schema with composite indexes
│   └── migrations/               # Database migrations
│
├── .env.example                  # Root environment template
├── .gitignore                    # Environment & credential protection
└── README.md                     # Documentation & setup guide
```

---

## 🔑 Environment Variables Setup

Template files are provided to make setup straightforward. **Never commit actual `.env` files with private secrets.**

### 1. Root & Backend Environment Template (`backend/.env` or root `.env`)

See [.env.example](file:///.env.example) and [backend/.env.example](file:///backend/.env.example):

```env
# Database Connection (PostgreSQL - Local or Hosted like Neon / Supabase)
DATABASE_URL="postgresql://postgres:password@localhost:5432/life_rpg?schema=public"

# Optional direct connection for migrations (if using connection poolers like PgBouncer)
DIRECT_URL="postgresql://postgres:password@localhost:5432/life_rpg?schema=public"

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT Secrets (Generate with: openssl rand -hex 32)
JWT_ACCESS_SECRET="bd3733623ed0c393f883508b41dbf298d9eb0411d7c3396e8fb1e207669a6606"
JWT_REFRESH_SECRET="805034c0cdc9a29a7123c62e01b2bc61a4076321a052a99346d6711eea144976"
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Optional Google OAuth 2.0 (Obtained from Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
```

### 2. Frontend Environment Template (`frontend/.env`)

See [frontend/.env.example](file:///frontend/.env.example):

```env
# Backend API Base URL
VITE_API_URL=http://localhost:3001

# Optional Google OAuth Client ID for One-Tap Sign In
VITE_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (v18.x or higher — tested on v20 and v22)
- **PostgreSQL** (v14+ running locally or a free cloud instance on Neon/Supabase)
- **npm** or **yarn** / **pnpm**

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/BT24CSE119/life-rpg.git
cd life-rpg
```

---

### Step 2: Configure Environment Files
```bash
# Backend configuration
cp backend/.env.example backend/.env

# Frontend configuration
cp frontend/.env.example frontend/.env
```
*(Update `DATABASE_URL` in `backend/.env` to point to your PostgreSQL instance).*

---

### Step 3: Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### Step 4: Run Database Migrations & Prisma Setup
```bash
cd backend
# Deploy all Prisma migrations
npx prisma migrate deploy --schema=../prisma/schema.prisma

# Generate Prisma Client
npx prisma generate --schema=../prisma/schema.prisma
```

---

### Step 5: Start the Development Servers

Open two terminal windows:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```
> Server runs on `http://localhost:3001` (SSE event stream on `/api/events`).

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
> Web client opens on `http://localhost:5173`.

---

## 🧪 Testing & Verification

The project includes thorough end-to-end integration and security test suites covering RPG mechanics, auth guards, IDOR prevention, and Google authentication:

```bash
# Run all backend test suites
cd backend
npx tsx --test tests/google.auth.integration.test.ts tests/phase10.final-verification.integration.test.ts tests/phase10.security.integration.test.ts tests/phase9.integration.test.ts tests/phase8.integration.test.ts tests/dashboard.integration.test.ts tests/rpg.integration.test.ts
```

Validate frontend TypeScript and production bundle compilation:
```bash
cd frontend
npm run type-check
npm run build
```

---

## 🎮 Core Game Mechanics & Design

### 1. Authoritative RPG Engine
- **XP & Leveling Curve**: XP requirements scale according to an exponential formula $100 \times \text{level}^{1.5}$, preventing early stagnation while preserving mid-to-late game accomplishment.
- **Attributes**: Completing physical, mental, agility, or consistency tasks rewards bonus attribute points (Strength, Intelligence, Agility, Vitality, Perception).
- **Streak Multipliers**: Maintaining daily mission completion streaks multiplies earned XP and Gold rewards.

### 2. Double-Entry Economy Ledger
- Every transaction (quest rewards, daily streak bonuses, Guild Bazaar purchases) is validated atomically with database constraints preventing negative balances, duplicate claims, or race conditions.

### 3. Guild Bazaar & Wardrobe
- Spend earned gold coins on character titles, glowing avatar frames, and exclusive high-tier adventurer avatars:
  - 🛡️ **Cyber Knight**
  - 🗡️ **Shadow Assassin**
  - ✨ **Holy Paladin**
  - 🔮 **Archmage Sorcerer**
- Equip/unequip gear dynamically from your Adventurer Inventory with instant real-time UI updates.

### 4. Hall of Champions
- Global adventurer rankings showcasing levels, XP milestones, and active streak champions to foster friendly competition.

---

## 🛡️ Security & Performance Architecture

- **Strict IDOR Mitigation**: Quests, notifications, and inventory operations verify ownership (`userId` match) directly inside transactions.
- **CSRF & Cookie Protection**: Session refresh tokens stored in `HttpOnly`, `SameSite=Lax` cookies.
- **Input Validation**: Zod schemas validate every incoming payload before reaching business controllers.
- **Asset Optimization**: Zero external 3D libraries; pure CSS isometric rendering provides high-FPS animations without taxing CPU/GPU.
- **SEO & Social Metadata**: Rich Open Graph meta tags, semantic HTML5 structure, descriptive page titles, and accessibility attributes.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
