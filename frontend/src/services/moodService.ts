import api from './api';
import { MoodEntry, MoodStats } from '../types';

export const moodService = {
  async getMoodEntries(startDate?: string, endDate?: string): Promise<MoodEntry[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/mood/entries/?${params.toString()}`);
    return response.data;
  },

  async getTodayMood(): Promise<MoodEntry | null> {
    try {
      const response = await api.get('/mood/today/');
      return response.data;
    } catch {
      return null;
    }
  },

  async createMoodEntry(data: {
    mood_score: number;
    emotions?: string[];
    note?: string;
    activities?: string[];
    sleep_quality?: number;
    energy_level?: number;
  }): Promise<MoodEntry> {
    const response = await api.post('/mood/entries/', data);
    return response.data;
  },

  async getMoodStats(period: 'week' | 'month' | 'year' = 'week'): Promise<MoodStats> {
    const response = await api.get(`/mood/stats/?period=${period}`);
    return response.data;
  },
};
