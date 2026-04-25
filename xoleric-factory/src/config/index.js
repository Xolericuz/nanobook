export default {
  // App Settings
  app: {
    name: 'Xoleric Factory',
    port: 3001,
    env: process.env.NODE_ENV || 'development'
  },

  // Ollama Settings
  ollama: {
    baseUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
    models: {
      ui: 'phi3:3.8b',        // Agent 1: UI/UX Master
      story: 'phi3:3.8b',        // Agent 2: Book Generator
      analysis: 'phi3:3.8b',      // Agent 3: User Intelligence
      control: 'phi3:3.8b'       // Agent 4: Supervisor
    },
    timeout: 180000,
    retryAttempts: 3
  },

  // Queue Settings
  queue: {
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    },
    jobSettings: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000
      },
      removeOnComplete: 100,
      removeOnFailed: 50
    }
  },

  // Scheduler Settings
  scheduler: {
    timezone: 'Asia/Tashkent',
    jobs: [
      {
        name: 'daily_book_generation',
        cron: '0 10 * * *',  // Har kuni 10:00 da
        description: 'Kuniga 1 ta kitob generatsiya'
      },
      {
        name: 'weekly_analytics',
        cron: '0 0 * * 0',   // Har yakshanba
        description: 'Haftalik analytics'
      },
      {
        name: 'hourly_health_check',
        cron: '0 * * * *',  // Har soat
        description: 'Tizim salomatligi tekshirish'
      }
    ]
  },

  // Dashboard Settings
  dashboard: {
    port: 3002,
    wsPort: 3003
  },

  // Audit Log Settings
  audit: {
    enabled: true,
    storagePath: './logs',
    retentionDays: 90,
    hashAlgorithm: 'sha256'
  },

  // Book Generation Settings
  book: {
    minPages: 100,
    minCharsPerPage: 700,
    categories: [
      'Falsafa', 'Texnologiya', 'Psixologiya', 'Hikoya', 
      'Sci-Fi', 'Biznes', 'Drama', 'Fantasy', 'Detektiv', 'Eksperimental'
    ],
    seeds: {
      useUniqueSeed: true,
      includeTimestamp: true,
      includeRandom: true
    }
  },

  // Statistics
  stats: {
    trackInterval: 60000,  // Har 1 daqiqa
    maxHistory: 1000
  }
};