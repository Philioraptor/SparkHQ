import express from 'express';
import cors from 'cors';
import { Queue } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { routeMultiRepoEvent } from '@sparkhq/shared-types';

const app = express();
const db = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// BullMQ Queue Connections (Graceful Redis Connection)
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
let ctoQueue: Queue | undefined;
let cmoQueue: Queue | undefined;

try {
  const redisConnection = { url: redisUrl };
  ctoQueue = new Queue('cto-tasks', { connection: redisConnection });
  cmoQueue = new Queue('cmo-tasks', { connection: redisConnection });
} catch (e) {
  console.warn('[Orchestrator Warning] Redis queue initialization failed, running in fallback mode:', e);
}

// Memory fallback store for standalone testing when database is not connected
const memoryLogs: any[] = [
  { id: 'log-1', agentRole: 'CEO', action: 'SYSTEM_INITIALIZED', details: JSON.stringify({ message: 'Project SparkHQ AI C-Suite Router Online' }), createdAt: new Date() }
];
const memoryTasks: any[] = [
  {
    id: 'demo-task-1',
    title: 'Goal: Build Next.js Stripe Checkout Component',
    description: 'Implement dark mode glassmorphism Stripe checkout page in Next.js Command Center.',
    assignedTo: 'CTO',
    status: 'AWAITING_APPROVAL',
    requiresApproval: true,
    outputPayload: {
      prUrl: 'https://github.com/sparkhq-ai/sparkhq-monorepo/pull/42',
      branchName: 'feature/stripe-checkout',
      repo: 'sparkhq-monorepo',
      prTitle: 'feat: Stripe checkout glassmorphism component'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'demo-task-2',
    title: 'Goal: Publish Launch Announcement B2B Post',
    description: 'Write compelling B2B LinkedIn post announcing AI C-Suite v1.0 release.',
    assignedTo: 'CMO',
    status: 'AWAITING_APPROVAL',
    requiresApproval: true,
    outputPayload: {
      platform: 'LINKEDIN',
      postText: '🚀 Excited to announce Project SparkHQ: The Autonomous AI C-Suite for Single Founders!\n\nNo open-ended agent chat loops. Pure 1-click binary approvals.\n\n✨ Key Highlights:\n- CTO Worker creates GitHub PRs automatically\n- CMO Worker generates viral technical B2B posts\n- CEO Standup cron delivers 9AM executive reports\n\nBuilt for single founders who scale standard operations to 100x speed.\n\n#ArtificialIntelligence #Founders #TechLeadership',
      status: 'DRAFT_READY_FOR_APPROVAL'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// 1. Central Event Router Endpoint
app.post('/api/v1/router/event', async (req, res) => {
  try {
    const rawEvent = req.body;
    console.log('[Router Received Event]', rawEvent.eventType, rawEvent.source);

    // Try DB first, fallback to memory
    let dbClient: any = db;
    try {
      await db.$connect();
    } catch {
      dbClient = {
        systemLog: {
          create: async ({ data }: any) => {
            const newLog = { id: `log-${Date.now()}`, ...data, createdAt: new Date() };
            memoryLogs.unshift(newLog);
            return newLog;
          }
        },
        task: {
          create: async ({ data }: any) => {
            const newTask = { id: `task-${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
            memoryTasks.unshift(newTask);
            return newTask;
          },
          findUnique: async ({ where }: any) => memoryTasks.find((t) => t.id === where.id),
          update: async ({ where, data }: any) => {
            const task = memoryTasks.find((t) => t.id === where.id);
            if (task) {
              Object.assign(task, data, { updatedAt: new Date() });
            }
            return task;
          }
        }
      };
    }

    const result = await routeMultiRepoEvent(rawEvent, dbClient, { ctoQueue, cmoQueue });
    res.status(200).json(result);
  } catch (error: any) {
    console.error('[Router Error]', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// 2. Fetch Tasks API
app.get('/api/v1/tasks', async (req, res) => {
  try {
    try {
      const tasks = await db.task.findMany({ orderBy: { createdAt: 'desc' } });
      return res.json(tasks);
    } catch {
      return res.json(memoryTasks);
    }
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// 3. Real-Time Server-Sent Events (SSE) for Dashboard Logs
app.get('/api/v1/stream/logs', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendLogs = async () => {
    try {
      const latestLogs = await db.systemLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
      res.write(`data: ${JSON.stringify(latestLogs)}\n\n`);
    } catch {
      res.write(`data: ${JSON.stringify(memoryLogs.slice(0, 10))}\n\n`);
    }
  };

  await sendLogs();
  const interval = setInterval(sendLogs, 3000);

  req.on('close', () => clearInterval(interval));
});

// 4. Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'HEALTHY', service: 'sparkhq-orchestrator-api', timestamp: new Date() });
});

app.listen(PORT, () => console.log(`[Orchestrator API] Running on port ${PORT}`));
