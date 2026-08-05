'use client';

import { useEffect, useState } from 'react';

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
      id: 'log-seed-1',
      agentRole: 'CEO',
      action: 'FOUNDER_GOAL_SUBMITTED',
      details: 'Dispatched Stripe Checkout goal to CTO Queue',
      createdAt: new Date(Date.now() - 300000).toISOString()
    },
    {
      id: 'log-seed-2',
      agentRole: 'CTO_WORKER',
      action: 'CTO_PR_RAISED',
      details: 'Created PR #42 (feature/stripe-checkout)',
      createdAt: new Date(Date.now() - 120000).toISOString()
    },
    {
      id: 'log-seed-3',
      agentRole: 'CMO_WORKER',
      action: 'CMO_DRAFT_CREATED',
      details: 'LinkedIn Post Draft ready for founder review',
      createdAt: new Date(Date.now() - 60000).toISOString()
    }
  ]);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch('/api/v1/stream/logs');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setLogs(data);
          }
        }
      } catch (e) {
        console.warn('Vercel logs fetch warning:', e);
      }
    }

    fetchLogs();
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card rounded-xl p-5 shadow-xl border border-slate-800">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Live Vercel Serverless Audit Stream
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500">Vercel API Logs</span>
      </div>

      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
        {logs.map((log) => (
          <div key={log.id} className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/60 flex items-start justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                log.agentRole.includes('CTO') ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/40' :
                log.agentRole.includes('CMO') ? 'bg-purple-950 text-purple-400 border border-purple-800/40' :
                'bg-blue-950 text-blue-400 border border-blue-800/40'
              }`}>
                {log.agentRole}
              </span>
              <div>
                <span className="font-semibold text-slate-200 font-mono">{log.action}</span>
                <p className="text-slate-400 mt-0.5 font-mono text-[11px]">{log.details}</p>
              </div>
            </div>
            <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
              {new Date(log.createdAt).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
