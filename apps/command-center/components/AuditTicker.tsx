'use client';

import { useState, useEffect } from 'react';

interface AuditLog {
  id: string;
  agentRole: string;
  action: string;
  details: string;
  createdAt: string;
}

export default function AuditTicker() {
  const [logs, setLogs] = useState<AuditLog[]>([
    {
      id: 'log-1',
      agentRole: 'SYSTEM_ROUTER',
      action: 'EVENT_ROUTED',
      details: 'Routed FOUNDER_GOAL_SUBMITTED to CTO Worker Queue',
      createdAt: new Date(Date.now() - 60000).toISOString()
    },
    {
      id: 'log-2',
      agentRole: 'CTO_WORKER',
      action: 'CTO_PR_RAISED',
      details: 'Generated feature/stripe-checkout branch & opened GitHub PR #42',
      createdAt: new Date(Date.now() - 30000).toISOString()
    },
    {
      id: 'log-3',
      agentRole: 'CMO_WORKER',
      action: 'CMO_DRAFT_CREATED',
      details: 'Drafted B2B launch announcement for LinkedIn feed',
      createdAt: new Date(Date.now() - 10000).toISOString()
    }
  ]);

  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // 3-Second Client Polling for Vercel Serverless Reliability (Replaces SSE)
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/v1/stream/logs', {
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setLogs((prev) => {
              const existingIds = new Set(prev.map((l) => l.id));
              const newLogs = data.filter((l: AuditLog) => !existingIds.has(l.id));
              if (newLogs.length > 0) {
                return [...newLogs, ...prev];
              }
              return prev;
            });
          }
        }
      } catch (err) {
        // Silent polling fallback
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800/90 glow-border">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Live System Audit Stream
          </h3>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
          3s Polling Sync
        </span>
      </div>

      <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 font-mono text-xs">
        {logs.map((log) => (
          <div
            key={log.id}
            className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col gap-1"
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                log.agentRole === 'CTO_WORKER' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/40' :
                log.agentRole === 'CMO_WORKER' ? 'bg-purple-950 text-purple-400 border border-purple-800/40' :
                log.agentRole === 'BILLING' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' :
                'bg-blue-950 text-blue-400 border border-blue-800/40'
              }`}>
                {log.agentRole}
              </span>
              <span className="text-[10px] text-slate-500">
                {new Date(log.createdAt).toLocaleTimeString()}
              </span>
            </div>

            <p className="text-slate-300 text-[11px] leading-relaxed mt-0.5">
              <strong className="text-slate-100 font-semibold">{log.action}:</strong> {log.details}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
