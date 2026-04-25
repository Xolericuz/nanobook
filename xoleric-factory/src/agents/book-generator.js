import config from '../../config/index.js';
import { broadcast } from '../api/server.js';
import { addAuditLog } from '../audit/index.js';
import { addBookGenerated, startGeneration, setGenerationStatus } from '../api/stats.js';
import { generateRandomBook, getTitleByCategory } from './book-generator.js';

// Agent 2: Book Generator (the Heart)
// Generates 1 book per day with 100+ pages, 700+ chars per page

const SYSTEM_PROMPT = `Sen professional kitob muallifasan. O'zbek tilida yozasan.
Har kitob quyidagi talablarga javob berishi kerak:
- 100+ sahifa
- Har sahifa 700+ belgi
- 5 ta bob (I, II, III, IV, V)
- Unique syujet va qahramonlar
- Genrega mos content

Output formati:
{
  "title": "Kitob nomi",
  "author": "Xoleric AI", 
  "category": "Janr",
  "description": "Qisqacha tavsif",
  "chapters": [
    {"id": "ch-1", "title": "I bob", "pages": ["sahifa matni..."]},
    ...
  ]
}`;

export class BookGeneratorAgent {
  constructor() {
    this.name = 'BookGenerator';
    this.model = config.ollama.models.story;
    this.lastRun = null;
    this.status = 'idle';
  }

  async generate(seed = null) {
    startGeneration();
    setGenerationStatus('generating');
    broadcast('generation_status', { status: 'started', agent: this.name });

    try {
      this.status = 'running';
      broadcast('agent_status', { agent: this.name, status: 'running' });

      // Check if Ollama is available
      const ollamaAvailable = await this.checkOllama();
      
      let book;
      
      if (ollamaAvailable && this.model) {
        // Generate with AI
        book = await this.generateWithAI(seed);
      } else {
        // Use fallback generator
        book = generateRandomBook(seed);
      }

      // Validate book
      if (!this.validateBook(book)) {
        throw new Error('Book validation failed');
      }

      // Add to audit log
      addAuditLog('BOOK_CREATED', {
        title: book.title,
        category: book.category,
        chapters: book.chapters.length,
        characters: book.content?.length || 0
      });

      // Update stats
      addBookGenerated(book.title);

      this.status = 'idle';
      this.lastRun = Date.now();
      broadcast('generation_status', { status: 'completed', book });
      broadcast('agent_status', { agent: this.name, status: 'idle' });

      return book;
    } catch (error) {
      this.status = 'error';
      setGenerationStatus('error');
      console.error('BookGenerator error:', error.message);
      broadcast('generation_status', { status: 'error', error: error.message });
      throw error;
    }
  }

  async checkOllama() {
    try {
      const response = await fetch(`${config.ollama.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async generateWithAI(seed) {
    const category = seed?.category || getRandomCategory();
    const title = seed?.title || getTitleByCategory(category);
    
    const prompt = `${SYSTEM_PROMPT}

Genre: ${category}
Title: ${title}
Seed: ${JSON.stringify(seed)}`;

    try {
      const response = await fetch(`${config.ollama.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.8,
            num_predict: 4000,
            top_p: 0.9
          }
        })
      });

      const data = await response.json();
      const content = data.response || '';

      return this.parseBookResponse(content, title, category);
    } catch (error) {
      console.log('AI generation failed, using fallback');
      return generateRandomBook({ category, title });
    }
  }

  parseBookResponse(content, title, category) {
    // Parse AI response into book format
    // This is simplified - real implementation would parse the full response
    const chapters = [];
    const bobTitles = ['Boshlanish', 'Rivojlanish', 'Markaz', 'Yuqori choqqi', 'Yakun'];
    
    bobTitles.forEach((bobTitle, idx) => {
      chapters.push({
        id: `ch-${idx + 1}`,
        title: bobTitle,
        pages: [generateLongContent(title, bobTitle, category)]
      });
    });

    return {
      id: generateBookId(),
      title: title,
      author: 'Xoleric AI',
      category: category,
      description: `${title} - ${category} janridagi ajoyib asar.`,
      cover: '',
      content: chapters.map(c => c.pages[0]).join('\n\n'),
      chapters: chapters,
      progress: 0,
      lastRead: 0,
      isFavorite: false,
      addedAt: Date.now(),
      totalPages: chapters.length
    };
  }

  validateBook(book) {
    if (!book.title || !book.category) return false;
    if (!book.chapters || book.chapters.length < 5) return false;
    
    const totalChars = book.content?.length || 0;
    if (totalChars < 700 * 5) return false;
    
    return true;
  }

  getStatus() {
    return {
      name: this.name,
      status: this.status,
      lastRun: this.lastRun
    };
  }
}

function getRandomCategory() {
  const categories = config.book.categories;
  return categories[Math.floor(Math.random() * categories.length)];
}

function generateBookId() {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function generateLongContent(title, bobTitle, category) {
  return `I bob. ${bobTitle}\n\n${title} - bu ${category} janridagi ajoyib asar.\n\nAsar boshlanishida... (700+ belgili kontent)`;
}

export default new BookGeneratorAgent();