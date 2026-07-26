import api from './api';
import { Conversation, Message } from '../types';
import { petService } from './petService';
import chatWebSocket, { ChatWSMessage } from './chatWebSocket';

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

  /**
   * Send a message via the REST API (original method, kept as fallback).
   */
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

  /**
   * Send a message via WebSocket for real-time delivery.
   * Falls back to REST if the WebSocket is not connected.
   *
   * @param message     The user's message text
   * @param conversationId  The conversation to send within
   * @param onTyping    Callback when the AI starts/stops typing
   * @param onMessage   Callback when the full response arrives
   * @param onError     Callback on error
   */
  async sendMessageWS(
    message: string,
    conversationId: number,
    onTyping?: (isTyping: boolean) => void,
    onMessage?: (data: ChatWSMessage) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    // Ensure we're connected to the right conversation
    if (
      !chatWebSocket.isConnected() ||
      chatWebSocket.getConversationId() !== conversationId
    ) {
      try {
        await chatWebSocket.connect(conversationId);
      } catch {
        // WebSocket connection failed — caller should fall back to REST
        onError?.('WebSocket connection failed');
        return;
      }
    }

    // Register a one-shot handler for the response
    const cleanup = chatWebSocket.onMessage((msg) => {
      if (msg.type === 'typing' && onTyping) {
        onTyping(msg.is_typing ?? false);
      } else if (msg.type === 'message') {
        onTyping?.(false);
        onMessage?.(msg);
        cleanup(); // Remove handler after receiving the response

        // Award XP to pet for chatting (fire-and-forget)
        petService.interact('chat', 'Had a conversation').catch(() => {});
      } else if (msg.type === 'error') {
        onTyping?.(false);
        onError?.(msg.message ?? 'Unknown error');
        cleanup();
      }
    });

    // Send the message
    chatWebSocket.sendMessage(message);
  },

  /**
   * Disconnect the chat WebSocket (e.g. when leaving the chat page).
   */
  disconnectWS(): void {
    chatWebSocket.disconnect();
  },

  async deleteAllHistory(): Promise<void> {
    await api.delete('/chat/delete-history/');
  },
};
