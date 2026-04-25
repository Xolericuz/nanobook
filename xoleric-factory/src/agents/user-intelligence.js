import config from '../../config/index.js';
import { broadcast } from '../api/server.js';

// Agent 3: User Intelligence
// Learns user preferences and recommends books

const SYSTEM_PROMPT = `Sen user intelligence expertasan. 
Foydalanuvchi haqida ma'lumot to'play va tavsiyalar berasan.
Chiqarish:
{
  "user_type": "fantasy lover", 
  "recommended_style": "epic storytelling",
  "preferred_genres": ["Fantasy", "Sci-Fi"],
  "reading_pattern": "evening"
}`;

export class UserIntelligenceAgent {
  constructor() {
    this.name = 'UserIntelligence';
    this.model = config.ollama.models.analysis;
    this.lastRun = null;
    this.status = 'idle';
    this.userProfiles = new Map();
  }

  async trackAction(userId, action) {
    try {
      this.status = 'running';
      broadcast('agent_status', { agent: this.name, status: 'running' });

      // Get or create user profile
      let profile = this.userProfiles.get(userId) || this.createProfile(userId);

      // Update profile based on action
      this.updateProfile(profile, action);

      // Save profile
      this.userProfiles.set(userId, profile);

      // Generate recommendations
      const recommendations = await this.generateRecommendations(profile);

      this.status = 'idle';
      this.lastRun = Date.now();
      broadcast('agent_status', { agent: this.name, status: 'idle' });

      return recommendations;
    } catch (error) {
      this.status = 'error';
      console.error('UserIntelligence error:', error.message);
      throw error;
    }
  }

  createProfile(userId) {
    return {
      userId,
      genres: [],
      readingHistory: [],
      completedBooks: [],
      favoriteAuthors: [],
      readingTimes: [],
      preferences: {},
      createdAt: Date.now()
    };
  }

  updateProfile(profile, action) {
    const { type, bookId, chapter, category, timestamp } = action;

    switch (type) {
      case 'start_reading':
        profile.readingHistory.push({ bookId, category, startTime: timestamp || Date.now() });
        break;
      case 'finish_chapter':
        profile.readingHistory.push({ bookId, chapter, timestamp: timestamp || Date.now() });
        break;
      case 'complete_book':
        profile.completedBooks.push({ bookId, timestamp: timestamp || Date.now() });
        break;
      case 'favorite':
        profile.preferences.favorites = profile.preferences.favorites || [];
        profile.preferences.favorites.push(bookId);
        break;
      case 'like_genre':
        if (!profile.genres.includes(category)) {
          profile.genres.push(category);
        }
        break;
    }

    profile.lastActive = Date.now();
  }

  async generateRecommendations(profile) {
    // Analyze reading patterns
    const genreCounts = {};
    profile.readingHistory.forEach(entry => {
      if (entry.category) {
        genreCounts[entry.category] = (genreCounts[entry.category] || 0) + 1;
      }
    });

    // Find favorite genres
    const favoriteGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre);

    // Determine user type
    let userType = 'casual_reader';
    if (profile.completedBooks.length > 10) userType = 'avid_reader';
    if (favoriteGenres.includes('Fantasy') || favoriteGenres.includes('Sci-Fi')) {
      userType = 'fantasy_lover';
    }
    if (favoriteGenres.includes('Biznes') || favoriteGenres.includes('Falsafa')) {
      userType = 'non_fiction_lover';
    }

    return {
      user_type: userType,
      preferred_genres: favoriteGenres,
      recommended_style: this.getRecommendedStyle(userType),
      completed_count: profile.completedBooks?.length || 0,
      reading_streak: this.calculateStreak(profile)
    };
  }

  getRecommendedStyle(userType) {
    const styles = {
      casual_reader: 'light_entertaining',
      avid_reader: 'deep_detailed',
      fantasy_lover: 'epic_storytelling',
      non_fiction_lover: 'informative_analytical'
    };
    return styles[userType] || 'balanced';
  }

  calculateStreak(profile) {
    // Simplified streak calculation
    if (!profile.readingHistory || profile.readingHistory.length === 0) return 0;
    return Math.min(profile.readingHistory.length, 30);
  }

  getProfile(userId) {
    return this.userProfiles.get(userId);
  }

  getAllProfiles() {
    return Array.from(this.userProfiles.values());
  }

  getStatus() {
    return {
      name: this.name,
      status: this.status,
      lastRun: this.lastRun,
      userCount: this.userProfiles.size
    };
  }
}

export default new UserIntelligenceAgent();