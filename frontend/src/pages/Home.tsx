import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, RefreshCw, ChevronRight, Wind, Sparkles, Star, Flame, Brain, BarChart3, PawPrint } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTheme, getTextClass, getGradientTextClass } from '../context/ThemeContext';
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
  const { isDark } = useTheme();
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
    <div className="min-h-screen p-4 md:p-6 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h1 className={clsx(
            "text-2xl md:text-3xl lg:text-4xl font-bold flex items-center gap-2",
            getGradientTextClass(isDark)
          )}>
            Welcome back, {firstName} <span className="text-2xl md:text-3xl">✨</span>
          </h1>
          <p className={clsx("text-base md:text-lg mt-1", getTextClass(isDark, 'muted'))}>
            How is your heart feeling today?
          </p>
        </motion.div>

        {/* Top Section - Affirmation & Check-in */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
          {/* Daily Affirmation Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-5 md:p-8 text-white min-h-[200px] md:min-h-[220px] shadow-xl shadow-purple-500/20"
          >
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 opacity-20">
              <svg width="100" height="100" viewBox="0 0 80 80" fill="currentColor">
                <path d="M40 0L45 30L80 35L50 45L55 80L40 55L25 80L30 45L0 35L35 30L40 0Z" />
              </svg>
            </div>
            <div className="absolute -bottom-10 -right-10 opacity-10">
              <svg width="200" height="200" viewBox="0 0 150 150" fill="currentColor">
                <circle cx="75" cy="75" r="75" />
              </svg>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <h2 className="text-lg md:text-xl font-bold">Daily Affirmation</h2>
            </div>
            <p className="text-white/95 text-base md:text-xl italic leading-relaxed mb-6 max-w-lg">
              "{affirmations[affirmationIndex]}"
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={newAffirmation}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all text-sm font-medium border border-white/20"
            >
              <RefreshCw className="w-4 h-4" />
              New Affirmation
            </motion.button>
          </motion.div>

          {/* Morning Check-in Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={clsx(
              "rounded-3xl p-6 shadow-lg flex flex-col items-center justify-center text-center",
              isDark 
                ? "bg-slate-800/80 border border-slate-700 shadow-amber-500/5" 
                : "bg-white border border-amber-100 shadow-amber-500/10"
            )}
          >
            <motion.div 
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-amber-400/30"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Sun className="w-8 h-8 text-white" />
            </motion.div>
            <h3 className={clsx("font-bold text-lg", isDark ? "text-white" : "text-gray-800")}>Morning Check-in</h3>
            <p className={clsx("text-sm mt-1 mb-4", isDark ? "text-slate-400" : "text-gray-500")}>
              {moodLogged ? "You've logged your mood today! 🎉" : "You haven't logged your mood yet."}
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/mood')}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-md shadow-indigo-500/30"
            >
              {moodLogged ? 'View Entry' : 'Log Now'}
            </motion.button>
          </motion.div>
        </div>

        {/* Bottom Section - Mood Trends & Quick Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Mood Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={clsx(
              "rounded-3xl p-5 md:p-6 shadow-lg",
              isDark 
                ? "bg-slate-800/80 border border-slate-700 shadow-indigo-500/5" 
                : "bg-white border border-indigo-100 shadow-indigo-500/5"
            )}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className={clsx("font-bold text-lg flex items-center gap-2", isDark ? "text-white" : "text-gray-800")}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                Mood Trends
              </h3>
              <span className={clsx(
                "text-xs px-3 py-1.5 rounded-full font-medium",
                isDark ? "text-slate-400 bg-slate-700" : "text-gray-500 bg-gray-100"
              )}>
                Last 7 Days
              </span>
            </div>

            {/* Simple Bar Chart - Rolling week (last 6 days + today) */}
            <div className="h-36 flex items-end justify-between gap-2 mb-4">
              {moodData.length > 0 ? moodData.map((entry, i) => {
                const height = entry.score ? (entry.score / 5) * 100 : 0;
                const isToday = i === moodData.length - 1;
                return (
                  <div key={`${entry.date}-${i}`} className="flex-1 flex flex-col items-center gap-2">
                    <div className={clsx(
                      "w-full rounded-xl relative overflow-hidden",
                      isDark ? "bg-slate-700" : "bg-gray-100"
                    )} style={{ height: '120px' }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className={`absolute bottom-0 left-0 right-0 rounded-xl ${
                          isToday 
                            ? 'bg-gradient-to-t from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/30' 
                            : 'bg-gradient-to-t from-indigo-500 to-violet-400'
                        }`}
                      />
                    </div>
                  </div>
                );
              }) : weekDays.map((dayInfo, i) => (
                <div key={`empty-${dayInfo.label}-${i}`} className="flex-1 flex flex-col items-center gap-2">
                  <div className={clsx(
                    "w-full rounded-xl relative",
                    isDark ? "bg-slate-700" : "bg-gray-100"
                  )} style={{ height: '120px' }} />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs font-medium">
              {moodData.length > 0 ? moodData.map((entry, i) => {
                const isToday = i === moodData.length - 1;
                return (
                  <span 
                    key={`label-${entry.date}-${i}`} 
                    className={`flex-1 text-center ${isToday ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}
                  >
                    {isToday ? 'TODAY' : entry.date}
                  </span>
                );
              }) : weekDays.map((dayInfo, i) => (
                <span 
                  key={`label-${dayInfo.label}-${i}`} 
                  className={`flex-1 text-center ${dayInfo.isToday ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}
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
            className={clsx(
              "rounded-3xl p-5 md:p-6 shadow-lg",
              isDark 
                ? "bg-slate-800/80 border border-slate-700 shadow-cyan-500/5" 
                : "bg-white border border-cyan-100 shadow-cyan-500/5"
            )}
          >
            <h3 className={clsx("font-bold text-lg mb-4 flex items-center gap-2", isDark ? "text-white" : "text-gray-800")}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <Wind className="w-4 h-4 text-white" />
              </div>
              Quick Tools
            </h3>
            <div className="space-y-3">
              {quickTools.map((tool) => (
                <motion.button
                  key={tool.id}
                  whileHover={{ x: 5 }}
                  onClick={() => handleToolClick(tool.id)}
                  className={clsx(
                    "w-full flex items-center gap-4 p-4 rounded-2xl transition-all group text-left border",
                    isDark 
                      ? "bg-slate-700/50 hover:bg-slate-700 border-slate-600 hover:border-indigo-500/50" 
                      : "bg-gray-50 hover:bg-gradient-to-r hover:from-gray-50 hover:to-indigo-50 border-transparent hover:border-indigo-100"
                  )}
                >
                  <div className={clsx('p-3 rounded-xl shadow-md', tool.color)}>
                    <tool.icon className={clsx('w-5 h-5', tool.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={clsx("font-semibold text-base", isDark ? "text-white" : "text-gray-800")}>{tool.title}</h4>
                    <p className={clsx("text-sm", isDark ? "text-slate-400" : "text-gray-500")}>{tool.subtitle}</p>
                  </div>
                  <ChevronRight className={clsx("w-5 h-5 transition-colors", isDark ? "text-slate-500 group-hover:text-indigo-400" : "text-gray-300 group-hover:text-indigo-500")} />
                </motion.button>
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
              className={clsx(
                "rounded-3xl p-5 md:p-6 shadow-lg",
                isDark 
                  ? "bg-gradient-to-br from-amber-900/40 via-orange-900/30 to-yellow-900/40 border border-amber-700/50 shadow-amber-500/10" 
                  : "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200 shadow-amber-500/10"
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className={clsx("font-bold text-lg flex items-center gap-2", isDark ? "text-white" : "text-gray-800")}>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <PawPrint className="w-4 h-4 text-white" />
                  </div>
                  Your Pet
                </h3>
                <motion.button
                  whileHover={{ x: 3 }}
                  onClick={() => navigate('/pet')}
                  className={clsx("text-sm flex items-center gap-1 font-medium", isDark ? "text-amber-400 hover:text-amber-300" : "text-amber-600 hover:text-amber-700")}
                >
                  Visit <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
              <div className="flex items-center gap-5">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className="text-6xl"
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
                  <p className={clsx("font-bold text-lg", isDark ? "text-white" : "text-gray-800")}>{pet.name}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className={clsx(
                      "text-sm px-2.5 py-1 rounded-full flex items-center gap-1 font-medium",
                      isDark ? "text-amber-300 bg-amber-900/50" : "text-amber-700 bg-amber-100"
                    )}>
                      <Star className="w-3.5 h-3.5 text-yellow-500" />
                      Level {pet.level}
                    </span>
                    <span className={clsx(
                      "text-sm px-2.5 py-1 rounded-full flex items-center gap-1 font-medium",
                      isDark ? "text-orange-300 bg-orange-900/50" : "text-orange-700 bg-orange-100"
                    )}>
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      {pet.current_streak} day
                    </span>
                  </div>
                  {/* XP Bar */}
                  <div className="mt-3">
                    <div className={clsx(
                      "h-2.5 rounded-full overflow-hidden",
                      isDark ? "bg-amber-900/50" : "bg-amber-200"
                    )}>
                      <motion.div 
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pet.level_progress}%` }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                      />
                    </div>
                    <p className={clsx("text-xs mt-1.5 font-medium", isDark ? "text-amber-400" : "text-amber-700")}>
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
            className={clsx(
              "rounded-3xl p-5 md:p-6 shadow-lg",
              isDark 
                ? "bg-gradient-to-br from-violet-900/40 via-purple-900/30 to-indigo-900/40 border border-violet-700/50 shadow-violet-500/10" 
                : "bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 border border-violet-200 shadow-violet-500/10"
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={clsx("font-bold text-lg flex items-center gap-2", isDark ? "text-white" : "text-gray-800")}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                AI Insights
              </h3>
              <motion.button
                whileHover={{ x: 3 }}
                onClick={() => navigate('/insights')}
                className={clsx("text-sm flex items-center gap-1 font-medium", isDark ? "text-violet-400 hover:text-violet-300" : "text-violet-600 hover:text-violet-700")}
              >
                View All <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
            {topPattern ? (
              <div className={clsx(
                "backdrop-blur-sm rounded-2xl p-4",
                isDark ? "bg-slate-800/50 border border-violet-700/30" : "bg-white/70 border border-violet-100"
              )}>
                <p className={clsx("font-semibold", isDark ? "text-white" : "text-gray-800")}>{topPattern.pattern_name}</p>
                <p className={clsx("text-sm mt-1.5 line-clamp-2", isDark ? "text-slate-300" : "text-gray-600")}>
                  {topPattern.description}
                </p>
                {topPattern.custom_advice && (
                  <p className={clsx(
                    "text-sm mt-3 flex items-start gap-2 p-3 rounded-xl",
                    isDark ? "text-violet-300 bg-violet-900/30" : "text-violet-600 bg-violet-50"
                  )}>
                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    {topPattern.custom_advice}
                  </p>
                )}
              </div>
            ) : (
              <div className={clsx(
                "text-center py-6 rounded-2xl",
                isDark ? "bg-slate-800/50" : "bg-white/50"
              )}>
                <Brain className={clsx("w-10 h-10 mx-auto mb-3", isDark ? "text-violet-500" : "text-violet-300")} />
                <p className={clsx("text-sm mb-3", isDark ? "text-slate-400" : "text-gray-500")}>No patterns detected yet</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate('/insights')}
                  className="text-sm text-white bg-gradient-to-r from-violet-500 to-purple-500 px-4 py-2 rounded-xl font-medium"
                >
                  Run Analysis →
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
