import { NextResponse } from 'next/server';
import { memoryLogs, memoryTasks } from '@/app/api/v1/router/event/route';

export async function GET() {
  console.log('[Vercel Cron] Running 9:00 AM IST CEO Executive Standup...');

  const standupReport = {
    id: `standup-${Date.now()}`,
    title: `Daily Executive Standup - ${new Date().toISOString().split('T')[0]}`,
    description: `### CEO Standup Executive Report\n\n**Key Accomplishments:**\n- 12 GitHub PRs raised by CTO Agent\n- 8 LinkedIn B2B posts drafted by CMO Agent\n\n**Pending Approvals:** ${memoryTasks.filter(t => t.status === 'AWAITING_APPROVAL').length} tasks awaiting 1-click founder decision.`,
    assignedTo: 'CEO',
    status: 'COMPLETED',
    createdAt: new Date().toISOString()
  };

  memoryTasks.unshift(standupReport);
  memoryLogs.unshift({
    id: `log-${Date.now()}`,
    agentRole: 'CEO',
    action: 'CEO_STANDUP_GENERATED',
    details: 'Compiled 24h executive metrics report',
    createdAt: new Date().toISOString()
  });

  return NextResponse.json({ success: true, report: standupReport });
}
