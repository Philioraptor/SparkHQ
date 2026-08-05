import { NextResponse } from 'next/server';
import { routeMultiRepoEvent } from '@sparkhq/shared-types';
import { processCtoTask, processCmoTask, publishLinkedInPost } from '@/lib/csuiteEngines';

export const memoryLogs: any[] = [
  { 
    id: 'log-v1', 
    agentRole: 'CEO', 
    action: 'SYSTEM_INITIALIZED', 
    details: JSON.stringify({ message: 'SparkHQ Vercel Serverless Router Online' }), 
    createdAt: new Date().toISOString() 
  }
];

export const memoryTasks: any[] = [
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
      postText: '🚀 Excited to announce Project SparkHQ: The Autonomous AI C-Suite for Single Founders!\n\nNo open-ended agent chat loops. Pure 1-click binary approvals.\n\n✨ Key Highlights:\n- CTO Worker creates GitHub PRs automatically\n- CMO Worker generates viral technical B2B posts & auto-publishes to feed\n- CEO Standup cron delivers 9AM executive reports\n\nBuilt for single founders who scale standard operations to 100x speed.\n\n#ArtificialIntelligence #Founders #TechLeadership',
      status: 'DRAFT_READY_FOR_APPROVAL'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export async function POST(request: Request) {
  try {
    const rawEvent = await request.json();
    console.log('[Vercel Event Router]', rawEvent.eventType, rawEvent.source);

    const mockDb = {
      systemLog: {
        create: async ({ data }: any) => {
          const newLog = { id: `log-${Date.now()}`, ...data, createdAt: new Date().toISOString() };
          memoryLogs.unshift(newLog);
          return newLog;
        }
      },
      task: {
        create: async ({ data }: any) => {
          const newTask = { id: `task-${Date.now()}`, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
          memoryTasks.unshift(newTask);
          return newTask;
        },
        findUnique: async ({ where }: any) => memoryTasks.find((t) => t.id === where.id),
        update: async ({ where, data }: any) => {
          const task = memoryTasks.find((t) => t.id === where.id);
          if (task) {
            Object.assign(task, data, { updatedAt: new Date().toISOString() });
          }
          return task;
        }
      }
    };

    const mockQueues = {
      ctoQueue: {
        add: async (jobName: string, data: any) => {
          if (jobName === 'generate-code') {
            try {
              const prResult = await processCtoTask(data.prompt);
              const task = memoryTasks.find(t => t.id === data.taskId);
              if (task) {
                task.status = 'AWAITING_APPROVAL';
                task.outputPayload = prResult;
                memoryLogs.unshift({
                  id: `log-${Date.now()}`,
                  agentRole: 'CTO_WORKER',
                  action: 'CTO_PR_RAISED',
                  details: `Raised PR ${prResult.prUrl} (${prResult.branchName})`,
                  createdAt: new Date().toISOString()
                });
              }
            } catch (e) {
              console.error('[Vercel CTO Worker Error]', e);
            }
          }
        }
      } as any,
      cmoQueue: {
        add: async (jobName: string, data: any) => {
          if (jobName === 'generate-copy') {
            try {
              const draftResult = await processCmoTask(data.prompt);
              const task = memoryTasks.find(t => t.id === data.taskId);
              if (task) {
                task.status = 'AWAITING_APPROVAL';
                task.outputPayload = draftResult;
                memoryLogs.unshift({
                  id: `log-${Date.now()}`,
                  agentRole: 'CMO_WORKER',
                  action: 'CMO_DRAFT_CREATED',
                  details: 'Drafted B2B LinkedIn post ready for approval',
                  createdAt: new Date().toISOString()
                });
              }
            } catch (e) {
              console.error('[Vercel CMO Worker Error]', e);
            }
          } else if (jobName === 'publish-linkedin') {
            // Founder Approved -> Execute Auto-Posting to LinkedIn!
            try {
              const task = memoryTasks.find(t => t.id === data.taskId);
              const postText = task?.outputPayload?.postText || data.payload?.postText || "New Technical Update from SparkHQ";
              const publishResult = await publishLinkedInPost(postText);
              
              if (task) {
                task.status = 'COMPLETED';
                task.outputPayload = {
                  ...task.outputPayload,
                  published: true,
                  postUrl: publishResult.postUrl
                };
              }
              memoryLogs.unshift({
                id: `log-${Date.now()}`,
                agentRole: 'CMO_WORKER',
                action: 'LINKEDIN_POST_PUBLISHED',
                details: `Published to LinkedIn Feed: ${publishResult.postUrl}`,
                createdAt: new Date().toISOString()
              });
            } catch (e) {
              console.error('[Vercel CMO LinkedIn Auto-Post Error]', e);
            }
          }
        }
      } as any
    };

    const result = await routeMultiRepoEvent(rawEvent, mockDb, mockQueues);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[Vercel Event Router Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
