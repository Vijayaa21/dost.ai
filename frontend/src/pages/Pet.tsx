import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Zap, Sparkles, Trophy, Flame, 
  Gift, Star, Crown, Glasses, Award
} from 'lucide-react';
import { petService, WellnessPet, PetStats } from '../services/petService';
import { PetSkeleton } from '../components/Skeleton';
import toast from '../utils/toast';
import clsx from 'clsx';

// Pet mood expressions (emoji-based for simplicity, can be replaced with SVG animations)
const petExpressions: Record<string, { emoji: string; color: string; bg: string }> = {
  ecstatic: { emoji: '🥳', color: 'text-yellow-500', bg: 'from-yellow-100 to-orange-100' },
  happy: { emoji: '😊', color: 'text-green-500', bg: 'from-green-100 to-emerald-100' },
  neutral: { emoji: '😐', color: 'text-blue-500', bg: 'from-blue-100 to-cyan-100' },
  sad: { emoji: '😢', color: 'text-purple-500', bg: 'from-purple-100 to-pink-100' },
  very_sad: { emoji: '😭', color: 'text-gray-500', bg: 'from-gray-100 to-slate-100' },
};

// Species to emoji mapping
const speciesEmojis: Record<string, { happy: string; sad: string; neutral: string }> = {
  cat: { happy: '😺', sad: '😿', neutral: '🐱' },
  dog: { happy: '🐶', sad: '🐕', neutral: '🐕' },
  plant: { happy: '🌱', sad: '🥀', neutral: '🌿' },
  bunny: { happy: '🐰', sad: '🐇', neutral: '🐇' },
};

// Accessory icons
const accessoryIcons: Record<string, React.ReactNode> = {
  bow: <Gift className="w-4 h-4" />,
  hat: <span>🎩</span>,
  glasses: <Glasses className="w-4 h-4" />,
  scarf: <span>🧣</span>,
  crown: <Crown className="w-4 h-4" />,
  wings: <span>🪽</span>,
};

export default function Pet() {
  const [pet, setPet] = useState<WellnessPet | null>(null);
  const [stats, setStats] = useState<PetStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [newName, setNewName] = useState('');
  const [isFeeding, setIsFeeding] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);

  useEffect(() => {
    loadPet();
  }, []);

  const loadPet = async () => {
    try {
      const [petData, statsData] = await Promise.all([
        petService.getPet(),
        petService.getStats(),
      ]);
      setPet(petData);
      setStats(statsData);
      setNewName(petData.name);
    } catch (error) {
      toast.handleError('Load Pet', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeed = async (boostType: 'happiness' | 'energy') => {
    if (!pet || isFeeding) return;
    
    setIsFeeding(true);
    try {
      const result = await petService.feed(boostType);
      setPet(result.pet);
      toast.success(result.message);
    } catch (error) {
      toast.handleError('Feed Pet', error);
    } finally {
      setIsFeeding(false);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim() || newName === pet?.name) {
      setShowNameEdit(false);
      return;
    }

    try {
      const updatedPet = await petService.updatePet({ name: newName.trim() });
      setPet(updatedPet);
      setShowNameEdit(false);
      toast.success(`Your pet is now called ${newName}! 🎉`);
    } catch (error) {
      toast.handleError('Update Name', error);
    }
  };

  const handleEquipAccessory = async (accessory: string | null) => {
    if (!pet) return;

    try {
      const result = await petService.equip(accessory);
      setPet(result.pet);
      toast.success(result.message);
    } catch (error) {
      toast.handleError('Equip Accessory', error);
    }
  };

  if (isLoading) {
    return <PetSkeleton />;
  }

  if (!pet) return null;

  const expression = petExpressions[pet.mood] || petExpressions.neutral;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 md:mb-6"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1 md:mb-2">
            Your Wellness Pet 🐾
          </h1>
          <p className="text-gray-500 text-sm md:text-base">
            Take care of your pet by taking care of yourself!
          </p>
        </motion.div>

        {/* Main Pet Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`bg-gradient-to-br ${expression.bg} rounded-3xl p-6 md:p-8 shadow-lg mb-6`}
        >
          {/* Pet Display */}
          <div className="text-center mb-6">
            {(() => {
              const species = pet.pet_type?.species || 'cat';
              const speciesEmoji = speciesEmojis[species] || speciesEmojis.cat;
              const moodKey = ['ecstatic', 'happy'].includes(pet.mood) ? 'happy' 
                : ['sad', 'very_sad'].includes(pet.mood) ? 'sad' : 'neutral';
              return (
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: pet.mood === 'ecstatic' ? [0, -5, 5, 0] : 0
                  }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="text-8xl md:text-9xl mb-4 inline-block relative"
                >
                  {speciesEmoji[moodKey]}
                  {pet.equipped_accessory && (
                    <span className="absolute -top-2 -right-2 text-2xl">
                      {pet.equipped_accessory === 'crown' ? '👑' : 
                       pet.equipped_accessory === 'hat' ? '🎩' :
                       pet.equipped_accessory === 'glasses' ? '🕶️' :
                       pet.equipped_accessory === 'bow' ? '🎀' :
                       pet.equipped_accessory === 'scarf' ? '🧣' :
                       pet.equipped_accessory === 'wings' ? '🪽' : ''}
                    </span>
                  )}
                </motion.div>
              );
            })()}

            {/* Pet Name */}
            {showNameEdit ? (
              <div className="flex items-center justify-center gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-300 text-center text-xl font-bold"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
                />
                <button
                  onClick={handleUpdateName}
                  className="px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowNameEdit(true)}
                className="text-2xl font-bold text-gray-800 hover:text-violet-600 transition-colors"
              >
                {pet.name}
              </button>
            )}

            <p className={`text-sm ${expression.color} font-medium mt-1`}>
              Feeling {pet.mood.replace('_', ' ')}!
            </p>
          </div>

          {/* Level & XP */}
          <div className="bg-white/60 backdrop-blur rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-gray-800">Level {pet.level}</span>
              </div>
              <span className="text-sm text-gray-600">
                {pet.experience} / {pet.xp_for_next_level} XP
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pet.level_progress}%` }}
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
            <div className="bg-white/60 backdrop-blur rounded-xl md:rounded-2xl p-2 md:p-4 text-center">
              <Heart className="w-5 h-5 md:w-6 md:h-6 text-red-500 mx-auto mb-1" />
              <p className="text-lg md:text-2xl font-bold text-gray-800">{pet.happiness}</p>
              <p className="text-xs text-gray-500">Happiness</p>
              <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-red-400 rounded-full"
                  style={{ width: `${pet.happiness}%` }}
                />
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur rounded-xl md:rounded-2xl p-2 md:p-4 text-center">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-yellow-500 mx-auto mb-1" />
              <p className="text-lg md:text-2xl font-bold text-gray-800">{pet.energy}</p>
              <p className="text-xs text-gray-500">Energy</p>
              <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-yellow-400 rounded-full"
                  style={{ width: `${pet.energy}%` }}
                />
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur rounded-xl md:rounded-2xl p-2 md:p-4 text-center">
              <Flame className="w-5 h-5 md:w-6 md:h-6 text-orange-500 mx-auto mb-1" />
              <p className="text-lg md:text-2xl font-bold text-gray-800">{pet.current_streak}</p>
              <p className="text-xs text-gray-500">Day Streak</p>
              <p className="text-xs text-gray-400 mt-1">Best: {pet.longest_streak}</p>
            </div>
          </div>

          {/* Feed Buttons */}
          <div className="flex gap-2 md:gap-3">
            <button
              onClick={() => handleFeed('happiness')}
              disabled={isFeeding || pet.happiness >= 100}
              className={clsx(
                "flex-1 py-2 md:py-3 px-3 md:px-4 rounded-xl font-medium flex items-center justify-center gap-1.5 md:gap-2 transition-all text-sm md:text-base",
                pet.happiness >= 100
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-red-100 text-red-600 hover:bg-red-200"
              )}
            >
              <Heart className="w-5 h-5" />
              Give Love
            </button>
            <button
              onClick={() => handleFeed('energy')}
              disabled={isFeeding || pet.energy >= 100}
              className={clsx(
                "flex-1 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all",
                pet.energy >= 100
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
              )}
            >
              <Zap className="w-5 h-5" />
              Energize
            </button>
          </div>
        </motion.div>

        {/* Accessories */}
        {pet.unlocked_accessories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm mb-6"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              Accessories
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleEquipAccessory(null)}
                className={clsx(
                  "px-4 py-2 rounded-xl transition-all",
                  !pet.equipped_accessory
                    ? "bg-violet-100 text-violet-600 ring-2 ring-violet-400"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                None
              </button>
              {pet.unlocked_accessories.map((acc) => (
                <button
                  key={acc}
                  onClick={() => handleEquipAccessory(acc)}
                  className={clsx(
                    "px-4 py-2 rounded-xl flex items-center gap-2 transition-all",
                    pet.equipped_accessory === acc
                      ? "bg-violet-100 text-violet-600 ring-2 ring-violet-400"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {accessoryIcons[acc] || acc}
                  <span className="capitalize">{acc}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Achievements */}
        {stats && stats.achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-sm mb-6"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Achievements
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {stats.achievements.map((achievement) => (
                <div
                  key={achievement.name}
                  className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 text-center"
                >
                  <span className="text-3xl">{achievement.icon}</span>
                  <p className="font-medium text-gray-800 mt-2">{achievement.name}</p>
                  <p className="text-xs text-gray-500">{achievement.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Activities */}
        {pet.recent_activities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 shadow-sm"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-500" />
              Recent Activities
            </h2>
            <div className="space-y-3">
              {pet.recent_activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-800">{activity.activity_display}</p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                  </div>
                  <span className="text-sm font-medium text-violet-600">
                    +{activity.xp_earned} XP
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* How to earn XP */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-violet-50 rounded-2xl p-6 mt-6"
        >
          <h3 className="font-bold text-violet-800 mb-3">💡 How to earn XP</h3>
          <ul className="text-sm text-violet-700 space-y-1">
            <li>• Log your mood daily (+15 XP)</li>
            <li>• Write in your journal (+25 XP)</li>
            <li>• Chat with Dost (+10 XP)</li>
            <li>• Complete breathing exercises (+20 XP)</li>
            <li>• Maintain your streak for bonus XP!</li>
          </ul>
        </motion.div>

        {/* Level Up Animation */}
        <AnimatePresence>
          {showLevelUp && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
              onClick={() => setShowLevelUp(false)}
            >
              <motion.div
                animate={{ 
                  rotate: [0, -10, 10, -10, 10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-3xl p-8 text-center shadow-2xl"
              >
                <span className="text-6xl">🎉</span>
                <h2 className="text-3xl font-bold text-white mt-4">Level Up!</h2>
                <p className="text-white/90 mt-2">
                  {pet.name} reached level {pet.level}!
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
