import { useState, useEffect, useCallback, useRef } from 'react';
import gameWebSocket, { GameState, PlayerInfo, GameUpdateMessage } from '../services/gameWebSocket';

interface UseGameWebSocketOptions {
  roomCode: string | null;
  onGameUpdate?: (state: GameState, status: string, players: PlayerInfo[]) => void;
  onChatMessage?: (message: string, username: string) => void;
  onError?: (error: string) => void;
  autoJoin?: boolean;
}

interface UseGameWebSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  makeMove: (gameState: GameState) => void;
  sendChat: (message: string) => void;
  requestState: () => void;
  joinGame: () => void;
  players: PlayerInfo[];
  gameState: GameState | null;
  status: string | null;
}

export default function useGameWebSocket({
  roomCode,
  onGameUpdate,
  onChatMessage,
  onError,
  autoJoin = true,
}: UseGameWebSocketOptions): UseGameWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [players, setPlayers] = useState<PlayerInfo[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  
  const onGameUpdateRef = useRef(onGameUpdate);
  const onChatMessageRef = useRef(onChatMessage);
  const onErrorRef = useRef(onError);

  // Keep refs updated
  useEffect(() => {
    onGameUpdateRef.current = onGameUpdate;
    onChatMessageRef.current = onChatMessage;
    onErrorRef.current = onError;
  }, [onGameUpdate, onChatMessage, onError]);

  // Handle incoming messages
  useEffect(() => {
    const handleMessage = (message: GameUpdateMessage) => {
      switch (message.type) {
        case 'game_update':
        case 'game_state':
          if (message.game_state) {
            setGameState(message.game_state);
          }
          if (message.status) {
            setStatus(message.status);
          }
          if (message.players) {
            setPlayers(message.players);
          }
          if (onGameUpdateRef.current && message.game_state && message.status && message.players) {
            onGameUpdateRef.current(message.game_state, message.status, message.players);
          }
          break;
        
        case 'chat_message':
          if (onChatMessageRef.current && message.message && message.username) {
            onChatMessageRef.current(message.message, message.username);
          }
          break;
        
        case 'error':
          if (onErrorRef.current && message.message) {
            onErrorRef.current(message.message);
          }
          break;
      }
    };

    const unsubscribe = gameWebSocket.onMessage(handleMessage);
    return () => unsubscribe();
  }, []);

  // Connect to WebSocket when roomCode changes
  useEffect(() => {
    if (!roomCode) {
      setIsConnected(false);
      return;
    }

    const connectAndJoin = async () => {
      setIsConnecting(true);
      try {
        await gameWebSocket.connect(roomCode);
        setIsConnected(true);
        
        if (autoJoin) {
          gameWebSocket.joinGame();
        }
      } catch (error) {
        console.error('[useGameWebSocket] Connection failed:', error);
        setIsConnected(false);
        if (onErrorRef.current) {
          onErrorRef.current('Failed to connect to game server');
        }
      } finally {
        setIsConnecting(false);
      }
    };

    connectAndJoin();

    return () => {
      // Only disconnect if we're leaving this specific room
      if (gameWebSocket.getRoomCode() === roomCode) {
        gameWebSocket.disconnect();
        setIsConnected(false);
      }
    };
  }, [roomCode, autoJoin]);

  const connect = useCallback(async () => {
    if (!roomCode) return;
    setIsConnecting(true);
    try {
      await gameWebSocket.connect(roomCode);
      setIsConnected(true);
    } catch (error) {
      console.error('[useGameWebSocket] Connection failed:', error);
      if (onErrorRef.current) {
        onErrorRef.current('Failed to connect to game server');
      }
    } finally {
      setIsConnecting(false);
    }
  }, [roomCode]);

  const disconnect = useCallback(() => {
    gameWebSocket.disconnect();
    setIsConnected(false);
  }, []);

  const makeMove = useCallback((state: GameState) => {
    if (!isConnected) {
      console.error('[useGameWebSocket] Not connected');
      return;
    }
    gameWebSocket.makeMove(state);
  }, [isConnected]);

  const sendChat = useCallback((message: string) => {
    if (!isConnected) return;
    gameWebSocket.sendChatMessage(message);
  }, [isConnected]);

  const requestState = useCallback(() => {
    if (!isConnected) return;
    gameWebSocket.getState();
  }, [isConnected]);

  const joinGame = useCallback(() => {
    if (!isConnected) return;
    gameWebSocket.joinGame();
  }, [isConnected]);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    makeMove,
    sendChat,
    requestState,
    joinGame,
    players,
    gameState,
    status,
  };
}
