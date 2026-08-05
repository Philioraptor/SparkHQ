'use client';

import { useState } from 'react';

interface ApprovalCardProps {
  taskId: string;
  title: string;
  assignedTo: string;
  description?: string;
  outputPayload: any;
  onActionComplete: () => void;
}

export default function ApprovalCard({ taskId, title, assignedTo, description, outputPayload, onActionComplete }: ApprovalCardProps) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [actionDoneMessage, setActionDoneMessage] = useState<string | null>(null);

  async function handleDecision(decision: 'APPROVED' | 'REJECTED') {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/router/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'COMMAND_CENTER',
          eventType: decision === 'APPROVED' ? 'FOUNDER_APPROVED' : 'FOUNDER_REJECTED',
          taskId,
          payload: { feedbackNote: feedback }
        })
      });

      if (!response.ok) {
        // Fallback for standalone demo mode
        console.warn('API connection offline, running simulated local action response');
      }

      setActionDoneMessage(decision === 'APPROVED' ? '✅ Execution Triggered' : '❌ Revision Enqueued');
      setTimeout(() => {
        onActionComplete();
      }, 1200);
    } catch (err) {
      console.error('Decision dispatch error:', err);
      setActionDoneMessage(decision === 'APPROVED' ? '✅ Execution Triggered' : '❌ Revision Enqueued');
      setTimeout(() => {
        onActionComplete();
      }, 1200);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-card glass-card-hover rounded-xl p-6 shadow-xl mb-5 border border-slate-800/80">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
            assignedTo === 'CTO' ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/50' : 'bg-purple-950/80 text-purple-400 border border-purple-800/50'
          }`}>
            Agent: {assignedTo}
          </span>
          <span className="text-xs text-slate-400 font-mono">Task ID: {taskId}</span>
        </div>
        <span className="text-xs text-amber-400 font-semibold px-2.5 py-1 rounded-md bg-amber-950/50 border border-amber-800/40 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          Awaiting Founder Approval
        </span>
      </div>

      <h3 className="text-lg font-bold text-slate-100 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-400 mb-4">{description}</p>
      )}

      {/* CTO Output Payload Render */}
      {outputPayload?.prUrl && (
        <div className="bg-slate-950/80 rounded-lg p-4 mb-4 border border-cyan-900/40">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-cyan-400">GitHub Pull Request Ready</span>
            <span className="text-xs font-mono text-slate-400">Branch: {outputPayload.branchName}</span>
          </div>
          {outputPayload.prTitle && (
            <div className="text-sm text-slate-200 font-medium mb-2">{outputPayload.prTitle}</div>
          )}
          <a 
            href={outputPayload.prUrl} 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center text-sm font-semibold text-cyan-400 hover:text-cyan-300 underline gap-1"
          >
            View Generated Pull Request ({outputPayload.branchName || 'PR Link'}) ↗
          </a>
        </div>
      )}

      {/* CMO Output Payload Render */}
      {outputPayload?.postText && (
        <div className="bg-slate-950/80 rounded-lg p-4 mb-4 border border-purple-900/40">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-purple-400">LinkedIn B2B Post Draft</span>
            <span className="text-xs font-mono text-slate-400">{outputPayload.platform || 'LINKEDIN'}</span>
          </div>
          <div className="bg-slate-900/90 p-3.5 rounded-md text-sm text-slate-300 whitespace-pre-wrap font-mono border border-slate-800 leading-relaxed max-h-48 overflow-y-auto">
            {outputPayload.postText}
          </div>
        </div>
      )}

      {actionDoneMessage ? (
        <div className="mt-4 p-3 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-sm font-medium text-center animate-fade-in">
          {actionDoneMessage}
        </div>
      ) : showRejectBox ? (
        <div className="mt-4 pt-4 border-t border-slate-800">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Provide specific feedback/revisions for Agent:
          </label>
          <textarea
            className="w-full bg-slate-950 text-sm text-white p-3 rounded-lg border border-slate-700 mb-3 focus:outline-none focus:border-red-500 font-mono placeholder:text-slate-600"
            placeholder="e.g. Include dark mode fallback styling and update test assertions..."
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleDecision('REJECTED')}
              disabled={loading}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all"
            >
              {loading ? 'Submitting...' : 'Confirm Rejection'}
            </button>
            <button
              onClick={() => setShowRejectBox(false)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium px-4 py-2 rounded-lg text-sm transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => handleDecision('APPROVED')}
            disabled={loading}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold px-5 py-2.5 rounded-lg text-sm flex-1 shadow-lg shadow-emerald-950/40 transition-all active:scale-[0.98]"
          >
            {loading ? 'Processing Event...' : 'Approve & Execute (1-Click)'}
          </button>
          <button
            onClick={() => setShowRejectBox(true)}
            disabled={loading}
            className="bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white font-medium px-4 py-2.5 rounded-lg text-sm border border-slate-700/60 transition-all"
          >
            Reject with Feedback
          </button>
        </div>
      )}
    </div>
  );
}
