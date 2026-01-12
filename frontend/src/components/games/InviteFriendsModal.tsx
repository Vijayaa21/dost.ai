import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Copy, Check, Loader2, Gamepad2 } from 'lucide-react';
import { getInviteCode } from '../../services/friendService';
import gamesService from '../../services/gamesService';
import { toast } from 'react-toastify';

interface InviteFriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GameType = 'tic-tac-toe' | 'rock-paper-scissors' | 'connect-four' | 'memory-match-mp';

const gameOptions = [
  { id: 'tic-tac-toe', name: 'Tic Tac Toe', emoji: '⭕' },
  { id: 'rock-paper-scissors', name: 'Rock Paper Scissors', emoji: '🪨📄✂️' },
  { id: 'connect-four', name: 'Connect Four', emoji: '🔴🟡' },
  { id: 'memory-match-mp', name: 'Memory Match', emoji: '🧠🎴' },
];

export default function InviteFriendsModal({ isOpen, onClose }: InviteFriendsModalProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [, setSelectedGame] = useState<GameType | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingGame, setCreatingGame] = useState(false);
  const [showGameSelection, setShowGameSelection] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      const fetchInviteCode = async () => {
        try {
          setLoading(true);
          const code = await getInviteCode();
          setInviteCode(code);
        } catch (error) {
          console.error("Failed to fetch invite code:", error);
          toast.error("Could not load your invite link. Please try again.");
          onClose();
        } finally {
          setLoading(false);
        }
      };
      fetchInviteCode();
    }
  }, [isOpen, onClose]);

  const handleCreateGameInvite = async (gameType: GameType) => {
    setCreatingGame(true);
    try {
      const session = await gamesService.createGameRoom(gameType);
      setRoomCode(session.room_code);
      setSelectedGame(gameType);
      setShowGameSelection(false);
      toast.success('Game room created! Share the link with your friend.');
    } catch (error) {
      toast.error('Failed to create game room.');
    } finally {
      setCreatingGame(false);
    }
  };

  // If we have a room code, the invite link goes directly to the game
  const inviteLink = roomCode 
    ? `${window.location.origin}/games/join?room=${roomCode}&invite=${inviteCode}`
    : inviteCode 
      ? `${window.location.origin}/signup?invite=${inviteCode}`
      : '';

  const handleCopy = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setRoomCode(null);
    setSelectedGame(null);
    setShowGameSelection(false);
    onClose();
  };

  const handleJoinGame = () => {
    if (roomCode) {
      navigate(`/games/join?room=${roomCode}`);
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="p-4 bg-blue-100 rounded-full mb-4">
                <Share2 size={32} className="text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {roomCode ? 'Game Room Ready!' : 'Invite Friends to Play'}
              </h2>
              <p className="text-gray-500 mb-6">
                {roomCode 
                  ? 'Share this link with your friend. When they click it, they\'ll join your game directly!'
                  : 'Create a game room and share the link, or just invite them to become friends.'}
              </p>

              {!roomCode && !showGameSelection && (
                <button
                  onClick={() => setShowGameSelection(true)}
                  disabled={loading}
                  className="w-full mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Gamepad2 size={20} />
                  Create Game & Invite
                </button>
              )}

              {showGameSelection && !roomCode && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Choose a game:</p>
                  <div className="grid grid-cols-2 gap-3">
                    {gameOptions.map((game) => (
                      <motion.button
                        key={game.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCreateGameInvite(game.id as GameType)}
                        disabled={creatingGame}
                        className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all disabled:opacity-50"
                      >
                        <div className="text-3xl mb-2">{game.emoji}</div>
                        <div className="text-sm font-semibold text-gray-700">{game.name}</div>
                      </motion.button>
                    ))}
                  </div>
                  {creatingGame && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-gray-600">
                      <Loader2 className="animate-spin" size={16} />
                      <span className="text-sm">Creating room...</span>
                    </div>
                  )}
                  <button
                    onClick={() => setShowGameSelection(false)}
                    className="mt-3 text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="w-full">
                <p className="text-xs text-gray-400 mb-2 text-left">
                  {roomCode ? 'Game invite link:' : 'Or share friend invite link:'}
                </p>
                <div className="w-full h-14 bg-gray-100 border border-gray-200 rounded-lg p-2 flex items-center gap-2">
                  {loading ? (
                    <div className="w-full flex items-center justify-center">
                      <Loader2 className="animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <>
                      <input 
                        type="text" 
                        readOnly 
                        value={inviteLink}
                        className="bg-transparent w-full text-gray-600 text-sm outline-none"
                      />
                      <button 
                        onClick={handleCopy}
                        className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                          copied 
                            ? 'bg-green-500 text-white' 
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {roomCode && (
                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleJoinGame}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Gamepad2 size={20} />
                    Join Game Now
                  </button>
                  <p className="text-sm text-gray-600">
                    Or share the link above with your friend to play together!
                  </p>
                </div>
              )}
              
              <p className="text-xs text-gray-400 mt-4">
                {roomCode 
                  ? 'Room code: ' + roomCode.slice(0, 12)
                  : 'New users will become your friend after signing up.'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
