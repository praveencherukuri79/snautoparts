import { EntityManager } from '@mikro-orm/core';
import { jobQueue, Job, JobType } from './job-queue.js';
import { Cart, Session } from '../entities/index.js';
import { logger } from '../config/logger.js';

/**
 * Cleanup Job Data
 */
interface CleanupJobData {
  batchSize?: number;
}

/**
 * Register cleanup job handlers
 */
export function registerCleanupJobHandlers(em: EntityManager): void {
  // Handle expired carts cleanup
  jobQueue.registerHandler<CleanupJobData>(
    JobType.CLEANUP_EXPIRED_CARTS,
    async (job) => {
      await cleanupExpiredCarts(em, job);
    },
  );

  // Handle expired sessions cleanup
  jobQueue.registerHandler<CleanupJobData>(
    JobType.CLEANUP_EXPIRED_SESSIONS,
    async (job) => {
      await cleanupExpiredSessions(em, job);
    },
  );
}

/**
 * Clean up expired/abandoned carts
 * 
 * Removes carts that haven't been updated in 30 days
 */
async function cleanupExpiredCarts(
  em: EntityManager,
  job: Job<CleanupJobData>,
): Promise<void> {
  const batchSize = job.data.batchSize ?? 100;
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() - 30);

  try {
    // Find expired carts
    const expiredCarts = await em.find(
      Cart,
      { updatedAt: { $lt: expirationDate } },
      { limit: batchSize },
    );

    if (expiredCarts.length === 0) {
      logger.debug('No expired carts to clean up');
      return;
    }

    // Remove expired carts (cascades to cart items)
    for (const cart of expiredCarts) {
      em.remove(cart);
    }

    await em.flush();

    logger.info(
      { count: expiredCarts.length },
      'Cleaned up expired carts',
    );

    // If we processed a full batch, schedule another cleanup
    if (expiredCarts.length === batchSize) {
      await jobQueue.enqueue({
        type: JobType.CLEANUP_EXPIRED_CARTS,
        data: { batchSize },
        scheduledAt: new Date(Date.now() + 1000), // 1 second delay
      });
    }
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      'Failed to clean up expired carts',
    );
    throw error;
  }
}

/**
 * Clean up expired sessions
 * 
 * Removes sessions that have expired
 */
async function cleanupExpiredSessions(
  em: EntityManager,
  job: Job<CleanupJobData>,
): Promise<void> {
  const batchSize = job.data.batchSize ?? 100;
  const now = new Date();

  try {
    // Find expired sessions
    const expiredSessions = await em.find(
      Session,
      { expiresAt: { $lt: now } },
      { limit: batchSize },
    );

    if (expiredSessions.length === 0) {
      logger.debug('No expired sessions to clean up');
      return;
    }

    // Remove expired sessions
    for (const session of expiredSessions) {
      em.remove(session);
    }

    await em.flush();

    logger.info(
      { count: expiredSessions.length },
      'Cleaned up expired sessions',
    );

    // If we processed a full batch, schedule another cleanup
    if (expiredSessions.length === batchSize) {
      await jobQueue.enqueue({
        type: JobType.CLEANUP_EXPIRED_SESSIONS,
        data: { batchSize },
        scheduledAt: new Date(Date.now() + 1000), // 1 second delay
      });
    }
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      'Failed to clean up expired sessions',
    );
    throw error;
  }
}

/**
 * Schedule daily cleanup jobs
 * 
 * Call this on server startup to schedule cleanup jobs
 */
export async function scheduleCleanupJobs(): Promise<void> {
  // Schedule cart cleanup for 2 AM
  const cartCleanupTime = getNextScheduledTime(2);
  await jobQueue.enqueue({
    type: JobType.CLEANUP_EXPIRED_CARTS,
    data: { batchSize: 100 },
    scheduledAt: cartCleanupTime,
  });

  // Schedule session cleanup for 3 AM
  const sessionCleanupTime = getNextScheduledTime(3);
  await jobQueue.enqueue({
    type: JobType.CLEANUP_EXPIRED_SESSIONS,
    data: { batchSize: 100 },
    scheduledAt: sessionCleanupTime,
  });

  logger.info('Scheduled daily cleanup jobs');
}

/**
 * Get the next scheduled time for a given hour
 */
function getNextScheduledTime(hour: number): Date {
  const now = new Date();
  const scheduled = new Date();
  scheduled.setHours(hour, 0, 0, 0);

  // If the scheduled time has passed today, schedule for tomorrow
  if (scheduled <= now) {
    scheduled.setDate(scheduled.getDate() + 1);
  }

  return scheduled;
}

