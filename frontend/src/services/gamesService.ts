import api from './api';

export interface TherapeuticGame {
  id: number;
  name: string;
  description: string;
  emotion_category: string;
  emotion_display: string;
  game_type: string;
  game_type_display: string;
  emoji: string;
  thumbnail_url: string | null;
  game_url: string | null;
  is_browser_playable: boolean;
  therapeutic_benefit: string;
  intensity_level: number;
  avg_duration_minutes: number;
}

export interface GameSession {
  id: number;
  game: TherapeuticGame;
  emotion_before: string;
  emotion_intensity_before: number;
  emotion_after: string | null;
  emotion_intensity_after: number | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  was_helpful: boolean | null;
  notes: string | null;
}

export interface EmotionCategory {
  code: string;
  name: string;
  count: number;
  emoji: string;
}

export interface GameRecommendation {
  emotion: string;
  intensity: number;
  games: TherapeuticGame[];
  message: string;
}

export interface GameStats {
  total_sessions: number;
  emotion_patterns: Array<{ emotion_before: string; count: number }>;
  helpful_rate: number;
  top_games: Array<{ game__name: string; game__emoji: string; count: number }>;
  improvement_rate: number;
}

export interface MultiplayerPlayer {
  id: number;
  username: string;
  symbol: string;
  score: number;
  joined_at: string;
}

export interface MultiplayerGameSession {
  id: number;
  room_code: string;
  game_type: string;
  host: number;
  host_username: string;
  player_list: MultiplayerPlayer[];
  player_count: number;
  max_players: number;
  status: 'waiting' | 'in-progress' | 'finished' | 'abandoned';
  game_state: {
    board: string[];
    turn: 'X' | 'O';
    winner: 'X' | 'O' | 'draw' | null;
  };
  created_at: string;
  updated_at: string;
}

const gamesService = {
  // Get all games
  getGames: async (params?: { emotion?: string; type?: string; intensity?: number }): Promise<TherapeuticGame[]> => {
    const response = await api.get('/games/games/', { params });
    return response.data;
  },

  // Get game by ID
  getGame: async (id: number): Promise<TherapeuticGame> => {
    const response = await api.get(`/games/games/${id}/`);
    return response.data;
  },

  // Get emotion categories
  getCategories: async (): Promise<EmotionCategory[]> => {
    const response = await api.get('/games/games/categories/');
    return response.data;
  },

  // Get game recommendations based on emotion
  getRecommendations: async (emotion: string, intensity: number = 3, context?: string): Promise<GameRecommendation> => {
    const response = await api.post('/games/games/recommend/', {
      emotion,
      intensity,
      context,
    });
    return response.data;
  },

  // Start a game session
  startSession: async (gameId: number, emotionBefore: string, intensityBefore: number): Promise<GameSession> => {
    const response = await api.post('/games/sessions/', {
      game_id: gameId,
      emotion_before: emotionBefore,
      emotion_intensity_before: intensityBefore,
    });
    return response.data;
  },

  // End a game session
  endSession: async (sessionId: number, data: {
    emotion_after?: string;
    emotion_intensity_after?: number;
    was_helpful?: boolean;
    notes?: string;
  }): Promise<GameSession> => {
    const response = await api.post(`/games/sessions/${sessionId}/end_session/`, data);
    return response.data;
  },

  // Get user's game sessions
  getSessions: async (): Promise<GameSession[]> => {
    const response = await api.get('/games/sessions/');
    return response.data;
  },

  // Get gaming stats
  getStats: async (): Promise<GameStats> => {
    const response = await api.get('/games/sessions/stats/');
    return response.data;
  },

  // --- Multiplayer Game Services ---

  // Create a new multiplayer game room
  createGameRoom: async (gameType: string = 'tic-tac-toe'): Promise<MultiplayerGameSession> => {
    const response = await api.post('/games/multiplayer/create/', { game_type: gameType });
    return response.data;
  },

  // Join an existing game room
  joinGameRoom: async (roomCode: string): Promise<MultiplayerGameSession> => {
    const response = await api.post(`/games/multiplayer/${roomCode}/join/`);
    return response.data;
  },

  // Get game room details
  getGameRoom: async (roomCode: string): Promise<MultiplayerGameSession> => {
    const response = await api.get(`/games/multiplayer/${roomCode}/`);
    return response.data;
  },

  // Make a move in a game
  makeMove: async (roomCode: string, position: number): Promise<MultiplayerGameSession> => {
    const response = await api.post(`/games/multiplayer/${roomCode}/move/`, { position });
    return response.data;
  },
};

export default gamesService;
