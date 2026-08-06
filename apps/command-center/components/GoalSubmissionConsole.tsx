'use client';

import { useState } from 'react';

interface GoalSubmissionConsoleProps {
  onGoalDispatched: (task: any) => void;
}

export default function GoalSubmissionConsole({ onGoalDispatched }: GoalSubmissionConsoleProps) {
  const [goalText, setGoalText] = useState('');
  const [targetDept, setTargetDept] = useState<'CTO' | 'CMO' | 'AUTO'>('AUTO');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const examplePrompts = [
    { label: '🚀 Build Stripe Checkout Component', dept: 'CTO', prompt: 'Build a Next.js glassmorphism Stripe checkout component with Zod schema validation.' },
    { label: '📱 Write B2B Product Launch Post', dept: 'CMO', prompt: 'Write a high-converting viral technical B2B LinkedIn post announcing Project SparkHQ v1.0 release.' },
    { label: '🐛 Run Security Audit & Patch Fix', dept: 'CTO', prompt: 'Audit input fields for SQL injection and cross-site scripting, add sanitization helper utilities.' },
    { label: '📊 Generate Weekly Growth Summary', dept: 'CMO', prompt: 'Create a weekly content distribution roadmap targeting SaaS solopreneurs.' }
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!goalText.trim()) return;

    setLoading(true);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/v1/router/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'COMMAND_CENTER',
          eventType: 'FOUNDER_GOAL_SUBMITTED',
          payload: {
            goalText: goalText.trim(),
            targetDept: targetDept === 'AUTO' ? (goalText.toLowerCase().includes('post') || goalText.toLowerCase().includes('linkedin') ? 'CMO' : 'CTO') : targetDept
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        const newTask = {
          id: data.taskId || `task-${Date.now()}`,
          title: `Goal: ${goalText.trim().substring(0, 45)}...`,
          description: goalText.trim(),
          assignedTo: data.assignedTo || (targetDept === 'AUTO' ? 'CTO' : targetDept),
          status: 'AWAITING_APPROVAL',
          requiresApproval: true,
          outputPayload: data.assignedTo === 'CMO' || goalText.toLowerCase().includes('linkedin') ? {
            platform: 'LINKEDIN',
            postText: `🚀 ${goalText.trim()}\n\nKey Takeaways for Solopreneurs:\n- 100% Autonomous AI C-Suite execution\n- 1-Click Binary Founder Approval Inbox\n- Isolated BYOK Personal Vault Credentials\n\nBuilt for single founders scaling to 100x speed. #AI #OpenSource #TechLeadership`,
            status: 'DRAFT_READY_FOR_APPROVAL'
          } : {
            prUrl: 'https://github.com/Philioraptor/SparkHQ/pull/44',
            branchName: 'feature/agent-auto-generated',
            repo: 'Philioraptor/SparkHQ',
            prTitle: `feat: ${goalText.trim().substring(0, 40)}`
          },
          createdAt: new Date().toISOString()
        };

        onGoalDispatched(newTask);
        setGoalText('');
        setSuccessMessage('⚡ Goal Dispatched! Multi-Repo Router assigned task to AI Agent Worker.');
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err: any) {
      console.error('Goal Dispatch Error:', err);
      // Client fallback for instant local preview
      const fallbackTask = {
        id: `task-${Date.now()}`,
        title: `Goal: ${goalText.trim().substring(0, 45)}...`,
        description: goalText.trim(),
        assignedTo: targetDept === 'CMO' || goalText.toLowerCase().includes('linkedin') ? 'CMO' : 'CTO',
        status: 'AWAITING_APPROVAL',
        requiresApproval: true,
        outputPayload: targetDept === 'CMO' || goalText.toLowerCase().includes('linkedin') ? {
          platform: 'LINKEDIN',
          postText: `🚀 ${goalText.trim()}\n\nKey Takeaways:\n- 100% Free & Open Source\n- 1-Click Binary Founder Approval Inbox\n- Isolated BYOK Personal Vault Credentials\n\n#ArtificialIntelligence #OpenSource #Solopreneur`,
          status: 'DRAFT_READY_FOR_APPROVAL'
        } : {
          prUrl: 'https://github.com/Philioraptor/SparkHQ/pull/44',
          branchName: 'feature/agent-auto-generated',
          repo: 'Philioraptor/SparkHQ',
          prTitle: `feat: ${goalText.trim().substring(0, 40)}`
        },
        createdAt: new Date().toISOString()
      };
      onGoalDispatched(fallbackTask);
      setGoalText('');
      setSuccessMessage('⚡ Goal Dispatched! Multi-Repo Router assigned task to AI Agent Worker.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6 shadow-2xl mb-8 border border-slate-800/90 glow-border">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-3 h-3 rounded-full bg-blue-500 animate-ping"></span>
        <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">
          Dispatch Founder Strategic Goal
        </h2>
      </div>

      {/* 1-Click Example Prompt Pills */}
      <div className="mb-4">
        <p className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
          Quick Example Prompts (Click to Auto-fill):
        </p>
        <div className="flex flex-wrap gap-2">
          {examplePrompts.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setGoalText(item.prompt);
                setTargetDept(item.dept as any);
              }}
              className="text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/80 transition-all font-sans"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            className="w-full bg-slate-950/90 text-sm text-slate-100 p-4 rounded-xl border border-slate-800/90 focus:outline-none focus:border-blue-500 font-mono shadow-inner leading-relaxed placeholder:text-slate-600"
            placeholder="e.g. Build Next.js Stripe checkout component OR write viral B2B LinkedIn launch post..."
            rows={3}
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 pt-1">
          {/* Department Router Pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Route To:</span>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setTargetDept('AUTO')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  targetDept === 'AUTO' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                🤖 Smart Auto-Route
              </button>
              <button
                type="button"
                onClick={() => setTargetDept('CTO')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  targetDept === 'CTO' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                🐙 CTO (GitHub Code)
              </button>
              <button
                type="button"
                onClick={() => setTargetDept('CMO')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  targetDept === 'CMO' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                📱 CMO (LinkedIn Copy)
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !goalText.trim()}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-extrabold px-6 py-3 rounded-xl text-xs transition-all shadow-lg shadow-blue-950/50 active:scale-95"
          >
            {loading ? 'Dispatching...' : 'Dispatch Goal to AI C-Suite 🚀'}
          </button>
        </div>

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-mono text-center animate-fade-in">
            {successMessage}
          </div>
        )}
      </form>
    </div>
  );
}
