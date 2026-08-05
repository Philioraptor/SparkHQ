import { Worker } from 'bullmq';
import { processCtoTask } from './ctoEngine';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const orchestratorUrl = process.env.ORCHESTRATOR_URL || 'http://localhost:4000';

console.log('[SparkHQ CTO Worker] Initializing background listener...');

const workerOptions = {
  connection: { url: redisUrl },
  settings: {
    backoffStrategies: {
      exponential: (attemptsMade: number) => Math.pow(2, attemptsMade) * 1000
    }
  }
};

const ctoWorker = new Worker('cto-tasks', async (job) => {
  console.log(`[CTO Worker] Processing job #${job.id}: ${job.name}`);
  const { taskId, prompt, owner = 'sparkhq-ai', repo = 'sparkhq-monorepo' } = job.data;

  try {
    const prResult = await processCtoTask(prompt, owner, repo);

    // Post back event to Orchestrator API
    await fetch(`${orchestratorUrl}/api/v1/router/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'CTO_WORKER',
        eventType: 'CTO_PR_RAISED',
        taskId: taskId,
        payload: prResult
      })
    });

    console.log(`[CTO Worker] Completed job #${job.id} - PR Raised.`);
    return prResult;
  } catch (err: any) {
    console.error(`[CTO Worker Error on job #${job.id}]`, err);
    throw err;
  }
}, workerOptions as any);

// Graceful SIGTERM Shutdowns
process.on('SIGTERM', async () => {
  console.log('[CTO Worker] SIGTERM received. Intercepting and closing gracefully...');
  await ctoWorker.close();
  process.exit(0);
});
