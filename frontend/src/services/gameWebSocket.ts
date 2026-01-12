// WebSocket service for real-time game communication

export interface GameState {
  [key: string]: any;
}

export interface PlayerInfo {
  id: number;
  user_id: number;
  username: string;
  symbol: string;
  score: number;
}

export interface GameUpdateMessage {
  type: 'game_update' | 'game_state' | 'chat_message' | 'error';
  game_state?: GameState;
  status?: 'waiting' | 'in-progress' | 'finished' | 'abandoned';
  players?: PlayerInfo[];
  message?: string;
  username?: string;
}

type MessageHandler = (message: GameUpdateMessage) => void;

class GameWebSocket {
  private socket: WebSocket | null = null;
  private roomCode: string | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  /**
   * Connect to a game room via WebSocket
   */
  connect(roomCode: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        if (this.roomCode === roomCode) {
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
      this.roomCode = roomCode;

      const token = localStorage.getItem('access_token');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = import.meta.env.VITE_WS_URL || window.location.host;
      
      // Include token in WebSocket URL for auth
      const wsUrl = `${protocol}//${host}/ws/game/${roomCode}/${token ? `?token=${token}` : ''}`;
      
      try {
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log(`[GameWS] Connected to room: ${roomCode}`);
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const message: GameUpdateMessage = JSON.parse(event.data);
            console.log('[GameWS] Received:', message.type);
            this.messageHandlers.forEach(handler => handler(message));
          } catch (error) {
            console.error('[GameWS] Failed to parse message:', error);
          }
        };

        this.socket.onclose = (event) => {
          console.log(`[GameWS] Disconnected:`, event.code, event.reason);
          this.isConnecting = false;
          
          // Attempt to reconnect if not a clean close
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect();
          }
        };

        this.socket.onerror = (error) => {
          console.error('[GameWS] Error:', error);
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
   * Attempt to reconnect after disconnection
   */
  private attemptReconnect(): void {
    if (!this.roomCode || this.isConnecting) return;

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;
    
    console.log(`[GameWS] Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (this.roomCode) {
        this.connect(this.roomCode).catch(console.error);
      }
    }, delay);
  }

  /**
   * Disconnect from the WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, 'Client disconnecting');
      this.socket = null;
    }
    this.roomCode = null;
    this.reconnectAttempts = 0;
    this.isConnecting = false;
  }

  /**
   * Send a message through the WebSocket
   */
  send(message: Record<string, any>): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('[GameWS] Cannot send - not connected');
      return;
    }
    this.socket.send(JSON.stringify(message));
  }

  /**
   * Join the game room
   */
  joinGame(): void {
    this.send({ type: 'join_game' });
  }

  /**
   * Make a move in the game
   */
  makeMove(gameState: GameState): void {
    this.send({ type: 'make_move', game_state: gameState });
  }

  /**
   * Request current game state
   */
  getState(): void {
    this.send({ type: 'get_state' });
  }

  /**
   * Send a chat message
   */
  sendChatMessage(message: string): void {
    this.send({ type: 'chat_message', message });
  }

  /**
   * Add a message handler
   */
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  /**
   * Get current room code
   */
  getRoomCode(): string | null {
    return this.roomCode;
  }
}

// Export singleton instance
const gameWebSocket = new GameWebSocket();
export default gameWebSocket;
