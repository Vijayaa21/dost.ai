import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Copy, Check, RefreshCw, Users, Loader2, Trophy } from 'lucide-react';
import { toast } from 'react-toastify';
import gamesService, { MultiplayerGameSession } from '../../services/gamesService';

interface MultiplayerMemoryProps {
  onBack: () => void;
  onComplete: (wasHelpful: boolean) => void;
  initialRoomCode?: string;
}

const emojis = ['🎨', '🎭', '🎪', '🎬', '🎮', '🎯', '🎲', '🎸'];
const cardPairs = [...emojis, ...emojis].sort(() => Math.random() - 0.5);

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MultiplayerMemory({ onBack, onComplete, initialRoomCode }: MultiplayerMemoryProps) {
  const [searchParams] = useSearchParams();
  const [gameSession, setGameSession] = useState<MultiplayerGameSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [cards, setCards] = useState<Card[]>(
    cardPairs.map((emoji, id) => ({ id, emoji, isFlipped: false, isMatched: false }))
  );
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [currentTurn, setCurrentTurn] = useState<'player1' | 'player2'>('player1');
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [myPlayer, setMyPlayer] = useState<'player1' | 'player2' | null>(null);
  const [view, setView] = useState<'menu' | 'waiting' | 'playing' | 'finished'>('menu');
  const [winner, setWinner] = useState<'player1' | 'player2' | 'draw' | null>(null);

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
          const myPlayerIndex = joinedSession.player_list.findIndex(p => p.user);
          setMyPlayer(myPlayerIndex === 0 ? 'player1' : 'player2');
          setView(joinedSession.status === 'in-progress' ? 'playing' : 'waiting');
        } catch (err: any) {
          if (err.response?.data?.error?.includes('already in this game')) {
            setGameSession(session);
            const myPlayerIndex = session.player_list.findIndex(p => p.user);
            setMyPlayer(myPlayerIndex === 0 ? 'player1' : 'player2');
            setView(session.status === 'in-progress' ? 'playing' : 'waiting');
          } else {
            throw err;
          }
        }
      } else {
        setGameSession(session);
        const myPlayerIndex = session.player_list.findIndex(p => p.user);
        setMyPlayer(myPlayerIndex === 0 ? 'player1' : 'player2');
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
    let interval: NodeJS.Timeout;
    if (gameSession && (view === 'waiting' || view === 'playing')) {
      interval = setInterval(async () => {
        try {
          const updated = await gamesService.getGameRoom(gameSession.room_code);
          setGameSession(updated);
          
          if (view === 'waiting' && updated.status === 'in-progress') {
            setView('playing');
          }

          const state = updated.game_state as any;
          if (state?.cards) {
            setCards(state.cards);
            setCurrentTurn(state.currentTurn || 'player1');
            setScores(state.scores || { player1: 0, player2: 0 });
            if (state.winner) {
              setWinner(state.winner);
              setView('finished');
            }
          }
        } catch (error) {
          console.error('Failed to fetch game state:', error);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameSession, view]);

  const handleCardClick = async (cardId: number) => {
    if (!gameSession || view !== 'playing' || currentTurn !== myPlayer) return;
    if (flippedCards.length >= 2 || cards[cardId].isFlipped || cards[cardId].isMatched) return;

    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    const newCards = cards.map(card =>
      card.id === cardId ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      const isMatch = cards[first].emoji === cards[second].emoji;

      setTimeout(async () => {
        if (isMatch) {
          const matchedCards = newCards.map(card =>
            card.id === first || card.id === second ? { ...card, isMatched: true } : card
          );
          setCards(matchedCards);
          
          const newScores = {
            ...scores,
            [currentTurn]: scores[currentTurn] + 1,
          };
          setScores(newScores);

          const allMatched = matchedCards.every(card => card.isMatched);
          const gameWinner = allMatched
            ? newScores.player1 > newScores.player2
              ? 'player1'
              : newScores.player2 > newScores.player1
              ? 'player2'
              : 'draw'
            : null;

          try {
            await gamesService.makeMove(gameSession.room_code, {
              cards: matchedCards,
              currentTurn,
              scores: newScores,
              winner: gameWinner,
            });

            if (gameWinner) {
              setWinner(gameWinner);
              setView('finished');
            }
          } catch (error) {
            toast.error('Failed to update game state.');
          }
        } else {
          const unflippedCards = newCards.map(card =>
            card.id === first || card.id === second ? { ...card, isFlipped: false } : card
          );
          setCards(unflippedCards);
          
          const nextTurn = currentTurn === 'player1' ? 'player2' : 'player1';
          setCurrentTurn(nextTurn);

          try {
            await gamesService.makeMove(gameSession.room_code, {
              cards: unflippedCards,
              currentTurn: nextTurn,
              scores,
              winner: null,
            });
          } catch (error) {
            toast.error('Failed to update game state.');
          }
        }
        setFlippedCards([]);
      }, 1000);
    }
  };

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const session = await gamesService.createGameRoom('memory-match-mp');
      setGameSession(session);
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
      setMyPlayer('player2');
      setView('playing');
      toast.success('Joined the game!');
    } catch (error) {
      toast.error('Failed to join game. Check the room code.');
    } finally {
      setLoading(false);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4">
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
            <div className="text-6xl mb-4">🧠🎴</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Memory Match Battle</h2>
            <p className="text-gray-600 mb-8">Take turns finding pairs. Most matches wins!</p>

            <div className="space-y-4">
              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <Loader2 className="animate-spin mx-auto text-purple-500 mb-4" size={48} />
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Waiting for opponent...</h3>
          <p className="text-gray-600 mb-6">Share this code with your friend:</p>
          
          <div className="bg-gray-100 rounded-xl p-4 mb-4">
            <code className="text-2xl font-mono font-bold text-gray-800">{gameSession?.room_code}</code>
          </div>

          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </motion.div>
      </div>
    );
  }

  // Playing View
  if (view === 'playing' || view === 'finished') {
    const isMyTurn = currentTurn === myPlayer;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4">
        <div className="max-w-3xl mx-auto pt-8">
          <div className="flex justify-between items-center mb-6">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
              <ArrowLeft size={20} />
              Back
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <div className={`text-center ${myPlayer === 'player1' ? 'font-bold' : ''}`}>
                <div className="text-2xl text-purple-500">{scores.player1}</div>
                <div className="text-sm text-gray-600">Player 1 {myPlayer === 'player1' && '(You)'}</div>
              </div>
              <div className="text-lg font-semibold text-gray-700">
                {winner ? '🎉 Game Over!' : isMyTurn ? '🟢 Your Turn' : '⏳ Opponent\'s Turn'}
              </div>
              <div className={`text-center ${myPlayer === 'player2' ? 'font-bold' : ''}`}>
                <div className="text-2xl text-pink-500">{scores.player2}</div>
                <div className="text-sm text-gray-600">Player 2 {myPlayer === 'player2' && '(You)'}</div>
              </div>
            </div>

            {/* Game Board */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {cards.map((card) => (
                <motion.div
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  whileHover={!card.isFlipped && !card.isMatched && isMyTurn ? { scale: 1.05 } : {}}
                  whileTap={!card.isFlipped && !card.isMatched && isMyTurn ? { scale: 0.95 } : {}}
                  className={`aspect-square rounded-xl flex items-center justify-center text-4xl font-bold cursor-pointer transition-all ${
                    card.isMatched
                      ? 'bg-green-100 text-green-500'
                      : card.isFlipped
                      ? 'bg-gradient-to-br from-purple-100 to-pink-100'
                      : 'bg-gradient-to-br from-gray-200 to-gray-300'
                  }`}
                >
                  {card.isFlipped || card.isMatched ? card.emoji : '?'}
                </motion.div>
              ))}
            </div>

            {winner && (
              <div className="text-center">
                <div className="text-5xl mb-4">
                  {winner === myPlayer && '🎉'}
                  {winner !== myPlayer && winner !== 'draw' && '😔'}
                  {winner === 'draw' && '🤝'}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {winner === myPlayer && 'You Win!'}
                  {winner !== myPlayer && winner !== 'draw' && 'Opponent Wins!'}
                  {winner === 'draw' && "It's a Draw!"}
                </h3>
                <button
                  onClick={onBack}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Back to Games
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}
