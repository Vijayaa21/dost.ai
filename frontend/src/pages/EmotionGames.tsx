import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, 
  Heart, 
  Play, 
  ArrowLeft,
  Sparkles,
  Users,
  Zap,
  Trophy,
  Clock,
  Star,
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

// Emotion options for selection with improved styling
const emotionOptions = [
  { id: 'anger', label: 'Angry', emoji: '😤', color: 'from-red-500 to-orange-600', bgGlow: 'shadow-red-500/30', description: 'Release tension' },
  { id: 'sadness', label: 'Sad', emoji: '😢', color: 'from-blue-500 to-indigo-600', bgGlow: 'shadow-blue-500/30', description: 'Find comfort' },
  { id: 'anxiety', label: 'Anxious', emoji: '😰', color: 'from-purple-500 to-pink-600', bgGlow: 'shadow-purple-500/30', description: 'Calm down' },
  { id: 'loneliness', label: 'Lonely', emoji: '🥺', color: 'from-cyan-500 to-blue-600', bgGlow: 'shadow-cyan-500/30', description: 'Feel connected' },
  { id: 'boredom', label: 'Bored', emoji: '😑', color: 'from-slate-500 to-gray-600', bgGlow: 'shadow-slate-500/30', description: 'Get stimulated' },
  { id: 'love', label: 'Loving', emoji: '🥰', color: 'from-pink-500 to-rose-600', bgGlow: 'shadow-pink-500/30', description: 'Express care' },
  { id: 'joy', label: 'Happy', emoji: '😄', color: 'from-yellow-500 to-amber-600', bgGlow: 'shadow-yellow-500/30', description: 'Celebrate!' },
  { id: 'fear', label: 'Scared', emoji: '😨', color: 'from-indigo-500 to-violet-600', bgGlow: 'shadow-indigo-500/30', description: 'Find courage' },
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
    <div className="min-h-screen p-4 md:p-6 relative overflow-hidden z-10">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
        {/* Stars background */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <InviteFriendsModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setInviteModalOpen(false)} 
      />
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-10"
        >
          <div className="flex justify-center items-center gap-3 mb-4">
            <motion.div 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-purple-500/30"
              whileHover={{ scale: 1.05 }}
            >
              <Gamepad2 className="w-5 h-5" />
              Emotion Games
              <Sparkles className="w-4 h-4" />
            </motion.div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setInviteModalOpen(true)}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2.5 rounded-full text-sm font-medium hover:bg-white/20 transition-all"
            >
              <Users className="w-4 h-4 text-cyan-400" />
              Invite Friends
            </motion.button>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
            Play Your Feelings Away
            <span className="inline-block ml-2">🎮</span>
          </h1>
          <p className="text-purple-200 text-base md:text-lg max-w-xl mx-auto px-4">
            Games designed to help you process emotions in a healthy way. Choose how you're feeling and we'll find the perfect game for you.
          </p>
          
          {/* Stats Bar */}
          <div className="flex justify-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-purple-300 text-sm">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>{builtInGames.length} Games</span>
            </div>
            <div className="flex items-center gap-2 text-purple-300 text-sm">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>8 Emotions</span>
            </div>
            <div className="flex items-center gap-2 text-purple-300 text-sm">
              <Heart className="w-4 h-4 text-pink-400" />
              <span>Therapeutic</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:gap-8">
          <div className="w-full">
            <AnimatePresence mode="wait">
              {/* Step 1: Select Emotion */}
              {step === 'select-emotion' && (
                <motion.div
                  key="select-emotion"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h2 className="text-xl md:text-2xl font-semibold text-white mb-8 text-center flex items-center justify-center gap-2">
                    <span className="text-2xl">✨</span>
                    How are you feeling right now?
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {emotionOptions.map((emotion, index) => (
                      <motion.button
                        key={emotion.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEmotionSelect(emotion.id)}
                        className={clsx(
                          'relative overflow-hidden rounded-3xl p-6 md:p-8 text-white text-center transition-all',
                          `bg-gradient-to-br ${emotion.color}`,
                          `shadow-xl ${emotion.bgGlow}`,
                          'hover:shadow-2xl min-h-[160px] md:min-h-[200px]'
                        )}
                      >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
                        <motion.div 
                          className="text-6xl md:text-7xl mb-3"
                          animate={{ rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        >
                          {emotion.emoji}
                        </motion.div>
                        <h3 className="font-bold text-sm md:text-base">{emotion.label}</h3>
                        <p className="text-xs opacity-90 mt-1">{emotion.description}</p>
                      </motion.button>
                    ))}
                  </div>

                  {/* All Games Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 mb-8"
                  >
                    <h3 className="text-2xl font-semibold text-white mb-8 text-center flex items-center justify-center gap-2">
                      <Star className="w-5 h-5 text-yellow-400" />
                      Or Browse All Games
                      <Star className="w-5 h-5 text-yellow-400" />
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                      {builtInGames.map((game, index) => (
                        <motion.button
                          key={game.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + index * 0.03 }}
                          whileHover={{ scale: 1.05, y: -3 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePlayGame(game)}
                          className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/10 hover:border-purple-400/50 hover:bg-white/15 transition-all text-left group min-h-[180px] md:min-h-[220px] flex flex-col justify-center"
                        >
                          <div className="text-5xl md:text-6xl mb-3 group-hover:scale-110 transition-transform">{game.emoji}</div>
                          <h4 className="font-semibold text-white text-base md:text-lg">{game.name}</h4>
                          <div className="flex items-center gap-1 mt-3 text-purple-300 text-sm">
                            <Clock className="w-4 h-4" />
                            {game.duration}
                          </div>
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
                  <motion.button
                    whileHover={{ x: -5 }}
                    onClick={handleBack}
                    className="text-purple-300 hover:text-white mb-6 inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Emotions
                  </motion.button>

                  {/* Supportive Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-gradient-to-r ${selectedEmotionData.color} rounded-3xl p-6 md:p-8 text-white mb-8 shadow-2xl ${selectedEmotionData.bgGlow}`}
                  >
                    <div className="flex items-start gap-5">
                      <motion.div 
                        className="text-5xl md:text-6xl"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {selectedEmotionData.emoji}
                      </motion.div>
                      <div>
                        <h3 className="font-bold text-xl md:text-2xl mb-2">
                          Feeling {selectedEmotionData.label.toLowerCase()}?
                        </h3>
                        <p className="text-white/90 text-base md:text-lg">{getEmotionMessage(selectedEmotion!)}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Recommended Games */}
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    Recommended for you
                  </h3>
                  
                  <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {recommendedGames.map((game, index) => (
                      <motion.div
                        key={game.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="bg-white/10 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/10 hover:border-purple-400/50 transition-all group min-h-[220px] md:min-h-[260px] flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <motion.span 
                            className="text-5xl"
                            animate={{ rotate: [0, -10, 10, 0] }}
                            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                          >
                            {game.emoji}
                          </motion.span>
                          <span className={`px-3 py-1.5 bg-gradient-to-r ${game.color} text-white text-xs font-semibold rounded-full shadow-lg`}>
                            {game.duration}
                          </span>
                        </div>
                        
                        <h3 className="font-bold text-white text-lg mb-2">{game.name}</h3>
                        <p className="text-sm text-purple-200 mb-4 line-clamp-2">{game.description}</p>
                        
                        <div className="bg-white/10 rounded-xl p-3 mb-4">
                          <p className="text-xs text-purple-200 flex items-center gap-2">
                            <Heart className="w-4 h-4 text-pink-400" />
                            {game.benefit}
                          </p>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handlePlayGame(game)}
                          className={`w-full bg-gradient-to-r ${game.color} text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2`}
                        >
                          <Play className="w-5 h-5" fill="white" />
                          Play Now
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Other Games */}
                  <div className="mt-10">
                    <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
                      <Gamepad2 className="w-5 h-5 text-cyan-400" />
                      Other games you might enjoy
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {builtInGames
                        .filter(g => !recommendedGames.includes(g))
                        .map((game, index) => (
                          <motion.button
                            key={game.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + index * 0.03 }}
                            whileHover={{ scale: 1.05, y: -3 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePlayGame(game)}
                            className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:border-cyan-400/50 hover:bg-white/15 transition-all text-left"
                          >
                            <div className="text-3xl mb-2">{game.emoji}</div>
                            <h4 className="font-semibold text-white text-sm">{game.name}</h4>
                            <p className="text-xs text-purple-300 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {game.duration}
                            </p>
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
            <div className="sticky top-6 bg-white/10 backdrop-blur-lg p-5 rounded-3xl border border-white/10 shadow-xl">
              <FriendsList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
