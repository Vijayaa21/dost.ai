import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gamepad2, 
  Heart, 
  Zap, 
  Clock, 
  Play, 
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import clsx from 'clsx';
import gamesService, { 
  TherapeuticGame, 
  EmotionCategory, 
  GameSession,
  GameRecommendation 
} from '../services/gamesService';
import { toast } from 'react-toastify';

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

const intensityLevels = [
  { value: 1, label: 'Mild', color: 'bg-green-100 text-green-700' },
  { value: 2, label: 'Light', color: 'bg-lime-100 text-lime-700' },
  { value: 3, label: 'Moderate', color: 'bg-yellow-100 text-yellow-700' },
  { value: 4, label: 'Strong', color: 'bg-orange-100 text-orange-700' },
  { value: 5, label: 'Intense', color: 'bg-red-100 text-red-700' },
];

export default function EmotionGames() {
  const [step, setStep] = useState<'select-emotion' | 'select-intensity' | 'recommendations' | 'playing' | 'feedback'>('select-emotion');
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [selectedIntensity, setSelectedIntensity] = useState(3);
  const [recommendations, setRecommendations] = useState<GameRecommendation | null>(null);
  const [selectedGame, setSelectedGame] = useState<TherapeuticGame | null>(null);
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<EmotionCategory[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await gamesService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleEmotionSelect = (emotionId: string) => {
    setSelectedEmotion(emotionId);
    setStep('select-intensity');
  };

  const handleIntensitySelect = async (intensity: number) => {
    setSelectedIntensity(intensity);
    setLoading(true);
    
    try {
      const recs = await gamesService.getRecommendations(selectedEmotion!, intensity);
      setRecommendations(recs);
      setStep('recommendations');
    } catch (error) {
      toast.error('Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayGame = async (game: TherapeuticGame) => {
    setSelectedGame(game);
    setLoading(true);
    
    try {
      const session = await gamesService.startSession(
        game.id,
        selectedEmotion!,
        selectedIntensity
      );
      setCurrentSession(session);
      setStep('playing');
      
      // Open game in new tab if URL exists
      if (game.game_url) {
        window.open(game.game_url, '_blank');
      }
    } catch (error) {
      toast.error('Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async (wasHelpful: boolean) => {
    if (!currentSession) return;
    
    try {
      await gamesService.endSession(currentSession.id, {
        was_helpful: wasHelpful,
        emotion_after: selectedEmotion || undefined,
        emotion_intensity_after: wasHelpful ? Math.max(1, selectedIntensity - 1) : selectedIntensity,
      });
      
      toast.success(wasHelpful ? 'Glad it helped! 🎉' : 'Thanks for the feedback 💙');
      
      // Reset
      setStep('select-emotion');
      setSelectedEmotion(null);
      setSelectedGame(null);
      setCurrentSession(null);
      setRecommendations(null);
    } catch (error) {
      toast.error('Failed to save feedback');
    }
  };

  const selectedEmotionData = emotionOptions.find(e => e.id === selectedEmotion);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 md:mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium mb-3 md:mb-4">
            <Gamepad2 className="w-3 h-3 md:w-4 md:h-4" />
            Emotion Games
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
            Play Your Feelings Away
          </h1>
          <p className="text-gray-600 text-sm md:text-base max-w-lg mx-auto px-4">
            Games designed to help you process emotions in a healthy way. Choose how you're feeling and we'll recommend the perfect game.
          </p>
        </motion.div>

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
            </motion.div>
          )}

          {/* Step 2: Select Intensity */}
          {step === 'select-intensity' && (
            <motion.div
              key="select-intensity"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="text-center"
            >
              <button
                onClick={() => setStep('select-emotion')}
                className="text-gray-500 hover:text-gray-700 mb-6 inline-flex items-center gap-1"
              >
                ← Back
              </button>
              
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-md mx-auto">
                <div className="text-5xl mb-4">{selectedEmotionData?.emoji}</div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {selectedEmotionData?.label}
                </h2>
                <p className="text-gray-600 mb-6">How intense is this feeling?</p>
                
                <div className="space-y-3">
                  {intensityLevels.map((level) => (
                    <motion.button
                      key={level.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleIntensitySelect(level.value)}
                      disabled={loading}
                      className={clsx(
                        'w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-between',
                        level.color,
                        'hover:shadow-md'
                      )}
                    >
                      <span>{level.label}</span>
                      <div className="flex gap-1">
                        {Array.from({ length: level.value }).map((_, i) => (
                          <Zap key={i} className="w-4 h-4" fill="currentColor" />
                        ))}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Game Recommendations */}
          {step === 'recommendations' && recommendations && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <button
                onClick={() => setStep('select-intensity')}
                className="text-gray-500 hover:text-gray-700 mb-6 inline-flex items-center gap-1"
              >
                ← Back
              </button>

              {/* Supportive Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl p-6 text-white mb-6"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Here's what might help</h3>
                    <p className="text-white/90">{recommendations.message}</p>
                  </div>
                </div>
              </motion.div>

              {/* Game Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recommendations.games.map((game, index) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-4xl">{game.emoji}</span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        {game.game_type_display}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-800 mb-2">{game.name}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{game.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        ~{game.avg_duration_minutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Level {game.intensity_level}
                      </span>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-3 mb-4">
                      <p className="text-xs text-purple-700">
                        <Heart className="w-3 h-3 inline mr-1" />
                        {game.therapeutic_benefit}
                      </p>
                    </div>

                    <button
                      onClick={() => handlePlayGame(game)}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" fill="white" />
                      Play Now
                      {game.game_url && <ExternalLink className="w-3 h-3" />}
                    </button>
                  </motion.div>
                ))}
              </div>

              {recommendations.games.length === 0 && (
                <div className="text-center py-12">
                  <Gamepad2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No games available for this emotion yet.</p>
                  <p className="text-gray-400 text-sm">Check back soon!</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 4: Playing */}
          {step === 'playing' && selectedGame && (
            <motion.div
              key="playing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center"
            >
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 max-w-lg mx-auto">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-7xl mb-6"
                >
                  {selectedGame.emoji}
                </motion.div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Playing: {selectedGame.name}
                </h2>
                <p className="text-gray-600 mb-6">
                  Take your time. Come back when you're ready.
                </p>

                {selectedGame.game_url ? (
                  <div className="bg-purple-50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-purple-700">
                      Game opened in a new tab! Play as long as you need.
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50 rounded-xl p-4 mb-6">
                    <p className="text-sm text-amber-700">
                      This is an offline activity. Try it for {selectedGame.avg_duration_minutes} minutes!
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setStep('feedback')}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white py-4 rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  I'm Done
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Feedback */}
          {step === 'feedback' && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center"
            >
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 max-w-md mx-auto">
                <div className="text-5xl mb-4">🎮</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  How was that?
                </h2>
                <p className="text-gray-600 mb-8">
                  Did playing help you feel better?
                </p>

                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEndSession(true)}
                    className="flex-1 bg-green-100 text-green-700 py-4 rounded-xl font-medium hover:bg-green-200 transition-all flex items-center justify-center gap-2"
                  >
                    <ThumbsUp className="w-5 h-5" />
                    Yes, it helped!
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEndSession(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                  >
                    <ThumbsDown className="w-5 h-5" />
                    Not really
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Stats (shown at bottom) */}
        {step === 'select-emotion' && categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-12"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Games by Emotion
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <div
                  key={cat.code}
                  className="bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100 flex items-center gap-2"
                >
                  <span>{cat.emoji}</span>
                  <span className="text-sm text-gray-700">{cat.name}</span>
                  <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
