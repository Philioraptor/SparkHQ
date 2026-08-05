import { Worker } from 'bullmq';
import { processCmoTask } from './cmoEngine';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const orchestratorUrl = process.env.ORCHESTRATOR_URL || 'http://localhost:4000';

console.log('[SparkHQ CMO Worker] Initializing background listener...');

const workerOptions = {
  connection: { url: redisUrl },
  settings: {
    backoffStrategies: {
      exponential: (attemptsMade: number) => Math.pow(2, attemptsMade) * 1000
    }
  }
};

const cmoWorker = new Worker('cmo-tasks', async (job) => {
  console.log(`[CMO Worker] Processing job #${job.id}: ${job.name}`);
  const { taskId, prompt } = job.data;

  try {
    const draftResult = await processCmoTask(prompt);

    // Post back event to Orchestrator API
    await fetch(`${orchestratorUrl}/api/v1/router/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'CMO_WORKER',
        eventType: 'CMO_DRAFT_CREATED',
        taskId: taskId,
        payload: draftResult
      })
    });

    console.log(`[CMO Worker] Completed job #${job.id} - LinkedIn Draft Created.`);
    return draftResult;
  } catch (err: any) {
    console.error(`[CMO Worker Error on job #${job.id}]`, err);
    throw err;
  }
}, workerOptions as any);

// Graceful SIGTERM Shutdowns
process.on('SIGTERM', async () => {
  console.log('[CMO Worker] SIGTERM received. Closing listener gracefully...');
  await cmoWorker.close();
  process.exit(0);
});
