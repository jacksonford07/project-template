/**
 * Background Jobs System
 *
 * Simple background job patterns for Next.js.
 * For production, consider: BullMQ, Trigger.dev, Inngest, or Quirrel.
 *
 * @example
 * ```ts
 * // Define a job
 * const sendEmailJob = defineJob({
 *   name: 'send-email',
 *   handler: async (payload) => {
 *     await sendEmail(payload.to, payload.subject, payload.body);
 *   },
 * });
 *
 * // Queue a job
 * await queueJob('send-email', { to: 'user@example.com', subject: 'Hello' });
 * ```
 */

import { logger } from '@/lib/logger';

// Job definition types
export interface JobDefinition<T = unknown> {
  name: string;
  handler: (payload: T) => Promise<void>;
  retries?: number;
  timeout?: number;
}

export interface QueuedJob<T = unknown> {
  id: string;
  name: string;
  payload: T;
  status: 'pending' | 'running' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

// In-memory job registry (for development)
const jobRegistry = new Map<string, JobDefinition>();
const jobQueue: QueuedJob[] = [];

/**
 * Define a background job
 */
export function defineJob<T>(definition: JobDefinition<T>): JobDefinition<T> {
  jobRegistry.set(definition.name, definition as JobDefinition);
  logger.info('Jobs', `Registered job: ${definition.name}`);
  return definition;
}

/**
 * Queue a job for execution
 */
export async function queueJob<T>(
  jobName: string,
  payload: T,
  options?: { delay?: number }
): Promise<string> {
  const job: QueuedJob<T> = {
    id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    name: jobName,
    payload,
    status: 'pending',
    attempts: 0,
    maxAttempts: 3,
    createdAt: new Date(),
  };

  jobQueue.push(job as QueuedJob);
  logger.info('Jobs', `Queued job: ${jobName}`, { jobId: job.id });

  // In development, process immediately (or with delay)
  if (options?.delay) {
    setTimeout(() => void processJob(job.id), options.delay);
  } else {
    // Process in next tick to simulate async behavior
    setImmediate(() => void processJob(job.id));
  }

  return job.id;
}

/**
 * Process a queued job
 */
async function processJob(jobId: string): Promise<void> {
  const job = jobQueue.find((j) => j.id === jobId);
  if (!job || job.status !== 'pending') return;

  const definition = jobRegistry.get(job.name);
  if (!definition) {
    logger.error('Jobs', `Unknown job type: ${job.name}`);
    job.status = 'failed';
    job.error = 'Unknown job type';
    return;
  }

  job.status = 'running';
  job.startedAt = new Date();
  job.attempts += 1;

  try {
    logger.info('Jobs', `Processing job: ${job.name}`, { jobId, attempt: job.attempts });

    // Apply timeout if specified
    const timeout = definition.timeout ?? 30000;
    await Promise.race([
      definition.handler(job.payload),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Job timeout')), timeout)
      ),
    ]);

    job.status = 'completed';
    job.completedAt = new Date();
    logger.success('Jobs', `Completed job: ${job.name}`, { jobId });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Jobs', `Failed job: ${job.name}`, error as Error, { jobId });

    // Retry if attempts remaining
    if (job.attempts < job.maxAttempts) {
      job.status = 'pending';
      const retryDelay = Math.pow(2, job.attempts) * 1000; // Exponential backoff
      setTimeout(() => void processJob(jobId), retryDelay);
      logger.info('Jobs', `Retrying job in ${retryDelay}ms`, { jobId, attempt: job.attempts });
    } else {
      job.status = 'failed';
      job.error = errorMessage;
    }
  }
}

/**
 * Get job status
 */
export function getJobStatus(jobId: string): QueuedJob | undefined {
  return jobQueue.find((j) => j.id === jobId);
}

/**
 * Get all jobs (for admin/debugging)
 */
export function getAllJobs(): QueuedJob[] {
  return [...jobQueue];
}

/**
 * Clear completed jobs (cleanup)
 */
export function clearCompletedJobs(): number {
  const initialLength = jobQueue.length;
  const remainingJobs = jobQueue.filter((j) => j.status !== 'completed');
  jobQueue.length = 0;
  jobQueue.push(...remainingJobs);
  return initialLength - jobQueue.length;
}

// Example job definitions
export const exampleJobs = {
  sendEmail: defineJob<{ to: string; subject: string; body: string }>({
    name: 'send-email',
    handler: async (payload) => {
      // Simulate email sending
      logger.info('Jobs', `Sending email to ${payload.to}: ${payload.subject}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      logger.success('Jobs', `Email sent to ${payload.to}`);
    },
    retries: 3,
    timeout: 30000,
  }),

  processWebhook: defineJob<{ url: string; data: unknown }>({
    name: 'process-webhook',
    handler: async (payload) => {
      logger.info('Jobs', `Processing webhook to ${payload.url}`);
      // In production, make actual HTTP request
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
  }),

  cleanupOldData: defineJob<{ olderThan: Date }>({
    name: 'cleanup-old-data',
    handler: async (payload) => {
      logger.info('Jobs', `Cleaning up data older than ${payload.olderThan.toISOString()}`);
      // In production, delete old records from database
      await new Promise((resolve) => setTimeout(resolve, 2000));
    },
    timeout: 60000,
  }),
};
