import config from '../../config/index.js';
import { broadcast } from '../api/server.js';
import { getStats } from '../api/stats.js';

// Agent 4: Supervisor (Control AI)
// Monitors all other agents and generates reports

export class SupervisorAgent {
  constructor() {
    this.name = 'Supervisor';
    this.model = config.ollama.models.control;
    this.status = 'idle';
    this.lastRun = null;
    this.checkHistory = [];
  }

  async runHealthCheck() {
    const timestamp = Date.now();
    
    try {
      this.status = 'running';
      broadcast('agent_status', { agent: this.name, status: 'running' });

      const health = await this.checkHealth();
      const stats = getStats();
      const report = this.generateReport(health, stats);

      this.status = 'idle';
      this.lastRun = timestamp;
      this.checkHistory.push(report);

      // Keep only last 100 checks
      if (this.checkHistory.length > 100) {
        this.checkHistory = this.checkHistory.slice(-100);
      }

      broadcast('supervisor_report', report);
      broadcast('agent_status', { agent: this.name, status: 'idle' });

      return report;
    } catch (error) {
      this.status = 'error';
      console.error('Supervisor error:', error.message);
      throw error;
    }
  }

  async checkHealth() {
    // Check Ollama
    let ollamaStatus = 'offline';
    try {
      const response = await fetch(`${config.ollama.baseUrl}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        ollamaStatus = `online (${data.models?.length || 0} models)`;
      }
    } catch {
      ollamaStatus = 'offline';
    }

    // Check queue (simplified - would check Redis in production)
    const queueStatus = 'unknown';

    // Check generation status
    const stats = getStats();
    const generationStatus = stats.currentGeneration || 'idle';

    return {
      timestamp: new Date().toISOString(),
      services: {
        ollama: ollamaStatus,
        queue: queueStatus,
        generation: generationStatus
      },
      metrics: {
        totalBooks: stats.totalBooks,
        todayBooks: stats.todayBooks,
        aiActions: stats.aiActionsCount,
        uptime: stats.uptime || 0
      },
      status: ollamaStatus.includes('online') ? 'healthy' : 'degraded'
    };
  }

  generateReport(health, stats) {
    let status = 'healthy';
    const issues = [];

    if (health.status === 'degraded') {
      status = 'warning';
      issues.push('Ollama offline or degraded');
    }

    if (stats.todayBooks === 0 && this.shouldHaveGenerated()) {
      status = 'warning';
      issues.push('No books generated today');
    }

    if (stats.aiActionsCount > 10000) {
      status = 'needs_attention';
      issues.push('High AI action count - possible issue');
    }

    return {
      timestamp: new Date().toISOString(),
      status,
      issues,
      health: health.services,
      metrics: health.metrics,
      lastCheck: this.lastRun
    };
  }

  shouldHaveGenerated() {
    // Check if it's past 10 AM today
    const now = new Date();
    const hour = now.getHours();
    return hour >= 10;
  }

  async generateSummary() {
    const stats = getStats();
    const lastCheck = this.checkHistory[this.checkHistory.length - 1];

    const summary = {
      generated_at: new Date().toISOString(),
      overall_status: lastCheck?.status || 'unknown',
      books: {
        total: stats.totalBooks,
        today: stats.todayBooks,
        last_title: stats.lastBookTitle,
        last_generated: stats.lastBookTime
      },
      system: {
        uptime_ms: stats.uptime || 0,
        ai_actions: stats.aiActionsCount
      },
      recent_issues: lastCheck?.issues || []
    };

    return summary;
  }

  getStatus() {
    return {
      name: this.name,
      status: this.status,
      lastRun: this.lastRun,
      checksCount: this.checkHistory.length
    };
  }

  getHistory(limit = 10) {
    return this.checkHistory.slice(-limit);
  }
}

export default new SupervisorAgent();