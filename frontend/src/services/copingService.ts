import api from './api';
import { CopingTool, Affirmation } from '../types';

export const copingService = {
  async getTools(category?: string, difficulty?: string): Promise<CopingTool[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty);
    
    const response = await api.get(`/coping/tools/?${params.toString()}`);
    return response.data;
  },

  async getTool(id: number): Promise<CopingTool> {
    const response = await api.get(`/coping/tools/${id}/`);
    return response.data;
  },

  async getRecommendedTool(emotion?: string): Promise<CopingTool> {
    const url = emotion ? `/coping/recommend/?emotion=${emotion}` : '/coping/recommend/';
    const response = await api.get(url);
    return response.data;
  },

  async logUsage(data: {
    tool: number;
    completed?: boolean;
    mood_before?: number;
    mood_after?: number;
    feedback?: string;
  }): Promise<void> {
    await api.post('/coping/usage/', data);
  },

  async getAffirmation(category?: string): Promise<Affirmation> {
    const url = category ? `/coping/affirmation/?category=${category}` : '/coping/affirmation/';
    const response = await api.get(url);
    return response.data;
  },

  async getStats(): Promise<{
    total_sessions: number;
    completed_sessions: number;
    most_used_tools: Array<{ tool__title: string; count: number }>;
    average_mood_improvement: number;
  }> {
    const response = await api.get('/coping/stats/');
    return response.data;
  },
};
