# ⚡ QA Nexus AI

**Intelligent AI-powered QA Test Case & Automation Script Generator**

A production-grade, enterprise-ready platform for QA engineers and project managers — featuring AI test generation, real-time sprint tracking, burndown analytics, team management, and report exports.

---

## 🖥️ Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18 + TypeScript               |
| Build Tool  | Vite 5                              |
| Styling     | Tailwind CSS 3 + Custom CSS Vars    |
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
│   │   ├── AITestGenerator.tsx     # AI-powered test case sandbox
│   │   ├── AnalyticsCharts.tsx     # Recharts: burndown, bar, pie, velocity
│   │   ├── ProjectCard.tsx         # Project card with progress + badges
│   │   ├── ProjectModal.tsx        # Create/edit project form modal
│   │   ├── Reports.tsx             # Report export panel + summary table
│   │   ├── Settings.tsx            # App settings: API key, notifications
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   ├── StatCard.tsx            # KPI stat card component
│   │   └── Team.tsx                # Team invite + permissions table
│   ├── context/
│   │   └── AuthContext.tsx         # Supabase auth context + provider
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts           # Supabase client init
│   │       └── types.ts            # Full TypeScript DB types
│   ├── routes/
│   │   ├── auth.tsx                # Login / Signup page
│   │   └── dashboard.tsx           # Main dashboard (all tabs)
│   ├── types/
│   │   └── index.ts                # Shared TypeScript interfaces
│   ├── App.tsx                     # Root app + auth router
│   ├── index.css                   # Global styles + design tokens
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

### 🏠 Overview Dashboard
- Personalised welcome banner with live story point stats
- 4-metric KPI cards with trend indicators
- Recent projects grid with one-click navigation

### 📁 Project Manager
- Full CRUD: create, edit, view projects
- Status badges: Not Started / In Progress / Under Review / Completed
- Priority labels: Critical / High / Medium / Low
- Story point tracking with visual progress bars
- Date range (start → target), tags, and search/filter toolbar

### 🤖 AI Test Generator
- Manual description input OR file upload (PRD / spec)
- Framework selector: Cypress or Playwright
- Generates step-by-step test cases with expected results
- Inline automation code with syntax-highlighted code blocks
- One-click copy for each script

### 📊 Analytics
- **Bar Chart** — total vs. completed vs. remaining story points per project
- **Burndown Chart** — ideal vs. actual burndown with area gradients
- **Pie Chart** — project status distribution
- **Velocity Bar Chart** — completion % per project

### 📄 Reports
- Executive Summary export (PDF)
- Test Coverage Report (CSV)
- Sprint Burndown Report (PDF)
- Activity Audit Log (CSV)
- Project summary table with all key metrics

### 👥 Team
- Invite team members by email with role assignment
- Role-based permission table (Owner / Admin / QA Lead / Viewer)
- Pending invitation tracking

### ⚙️ Settings
- Anthropic API key management
- Notification preferences toggles
- Webhook & third-party integrations (Jira, GitHub, Slack)
- Danger zone: export data, delete account

---

## 🔐 Security

- All database tables use **Row Level Security (RLS)**
- Users can only read/write their own data
- Auth tokens managed by Supabase (auto-refresh enabled)
- Environment variables never committed to git

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

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| `VITE_SUPABASE_URL is missing` | Ensure `.env` file exists and has correct values |
| Login fails with 400 error | Check that your Supabase project is active and anon key is correct |
| Charts show no data | Create at least one project with start and target dates |
| Build error: `Cannot find module` | Run `npm install` to restore node_modules |
| Auth redirect loop | Clear browser localStorage and try again |

---

## 📜 License

MIT © QA Nexus AI
