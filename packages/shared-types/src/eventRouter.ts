import { z } from 'zod';
import { Queue } from 'bullmq';

// 1. Strict Event Payload Schema
export const EventSchema = z.object({
  source: z.enum(['COMMAND_CENTER', 'CTO_WORKER', 'CMO_WORKER', 'GITHUB_WEBHOOK', 'CEO_AGENT']),
  eventType: z.enum([
    'FOUNDER_GOAL_SUBMITTED',
    'CTO_PR_RAISED',
    'CMO_DRAFT_CREATED',
    'FOUNDER_APPROVED',
    'FOUNDER_REJECTED'
  ]),
  taskId: z.string().optional(),
  payload: z.record(z.any())
});

export type EventPayload = z.infer<typeof EventSchema>;

// 2. Multi-Repo Central Event Router Function
export async function routeMultiRepoEvent(
  rawEvent: unknown,
  db: any, // Prisma Client or Mock Database Provider
  queues: { ctoQueue?: Queue; cmoQueue?: Queue }
) {
  // Step A: Validate Event Schema
  const event = EventSchema.parse(rawEvent);

  // Step B: Log Event in Shared Database for Auditability
  if (db && db.systemLog) {
    await db.systemLog.create({
      data: {
        agentRole: event.source,
        action: event.eventType,
        details: JSON.stringify(event.payload)
      }
    });
  }

  // Step C: Route Event to Target Repository Worker
  switch (event.eventType) {
    case 'FOUNDER_GOAL_SUBMITTED': {
      // CEO Agent parses founder goal & enqueues CTO / CMO tasks
      const { goalText, targetDept = 'CTO' } = event.payload;
      
      const task = db && db.task ? await db.task.create({
        data: {
          title: `Goal: ${goalText.substring(0, 50)}`,
          description: goalText,
          assignedTo: targetDept, // "CTO" or "CMO"
          status: 'IN_PROGRESS',
          requiresApproval: true
        }
      }) : { id: `task-${Date.now()}` };

      if (targetDept === 'CTO') {
        if (queues.ctoQueue) {
          await queues.ctoQueue.add('generate-code', { taskId: task.id, prompt: goalText });
        }
      } else if (targetDept === 'CMO') {
        if (queues.cmoQueue) {
          await queues.cmoQueue.add('generate-copy', { taskId: task.id, prompt: goalText });
        }
      }
      return { success: true, taskId: task.id, status: 'DISPATCHED', assignedTo: targetDept };
    }

    case 'CTO_PR_RAISED': {
      // CTO Worker finished PR -> Notify Command Center UI
      if (db && db.task && event.taskId) {
        await db.task.update({
          where: { id: event.taskId },
          data: {
            status: 'AWAITING_APPROVAL',
            outputPayload: event.payload // Contains prUrl, branchName, repo
          }
        });
      }
      return { success: true, status: 'AWAITING_FOUNDER_APPROVAL' };
    }

    case 'CMO_DRAFT_CREATED': {
      // CMO Worker finished Draft -> Notify Command Center UI
      if (db && db.task && event.taskId) {
        await db.task.update({
          where: { id: event.taskId },
          data: {
            status: 'AWAITING_APPROVAL',
            outputPayload: event.payload // Contains platform, postText
          }
        });
      }
      return { success: true, status: 'AWAITING_FOUNDER_APPROVAL' };
    }

    case 'FOUNDER_APPROVED': {
      // Founder clicked Approve in UI -> Execute GitHub Merge / LinkedIn Post
      if (!event.taskId) throw new Error('Task ID is required for FOUNDER_APPROVED event');

      let task = db && db.task ? await db.task.findUnique({ where: { id: event.taskId } }) : null;
      if (!task && db && db.task) throw new Error(`Task not found for id: ${event.taskId}`);

      const assignedTo = task ? task.assignedTo : 'CTO';
      const outputPayload = task ? task.outputPayload : event.payload;

      if (assignedTo === 'CTO') {
        if (queues.ctoQueue) {
          await queues.ctoQueue.add('merge-and-deploy', { taskId: event.taskId, payload: outputPayload });
        }
      } else if (assignedTo === 'CMO') {
        if (queues.cmoQueue) {
          await queues.cmoQueue.add('publish-linkedin', { taskId: event.taskId, payload: outputPayload });
        }
      }

      if (db && db.task) {
        await db.task.update({
          where: { id: event.taskId },
          data: { status: 'EXECUTING_APPROVED_ACTION' }
        });
      }
      return { success: true, status: 'EXECUTION_STARTED' };
    }

    case 'FOUNDER_REJECTED': {
      // Founder clicked Reject -> Re-enqueue with feedback
      if (!event.taskId) throw new Error('Task ID is required for FOUNDER_REJECTED event');

      const feedbackNote = event.payload?.feedbackNote || 'Rejection reason not provided';

      if (db && db.task) {
        await db.task.update({
          where: { id: event.taskId },
          data: { 
            status: 'REJECTED_WITH_FEEDBACK',
            feedbackNote: feedbackNote
          }
        });
      }
      return { success: true, status: 'RE-ENQUEUED_WITH_FEEDBACK', feedbackNote };
    }

    default:
      throw new Error(`Unhandled event type: ${event.eventType}`);
  }
}
