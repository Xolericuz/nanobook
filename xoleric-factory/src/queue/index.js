import { Queue, Worker } from 'bullmq';
import { broadcast } from '../api/server.js';
import bookGenerator from '../agents/book-generator.js';
import uiMaster from '../agents/ui-master.js';
import userIntelligence from '../agents/user-intelligence.js';
import supervisor from '../agents/supervisor.js';
import config from '../../config/index.js';

// Initialize queues
const queues = {};
const workers = {};

// Job processors
const processors = {
  // Generate daily book
  async generate_book(job) {
    console.log('📚 Generating new book...');
    broadcast('job_started', { job: 'generate_book' });
    
    const book = await bookGenerator.generate(job.data.seed);
    
    broadcast('job_completed', { job: 'generate_book', result: book.title });
    return book;
  },

  // Generate UI update
  async generate_ui(job) {
    console.log('🎨 Generating UI update...');
    
    const stats = await import('../api/stats.js').then(m => m.getStats());
    const config = await uiMaster.generate(stats);
    
    return config;
  },

  // Track user action
  async track_user(job) {
    const { userId, action, bookId, chapter } = job.data;
    return await userIntelligence.trackAction(userId, action);
  },

  // Health check
  async health_check(job) {
    return await supervisor.runHealthCheck();
  }
};

// Initialize all queues
export async function initializeQueues() {
  const jobTypes = ['generate_book', 'generate_ui', 'track_user', 'health_check'];
  
  for (const jobType of jobTypes) {
    queues[jobType] = new Queue(jobType, {
      defaultJobOptions: {
        attempts: config.queue.jobSettings.attempts,
        backoff: config.queue.jobSettings.backoff,
        removeOnComplete: config.queue.jobSettings.removeOnComplete,
        removeOnFailed: config.queue.jobSettings.removeOnFailed
      }
    });

    // Create worker for each queue
    workers[jobType] = new Worker(jobType, async (job) => {
      const processor = processors[jobType];
      if (processor) {
        return await processor(job);
      }
    }, {
      concurrency: 1,
      limiter: {
        max: 1,
        duration: 60000
      }
    });

    workers[jobType].on('completed', (job) => {
      console.log(`✅ ${jobType} completed`);
      broadcast('job_completed', { job: jobType, id: job.id });
    });

    workers[jobType].on('failed', (job, err) => {
      console.error(`❌ ${jobType} failed:`, err.message);
      broadcast('job_failed', { job: jobType, error: err.message });
    });
  }

  console.log('✅ Queues initialized');
}

// Add job to queue
export async function addJob(jobType, data = {}) {
  const queue = queues[jobType];
  if (!queue) {
    throw new Error(`Unknown job type: ${jobType}`);
  }

  const job = await queue.add(jobType, data, {
    priority: data.priority === 'high' ? 1 : 2,
    delay: data.delay || 0
  });

  return job;
}

// Get queue status
export function getQueueStatus() {
  const status = {};
  for (const [name, queue] of Object.entries(queues)) {
    status[name] = {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0
    };
  }
  return status;
}

// Close all queues
export async function closeQueues() {
  for (const worker of Object.values(workers)) {
    await worker.close();
  }
  for (const queue of Object.values(queues)) {
    await queue.close();
  }
  console.log('✅ Queues closed');
}

export { queues, workers };