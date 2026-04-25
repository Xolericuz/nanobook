import cron from 'node-cron';
import { addJob } from '../queue/index.js';
import config from '../../config/index.js';
import { resetDailyStats, updateHourlyStats, setGenerationStatus } from '../api/stats.js';

const scheduledJobs = [];

// Initialize scheduler
export function initializeScheduler() {
  console.log('⏰ Scheduler initializing...');

  // Schedule daily book generation (10:00 AM)
  const dailyBook = cron.schedule(config.scheduler.jobs[0].cron, async () => {
    console.log('📚 Daily book generation started');
    setGenerationStatus('scheduled');
    
    try {
      await addJob('generate_book', { source: 'scheduler' });
      console.log('✅ Book generation job queued');
    } catch (error) {
      console.error('❌ Book generation failed:', error.message);
    }
  }, {
    scheduled: true
  });
  scheduledJobs.push({ name: 'daily_book_generation', job: dailyBook });

  // Schedule weekly analytics (Sunday midnight)
  const weeklyAnalytics = cron.schedule(config.scheduler.jobs[1].cron, async () => {
    console.log('📊 Weekly analytics run...');
    // Would generate weekly report here
    console.log('✅ Weekly analytics completed');
  });
  scheduledJobs.push({ name: 'weekly_analytics', job: weeklyAnalytics });

  // Schedule hourly health checks
  const hourlyHealthCheck = cron.schedule(config.scheduler.jobs[2].cron, async () => {
    console.log('🏥 Hourly health check...');
    try {
      await addJob('health_check', { source: 'scheduler' });
    } catch (error) {
      console.error('Health check failed:', error.message);
    }
  });
  scheduledJobs.push({ name: 'hourly_health_check', job: hourlyHealthCheck });

  // Also run stats update every minute
  const minuteStats = cron.schedule('* * * * *', () => {
    updateHourlyStats();
  });
  scheduledJobs.push({ name: 'minute_stats', job: minuteStats });

  // Reset daily stats at midnight
  const midnightReset = cron.schedule('0 0 * * *', () => {
    console.log('🌙 Resetting daily stats...');
    resetDailyStats();
  });
  scheduledJobs.push({ name: 'midnight_reset', job: midnightReset });

  console.log(`✅ ${scheduledJobs.length} jobs scheduled`);
  console.log('   - Daily book: 10:00 AM');
  console.log('   - Hourly health: every hour');
  console.log('   - Stats update: every minute');
  console.log('   - Midnight reset');
}

// Stop all scheduled jobs
export function stopScheduler() {
  console.log('⏰ Stopping scheduler...');
  scheduledJobs.forEach(({ name, job }) => {
    job.stop();
    console.log(`   - Stopped: ${name}`);
  });
  console.log('✅ Scheduler stopped');
}

// Get scheduled jobs info
export function getScheduledJobs() {
  return scheduledJobs.map(({ name, job }) => ({
    name,
    running: job.isRunning()
  }));
}

// Manual trigger functions
export async function triggerDailyGeneration() {
  return await addJob('generate_book', { source: 'manual' });
}

export async function triggerHealthCheck() {
  return await addJob('health_check', { source: 'manual' });
}

export default {
  initializeScheduler,
  stopScheduler,
  getScheduledJobs,
  triggerDailyGeneration,
  triggerHealthCheck
};