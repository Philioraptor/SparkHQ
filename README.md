<div align="center">

# ⚡ Project SparkHQ: Autonomous AI C-Suite System
### *Single Founder Vision ➔ Production GitHub PRs, Web Apps & B2B LinkedIn Posts*

[![Vercel Deployment](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![Next.js 14](https://img.shields.io/badge/Next.js%2014-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Gemini 2.5 Flash](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)](https://ai.google.dev)
[![BullMQ](https://img.shields.io/badge/BullMQ-FF4500?style=for-the-badge&logo=redis&logoColor=white)](https://bullmq.io)
[![Prisma ORM](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io)

<p align="center">
  <a href="#-architecture-overview">Architecture</a> •
  <a href="#-key-features">Key Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-deploy-to-vercel">Vercel Deploy</a> •
  <a href="#-monetization--roi">Monetization</a>
</p>

---

</div>

## 🌟 Executive Overview

**Project SparkHQ** is an autonomous AI C-Suite system engineered specifically for single founders and micro-teams. It converts high-level vision statements into **production-ready GitHub Pull Requests**, **deployed web features**, and **viral B2B LinkedIn posts** without daily operational exhaustion.

> **Zero-Exhaustion Core Principle:**
> Agents do **not** engage in unpredictable, open-ended chat loops. Communication strictly uses **Database Event + BullMQ Queue** flows governed by **1-Click Binary Founder Approvals** (`Approve & Execute` vs `Reject with Feedback`).

---

## 📐 Architecture Overview

```mermaid
sequenceDiagram
    autonumber
    actor Founder as Founder (Dhruv Mishra)
    participant UI as Command Center UI (Next.js 14)
    participant Router as Central Event Router (Zod Schema)
    participant DB as Prisma Database & Logs
    participant Worker as CTO / CMO Workers (Gemini 2.5 Flash)
    participant GitHub as GitHub / LinkedIn API

    Founder->>UI: 1. Input Vision Goal (e.g. "Stripe Checkout Page")
    UI->>Router: 2. POST /api/v1/router/event (FOUNDER_GOAL_SUBMITTED)
    Router->>DB: 3. Create Task & Audit Log
    Router->>Worker: 4. Enqueue Job to CTO/CMO Queue
    Worker->>Worker: 5. Gemini 2.5 Flash generates code/copy
    Worker->>GitHub: 6. Octokit opens Pull Request / Draft
    Worker->>Router: 7. CTO_PR_RAISED Event
    Router->>UI: 8. AWAITING_APPROVAL Inbox Badge
    Founder->>UI: 9. Click "Approve & Execute" (1-Click Binary)
    UI->>Router: 10. FOUNDER_APPROVED Event
    Router->>GitHub: 11. Auto-Merge Branch & Publish
```

---

## ✨ Key Features

### 💻 1. CTO Worker: GitHub PR Engine
- **Powered by `@google/genai` (Gemini 2.5 Flash) & `@octokit/rest`**.
- Autonomously analyzes requirements, creates isolated feature branches (`feature/cto-...`), commits generated TypeScript/Next.js code, and opens clean Pull Requests.
- Includes rate limit protection (`x-ratelimit-remaining`) and graceful backoffs.

### 📢 2. CMO Worker: B2B LinkedIn Content Engine
- Generates structured, high-converting B2B technical posts tailored for tech founders and developers.
- Formats posts with strong hooks, feature bullet points, call-to-actions, and relevant hashtags.

### 📊 3. CEO Daily Executive Standup Cron
- Runs automatically every morning at **9:00 AM IST (3:00 AM UTC)** via Vercel Crons or Node cron workers.
- Analyzes 24-hour database system logs and task metrics to deliver a concise Markdown summary to the Founder.

### 🛡️ 4. Founder Command Center Dashboard
- Cyber-glassmorphism UI with real-time metric counters.
- **1-Click Binary Approval Inbox**: Displays generated PR links and LinkedIn post drafts with **Approve & Execute** or **Reject with Feedback** controls.
- **Live System Audit Stream**: Real-time Server-Sent Events (SSE) log ticker connected to Prisma audit tables.

---

## 📁 Repository Structure

```
sparkhq-c-suite/
├── apps/
│   ├── command-center/       # Next.js 14 Dashboard UI & Vercel API Routes
│   └── orchestrator-api/     # Express Central Router Server & SSE Endpoint
├── packages/
│   ├── database/             # Prisma ORM Schema & Migrations
│   └── shared-types/         # Zod Event Schema & routeMultiRepoEvent Core
├── workers/
│   ├── cto-worker/           # Gemini + Octokit GitHub Code Generator
│   ├── cmo-worker/           # Gemini B2B LinkedIn Copy Generator
│   └── ceo-cron/             # Daily Executive Standup Cron Job
├── render.yaml               # Infrastructure-as-Code Blueprint (Render)
├── vercel.json               # 1-Click Serverless Deployment Blueprint (Vercel)
└── package.json              # Monorepo Workspace Root
```

---

## ⚡ Quick Start (Local Setup)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/sparkhq-ai/sparkhq-monorepo.git
cd sparkhq-monorepo
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your credentials:
```ini
GEMINI_API_KEY="your_gemini_api_key"
GITHUB_TOKEN="ghp_your_github_personal_access_token"
DATABASE_URL="postgresql://user:password@localhost:5432/sparkhq_db"
REDIS_URL="redis://127.0.0.1:6379"
```

### 3. Build & Run Monorepo
```bash
# Build all 6 packages
npm run build

# Start Next.js Command Center UI
npm run dev:command-center

# Start Central Orchestrator API
npm run dev:orchestrator
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the Command Center!

---

## ☁️ 1-Click Vercel Deployment

Deploy the entire AI C-Suite natively on Vercel Serverless Functions:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sparkhq-ai/sparkhq-monorepo)

1. Import the repository in [Vercel](https://vercel.com/new).
2. Set Environment Variables (`GEMINI_API_KEY`, `GITHUB_TOKEN`).
3. Click **Deploy**!

---

## 📈 Monetization & ROI

- **Internal ROI:** Replaces $200k/year in CTO/CMO salary overhead while 10x-ing feature release velocity.
- **SaaS B2B Market:** Solves the AI governance problem for solo founders. Charge **$49 - $149/month** per seat for automated PRs & lead generation.

---

## 📜 License

Distributed under the **MIT License**. Created with ❤️ by **Dhruv Mishra** (Founder & Board Chairman).
