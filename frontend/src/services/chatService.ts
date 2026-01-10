import api from './api';
import { Conversation, Message } from '../types';
import { petService } from './petService';

export const chatService = {
  async getConversations(): Promise<Conversation[]> {
    const response = await api.get('/chat/conversations/');
    return response.data;
  },

  async getConversation(id: number): Promise<Conversation> {
    const response = await api.get(`/chat/conversations/${id}/`);
    return response.data;
  },

  async createConversation(): Promise<Conversation> {
    const response = await api.post('/chat/conversations/');
    return response.data;
  },

  async deleteConversation(id: number): Promise<void> {
    await api.delete(`/chat/conversations/${id}/`);
  },

  async sendMessage(
    message: string,
    conversationId?: number
  ): Promise<{
    conversation_id: number;
    user_message: Message;
    assistant_message: Message;
  }> {
    const response = await api.post('/chat/send/', {
      message,
      conversation_id: conversationId,
    });
    
    // Award XP to pet for chatting
    try {
      await petService.interact('chat', 'Had a conversation');
    } catch {
      // Pet interaction failed silently
    }
    
    return response.data;
  },

  async deleteAllHistory(): Promise<void> {
    await api.delete('/chat/delete-history/');
  },
};
