import { z } from 'zod';
import { Queue } from 'bullmq';

// 1. Strict Event Payload Schema
export const EventSchema = z.object({
  source: z.enum(['COMMAND_CENTER', 'CTO_WORKER', 'CMO_WORKER', 'SUPPORT_WORKER', 'GITHUB_WEBHOOK', 'CEO_AGENT']),
  eventType: z.enum([
    'FOUNDER_GOAL_SUBMITTED',
    'CTO_PR_RAISED',
    'CMO_DRAFT_CREATED',
    'SUPPORT_TICKET_ESCALATED',
    'FOUNDER_APPROVED',
    'FOUNDER_REJECTED',
    'FOUNDER_KILLED'
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
      const { goalText, targetDept = 'CTO' } = event.payload;
      
      const task = db && db.task ? await db.task.create({
        data: {
          title: `Goal: ${goalText.substring(0, 50)}`,
          description: goalText,
          assignedTo: targetDept,
          status: 'IN_PROGRESS',
          requiresApproval: true
        }
      }) : { id: `task-${Date.now()}` };

      if (targetDept === 'CTO' && queues.ctoQueue) {
        await queues.ctoQueue.add('generate-code', { taskId: task.id, prompt: goalText });
      } else if (targetDept === 'CMO' && queues.cmoQueue) {
        await queues.cmoQueue.add('generate-copy', { taskId: task.id, prompt: goalText });
      }
      return { success: true, taskId: task.id, status: 'DISPATCHED', assignedTo: targetDept };
    }

    case 'SUPPORT_TICKET_ESCALATED': {
      const { ticketId, userEmail, issueDescription } = event.payload;

      const task = db && db.task ? await db.task.create({
        data: {
          title: `Self-Healing Bugfix: Ticket #${ticketId || Date.now()}`,
          description: `User Bug Report (${userEmail}): ${issueDescription}`,
          assignedTo: 'CTO',
          status: 'IN_PROGRESS',
          requiresApproval: true
        }
      }) : { id: `task-bug-${Date.now()}` };

      if (queues.ctoQueue) {
        await queues.ctoQueue.add('generate-code', { 
          taskId: task.id, 
          prompt: `Fix reported user bug (${issueDescription}). Write robust error handling and fix tests.` 
        });
      }
      return { success: true, taskId: task.id, status: 'BUGFIX_DISPATCHED_TO_CTO' };
    }

    case 'CTO_PR_RAISED': {
      if (db && db.task && event.taskId) {
        await db.task.update({
          where: { id: event.taskId },
          data: {
            status: 'AWAITING_APPROVAL',
            outputPayload: event.payload
          }
        });
      }
      return { success: true, status: 'AWAITING_FOUNDER_APPROVAL' };
    }

    case 'CMO_DRAFT_CREATED': {
      if (db && db.task && event.taskId) {
        await db.task.update({
          where: { id: event.taskId },
          data: {
            status: 'AWAITING_APPROVAL',
            outputPayload: event.payload
          }
        });
      }
      return { success: true, status: 'AWAITING_FOUNDER_APPROVAL' };
    }

    case 'FOUNDER_APPROVED': {
      if (!event.taskId) throw new Error('Task ID is required for FOUNDER_APPROVED event');

      let task = db && db.task ? await db.task.findUnique({ where: { id: event.taskId } }) : null;

      const assignedTo = task ? task.assignedTo : 'CTO';
      const outputPayload = task ? task.outputPayload : event.payload;

      if (assignedTo === 'CTO' && queues.ctoQueue) {
        await queues.ctoQueue.add('merge-and-deploy', { taskId: event.taskId, payload: outputPayload });
      } else if (assignedTo === 'CMO' && queues.cmoQueue) {
        await queues.cmoQueue.add('publish-linkedin', { taskId: event.taskId, payload: outputPayload });
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

    case 'FOUNDER_KILLED': {
      if (!event.taskId) throw new Error('Task ID is required for FOUNDER_KILLED event');

      if (db && db.task) {
        await db.task.update({
          where: { id: event.taskId },
          data: { status: 'FAILED' }
        });
      }
      return { success: true, status: 'TASK_EXTERMINATED' };
    }

    default:
      throw new Error(`Unhandled event type: ${event.eventType}`);
  }
}
