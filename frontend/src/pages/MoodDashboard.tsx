import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { Calendar, TrendingUp, Smile, Activity } from 'lucide-react';
import { moodService } from '../services/moodService';
import { MoodEntry, MoodStats } from '../types';
import clsx from 'clsx';
import { format } from 'date-fns';

const moodEmojis = [
  { score: 1, emoji: '😢', label: 'Very Low' },
  { score: 2, emoji: '😔', label: 'Low' },
  { score: 3, emoji: '😐', label: 'Neutral' },
  { score: 4, emoji: '🙂', label: 'Good' },
  { score: 5, emoji: '😊', label: 'Great' },
];

const emotionTags = [
  'happy', 'sad', 'anxious', 'angry', 'calm', 
  'stressed', 'excited', 'tired', 'hopeful', 'grateful'
];

export default function MoodDashboard() {
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null);
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = async () => {
    try {
      const [todayData, statsData] = await Promise.all([
        moodService.getTodayMood(),
        moodService.getMoodStats(period)
      ]);
      setTodayMood(todayData);
      setStats(statsData);
      
      if (todayData) {
        setSelectedMood(todayData.mood_score);
        setSelectedEmotions(todayData.emotions || []);
        setNote(todayData.note || '');
      }
      setError(null);
    } catch (error) {
      console.error('Failed to load mood data:', error);
      setError('Failed to load mood data. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!selectedMood) return;

    setIsSubmitting(true);
    try {
      await moodService.createMoodEntry({
        mood_score: selectedMood,
        emotions: selectedEmotions,
        note: note,
      });
      await loadData();
      setError(null);
    } catch (error) {
      console.error('Failed to save mood:', error);
      setError('Failed to save mood. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev =>
      prev.includes(emotion)
        ? prev.filter(e => e !== emotion)
        : [...prev, emotion]
    );
  };

  const chartData = stats?.weekly_trend.map(entry => ({
    date: format(new Date(entry.date), 'EEE'),
    mood: entry.mood_score,
  })) || [];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mood Dashboard</h1>
            <p className="text-gray-600">Track and understand your emotional patterns</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod('week')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                period === 'week' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
              )}
            >
              Week
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                period === 'month' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
              )}
            >
              Month
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Today's Check-in */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-800">
              {todayMood ? "Today's Mood" : "How are you feeling today?"}
            </h2>
          </div>

          {/* Mood Selector */}
          <div className="flex justify-center gap-4 mb-6">
            {moodEmojis.map((mood) => (
              <button
                key={mood.score}
                onClick={() => setSelectedMood(mood.score)}
                className={clsx(
                  'flex flex-col items-center p-3 rounded-xl transition-all',
                  selectedMood === mood.score
                    ? 'bg-primary-100 scale-110'
                    : 'hover:bg-gray-50'
                )}
              >
                <span className="mood-emoji">{mood.emoji}</span>
                <span className="text-xs text-gray-500 mt-1">{mood.label}</span>
              </button>
            ))}
          </div>

          {/* Emotion Tags */}
          {selectedMood && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4"
            >
              <p className="text-sm text-gray-600 mb-2">What emotions are you experiencing?</p>
              <div className="flex flex-wrap gap-2">
                {emotionTags.map((emotion) => (
                  <button
                    key={emotion}
                    onClick={() => toggleEmotion(emotion)}
                    className={clsx(
                      'px-3 py-1 rounded-full text-sm capitalize transition-all',
                      selectedEmotions.includes(emotion)
                        ? 'bg-lavender-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {emotion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Note */}
          {selectedMood && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4"
            >
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about how you're feeling (optional)"
                className="input-field resize-none h-24"
              />
            </motion.div>
          )}

          {/* Submit Button */}
          {selectedMood && (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="btn-primary w-full py-3"
            >
              {isSubmitting ? 'Saving...' : todayMood ? 'Update Mood' : 'Log Mood'}
            </button>
          )}
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                <Smile className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average Mood</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats?.average_mood.toFixed(1) || '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-lavender-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-lavender-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Entries</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats?.total_entries || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Top Emotion</p>
                <p className="text-2xl font-bold text-gray-800 capitalize">
                  {Object.keys(stats?.emotion_frequency || {})[0] || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mood Trend Chart */}
        {chartData.length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Mood Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} stroke="#9ca3af" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ fill: '#6366f1', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Emotion Frequency */}
        {stats && Object.keys(stats.emotion_frequency).length > 0 && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Emotion Frequency</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={Object.entries(stats.emotion_frequency).map(([emotion, count]) => ({
                    emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
                    count
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="emotion" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
