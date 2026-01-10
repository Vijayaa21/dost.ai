import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { moodService } from '../services/moodService';
import { MoodEntry } from '../types';
import clsx from 'clsx';
import toast from '../utils/toast';

// Mood options matching the design
const moodOptions = [
  { 
    score: 1, 
    emoji: '😞', 
    label: 'VERY LOW', 
    color: 'bg-red-100',
    textColor: 'text-red-500',
    borderColor: 'border-red-300'
  },
  { 
    score: 2, 
    emoji: '😕', 
    label: 'A BIT OFF', 
    color: 'bg-orange-100',
    textColor: 'text-orange-500',
    borderColor: 'border-orange-300'
  },
  { 
    score: 3, 
    emoji: '🙂', 
    label: 'OKAY', 
    color: 'bg-yellow-100',
    textColor: 'text-yellow-600',
    borderColor: 'border-yellow-300'
  },
  { 
    score: 4, 
    emoji: '😊', 
    label: 'GOOD', 
    color: 'bg-green-100',
    textColor: 'text-green-500',
    borderColor: 'border-green-300'
  },
  { 
    score: 5, 
    emoji: '✨', 
    label: 'AMAZING', 
    color: 'bg-indigo-50',
    textColor: 'text-indigo-500',
    borderColor: 'border-indigo-300'
  },
];

export default function MoodDashboard() {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 md:mb-8"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
            How's your mood right now?
          </h1>
          <p className="text-gray-500 text-base md:text-lg">
            Daily check-ins help you spot patterns over time.
          </p>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6"
          >
            <p className="text-red-600 text-sm">{error}</p>
          </motion.div>
        )}

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6"
          >
            <p className="text-green-600 text-sm text-center">✓ Mood saved successfully! Redirecting...</p>
          </motion.div>
        )}

        {/* Mood Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center gap-2 md:gap-3 lg:gap-4 mb-6 md:mb-8 flex-wrap"
        >
          {moodOptions.map((mood) => (
            <motion.button
              key={mood.score}
              onClick={() => setSelectedMood(mood.score)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={clsx(
                'flex flex-col items-center p-3 md:p-4 lg:p-6 rounded-xl md:rounded-2xl transition-all border-2',
                mood.color,
                selectedMood === mood.score 
                  ? `${mood.borderColor} shadow-lg` 
                  : 'border-transparent'
              )}
            >
              <span className="text-2xl md:text-3xl lg:text-4xl mb-1 md:mb-2">{mood.emoji}</span>
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
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-gray-800 text-lg">Reflect on your mood</h2>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What contributed to this feeling? (Optional)"
            className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-700 placeholder-gray-400"
          />
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={handleSubmit}
            disabled={!selectedMood || isSubmitting}
            className={clsx(
              'w-full py-4 rounded-xl font-semibold text-lg transition-all',
              selectedMood && !isSubmitting
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200'
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
              'Save Entry'
            )}
          </button>
        </motion.div>

        {/* Previous Entry Info */}
        {todayMood && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-6"
          >
            <p className="text-sm text-gray-500">
              You've already logged your mood today. Saving will update your entry.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
