// In-memory statistics (can be replaced with Redis for production)

let stats = {
  // Core metrics
  totalBooks: 100,
  todayBooks: 0,
  activeUsers: 0,
  aiActionsCount: 0,
  
  // Generation state
  currentGeneration: 'idle',
  lastBookTime: null,
  lastBookTitle: null,
  
  // Timestamps
  startedAt: Date.now(),
  lastUpdate: Date.now(),
  
  // Historical data
  daily: [],
  hourly: [],
  weekly: []
};

const maxHistory = 1000;

// Initialize with existing books count
export function initializeStats(existingBooksCount) {
  stats.totalBooks = existingBooksCount;
  stats.lastUpdate = Date.now();
}

// Get current stats
export function getStats() {
  return {
    ...stats,
    uptime: Date.now() - stats.startedAt
  };
}

// Increment today's books count
export function addBookGenerated(title) {
  stats.todayBooks++;
  stats.totalBooks++;
  stats.currentGeneration = 'completed';
  stats.lastBookTime = new Date().toISOString();
  stats.lastBookTitle = title;
  stats.lastUpdate = Date.now();
  stats.aiActionsCount++;
  
  // Add to daily history
  stats.daily.push({
    time: Date.now(),
    books: 1,
    title
  });
  
  // Trim history
  if (stats.daily.length > maxHistory) {
    stats.daily = stats.daily.slice(-maxHistory);
  }
}

// Update generation status
export function setGenerationStatus(status) {
  stats.currentGeneration = status;
  stats.lastUpdate = Date.now();
  stats.aiActionsCount++;
}

// Track user action
export function trackUserAction(userId, action) {
  stats.activeUsers = Math.max(stats.activeUsers, 1); // Simplified
  stats.aiActionsCount++;
}

// Update hourly stats
export function updateHourlyStats() {
  const now = Date.now();
  
  // Add current hour entry
  stats.hourly.push({
    time: now,
    books: stats.todayBooks,
    actions: stats.aiActionsCount
  });
  
  // Keep last 24 hours
  if (stats.hourly.length > 24) {
    stats.hourly = stats.hourly.slice(-24);
  }
}

// Start new generation
export function startGeneration() {
  stats.currentGeneration = 'in_progress';
  stats.lastUpdate = Date.now();
}

// Reset daily stats (called at midnight)
export function resetDailyStats() {
  // Save yesterday's stats to history before resetting
  if (stats.daily.length > 0) {
    stats.weekly.push({
      date: new Date().toISOString(),
      totalBooks: stats.todayBooks,
      totalActions: stats.aiActionsCount
    });
  }
  
  stats.todayBooks = 0;
  stats.currentGeneration = 'idle';
  stats.lastUpdate = Date.now();
}

export default {
  getStats,
  addBookGenerated,
  setGenerationStatus,
  trackUserAction,
  updateHourlyStats,
  startGeneration,
  resetDailyStats,
  initializeStats
};