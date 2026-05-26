import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '../config/env';

let isRedisConnected = false;
let assignmentQueue: Queue | null = null;
let redisConnection: IORedis | null = null;
let bullmqWorker: Worker | null = null;

export type JobHandler = (assignmentId: string) => Promise<void>;
let activeJobHandler: JobHandler | null = null;

// Initialize the queue system (connects to Redis or falls back to in-memory)
export async function initializeQueue(handler: JobHandler) {
  activeJobHandler = handler;
  const redisUrl = config.REDIS_URL || 'redis://127.0.0.1:6379';

  console.log(`Checking Redis server status at ${redisUrl}...`);
  
  // Fast-failing test client to check if Redis is active
  const testClient = new IORedis(redisUrl, {
    connectTimeout: 1500,
    maxRetriesPerRequest: 0, // Fail immediately instead of infinite retrying
  });

  try {
    await new Promise<void>((resolve, reject) => {
      testClient.once('ready', () => {
        isRedisConnected = true;
        resolve();
      });
      testClient.once('error', (err) => {
        reject(err);
      });
    });
    testClient.disconnect();
    
    console.log('Redis server is active. Initializing production BullMQ + Redis queue...');
    
    redisConnection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null // Required by BullMQ
    });

    assignmentQueue = new Queue('assignment-generation', {
      connection: redisConnection
    });

    bullmqWorker = new Worker('assignment-generation', async (job: Job) => {
      console.log(`BullMQ background worker processing job [ID: ${job.id}] for assignment [ID: ${job.data.assignmentId}]`);
      if (activeJobHandler) {
        await activeJobHandler(job.data.assignmentId);
      }
    }, {
      connection: redisConnection,
      concurrency: 2 // Allow parallel processing
    });

    bullmqWorker.on('failed', (job, err) => {
      console.error(`BullMQ job [ID: ${job?.id}] failed:`, err);
    });

    bullmqWorker.on('completed', (job) => {
      console.log(`BullMQ job [ID: ${job.id}] completed successfully.`);
    });

  } catch (err) {
    console.warn('\nRedis server not detected or connection failed.');
    console.warn('Fallback: Running an in-memory asynchronous background queue.');
    console.warn('To utilize production BullMQ + Redis queue, ensure Redis is running and update REDIS_URL in .env.\n');
    
    isRedisConnected = false;
    testClient.disconnect();
  }
}

// Add an assignment generation task to the queue
export async function addGenerationJob(assignmentId: string) {
  if (isRedisConnected && assignmentQueue) {
    const job = await assignmentQueue.add('generate', { assignmentId }, {
      removeOnComplete: true,
      removeOnFail: true,
      attempts: 2
    });
    console.log(`Job [ID: ${job.id}] successfully queued in BullMQ.`);
  } else {
    console.log(`Assignment [ID: ${assignmentId}] queued in in-memory scheduler.`);
    
    // Execute asynchronously out of the main request-response loop
    setTimeout(async () => {
      if (activeJobHandler) {
        console.log(`In-memory scheduler processing assignment [ID: ${assignmentId}]`);
        try {
          await activeJobHandler(assignmentId);
        } catch (err) {
          console.error(`In-memory execution failed for assignment [ID: ${assignmentId}]:`, err);
        }
      }
    }, 1000);
  }
}

// Get the current status of the queue system
export function getQueueStatus() {
  return {
    isRedisConnected,
    type: isRedisConnected ? 'BullMQ (Redis)' : 'In-Memory (Fallback)'
  };
}
