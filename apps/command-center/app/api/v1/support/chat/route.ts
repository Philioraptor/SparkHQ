import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { memoryLogs, memoryTasks } from '../../router/event/route';
import { processCtoTask } from '@/lib/csuiteEngines';

const apiKey = process.env.GEMINI_API_KEY || "demo-api-key";
const ai = new GoogleGenAI({ apiKey });

export async function POST(request: Request) {
  try {
    const { userEmail = 'user@sparkhq.ai', message } = await request.json();

    console.log(`[Support Agent API] Received query from ${userEmail}: "${message}"`);

    const lower = message.toLowerCase();
    const isBug = lower.includes('bug') || lower.includes('error') || lower.includes('fail') || lower.includes('crash') || lower.includes('broken') || lower.includes('issue');

    let replyText = '';
    let isEscalated = false;
    let ticketId = `TICKET-${Date.now().toString().slice(-4)}`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Customer Query: ${message}`,
        config: {
          systemInstruction: `You are the SparkHQ AI Support Agent. 
          For billing questions, explain that users can manage subscriptions, upgrade plans, or update cards self-service at /billing.
          For feature questions, explain how 1-Click Binary Approvals work.
          For bug reports, express empathy, state that a Support Ticket has been logged, and that the CTO Agent will raise a GitHub PR fix for approval.`
        }
      });
      replyText = response.text || '';
    } catch (err) {
      console.warn('[Support Agent Gemini Fallback]', err);
    }

    if (!replyText) {
      if (isBug) {
        replyText = `I have logged Support Ticket #${ticketId}. Our CTO Agent is analyzing the issue and raising a GitHub PR fix for founder approval!`;
      } else {
        replyText = `Thank you for contacting SparkHQ Support! You can manage your subscription 24/7 self-service on our Billing Portal (/billing). Let us know if you need anything else!`;
      }
    }

    if (isBug) {
      isEscalated = true;
      
      // Self-Healing Bug Fix Loop Trigger
      const bugTask: {
        id: string;
        title: string;
        description: string;
        assignedTo: string;
        status: string;
        requiresApproval: boolean;
        outputPayload: any;
        createdAt: string;
        updatedAt: string;
      } = {
        id: `task-bug-${Date.now()}`,
        title: `Self-Healing Bugfix: Support Ticket #${ticketId}`,
        description: `User Bug Report (${userEmail}): ${message}`,
        assignedTo: 'CTO',
        status: 'IN_PROGRESS',
        requiresApproval: true,
        outputPayload: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      memoryTasks.unshift(bugTask);
      memoryLogs.unshift({
        id: `log-${Date.now()}`,
        agentRole: 'SUPPORT',
        action: 'SUPPORT_TICKET_ESCALATED',
        details: `Bug report logged from ${userEmail} ➔ Ticket #${ticketId} escalated to CTO Worker`,
        createdAt: new Date().toISOString()
      });

      // Asynchronously trigger CTO Agent to raise fix PR
      setTimeout(async () => {
        try {
          const prResult = await processCtoTask(`Fix reported user bug (${message}). Ensure zero regression and clean TypeScript code.`);
          bugTask.status = 'AWAITING_APPROVAL';
          bugTask.outputPayload = prResult;
          memoryLogs.unshift({
            id: `log-${Date.now()}`,
            agentRole: 'CTO_WORKER',
            action: 'CTO_PR_RAISED',
            details: `Raised Bugfix PR ${prResult.prUrl} (${prResult.branchName})`,
            createdAt: new Date().toISOString()
          });
        } catch (e) {
          console.error('[Self-Healing CTO Trigger Error]', e);
        }
      }, 500);
    } else {
      memoryLogs.unshift({
        id: `log-${Date.now()}`,
        agentRole: 'SUPPORT',
        action: 'QUERY_RESOLVED_AUTOMATED',
        details: `Automated AI support query resolved for ${userEmail}`,
        createdAt: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      reply: replyText,
      isEscalated,
      ticketId: isBug ? ticketId : undefined
    });
  } catch (error: any) {
    console.error('[Support Agent API Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
