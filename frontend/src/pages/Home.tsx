import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, RefreshCw, ChevronRight, Wind, Sparkles, ChevronDown, Star, Flame, Brain } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { moodService } from '../services/moodService';
import { petService, WellnessPet } from '../services/petService';
import { insightsService, TriggerPattern } from '../services/insightsService';
import { DashboardSkeleton } from '../components/Skeleton';
import clsx from 'clsx';

// Species to emoji mapping
const speciesEmojis: Record<string, { happy: string; sad: string; neutral: string }> = {
  cat: { happy: '😺', sad: '😿', neutral: '🐱' },
  dog: { happy: '🐶', sad: '🐕', neutral: '🐕' },
  plant: { happy: '🌱', sad: '🥀', neutral: '🌿' },
  bunny: { happy: '🐰', sad: '🐇', neutral: '🐇' },
};

// Daily affirmations
const affirmations = [
  "I am worthy of peace, joy, and all the good things that life has to offer. My feelings are valid, and I am doing my best.",
  "Today, I choose to focus on what I can control and let go of what I cannot.",
  "I am stronger than my challenges and bigger than my fears.",
  "My journey is unique, and I embrace every step of it with courage.",
  "I deserve love, kindness, and compassion - especially from myself.",
  "Every breath I take fills me with calm and peace.",
  "I am allowed to take up space and make my voice heard.",
  "My emotions are valid, and I honor them without judgment.",
  "I am growing, healing, and becoming the best version of myself.",
  "Today is a new opportunity to nurture my mind, body, and soul.",
];

// Quick tools
const quickTools = [
  {
    id: 'breathing-box',
    icon: Wind,
    title: 'Box Breathing',
    subtitle: 'Calm your nervous system',
    color: 'bg-cyan-100',
    iconColor: 'text-cyan-600',
  },
  {
    id: 'grounding-54321',
    icon: Sparkles,
    title: '5-4-3-2-1 Technique',
    subtitle: 'Ground yourself in the present',
    color: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [moodLogged, setMoodLogged] = useState(false);
  const [affirmationIndex, setAffirmationIndex] = useState(0);
  const [moodData, setMoodData] = useState<{ date: string; score: number }[]>([]);
  const [pet, setPet] = useState<WellnessPet | null>(null);
  const [topPattern, setTopPattern] = useState<TriggerPattern | null>(null);

  const firstName = user?.first_name || user?.username || 'Friend';

  useEffect(() => {
    // Set random affirmation on load
    setAffirmationIndex(Math.floor(Math.random() * affirmations.length));
    
    // Check if mood logged today
    const checkMood = async () => {
      try {
        const today = await moodService.getTodayMood();
        if (today) setMoodLogged(true);
        
        // Get mood stats for chart
        const stats = await moodService.getMoodStats('week');
        if (stats?.weekly_trend) {
          // Use the day_label from backend (rolling week ending today)
          const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
          setMoodData(stats.weekly_trend.map((t: any) => ({
            date: t.day_label || new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
            score: t.mood_score,
            isToday: (t.day_label || new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()) === today
          })));
        }
      } catch {
        // Ignore errors
      }
    };
    
    // Load pet data
    const loadPet = async () => {
      try {
        const petData = await petService.getPet();
        setPet(petData);
      } catch {
        // Ignore errors
      }
    };
    
    // Load top insight pattern
    const loadInsights = async () => {
      try {
        const patterns = await insightsService.getActivePatterns();
        if (patterns.length > 0) {
          setTopPattern(patterns[0]);
        }
      } catch {
        // Ignore errors
      }
    };
    
    // Load all data then hide skeleton
    Promise.all([checkMood(), loadPet(), loadInsights()]).finally(() => {
      setLoading(false);
    });
  }, []);

  const newAffirmation = () => {
    setAffirmationIndex((prev) => (prev + 1) % affirmations.length);
  };

  const handleToolClick = (toolId: string) => {
    navigate(`/coping?exercise=${toolId}`);
  };

  // Generate rolling week days (last 6 days + today)
  const getWeekDays = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        label: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        date: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        isToday: i === 0
      });
    }
    return days;
  };
  const weekDays = getWeekDays();

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 flex items-center gap-2">
            Welcome back, {firstName} <span className="text-xl md:text-2xl">✨</span>
          </h1>
          <p className="text-gray-500 text-base md:text-lg mt-1">How is your heart feeling today?</p>
        </motion.div>

        {/* Top Section - Affirmation & Check-in */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
          {/* Daily Affirmation Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-purple-600 p-4 md:p-6 text-white min-h-[180px] md:min-h-[200px]"
          >
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 opacity-20">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="currentColor">
                <path d="M40 0L45 30L80 35L50 45L55 80L40 55L25 80L30 45L0 35L35 30L40 0Z" />
              </svg>
            </div>
            <div className="absolute bottom-0 right-0 opacity-10">
              <svg width="150" height="150" viewBox="0 0 150 150" fill="currentColor">
                <circle cx="75" cy="75" r="75" />
              </svg>
            </div>

            <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Daily Affirmation</h2>
            <p className="text-white/90 text-base md:text-lg italic leading-relaxed mb-4 md:mb-6 max-w-md">
              "{affirmations[affirmationIndex]}"
            </p>
            <button
              onClick={newAffirmation}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 rounded-full transition-all text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              New Affirmation
            </button>
          </motion.div>

          {/* Morning Check-in Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center"
          >
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <Sun className="w-8 h-8 text-amber-500" />
            </div>
            <h3 className="font-semibold text-gray-800 text-lg">Morning Check-in</h3>
            <p className="text-gray-500 text-sm mt-1 mb-4">
              {moodLogged ? "You've logged your mood today!" : "You haven't logged your mood yet."}
            </p>
            <button
              onClick={() => navigate('/mood')}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all"
            >
              {moodLogged ? 'View Entry' : 'Log Now'}
            </button>
          </motion.div>
        </div>

        {/* Bottom Section - Mood Trends & Quick Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Mood Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="font-semibold text-gray-800 text-base md:text-lg">Mood Trends</h3>
              <button className="flex items-center gap-1 text-xs md:text-sm text-gray-500 hover:text-gray-700 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-gray-200">
                Last 7 Days
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Simple Bar Chart - Rolling week (last 6 days + today) */}
            <div className="h-32 flex items-end justify-between gap-2 mb-4">
              {moodData.length > 0 ? moodData.map((entry, i) => {
                const height = entry.score ? (entry.score / 5) * 100 : 0;
                const isToday = i === moodData.length - 1;
                return (
                  <div key={`${entry.date}-${i}`} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '100px' }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className={`absolute bottom-0 left-0 right-0 rounded-t-lg ${
                          isToday 
                            ? 'bg-gradient-to-t from-emerald-500 to-teal-400' 
                            : 'bg-gradient-to-t from-indigo-500 to-violet-400'
                        }`}
                      />
                    </div>
                  </div>
                );
              }) : weekDays.map((dayInfo, i) => (
                <div key={`empty-${dayInfo.label}-${i}`} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '100px' }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 font-medium">
              {moodData.length > 0 ? moodData.map((entry, i) => {
                const isToday = i === moodData.length - 1;
                return (
                  <span 
                    key={`label-${entry.date}-${i}`} 
                    className={`flex-1 text-center ${isToday ? 'text-emerald-600 font-semibold' : ''}`}
                  >
                    {isToday ? 'TODAY' : entry.date}
                  </span>
                );
              }) : weekDays.map((dayInfo, i) => (
                <span 
                  key={`label-${dayInfo.label}-${i}`} 
                  className={`flex-1 text-center ${dayInfo.isToday ? 'text-emerald-600 font-semibold' : ''}`}
                >
                  {dayInfo.isToday ? 'TODAY' : dayInfo.label}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Quick Tools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100"
          >
            <h3 className="font-semibold text-gray-800 text-base md:text-lg mb-3 md:mb-4">Quick Tools</h3>
            <div className="space-y-2 md:space-y-3">
              {quickTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleToolClick(tool.id)}
                  className="w-full flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl hover:bg-gray-50 transition-all group text-left"
                >
                  <div className={clsx('p-2 md:p-3 rounded-xl', tool.color)}>
                    <tool.icon className={clsx('w-4 h-4 md:w-5 md:h-5', tool.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-800 text-sm md:text-base truncate">{tool.title}</h4>
                    <p className="text-xs md:text-sm text-gray-500 truncate">{tool.subtitle}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* New Section - Pet & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
          {/* Pet Widget */}
          {pet && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 md:p-6 shadow-sm border border-amber-100"
            >
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="font-semibold text-gray-800 text-base md:text-lg">Your Pet</h3>
                <button
                  onClick={() => navigate('/pet')}
                  className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
                >
                  Visit <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-5xl"
                >
                  {(() => {
                    const species = pet.pet_type?.species || 'cat';
                    const speciesEmoji = speciesEmojis[species] || speciesEmojis.cat;
                    const moodKey = ['ecstatic', 'happy'].includes(pet.mood) ? 'happy' 
                      : ['sad', 'very_sad'].includes(pet.mood) ? 'sad' : 'neutral';
                    return speciesEmoji[moodKey];
                  })()}
                </motion.div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{pet.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Level {pet.level}
                    </span>
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Flame className="w-4 h-4 text-orange-500" />
                      {pet.current_streak} day streak
                    </span>
                  </div>
                  {/* XP Bar */}
                  <div className="mt-2">
                    <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                        style={{ width: `${pet.level_progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-amber-700 mt-1">
                      {pet.experience}/{pet.xp_for_next_level} XP to next level
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Insights Widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 shadow-sm border border-violet-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                <Brain className="w-5 h-5 text-violet-500" />
                AI Insights
              </h3>
              <button
                onClick={() => navigate('/insights')}
                className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            {topPattern ? (
              <div className="bg-white/60 rounded-xl p-4">
                <p className="font-medium text-gray-800">{topPattern.pattern_name}</p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {topPattern.description}
                </p>
                {topPattern.custom_advice && (
                  <p className="text-sm text-violet-600 mt-2 flex items-start gap-1">
                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {topPattern.custom_advice}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm mb-3">No patterns detected yet</p>
                <button
                  onClick={() => navigate('/insights')}
                  className="text-sm text-violet-600 hover:text-violet-700 font-medium"
                >
                  Run Analysis →
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
