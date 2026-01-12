import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Copy, Check, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import gamesService, { MultiplayerGameSession } from '../../services/gamesService';

interface ConnectFourProps {
  onBack: () => void;
  onComplete?: (wasHelpful: boolean) => void;
  initialRoomCode?: string;
}

const ROWS = 6;
const COLS = 7;

type Cell = 'empty' | 'red' | 'yellow';
type Board = Cell[][];

export default function ConnectFour({ onBack, initialRoomCode }: ConnectFourProps) {
  const [searchParams] = useSearchParams();
  const [gameSession, setGameSession] = useState<MultiplayerGameSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [myColor, setMyColor] = useState<'red' | 'yellow' | null>(null);
  const [board, setBoard] = useState<Board>(Array(ROWS).fill(null).map(() => Array(COLS).fill('empty')));
  const [currentTurn, setCurrentTurn] = useState<'red' | 'yellow'>('red');
  const [winner, setWinner] = useState<'red' | 'yellow' | 'draw' | null>(null);
  const [view, setView] = useState<'menu' | 'waiting' | 'playing' | 'finished'>('menu');
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

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
          // Last joined player
          const myPlayer = joinedSession.player_list[joinedSession.player_list.length - 1];
          setMyColor(myPlayer?.symbol === 'X' ? 'red' : 'yellow');
          setView(joinedSession.status === 'in-progress' ? 'playing' : 'waiting');
        } catch (err: any) {
          if (err.response?.data?.error?.includes('already in this game')) {
            setGameSession(session);
            // First player is host
            setMyColor(session.player_list[0]?.symbol === 'X' ? 'red' : 'yellow');
            setView(session.status === 'in-progress' ? 'playing' : 'waiting');
          } else {
            throw err;
          }
        }
      } else {
        setGameSession(session);
        // Find based on position (host is first)
        setMyColor(session.player_list[0]?.symbol === 'X' ? 'red' : 'yellow');
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
          if (state?.board && Array.isArray(state.board) && state.board.length === ROWS) {
            setBoard(state.board);
            setCurrentTurn(state.currentTurn || 'red');
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

  const checkWinner = (board: Board, lastRow: number, lastCol: number, color: Cell): boolean => {
    const directions = [
      [0, 1],  // horizontal
      [1, 0],  // vertical
      [1, 1],  // diagonal \
      [1, -1], // diagonal /
    ];

    for (const [dx, dy] of directions) {
      let count = 1;
      
      // Check positive direction
      for (let i = 1; i < 4; i++) {
        const row = lastRow + dx * i;
        const col = lastCol + dy * i;
        if (row >= 0 && row < ROWS && col >= 0 && col < COLS && board[row][col] === color) {
          count++;
        } else break;
      }
      
      // Check negative direction
      for (let i = 1; i < 4; i++) {
        const row = lastRow - dx * i;
        const col = lastCol - dy * i;
        if (row >= 0 && row < ROWS && col >= 0 && col < COLS && board[row][col] === color) {
          count++;
        } else break;
      }
      
      if (count >= 4) return true;
    }
    return false;
  };

  const handleColumnClick = async (col: number) => {
    if (!gameSession || view !== 'playing' || currentTurn !== myColor || winner) return;

    // Find the lowest empty row in this column
    let row = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][col] === 'empty') {
        row = r;
        break;
      }
    }

    if (row === -1) return; // Column is full

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = myColor!;
    setBoard(newBoard);

    const hasWinner = checkWinner(newBoard, row, col, myColor!);
    const isFull = newBoard.every(row => row.every(cell => cell !== 'empty'));

    try {
      await gamesService.makeMove(gameSession.room_code, {
        board: newBoard,
        currentTurn: myColor === 'red' ? 'yellow' : 'red',
        winner: hasWinner ? myColor : (isFull ? 'draw' : null),
      });

      if (hasWinner) {
        setWinner(myColor!);
        setView('finished');
      } else if (isFull) {
        setWinner('draw');
        setView('finished');
      } else {
        setCurrentTurn(myColor === 'red' ? 'yellow' : 'red');
      }
    } catch (error) {
      toast.error('Failed to make move.');
      // Revert the board
      setBoard(board);
    }
  };

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const session = await gamesService.createGameRoom('connect-four');
      setGameSession(session);
      setMyColor('red'); // Creator is always red (first player)
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
      setMyColor('yellow');
      setView('playing');
      toast.success('Joined the game!');
    } catch (error) {
      toast.error('Failed to join game. Check the room code.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAgain = async () => {
    if (!gameSession) return;
    setLoading(true);
    try {
      const newBoard = Array(ROWS).fill(null).map(() => Array(COLS).fill('empty'));
      await gamesService.makeMove(gameSession.room_code, {
        board: newBoard,
        currentTurn: 'red',
        winner: null,
      });
      setBoard(newBoard);
      setCurrentTurn('red');
      setWinner(null);
      setView('playing');
    } catch (error) {
      toast.error('Failed to reset game.');
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
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
            <div className="text-6xl mb-4">🔴🟡</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Connect Four</h2>
            <p className="text-gray-600 mb-8">Connect 4 discs in a row to win!</p>

            <div className="space-y-4">
              <button
                onClick={handleCreateRoom}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <Loader2 className="animate-spin mx-auto text-blue-500 mb-4" size={48} />
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Waiting for opponent...</h3>
          <p className="text-gray-600 mb-2">You are: <span className="font-bold text-red-500">Red</span></p>
          <p className="text-gray-600 mb-6">Share this code with your friend:</p>
          
          <div className="bg-gray-100 rounded-xl p-4 mb-4">
            <code className="text-2xl font-mono font-bold text-gray-800">{gameSession?.room_code}</code>
          </div>

          <button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
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
    const isMyTurn = currentTurn === myColor;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <div className="max-w-3xl mx-auto pt-8">
          <div className="flex justify-between items-center mb-6">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
              <ArrowLeft size={20} />
              Back
            </button>
            <div className="text-lg font-semibold text-gray-700">
              You are: <span className={myColor === 'red' ? 'text-red-500' : 'text-yellow-500'}>{myColor?.toUpperCase()}</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-8"
          >
            {winner ? (
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">
                  {winner === myColor && '🎉'}
                  {winner !== myColor && winner !== 'draw' && '😔'}
                  {winner === 'draw' && '🤝'}
                </div>
                <h3 className="text-3xl font-bold text-gray-800">
                  {winner === myColor && 'You Win!'}
                  {winner !== myColor && winner !== 'draw' && 'Opponent Wins!'}
                  {winner === 'draw' && "It's a Draw!"}
                </h3>
              </div>
            ) : (
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {isMyTurn ? 'Your Turn!' : "Opponent's Turn"}
                </h3>
                <p className="text-gray-600 mt-2">
                  Current: <span className={currentTurn === 'red' ? 'text-red-500 font-bold' : 'text-yellow-500 font-bold'}>
                    {currentTurn?.toUpperCase()}
                  </span>
                </p>
              </div>
            )}

            {/* Game Board */}
            <div className="bg-blue-600 rounded-2xl p-4 inline-block mx-auto">
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
                {board.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <motion.div
                      key={`${rowIndex}-${colIndex}`}
                      onMouseEnter={() => !winner && isMyTurn && setHoveredCol(colIndex)}
                      onMouseLeave={() => setHoveredCol(null)}
                      onClick={() => handleColumnClick(colIndex)}
                      whileHover={!winner && isMyTurn ? { scale: 1.05 } : {}}
                      className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center ${
                        !winner && isMyTurn && hoveredCol === colIndex ? 'cursor-pointer' : ''
                      }`}
                      style={{
                        backgroundColor: cell === 'empty' ? 'white' : cell === 'red' ? '#ef4444' : '#eab308',
                        boxShadow: cell !== 'empty' ? '0 2px 8px rgba(0,0,0,0.2)' : 'inset 0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    />
                  ))
                )}
              </div>
            </div>

            {winner && (
              <div className="mt-8 space-y-3">
                <button
                  onClick={handlePlayAgain}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin mx-auto" size={24} /> : 'Play Again'}
                </button>
                <button
                  onClick={onBack}
                  className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all"
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
