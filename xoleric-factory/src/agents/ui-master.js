import config from '../../config/index.js';
import { broadcast } from '../api/server.js';

// Agent 1: UI/UX Master
// Generates UI updates and theme configurations

const SYSTEM_PROMPT = `Sen UI/UX Master professional designerasan.
Har kuni yangi theme yoki feature taklif qilishing kerak.
Chiqarish formati:
{
  "theme": "dark minimal",
  "font": "Inter",
  "layout": "grid", 
  "feature": "daily book highlight",
  "colors": {
    "primary": "#6366f1",
    "secondary": "#8b5cf6"
  }
}`;

export class UIMasterAgent {
  constructor() {
    this.name = 'UIMaster';
    this.model = config.ollama.models.ui;
    this.lastRun = null;
    this.status = 'idle';
  }

  async generate(config) {
    const prompt = `${SYSTEM_PROMPT}

Hozirgi holat: ${config.currentTheme}
Foydalanuvchilar soni: ${config.activeUsers}

Yangi theme taklif qil:`;

    try {
      this.status = 'running';
      broadcast('agent_status', { agent: this.name, status: 'running' });

      const response = await this.callOllama({
        model: this.model,
        prompt: prompt,
        stream: false
      });

      const result = this.parseResponse(response);
      
      this.status = 'idle';
      this.lastRun = Date.now();
      broadcast('agent_status', { agent: this.name, status: 'idle', result });

      return result;
    } catch (error) {
      this.status = 'error';
      console.error('UIMaster error:', error.message);
      throw error;
    }
  }

  async callOllama(payload) {
    const response = await fetch(`${config.ollama.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: payload.model,
        prompt: payload.prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 500
        }
      })
    });

    const data = await response.json();
    return data.response;
  }

  parseResponse(response) {
    try {
      // Try to parse JSON from response
      const match = response.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch (e) {
      // If parse fails, return default
    }
    return { theme: 'dark minimal', font: 'Inter', layout: 'grid' };
  }

  getStatus() {
    return {
      name: this.name,
      status: this.status,
      lastRun: this.lastRun
    };
  }
}

export default new UIMasterAgent();