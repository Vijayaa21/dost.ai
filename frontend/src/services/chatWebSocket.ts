/**
 * WebSocket service for real-time chat communication with Dost AI.
 *
 * Handles connection lifecycle, JWT auth via query string, automatic
 * reconnection, and typed message dispatch to registered handlers.
 */

export interface ChatWSMessage {
  type: 'typing' | 'message' | 'error';
  is_typing?: boolean;
  message?: string;
  user_message?: {
    id: number;
    role: 'user';
    content: string;
    detected_emotion: string | null;
    is_crisis: boolean;
    created_at: string;
  };
  assistant_message?: {
    id: number;
    role: 'assistant';
    content: string;
    is_crisis: boolean;
    created_at: string;
  };
  coping_suggestion?: {
    show_coping: boolean;
    message: string;
    category: string;
    exercises: Array<{
      name: string;
      id: number;
      duration: string;
    }>;
  };
}

type ChatMessageHandler = (message: ChatWSMessage) => void;

class ChatWebSocket {
  private socket: WebSocket | null = null;
  private conversationId: number | null = null;
  private messageHandlers: Set<ChatMessageHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  /**
   * Connect to a chat conversation via WebSocket.
   */
  connect(conversationId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        if (this.conversationId === conversationId) {
          resolve();
          return;
        }
        this.disconnect();
      }

      if (this.isConnecting) {
        reject(new Error('Already connecting'));
        return;
      }

      this.isConnecting = true;
      this.conversationId = conversationId;

      const token = localStorage.getItem('access_token');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = import.meta.env.VITE_WS_URL || window.location.host;

      const wsUrl = `${protocol}//${host}/ws/chat/${conversationId}/${token ? `?token=${token}` : ''}`;

      try {
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log(`[ChatWS] Connected to conversation: ${conversationId}`);
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const message: ChatWSMessage = JSON.parse(event.data);
            this.messageHandlers.forEach((handler) => handler(message));
          } catch (error) {
            console.error('[ChatWS] Failed to parse message:', error);
          }
        };

        this.socket.onclose = (event) => {
          console.log('[ChatWS] Disconnected:', event.code, event.reason);
          this.isConnecting = false;

          // Attempt to reconnect if not a clean close
          if (
            event.code !== 1000 &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            this.attemptReconnect();
          }
        };

        this.socket.onerror = (error) => {
          console.error('[ChatWS] Error:', error);
          this.isConnecting = false;
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Attempt to reconnect after disconnection.
   */
  private attemptReconnect(): void {
    if (!this.conversationId || this.isConnecting) return;

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(
      `[ChatWS] Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`
    );

    setTimeout(() => {
      if (this.conversationId) {
        this.connect(this.conversationId).catch(console.error);
      }
    }, delay);
  }

  /**
   * Disconnect from the WebSocket.
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, 'Client disconnecting');
      this.socket = null;
    }
    this.conversationId = null;
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }

  /**
   * Send a chat message through the WebSocket.
   */
  sendMessage(message: string): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('[ChatWS] Cannot send - not connected');
      return;
    }
    this.socket.send(JSON.stringify({ message }));
  }

  /**
   * Register a handler for incoming messages.
   * Returns a cleanup function to remove the handler.
   */
  onMessage(handler: ChatMessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Check if the WebSocket is currently connected.
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Get the current conversation ID.
   */
  getConversationId(): number | null {
    return this.conversationId;
  }
}

// Export singleton instance
const chatWebSocket = new ChatWebSocket();
export default chatWebSocket;
