/**
 * Job Queue Interface
 * 
 * Defines the structure for background job processing.
 * This is a simple in-memory implementation that can be replaced
 * with Redis/BullMQ or a database-backed queue in production.
 */

export interface Job<T = unknown> {
  id: string;
  type: JobType;
  data: T;
  attempts: number;
  maxAttempts: number;
  scheduledAt: Date;
  processedAt?: Date;
  failedAt?: Date;
  error?: string;
}

export enum JobType {
  // Affiliate/Supplier Jobs
  AFFILIATE_ORDER_PUSH = 'affiliate:order:push',
  AFFILIATE_ORDER_RETRY = 'affiliate:order:retry',
  AFFILIATE_STATUS_SYNC = 'affiliate:status:sync',

  // Inventory Jobs
  INVENTORY_LOW_STOCK_ALERT = 'inventory:low-stock:alert',
  INVENTORY_IMPORT_PROCESS = 'inventory:import:process',

  // Order Jobs
  ORDER_CONFIRMATION_EMAIL = 'order:email:confirmation',
  ORDER_SHIPPED_EMAIL = 'order:email:shipped',
  ORDER_STATUS_WEBHOOK = 'order:webhook:status',

  // Cleanup Jobs
  CLEANUP_EXPIRED_CARTS = 'cleanup:carts:expired',
  CLEANUP_EXPIRED_SESSIONS = 'cleanup:sessions:expired',
}

export interface JobHandler<T = unknown> {
  (job: Job<T>): Promise<void>;
}

/**
 * Simple in-memory job queue implementation
 * 
 * For production, replace with:
 * - BullMQ (Redis-backed)
 * - pg-boss (PostgreSQL-backed)
 * - Custom database-backed queue
 */
export class JobQueue {
  private jobs: Map<string, Job> = new Map();
  private handlers: Map<JobType, JobHandler> = new Map();
  private processing: boolean = false;
  private intervalId?: ReturnType<typeof setInterval>;

  /**
   * Register a handler for a job type
   */
  registerHandler<T>(type: JobType, handler: JobHandler<T>): void {
    this.handlers.set(type, handler as JobHandler);
  }

  /**
   * Add a job to the queue
   */
  async enqueue<T>(options: {
    type: JobType;
    data: T;
    maxAttempts?: number;
    scheduledAt?: Date;
  }): Promise<Job<T>> {
    const job: Job<T> = {
      id: crypto.randomUUID(),
      type: options.type,
      data: options.data,
      attempts: 0,
      maxAttempts: options.maxAttempts ?? 3,
      scheduledAt: options.scheduledAt ?? new Date(),
    };

    this.jobs.set(job.id, job as Job);
    return job;
  }

  /**
   * Start processing jobs
   */
  start(intervalMs: number = 1000): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.processJobs();
    }, intervalMs);
  }

  /**
   * Stop processing jobs
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }

  /**
   * Process pending jobs
   */
  private async processJobs(): Promise<void> {
    if (this.processing) return;
    this.processing = true;

    try {
      const now = new Date();

      for (const [id, job] of this.jobs) {
        // Skip jobs scheduled for the future
        if (job.scheduledAt > now) continue;

        // Skip already processed jobs
        if (job.processedAt) continue;

        // Skip jobs that have exceeded max attempts
        if (job.attempts >= job.maxAttempts) continue;

        const handler = this.handlers.get(job.type);
        if (!handler) {
          console.warn(`No handler registered for job type: ${job.type}`);
          continue;
        }

        job.attempts++;

        try {
          await handler(job);
          job.processedAt = new Date();
          this.jobs.delete(id);
        } catch (error) {
          job.error = error instanceof Error ? error.message : String(error);

          if (job.attempts >= job.maxAttempts) {
            job.failedAt = new Date();
            console.error(`Job ${id} failed after ${job.attempts} attempts:`, job.error);
          } else {
            // Exponential backoff: 1s, 2s, 4s, 8s...
            const backoffMs = Math.pow(2, job.attempts - 1) * 1000;
            job.scheduledAt = new Date(now.getTime() + backoffMs);
          }
        }
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Get job by ID
   */
  getJob(id: string): Job | undefined {
    return this.jobs.get(id);
  }

  /**
   * Get all pending jobs
   */
  getPendingJobs(): Job[] {
    return Array.from(this.jobs.values()).filter(
      (job) => !job.processedAt && !job.failedAt,
    );
  }

  /**
   * Get failed jobs
   */
  getFailedJobs(): Job[] {
    return Array.from(this.jobs.values()).filter((job) => job.failedAt);
  }
}

// Global job queue instance
export const jobQueue = new JobQueue();

