import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Copy, Check, RefreshCw, Users, Loader2, Trophy, Frown } from 'lucide-react';
import { toast } from 'react-toastify';
import gamesService, { MultiplayerGameSession } from '../../services/gamesService';

interface TicTacToeProps {
  onBack: () => void;
  onComplete: (wasHelpful: boolean) => void;
  initialRoomCode?: string;
}

export default function TicTacToe({ onBack, onComplete, initialRoomCode }: TicTacToeProps) {
  const [searchParams] = useSearchParams();
  const [gameSession, setGameSession] = useState<MultiplayerGameSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [mySymbol, setMySymbol] = useState<'X' | 'O' | null>(null);
  const [view, setView] = useState<'menu' | 'waiting' | 'playing' | 'finished'>('menu');
  const [initializing, setInitializing] = useState(false);

  // Check for room code in URL or props on mount
  useEffect(() => {
    const roomFromUrl = searchParams.get('room') || initialRoomCode;
    if (roomFromUrl && !gameSession) {
      handleAutoJoin(roomFromUrl);
    }
  }, [searchParams, initialRoomCode]);

  const handleAutoJoin = async (roomCode: string) => {
    setInitializing(true);
    try {
      // First try to get the room details
      const session = await gamesService.getGameRoom(roomCode);
      setGameSession(session);
      
      // Determine my symbol based on player list
      const myPlayer = session.player_list.find(p => p.symbol);
      if (session.player_list.length === 1) {
        // I'm the second player, try to join
        try {
          const joinedSession = await gamesService.joinGameRoom(roomCode);
          setGameSession(joinedSession);
          setMySymbol('O');
          if (joinedSession.status === 'in-progress') {
            setView('playing');
          } else {
            setView('waiting');
          }
        } catch (err: any) {
          // If already in game, figure out our symbol
          if (err.response?.data?.error?.includes('already in this game')) {
            setMySymbol(session.player_list[0].symbol as 'X' | 'O');
            setView(session.status === 'in-progress' ? 'playing' : 
                   session.status === 'finished' ? 'finished' : 'waiting');
          }
        }
      } else {
        // Game might have started, figure out our role
        // For now, assume we're 'O' if joining via link
        setMySymbol('O');
        setView(session.status === 'in-progress' ? 'playing' : 
               session.status === 'finished' ? 'finished' : 'waiting');
      }
    } catch (error) {
      console.error('Failed to auto-join game:', error);
      toast.error('Could not join the game room.');
    } finally {
      setInitializing(false);
    }
  };

  // Polling for game state updates
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameSession && (view === 'waiting' || view === 'playing')) {
      interval = setInterval(async () => {
        try {
          const updatedSession = await gamesService.getGameRoom(gameSession.room_code);
          setGameSession(updatedSession);

          if (updatedSession.status === 'in-progress' && view === 'waiting') {
            setView('playing');
            toast.success('Opponent joined! Game started!');
          }
          if (updatedSession.status === 'finished') {
            setView('finished');
          }
        } catch (error) {
          console.error('Failed to poll game state:', error);
        }
      }, 2000); // Poll every 2 seconds
    }
    return () => clearInterval(interval);
  }, [gameSession, view]);

  const handleCreateGame = async () => {
    setLoading(true);
    try {
      const session = await gamesService.createGameRoom('tic-tac-toe');
      setGameSession(session);
      setMySymbol('X');
      setView('waiting');
    } catch (error) {
      toast.error('Failed to create game room.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!joinCode.trim()) {
      toast.error('Please enter a room code.');
      return;
    }
    setJoining(true);
    try {
      const session = await gamesService.joinGameRoom(joinCode.trim());
      setGameSession(session);
      setMySymbol('O');
      if (session.status === 'in-progress') {
        setView('playing');
      } else {
        setView('waiting');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to join game.');
    } finally {
      setJoining(false);
    }
  };

  const handleCopyCode = () => {
    if (gameSession) {
      navigator.clipboard.writeText(gameSession.room_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleMakeMove = async (position: number) => {
    if (!gameSession || gameSession.game_state.turn !== mySymbol) return;
    if (gameSession.game_state.board[position] !== ' ') return;

    try {
      const updatedSession = await gamesService.makeMove(gameSession.room_code, position);
      setGameSession(updatedSession);
      if (updatedSession.status === 'finished') {
        setView('finished');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to make move.');
    }
  };

  const getResultMessage = useCallback(() => {
    if (!gameSession) return '';
    const winner = gameSession.game_state.winner;
    if (winner === 'draw') return "It's a draw!";
    if (winner === mySymbol) return 'You Won! 🎉';
    return 'You Lost!';
  }, [gameSession, mySymbol]);

  const renderBoard = () => {
    if (!gameSession) return null;
    const { board, turn, winner } = gameSession.game_state;
    const isMyTurn = turn === mySymbol && !winner;

    return (
      <div className="flex flex-col items-center">
        <p className={`mb-4 text-lg font-semibold ${isMyTurn ? 'text-green-600' : 'text-gray-500'}`}>
          {winner ? getResultMessage() : (isMyTurn ? 'Your turn!' : "Opponent's turn...")}
        </p>
        <div className="grid grid-cols-3 gap-2 bg-indigo-100 p-3 rounded-xl">
          {board.map((cell, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: cell === ' ' && isMyTurn ? 1.05 : 1 }}
              whileTap={{ scale: cell === ' ' && isMyTurn ? 0.95 : 1 }}
              onClick={() => handleMakeMove(index)}
              disabled={!isMyTurn || cell !== ' '}
              className={`w-24 h-24 md:w-28 md:h-28 bg-white rounded-lg shadow-md flex items-center justify-center text-5xl font-bold transition-colors
                ${cell === ' ' && isMyTurn ? 'hover:bg-indigo-50 cursor-pointer' : 'cursor-not-allowed'}
                ${cell === 'X' ? 'text-blue-500' : 'text-rose-500'}
              `}
            >
              {cell !== ' ' && cell}
            </motion.button>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-500">
          You are: <span className={`font-bold ${mySymbol === 'X' ? 'text-blue-500' : 'text-rose-500'}`}>{mySymbol}</span>
        </p>
      </div>
    );
  };

  // Show loading when auto-joining from URL
  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto text-indigo-500 mb-4" size={48} />
          <p className="text-gray-600">Joining game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 flex flex-col">
      <button onClick={onBack} className="text-gray-600 hover:text-gray-800 mb-4 self-start flex items-center gap-1">
        <ArrowLeft size={20} /> Back
      </button>

      <div className="flex-grow flex flex-col items-center justify-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Tic Tac Toe</h1>
        <p className="text-gray-500 mb-8">Play with a friend!</p>

        <AnimatePresence mode="wait">
          {/* Menu View */}
          {view === 'menu' && !initializing && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center"
            >
              <Users className="mx-auto text-indigo-500 mb-4" size={48} />
              <button
                onClick={handleCreateGame}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-xl font-semibold mb-4 hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Create New Game'}
              </button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-gray-500">or</span></div>
              </div>
              <input
                type="text"
                placeholder="Enter Room Code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 mb-3 text-center focus:ring-2 focus:ring-indigo-300 outline-none"
              />
              <button
                onClick={handleJoinGame}
                disabled={joining}
                className="w-full bg-white border-2 border-indigo-500 text-indigo-500 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-all disabled:opacity-50"
              >
                {joining ? <Loader2 className="animate-spin mx-auto" /> : 'Join Game'}
              </button>
            </motion.div>
          )}

          {/* Waiting View */}
          {view === 'waiting' && gameSession && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center"
            >
              <Loader2 className="animate-spin mx-auto text-indigo-500 mb-4" size={48} />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Waiting for opponent...</h2>
              <p className="text-gray-500 mb-4">Share this code with a friend:</p>
              <div className="flex items-center justify-center gap-2 bg-gray-100 p-3 rounded-lg">
                <span className="font-mono text-lg text-indigo-600 select-all">{gameSession.room_code}</span>
                <button onClick={handleCopyCode} className="p-2 hover:bg-gray-200 rounded-md">
                  {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} className="text-gray-500" />}
                </button>
              </div>
            </motion.div>
          )}

          {/* Playing View */}
          {view === 'playing' && gameSession && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white p-6 md:p-8 rounded-2xl shadow-xl"
            >
              {renderBoard()}
            </motion.div>
          )}

          {/* Finished View */}
          {view === 'finished' && gameSession && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center"
            >
              {gameSession.game_state.winner === mySymbol ? (
                <Trophy className="mx-auto text-yellow-500 mb-4" size={64} />
              ) : gameSession.game_state.winner === 'draw' ? (
                <RefreshCw className="mx-auto text-gray-500 mb-4" size={64} />
              ) : (
                <Frown className="mx-auto text-gray-400 mb-4" size={64} />
              )}
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{getResultMessage()}</h2>
              <button
                onClick={() => { setView('menu'); setGameSession(null); }}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-xl font-semibold mb-3 hover:shadow-lg transition-all"
              >
                Play Again
              </button>
              <button
                onClick={() => onComplete(gameSession.game_state.winner === mySymbol)}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Back to Games
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
