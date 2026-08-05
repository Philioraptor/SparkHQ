'use client';

import { useState } from 'react';
import Header from '../components/Header';
import GoalSubmissionConsole from '../components/GoalSubmissionConsole';
import ApprovalCard from '../components/ApprovalCard';
import AuditTicker from '../components/AuditTicker';
import SupportChatWidget from '../components/SupportChatWidget';
import FounderAuthGuard from '../components/FounderAuthGuard';
import ApiKeyVault from '../components/ApiKeyVault';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'COMMAND' | 'VAULT'>('COMMAND');

  const [tasks, setTasks] = useState<any[]>([
    {
      id: 'task-stripe-pr',
      title: 'Goal: Build Next.js Stripe Checkout Component',
      description: 'Design and write clean glassmorphism Stripe checkout page with Zod schema validation.',
      assignedTo: 'CTO',
      status: 'AWAITING_APPROVAL',
      requiresApproval: true,
      outputPayload: {
        prUrl: 'https://github.com/sparkhq-ai/sparkhq-monorepo/pull/42',
        branchName: 'feature/stripe-checkout',
        repo: 'sparkhq-monorepo',
        prTitle: 'feat: Stripe checkout glassmorphism component'
      },
      createdAt: new Date().toISOString()
    },
    {
      id: 'task-linkedin-draft',
      title: 'Goal: Publish Launch Announcement B2B Post',
      description: 'Write high-converting B2B LinkedIn post announcing AI C-Suite v1.0 release.',
      assignedTo: 'CMO',
      status: 'AWAITING_APPROVAL',
      requiresApproval: true,
      outputPayload: {
        platform: 'LINKEDIN',
        postText: '🚀 Excited to announce Project SparkHQ: The Autonomous AI C-Suite for Single Founders!\n\nNo open-ended agent chat loops. Pure 1-click binary approvals.\n\n✨ Key Highlights:\n- CTO Worker creates GitHub PRs automatically\n- CMO Worker generates viral technical B2B posts\n- CEO Standup cron delivers 9AM executive reports\n- AI Support Chatbot & Self-Healing Bug Fix Loop\n- BYOK Personal API Key Vault Isolation & Task Exterminator\n\nBuilt for single founders who scale standard operations to 100x speed.\n\n#ArtificialIntelligence #Founders #TechLeadership',
        status: 'DRAFT_READY_FOR_APPROVAL'
      },
      createdAt: new Date().toISOString()
    }
  ]);

  const [standupModalOpen, setStandupModalOpen] = useState(false);

  function handleGoalDispatched(newTask: any) {
    setTasks((prev) => [newTask, ...prev]);
  }

  function handleActionComplete(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }

  const pendingApprovals = tasks.filter((t) => t.status === 'AWAITING_APPROVAL' || t.status === 'IN_PROGRESS');

  return (
    <FounderAuthGuard>
      <div className="min-h-screen bg-[#080B11] text-slate-100 pb-16 relative">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Top Navigation Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-8">
            <div className="flex gap-3 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('COMMAND')}
                className={`text-xs font-bold px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
                  activeTab === 'COMMAND'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-950/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>⚡ Command Console & Approvals</span>
                {pendingApprovals.length > 0 && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                    {pendingApprovals.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('VAULT')}
                className={`text-xs font-bold px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
                  activeTab === 'VAULT'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-950/50'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🔑 Personal API Key Vault (BYOK)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40 uppercase">
                  Isolated
                </span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <a
                href="/billing"
                className="text-xs font-bold text-slate-300 hover:text-white px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1.5"
              >
                <span>💳 Billing Portal</span>
              </a>
              <button
                onClick={() => setStandupModalOpen(true)}
                className="text-xs font-bold text-blue-400 hover:text-blue-300 px-3.5 py-2 rounded-lg bg-blue-950/60 border border-blue-800/50 flex items-center gap-1.5"
              >
                <span>📊 CEO 9AM Standup</span>
              </button>
            </div>
          </div>

          {/* TAB 1: COMMAND CONSOLE & APPROVALS */}
          {activeTab === 'COMMAND' && (
            <>
              {/* Metric Counter Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="glass-card rounded-xl p-5 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Awaiting Decisions</p>
                    <h3 className="text-2xl font-extrabold text-amber-400 mt-1">{pendingApprovals.length} Tasks</h3>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400 text-lg">
                    ⏳
                  </div>
                </div>

                <div className="glass-card rounded-xl p-5 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CTO Worker PRs</p>
                    <h3 className="text-2xl font-extrabold text-cyan-400 mt-1">14 Raised</h3>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400 text-lg">
                    🐙
                  </div>
                </div>

                <div className="glass-card rounded-xl p-5 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Exterminated Tasks</p>
                    <h3 className="text-2xl font-extrabold text-rose-400 mt-1">0 Purged</h3>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-rose-950/60 border border-rose-800/40 flex items-center justify-center text-rose-400 text-lg">
                    ☠️
                  </div>
                </div>

                <div className="glass-card rounded-xl p-5 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">API Vault Isolation</p>
                    <button
                      onClick={() => setActiveTab('VAULT')}
                      className="mt-1 text-xs font-bold text-purple-400 hover:text-purple-300 underline flex items-center gap-1"
                    >
                      Manage Keys 🔑
                    </button>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400 text-lg">
                    🔒
                  </div>
                </div>
              </div>

              {/* Goal Submission Console */}
              <GoalSubmissionConsole onGoalDispatched={handleGoalDispatched} />

              {/* Core Split View: Approval Inbox vs System Audit Stream */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: 1-Click Approval Queue */}
                <div className="lg:col-span-7">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                      <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">
                        1-Click Founder Approval Queue
                      </h2>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {pendingApprovals.length} Pending
                    </span>
                  </div>

                  {pendingApprovals.length === 0 ? (
                    <div className="glass-card rounded-xl p-12 text-center border border-slate-800">
                      <div className="w-12 h-12 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 flex items-center justify-center mx-auto mb-3 text-xl">
                        ✨
                      </div>
                      <h4 className="font-bold text-slate-200 text-base mb-1">Queue Clean & Clear</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        All agent tasks have been reviewed and executed. Dispatch a new founder goal above to generate new work!
                      </p>
                    </div>
                  ) : (
                    pendingApprovals.map((task) => (
                      <ApprovalCard
                        key={task.id}
                        taskId={task.id}
                        title={task.title}
                        description={task.description}
                        assignedTo={task.assignedTo}
                        outputPayload={task.outputPayload}
                        onActionComplete={() => handleActionComplete(task.id)}
                      />
                    ))
                  )}
                </div>

                {/* Right Column: Live Audit Ticker & Architecture Badge */}
                <div className="lg:col-span-5 space-y-6">
                  <AuditTicker />

                  {/* Architecture Principles Box */}
                  <div className="glass-card rounded-xl p-5 border border-slate-800/90">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                      Zero-Exhaustion Engineering Principles
                    </h3>
                    <ul className="space-y-2.5 text-xs text-slate-400">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">•</span>
                        <span><strong>Isolated BYOK Key Vault:</strong> Users bring their own API keys; strictly isolated in local browser vault.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold">•</span>
                        <span><strong>Task Extermination Controls:</strong> Instantly kill and purge unwanted agent tasks with 1 click.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span><strong>Founder Auth Security:</strong> Locked with Master Security Key to prevent public misuse.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400 font-bold">•</span>
                        <span><strong>AI Support Helpdesk:</strong> 80-90% automated query resolution with Gemini AI Chatbot.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: PERSONAL API KEY VAULT (BYOK) */}
          {activeTab === 'VAULT' && <ApiKeyVault />}
        </main>

        {/* Embedded Floating AI Helpdesk Support Chatbot */}
        <SupportChatWidget />

        {/* CEO Executive Standup Modal */}
        {standupModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-card rounded-2xl max-w-2xl w-full p-6 border border-slate-700 shadow-2xl relative">
              <button
                onClick={() => setStandupModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm font-mono bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800"
              >
                ✕ ESC
              </button>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📊</span>
                <h3 className="text-lg font-bold text-slate-100">CEO Daily Executive Standup</h3>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 font-mono leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
{`### Executive Standup Summary - ${new Date().toISOString().split('T')[0]}
Owner: Founder Dhruv Mishra

1. Key Milestones Completed (Past 24h)
- CTO Worker: 3 GitHub Pull Requests merged (including Self-Healing Bug Fix PR #43).
- CMO Worker: 2 B2B LinkedIn updates auto-published to feed.
- Support Agent: 12 user queries resolved automatically (91.6% automation rate).

2. Security & Tenant Isolation
- BYOK API Vault: Active. Users manage isolated personal API keys.
- Task Exterminator: Enabled for instant task purging.
- Security Guard: Founder Auth Lock Active.

3. System Audit & Backoff Log
- Self-Healing Loop: 0 manual support tickets required.
- PostgreSQL Prisma Audit: All events logged with zero-exhaustion database routing.`}
              </div>
              <div className="mt-5 text-right">
                <button
                  onClick={() => setStandupModalOpen(false)}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-all"
                >
                  Close Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </FounderAuthGuard>
  );
}
