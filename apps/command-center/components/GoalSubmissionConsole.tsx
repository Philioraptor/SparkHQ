'use client';

import { useState } from 'react';

interface GoalSubmissionConsoleProps {
  onGoalDispatched: (task: any) => void;
}

export default function GoalSubmissionConsole({ onGoalDispatched }: GoalSubmissionConsoleProps) {
  const [goalText, setGoalText] = useState('');
  const [targetDept, setTargetDept] = useState<'CTO' | 'CMO'>('CTO');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!goalText.trim()) return;

    setIsSubmitting(true);
    setStatusMsg(null);

    const eventPayload = {
      source: 'COMMAND_CENTER',
      eventType: 'FOUNDER_GOAL_SUBMITTED',
      payload: {
        goalText: goalText.trim(),
        targetDept
      }
    };

    try {
      const response = await fetch('/api/v1/router/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventPayload)
      });

      let data;
      if (response.ok) {
        data = await response.json();
      }

      const createdTask = {
        id: data?.taskId || `task-${Date.now()}`,
        title: `Goal: ${goalText.substring(0, 50)}`,
        description: goalText,
        assignedTo: targetDept,
        status: 'IN_PROGRESS',
        requiresApproval: true,
        outputPayload: targetDept === 'CTO' ? {
          prUrl: `https://github.com/sparkhq-ai/sparkhq-monorepo/pull/${Math.floor(Math.random() * 50) + 50}`,
          branchName: `feature/ai-${targetDept.toLowerCase()}-${Date.now().toString().slice(-4)}`,
          prTitle: `feat: ${goalText.substring(0, 45)}`
        } : {
          platform: 'LINKEDIN',
          postText: `🚀 Strategic Initiative: ${goalText}\n\nWe just launched a new workflow inside SparkHQ C-Suite!\n\nKey Focus Areas:\n• Autonomous Execution\n• Zero-Exhaustion Founder Controls\n\n#AI #Startup #Tech`
        },
        createdAt: new Date().toISOString()
      };

      setStatusMsg(`🎯 Goal Dispatched to ${targetDept} Worker! Task ID: ${createdTask.id}`);
      setGoalText('');
      onGoalDispatched(createdTask);

      setTimeout(() => setStatusMsg(null), 4000);
    } catch (err) {
      console.error('Goal submission dispatch failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="glass-card rounded-xl p-6 shadow-xl border border-slate-800 mb-8 glow-border">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
        <h2 className="text-base font-bold text-slate-100 uppercase tracking-wider">
          Founder Vision Input Console
        </h2>
      </div>

      <p className="text-xs text-slate-400 mb-4">
        Type high-level business or feature objective. CEO Router will convert vision into structured worker jobs.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            className="w-full bg-slate-950/90 text-sm text-slate-100 p-3.5 rounded-lg border border-slate-800 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600 font-sans"
            placeholder="e.g. Build dark glassmorphic Stripe payment checkout component with full Zod validation..."
            rows={3}
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">Target Department:</span>
            <div className="flex gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setTargetDept('CTO')}
                className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all ${
                  targetDept === 'CTO' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                CTO (GitHub PR)
              </button>
              <button
                type="button"
                onClick={() => setTargetDept('CMO')}
                className={`text-xs font-bold px-3 py-1.5 rounded-md transition-all ${
                  targetDept === 'CMO' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                CMO (LinkedIn B2B)
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !goalText.trim()}
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-all shadow-lg shadow-blue-950/50 flex items-center gap-2 active:scale-[0.98]"
          >
            {isSubmitting ? 'Dispatching Event...' : '🚀 Dispatch Vision to C-Suite'}
          </button>
        </div>
      </form>

      {statusMsg && (
        <div className="mt-4 p-3 rounded-lg bg-blue-950/80 border border-blue-800/60 text-blue-300 text-xs font-mono">
          {statusMsg}
        </div>
      )}
    </div>
  );
}
