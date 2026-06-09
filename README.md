# ⚡ QA Nexus AI

**Intelligent AI-powered QA Test Plan, Test Case & Automation Script Generator**

A production-grade, enterprise-ready platform for QA engineers and project managers — featuring AI test plan drafting, vertical test case generation, an interactive Playwright runner simulator, project-based bug reporting, real-time sprint tracking, burndown analytics, and team management.

---

## 🖥️ Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18 + TypeScript               |
| Build Tool  | Vite 5                              |
| Styling     | Tailwind CSS 3 + Beige Design System|
| Typography  | Geist Sans & Geist Mono (Google)    |
| Icons       | Lucide React                        |
| Charts      | Recharts                            |
| Backend     | Supabase (Postgres + Auth + RLS)    |
| AI Engine   | Anthropic Claude API (optional)     |

---

## 🚀 Quick Start (Run Locally)

### Prerequisites
- **Node.js** v18 or higher → [nodejs.org](https://nodejs.org)
- **npm** v9+ (bundled with Node)
- A free **Supabase** account → [supabase.com](https://supabase.com)

---

### Step 1 — Install Dependencies

```bash
cd qa-nexus-ai
npm install
```

---

### Step 2 — Set Up Supabase

1. Go to [app.supabase.com](https://app.supabase.com) and create a **New Project**.
2. Once the project is ready, navigate to:
   - **Settings → API** and copy:
     - `Project URL` → your `VITE_SUPABASE_URL`
     - `anon public` key → your `VITE_SUPABASE_PUBLISHABLE_KEY`

3. Open the **SQL Editor** in your Supabase dashboard.
4. Paste and run the contents of `supabase/migrations/001_initial_schema.sql`.
5. *(Optional)* To load demo data, edit `supabase/seed.sql`, replace `YOUR-USER-UUID-HERE` with your user's UUID, then run it.

---

### Step 3 — Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key-here
```

---

### Step 4 — Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### Step 5 — (Optional) Enable Live AI Test Generation

1. Get your API key from [console.anthropic.com](https://console.anthropic.com/settings/keys).
2. In the app, go to **Settings → AI Integration** and paste your key.

> ⚠️ For production, route API calls through a Supabase Edge Function — never expose secret keys in the browser.

---

## 📁 Project Structure

```
qa-nexus-ai/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── AITestGenerator.tsx     # AI test case sandbox & Playwright runner simulator
│   │   ├── AITestPlan.tsx          # AI test plan drafting engine (PRDs to Strategy)
│   │   ├── AnalyticsCharts.tsx     # Recharts: burndown, bar, pie, velocity
│   │   ├── BugReporter.tsx         # Bug reporter database and resolution manager
│   │   ├── ProjectCard.tsx         # Project card with progress + badges
│   │   ├── ProjectModal.tsx        # Create/edit project form modal
│   │   ├── Reports.tsx             # Report export panel + summary table
│   │   ├── Settings.tsx            # App settings: API key, notifications
│   │   ├── Sidebar.tsx             # Navigation sidebar with Bug Reporter addition
│   │   ├── StatCard.tsx            # KPI stat card component
│   │   └── Team.tsx                # Team invite + permissions table
│   ├── context/
│   │   └── AuthContext.tsx         # Supabase auth context + provider
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts           # Supabase client init
│   │       └── types.ts            # Full TypeScript DB types
│   ├── routes/
│   │   ├── auth.tsx                # Login / Signup landing page (beige theme)
│   │   └── dashboard.tsx           # Main dashboard workspace (tabs routing)
│   ├── types/
│   │   └── index.ts                # Shared TypeScript interfaces
│   ├── App.tsx                     # Root app + auth router
│   ├── index.css                   # Global styles + beige variables + Geist font imports
│   └── main.tsx                    # React entry point
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # Full DB schema + RLS policies
│   └── seed.sql                    # Optional demo data
├── .env.example                    # Environment variable template
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## ✨ Features

### 🎨 Beige Theme & Geist Typography
- Premium **sand-beige design tokens** (`#f7f5f0` base, `#fdfcf9` surfaces, `#2b241a` espresso text) for a beautiful, paper-like warm aesthetic.
- **Geist Sans & Geist Mono** fonts globally integrated for crisp, modern editorial developer interfaces.

### 🏠 Overview Dashboard
- Personalised welcome banner with live story point stats.
- 4-metric KPI cards with trend indicators.
- Recent projects grid with one-click navigation.

### 📁 Project Manager
- Full CRUD: create, edit, view projects.
- Status badges: Not Started / In Progress / Under Review / Completed.
- Priority labels: Critical / High / Medium / Low.
- Story point tracking with visual progress bars.
- Date range (start → target), tags, and search/filter toolbar.

### 📋 AI Test Plan
- Upload PRD/Specs and draft industry-standard test strategies (objectives, methodology, matrix layout).
- Select target frameworks (Playwright, Cypress, Selenium) and configurations.
- Export matrices to CSV/PDF or save to project storage.

### 🤖 AI Test Generator & Playwright Runner
- Generates step-by-step test cases vertically line-by-line with **Expected Results placed in front of each testcase**.
- **Playwright Test Runner**: Run individual tests directly from the dashboard.
- **Simulated Terminal Console**: Opens an interactive console drawer displaying step-by-step test logs and failing traces (`npx playwright test`).
- **Auto Bug Logging**: Automatically logs failed test executions to the Bug Reporter.

### 🐛 Bug Reporter
- Aggregates and stores failed test cases separately for each project.
- Visual active bug statistics categorized by severity (Critical, High, Medium, Low).
- Search bar and project filters to query bugs.
- **Manual Resolution**: Resolve and remove bugs directly from the dashboard.

### 📊 Analytics
- **Bar Chart** — total vs. completed vs. remaining story points per project.
- **Burndown Chart** — ideal vs. actual burndown with area gradients.
- **Pie Chart** — project status distribution.
- **Velocity Bar Chart** — completion % per project.

### 📄 Reports
- Executive Summary export (PDF).
- Test Coverage Report (CSV).
- Sprint Burndown Report (PDF).
- Activity Audit Log (CSV).
- Project summary table with all key metrics.

### 👥 Team
- Invite team members by email with role assignment.
- Role-based permission table (Owner / Admin / QA Lead / Viewer).
- Pending invitation tracking.

---

## 🔐 Security

- All database tables use **Row Level Security (RLS)**.
- Users can only read/write their own data.
- Auth tokens managed by Supabase (auto-refresh enabled).
- Environment variables never committed to git.

---

## 🏗️ Build for Production

```bash
npm run build
```

Output is in the `dist/` folder. Deploy to **Vercel**, **Netlify**, or any static host.

For Vercel:
```bash
npx vercel --prod
```

Remember to set your `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as environment variables in your hosting platform.

---

## 📜 License

MIT © QA Nexus AI
