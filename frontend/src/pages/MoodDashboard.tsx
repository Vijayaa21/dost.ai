import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Heart } from 'lucide-react';
import { moodService } from '../services/moodService';
import { useTheme } from '../context/ThemeContext';
import { MoodEntry } from '../types';
import clsx from 'clsx';
import toast from '../utils/toast';

// Mood options matching the design - enhanced with gradients
const moodOptions = [
  { 
    score: 1, 
    emoji: '😞', 
    label: 'VERY LOW', 
    color: 'from-red-100 to-red-50',
    textColor: 'text-red-600',
    borderColor: 'border-red-400',
    shadowColor: 'shadow-red-500/20'
  },
  { 
    score: 2, 
    emoji: '😕', 
    label: 'A BIT OFF', 
    color: 'from-orange-100 to-orange-50',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-400',
    shadowColor: 'shadow-orange-500/20'
  },
  { 
    score: 3, 
    emoji: '🙂', 
    label: 'OKAY', 
    color: 'from-yellow-100 to-amber-50',
    textColor: 'text-yellow-600',
    borderColor: 'border-yellow-400',
    shadowColor: 'shadow-yellow-500/20'
  },
  { 
    score: 4, 
    emoji: '😊', 
    label: 'GOOD', 
    color: 'from-green-100 to-emerald-50',
    textColor: 'text-green-600',
    borderColor: 'border-green-400',
    shadowColor: 'shadow-green-500/20'
  },
  { 
    score: 5, 
    emoji: '✨', 
    label: 'AMAZING', 
    color: 'from-indigo-100 to-purple-50',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-400',
    shadowColor: 'shadow-indigo-500/20'
  },
];

export default function MoodDashboard() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadTodayMood();
  }, []);

  const loadTodayMood = async () => {
    try {
      const data = await moodService.getTodayMood();
      if (data) {
        setTodayMood(data);
        setSelectedMood(data.mood_score);
        setNote(data.note || '');
      }
    } catch {
      // No mood logged today - that's okay
    }
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      await moodService.createMoodEntry({
        mood_score: selectedMood,
        emotions: [],
        note: note,
      });
      setSuccess(true);
      toast.success('Mood logged successfully! 🎉');
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    } catch (err) {
      toast.handleError('Save Mood', err);
      setError('Failed to save mood. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={clsx(
      "min-h-screen p-4 md:p-6 transition-colors duration-300",
      isDark ? "bg-transparent" : "bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50"
    )}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div 
            className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Heart className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className={clsx(
            "text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent mb-3",
            isDark 
              ? "bg-gradient-to-r from-amber-400 to-orange-400" 
              : "bg-gradient-to-r from-amber-600 to-orange-600"
          )}>
            How's your mood right now?
          </h1>
          <p className={clsx("text-base md:text-lg", isDark ? "text-slate-400" : "text-gray-500")}>
            Daily check-ins help you spot patterns over time ✨
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx(
              "border rounded-2xl px-4 py-3 mb-6",
              isDark ? "bg-red-900/30 border-red-700" : "bg-red-50 border-red-200"
            )}
          >
            <p className={clsx("text-sm", isDark ? "text-red-400" : "text-red-600")}>{error}</p>
          </motion.div>
        )}

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={clsx(
              "border rounded-2xl px-4 py-4 mb-6",
              isDark ? "bg-green-900/30 border-green-700" : "bg-green-50 border-green-200"
            )}
          >
            <p className={clsx("text-sm text-center font-medium", isDark ? "text-green-400" : "text-green-600")}>✓ Mood saved successfully! Redirecting...</p>
          </motion.div>
        )}

        {/* Mood Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center gap-3 md:gap-4 mb-8 flex-wrap"
        >
          {moodOptions.map((mood, index) => (
            <motion.button
              key={mood.score}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              onClick={() => setSelectedMood(mood.score)}
              whileHover={{ scale: 1.08, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className={clsx(
                'flex flex-col items-center p-4 md:p-5 lg:p-6 rounded-2xl transition-all border-2 bg-gradient-to-br',
                mood.color,
                selectedMood === mood.score 
                  ? `${mood.borderColor} shadow-xl ${mood.shadowColor}` 
                  : 'border-transparent shadow-md hover:shadow-lg'
              )}
            >
              <motion.span 
                className="text-3xl md:text-4xl lg:text-5xl mb-2"
                animate={selectedMood === mood.score ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {mood.emoji}
              </motion.span>
              <span className={clsx(
                'text-xs font-bold tracking-wide',
                mood.textColor
              )}>
                {mood.label}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Reflect Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={clsx(
            "rounded-3xl p-6 shadow-xl mb-6",
            isDark 
              ? "bg-slate-800/80 border border-slate-700 shadow-amber-500/5" 
              : "bg-white border border-amber-100 shadow-amber-500/5"
          )}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <h2 className={clsx("font-bold text-lg", isDark ? "text-white" : "text-gray-800")}>Reflect on your mood</h2>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What contributed to this feeling? (Optional)"
            className={clsx(
              "w-full h-32 p-4 border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent",
              isDark 
                ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-500" 
                : "bg-amber-50/50 border-amber-200 text-gray-700 placeholder-gray-400"
            )}
          />
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            whileHover={{ scale: selectedMood && !isSubmitting ? 1.02 : 1 }}
            whileTap={{ scale: selectedMood && !isSubmitting ? 0.98 : 1 }}
            onClick={handleSubmit}
            disabled={!selectedMood || isSubmitting}
            className={clsx(
              'w-full py-4 rounded-2xl font-bold text-lg transition-all',
              selectedMood && !isSubmitting
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-xl shadow-amber-500/30'
                : isDark 
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Save Entry
              </span>
            )}
          </motion.button>
        </motion.div>

        {/* Previous Entry Info */}
        {todayMood && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={clsx(
              "text-center mt-6 rounded-2xl p-4",
              isDark ? "bg-slate-800/50" : "bg-white/50"
            )}
          >
            <p className={clsx("text-sm", isDark ? "text-slate-400" : "text-gray-500")}>
              You've already logged your mood today. Saving will update your entry.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
