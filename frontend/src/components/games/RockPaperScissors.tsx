import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Check, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import gamesService, { MultiplayerGameSession } from '../../services/gamesService';

interface RockPaperScissorsProps {
  onBack: () => void;
  onComplete: (wasHelpful: boolean) => void;
  initialRoomCode?: string;
}

type Choice = 'rock' | 'paper' | 'scissors' | null;

const choiceEmojis = {
  rock: '🪨',
  paper: '📄',
  scissors: '✂️',
};

export default function RockPaperScissors({ onBack, initialRoomCode }: RockPaperScissorsProps) {
  const [searchParams] = useSearchParams();
  const [gameSession, setGameSession] = useState<MultiplayerGameSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [myChoice, setMyChoice] = useState<Choice>(null);
  const [opponentChoice, setOpponentChoice] = useState<Choice>(null);
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [view, setView] = useState<'menu' | 'waiting' | 'playing' | 'result'>('menu');
  const [round, setRound] = useState(1);
  const [scores, setScores] = useState({ me: 0, opponent: 0 });
  const [isPlayer1, setIsPlayer1] = useState<boolean | null>(null);

  useEffect(() => {
    const roomFromUrl = searchParams.get('room') || initialRoomCode;
    if (roomFromUrl && !gameSession) {
      handleAutoJoin(roomFromUrl);
    }
  }, [searchParams, initialRoomCode]);

  const handleAutoJoin = async (roomCode: string) => {
    setLoading(true);
    try {
      const session = await gamesService.getGameRoom(roomCode);
      
      if (session.player_list.length < 2) {
        // Join if room has 0 or 1 players
        try {
          const joinedSession = await gamesService.joinGameRoom(roomCode);
          setGameSession(joinedSession);
          // I'm the player who just joined - first player is player1
          setIsPlayer1(joinedSession.player_list.length === 1);
          setView(joinedSession.status === 'in-progress' ? 'playing' : 'waiting');
        } catch (err: any) {
          if (err.response?.data?.error?.includes('already in this game')) {
            setGameSession(session);
            // If I'm already in and I'm the host, I'm player 1
            setIsPlayer1(session.host === session.player_list[0]?.user_id);
            setView(session.status === 'in-progress' ? 'playing' : 'waiting');
          } else {
            throw err;
          }
        }
      } else {
        setGameSession(session);
        setView(session.status === 'in-progress' ? 'playing' : 'waiting');
      }
    } catch (error) {
      console.error('Failed to auto-join game:', error);
      toast.error('Could not join the game room.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (gameSession && (view === 'waiting' || view === 'playing')) {
      interval = setInterval(async () => {
        try {
          const updated = await gamesService.getGameRoom(gameSession.room_code);
          setGameSession(updated);
          
          if (view === 'waiting' && updated.status === 'in-progress') {
            setView('playing');
          }

          // Check for opponent's move
          const state = updated.game_state as any;
          if (state?.p1Choice && state?.p2Choice && myChoice) {
            evaluateRound(state);
          }
        } catch (error) {
          console.error('Failed to fetch game state:', error);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameSession, view, myChoice]);

  const evaluateRound = (state: any) => {
    const amPlayer1 = isPlayer1 ?? false;
    const myChoiceVal = amPlayer1 ? state.p1Choice : state.p2Choice;
    const oppChoiceVal = amPlayer1 ? state.p2Choice : state.p1Choice;

    setOpponentChoice(oppChoiceVal);

    if (myChoiceVal === oppChoiceVal) {
      setResult('draw');
    } else if (
      (myChoiceVal === 'rock' && oppChoiceVal === 'scissors') ||
      (myChoiceVal === 'scissors' && oppChoiceVal === 'paper') ||
      (myChoiceVal === 'paper' && oppChoiceVal === 'rock')
    ) {
      setResult('win');
      setScores(prev => ({ ...prev, me: prev.me + 1 }));
    } else {
      setResult('lose');
      setScores(prev => ({ ...prev, opponent: prev.opponent + 1 }));
    }
    setView('result');
  };

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const session = await gamesService.createGameRoom('rock-paper-scissors');
      setGameSession(session);
      setIsPlayer1(true); // Creator is always player 1
      setView('waiting');
      toast.success('Room created! Share the code with your friend.');
    } catch (error) {
      toast.error('Failed to create game room.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinCode.trim()) return;
    setLoading(true);
    try {
      const session = await gamesService.joinGameRoom(joinCode);
      setGameSession(session);
      setIsPlayer1(false); // Joiner is player 2
      setView('playing');
      toast.success('Joined the game!');
    } catch (error) {
      toast.error('Failed to join game. Check the room code.');
    } finally {
      setLoading(false);
    }
  };

  const handleChoice = async (choice: Choice) => {
    if (!gameSession || myChoice) return;
    
    setMyChoice(choice);
    try {
      // Send move to backend
      const state = gameSession.game_state as any || {};
      const updatedState = isPlayer1 
        ? { ...state, p1Choice: choice }
        : { ...state, p2Choice: choice };

      await gamesService.makeMove(gameSession.room_code, updatedState);
    } catch (error) {
      toast.error('Failed to register your choice.');
    }
  };

  const handleNextRound = () => {
    setMyChoice(null);
    setOpponentChoice(null);
    setResult(null);
    setRound(prev => prev + 1);
    setView('playing');
  };

  const handleCopyLink = () => {
    if (!gameSession) return;
    const link = `${window.location.origin}/games/join?room=${gameSession.room_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied!');
  };

  // Menu View
  if (view === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <button onClick={onBack} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft size={20} />
            Back to Games
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-8 text-center"
          >
            <div className="text-6xl mb-4">🪨📄✂️</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Rock Paper Scissors</h2>
            <p className="text-gray-600 mb-8">Challenge a friend to a classic game!</p>

            <div className="space-y-4">
              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" size={24} /> : 'Create Game Room'}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or</span>
                </div>
              </div>

              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Enter room code"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
              />
              <button
                onClick={handleJoinRoom}
                disabled={loading || !joinCode.trim()}
                className="w-full bg-gray-800 text-white py-4 rounded-xl font-semibold hover:bg-gray-700 transition-all disabled:opacity-50"
              >
                Join Game
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Waiting View
  if (view === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 p-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <Loader2 className="animate-spin mx-auto text-pink-500 mb-4" size={48} />
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Waiting for opponent...</h3>
          <p className="text-gray-600 mb-6">Share this code with your friend:</p>
          
          <div className="bg-gray-100 rounded-xl p-4 mb-4">
            <code className="text-2xl font-mono font-bold text-gray-800">{gameSession?.room_code}</code>
          </div>

          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-colors"
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </motion.div>
      </div>
    );
  }

  // Playing View
  if (view === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <div className="flex justify-between items-center mb-6">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
              <ArrowLeft size={20} />
              Back
            </button>
            <div className="text-lg font-semibold text-gray-700">Round {round}</div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-8"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Move</h3>
              <div className="flex justify-center gap-8 text-xl font-semibold">
                <div className="text-pink-500">You: {scores.me}</div>
                <div className="text-gray-400">-</div>
                <div className="text-red-500">Opponent: {scores.opponent}</div>
              </div>
            </div>

            {myChoice ? (
              <div className="text-center py-12">
                <div className="text-8xl mb-4">{choiceEmojis[myChoice]}</div>
                <p className="text-xl text-gray-600">Waiting for opponent...</p>
                <Loader2 className="animate-spin mx-auto mt-4 text-pink-500" size={32} />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {(['rock', 'paper', 'scissors'] as Choice[]).map((choice) => (
                  <motion.button
                    key={choice}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleChoice(choice)}
                    className="aspect-square bg-gradient-to-br from-pink-100 to-red-100 rounded-2xl flex flex-col items-center justify-center gap-3 hover:shadow-lg transition-all"
                  >
                    <span className="text-6xl">{choiceEmojis[choice!]}</span>
                    <span className="text-lg font-semibold text-gray-700 capitalize">{choice}</span>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Result View
  if (view === 'result') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 p-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="text-6xl mb-4">
            {result === 'win' && '🎉'}
            {result === 'lose' && '😔'}
            {result === 'draw' && '🤝'}
          </div>
          
          <h3 className="text-3xl font-bold text-gray-800 mb-4">
            {result === 'win' && 'You Win!'}
            {result === 'lose' && 'You Lose!'}
            {result === 'draw' && "It's a Draw!"}
          </h3>

          <div className="flex justify-center gap-8 text-4xl mb-8">
            <div>
              <div className="mb-2">{myChoice && choiceEmojis[myChoice]}</div>
              <div className="text-sm text-gray-600">You</div>
            </div>
            <div className="self-center text-2xl text-gray-400">vs</div>
            <div>
              <div className="mb-2">{opponentChoice && choiceEmojis[opponentChoice]}</div>
              <div className="text-sm text-gray-600">Opponent</div>
            </div>
          </div>

          <div className="flex justify-center gap-8 text-xl font-semibold mb-8">
            <div className="text-pink-500">You: {scores.me}</div>
            <div className="text-red-500">Opponent: {scores.opponent}</div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleNextRound}
              className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Play Again
            </button>
            <button
              onClick={onBack}
              className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              Back to Games
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
