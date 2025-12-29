import api from './api';
import { JournalEntry, JournalPrompt } from '../types';

export const journalService = {
  async getEntries(search?: string, tag?: string): Promise<JournalEntry[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (tag) params.append('tag', tag);
    
    const response = await api.get(`/journal/entries/?${params.toString()}`);
    return response.data;
  },

  async getEntry(id: number): Promise<JournalEntry> {
    const response = await api.get(`/journal/entries/${id}/`);
    return response.data;
  },

  async createEntry(data: {
    title?: string;
    content: string;
    tags?: string[];
    mood_at_writing?: number;
    ai_reflection_enabled?: boolean;
  }): Promise<JournalEntry> {
    const response = await api.post('/journal/entries/', data);
    return response.data;
  },

  async updateEntry(id: number, data: Partial<JournalEntry>): Promise<JournalEntry> {
    const response = await api.patch(`/journal/entries/${id}/`, data);
    return response.data;
  },

  async deleteEntry(id: number): Promise<void> {
    await api.delete(`/journal/entries/${id}/`);
  },

  async getPrompt(category?: string): Promise<JournalPrompt> {
    const url = category ? `/journal/prompt/?category=${category}` : '/journal/prompt/';
    const response = await api.get(url);
    return response.data;
  },

  async getStats(): Promise<{
    total_entries: number;
    tag_frequency: Record<string, number>;
    writing_streak: number;
  }> {
    const response = await api.get('/journal/stats/');
    return response.data;
  },
};
