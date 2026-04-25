import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import config from '../config/index.js';
import { getStats, resetDailyStats } from './stats.js';
import { addJob } from '../queue/index.js';
import { getAuditLog } from '../audit/index.js';

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ port: config.dashboard.wsPort });

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Statistics endpoints
app.get('/api/stats', (req, res) => {
  res.json(getStats());
});

app.get('/api/stats/:period', (req, res) => {
  const { period } = req.params;
  const stats = getStats();
  res.json(stats[period] || stats);
});

// Manual book generation
app.post('/api/generate/book', async (req, res) => {
  try {
    const job = await addJob('generate_book', { priority: req.body.priority || 'normal' });
    res.json({ success: true, jobId: job.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate UI update
app.post('/api/generate/ui', async (req, res) => {
  try {
    const job = await addJob('generate_ui', { theme: req.body.theme });
    res.json({ success: true, jobId: job.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User analytics
app.post('/api/user/track', async (req, res) => {
  try {
    const { userId, action, bookId, chapter } = req.body;
    const job = await addJob('track_user', { userId, action, bookId, chapter });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Audit log
app.get('/api/audit', (req, res) => {
  const { limit = 50 } = req.query;
  res.json(getAuditLog(parseInt(limit)));
});

// Agent status
app.get('/api/agents/status', (req, res) => {
  const queue = await import('../queue/index.js');
  res.json({
    agents: {
      ui_master: { status: 'idle', lastRun: null },
      book_generator: { status: 'idle', lastRun: null },
      user_intelligence: { status: 'idle', lastRun: null },
      supervisor: { status: 'idle', lastRun: null }
    }
  });
});

// WebSocket for real-time updates
wss.on('connection', (ws) => {
  console.log('Dashboard connected');
  
  // Send initial stats
  ws.send(JSON.stringify({ type: 'stats', data: getStats() }));
  
  ws.on('close', () => {
    console.log('Dashboard disconnected');
  });
});

// Broadcast function for real-time updates
export function broadcast(type, data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type, data }));
    }
  });
}

// Start server
const PORT = config.app.port;
httpServer.listen(PORT, () => {
  console.log(`🚀 Xoleric Factory API running on port ${PORT}`);
  console.log(`📊 Dashboard WS on port ${config.dashboard.wsPort}`);
});

export { app, httpServer, broadcast };