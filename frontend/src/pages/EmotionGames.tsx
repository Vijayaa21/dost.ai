import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, 
  Heart, 
  Play, 
  ArrowLeft,
  Sparkles,
  Users,
} from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-toastify';

// Import our new modal
import InviteFriendsModal from '../components/games/InviteFriendsModal';
import FriendsList from '../components/games/FriendsList';

// Import built-in games
import {
  BubblePop,
  FruitSlice,
  CatchStars,
  MemoryMatch,
  BreathingBubble,
  ColorCanvas,
  RunnerGame,
  NeonCruise,
  ColorSort,
  CloudBrush,
  TicTacToe,
  RockPaperScissors,
  ConnectFour,
  MultiplayerMemory,
  builtInGames,
  emotionGameMap,
  getEmotionMessage,
  type BuiltInGame,
} from '../components/games';

// Emotion options for selection
const emotionOptions = [
  { id: 'anger', label: 'Angry / Frustrated', emoji: '😤', color: 'from-red-400 to-orange-500', description: 'Want to release tension' },
  { id: 'sadness', label: 'Sad / Down', emoji: '😢', color: 'from-blue-400 to-indigo-500', description: 'Need comfort or distraction' },
  { id: 'anxiety', label: 'Anxious / Stressed', emoji: '😰', color: 'from-purple-400 to-pink-500', description: 'Need to calm down' },
  { id: 'loneliness', label: 'Lonely / Isolated', emoji: '🥺', color: 'from-cyan-400 to-blue-500', description: 'Want connection' },
  { id: 'boredom', label: 'Bored / Restless', emoji: '😑', color: 'from-gray-400 to-slate-500', description: 'Need stimulation' },
  { id: 'love', label: 'Loving / Affectionate', emoji: '🥰', color: 'from-pink-400 to-rose-500', description: 'Want to express care' },
  { id: 'joy', label: 'Happy / Excited', emoji: '😄', color: 'from-yellow-400 to-amber-500', description: 'Want to celebrate' },
  { id: 'fear', label: 'Scared / Worried', emoji: '😨', color: 'from-indigo-400 to-violet-500', description: 'Need courage' },
];

type GameStep = 'select-emotion' | 'recommendations' | 'playing';

export default function EmotionGames() {
  const [step, setStep] = useState<GameStep>('select-emotion');
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<BuiltInGame | null>(null);
  const [recommendedGames, setRecommendedGames] = useState<BuiltInGame[]>([]);
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);

  const handleEmotionSelect = (emotionId: string) => {
    setSelectedEmotion(emotionId);
    
    // Get recommended games for this emotion
    const gameIds = emotionGameMap[emotionId] || [];
    const games = gameIds
      .map(id => builtInGames.find(g => g.id === id))
      .filter((g): g is BuiltInGame => g !== undefined);
    
    setRecommendedGames(games);
    setStep('recommendations');
  };

  const handlePlayGame = (game: BuiltInGame) => {
    setSelectedGame(game);
    setStep('playing');
  };

  const handleGameComplete = (wasHelpful: boolean) => {
    toast.success(wasHelpful ? 'Glad it helped! 🎉' : 'Thanks for playing! 💙');
    setStep('select-emotion');
    setSelectedEmotion(null);
    setSelectedGame(null);
  };

  const handleBack = () => {
    if (step === 'playing') {
      setStep('recommendations');
      setSelectedGame(null);
    } else if (step === 'recommendations') {
      setStep('select-emotion');
      setSelectedEmotion(null);
    }
  };

  const selectedEmotionData = emotionOptions.find(e => e.id === selectedEmotion);

  // Render the selected game
  if (step === 'playing' && selectedGame) {
    const gameComponents: Record<string, React.ComponentType<{ onBack: () => void; onComplete: (wasHelpful: boolean) => void }>> = {
      'bubble-pop': BubblePop,
      'fruit-slice': FruitSlice,
      'catch-stars': CatchStars,
      'memory-match': MemoryMatch,
      'breathing-bubble': BreathingBubble,
      'color-canvas': ColorCanvas,
      'runner-game': RunnerGame,
      'neon-cruise': NeonCruise,
      'color-sort': ColorSort,
      'cloud-brush': CloudBrush,
      'tic-tac-toe': TicTacToe,
      'rock-paper-scissors': RockPaperScissors,
      'connect-four': ConnectFour,
      'memory-match-mp': MultiplayerMemory,
    };

    const GameComponent = gameComponents[selectedGame.id];
    if (GameComponent) {
      return <GameComponent onBack={handleBack} onComplete={handleGameComplete} />;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-4 md:p-6">
      <InviteFriendsModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setInviteModalOpen(false)} 
      />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 md:mb-8"
        >
          <div className="flex justify-center items-center gap-2 mb-3 md:mb-4">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium">
              <Gamepad2 className="w-3 h-3 md:w-4 md:h-4" />
              Emotion Games
            </div>
            <button 
              onClick={() => setInviteModalOpen(true)}
              className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Users className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
              Invite Friends
            </button>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
            Play Your Feelings Away
          </h1>
          <p className="text-gray-600 text-sm md:text-base max-w-lg mx-auto px-4">
            Games designed to help you process emotions in a healthy way. Choose how you're feeling and we'll recommend the perfect game.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Select Emotion */}
              {step === 'select-emotion' && (
                <motion.div
                  key="select-emotion"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6 text-center">
                    How are you feeling right now?
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
                    {emotionOptions.map((emotion) => (
                      <motion.button
                        key={emotion.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleEmotionSelect(emotion.id)}
                        className={clsx(
                          'relative overflow-hidden rounded-xl md:rounded-2xl p-4 md:p-6 text-white text-center transition-all',
                          `bg-gradient-to-br ${emotion.color}`,
                          'hover:shadow-lg hover:shadow-purple-200'
                        )}
                      >
                        <div className="text-3xl md:text-4xl mb-1 md:mb-2">{emotion.emoji}</div>
                        <h3 className="font-semibold text-xs md:text-sm">{emotion.label}</h3>
                        <p className="text-xs opacity-80 mt-0.5 md:mt-1 hidden sm:block">{emotion.description}</p>
                      </motion.button>
                    ))}
                  </div>

                  {/* All Games Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-12"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                      Or browse all games
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {builtInGames.map((game) => (
                        <motion.button
                          key={game.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handlePlayGame(game)}
                          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all text-left"
                        >
                          <div className="text-3xl mb-2">{game.emoji}</div>
                          <h4 className="font-semibold text-gray-800 text-sm">{game.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{game.duration}</p>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* Step 2: Game Recommendations */}
              {step === 'recommendations' && selectedEmotionData && (
                <motion.div
                  key="recommendations"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <button
                    onClick={handleBack}
                    className="text-gray-500 hover:text-gray-700 mb-6 inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>

                  {/* Supportive Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-gradient-to-r ${selectedEmotionData.color} rounded-2xl p-6 text-white mb-6`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">{selectedEmotionData.emoji}</div>
                      <div>
                        <h3 className="font-semibold text-lg mb-1">
                          Feeling {selectedEmotionData.label.toLowerCase()}?
                        </h3>
                        <p className="text-white/90">{getEmotionMessage(selectedEmotion!)}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Recommended Games */}
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    <Sparkles className="w-5 h-5 inline mr-2 text-purple-500" />
                    Recommended for you
                  </h3>
                  
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {recommendedGames.map((game, index) => (
                      <motion.div
                        key={game.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <span className="text-4xl">{game.emoji}</span>
                          <span className={`px-2 py-1 bg-gradient-to-r ${game.color} text-white text-xs font-medium rounded-full`}>
                            {game.duration}
                          </span>
                        </div>
                        
                        <h3 className="font-semibold text-gray-800 mb-2">{game.name}</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{game.description}</p>
                        
                        <div className="bg-purple-50 rounded-xl p-3 mb-4">
                          <p className="text-xs text-purple-700">
                            <Heart className="w-3 h-3 inline mr-1" />
                            {game.benefit}
                          </p>
                        </div>

                        <button
                          onClick={() => handlePlayGame(game)}
                          className={`w-full bg-gradient-to-r ${game.color} text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2`}
                        >
                          <Play className="w-4 h-4" fill="white" />
                          Play Now
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Other Games */}
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Other games you might enjoy</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {builtInGames
                        .filter(g => !recommendedGames.includes(g))
                        .map((game) => (
                          <motion.button
                            key={game.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handlePlayGame(game)}
                            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all text-left"
                          >
                            <div className="text-3xl mb-2">{game.emoji}</div>
                            <h4 className="font-semibold text-gray-800 text-sm">{game.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">{game.duration}</p>
                          </motion.button>
                        ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Friends List */}
          <div className="hidden lg:block mt-16 lg:mt-0">
            <div className="sticky top-6 bg-white/50 backdrop-blur-lg p-4 rounded-2xl border border-gray-200/50 shadow-sm">
              <FriendsList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
