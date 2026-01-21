import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, AlertCircle, TrendingUp, TrendingDown, Minus,
  Lightbulb, Clock, Calendar, Tag, X, RefreshCw,
  ThumbsUp, ThumbsDown, ChevronRight, Sparkles
} from 'lucide-react';
import { insightsService, TriggerPattern, MoodAnalysis, InsightNotification } from '../services/insightsService';
import { useTheme } from '../context/ThemeContext';
import { InsightsSkeleton } from '../components/Skeleton';
import toast from '../utils/toast';
import clsx from 'clsx';

// Emotion type colors and icons
const emotionStyles: Record<string, { color: string; bg: string; icon: string }> = {
  anxiety: { color: 'text-amber-600', bg: 'bg-amber-50', icon: '😰' },
  sadness: { color: 'text-blue-600', bg: 'bg-blue-50', icon: '😢' },
  anger: { color: 'text-red-600', bg: 'bg-red-50', icon: '😠' },
  stress: { color: 'text-orange-600', bg: 'bg-orange-50', icon: '😫' },
  low_energy: { color: 'text-gray-600', bg: 'bg-gray-50', icon: '😴' },
  overwhelm: { color: 'text-purple-600', bg: 'bg-purple-50', icon: '🤯' },
  loneliness: { color: 'text-indigo-600', bg: 'bg-indigo-50', icon: '😔' },
  positive: { color: 'text-green-600', bg: 'bg-green-50', icon: '😊' },
};

// Trigger type icons
const triggerIcons: Record<string, React.ReactNode> = {
  time: <Clock className="w-5 h-5" />,
  topic: <Tag className="w-5 h-5" />,
  activity: <Calendar className="w-5 h-5" />,
};

export default function Insights() {
  const { isDark } = useTheme();
  const [patterns, setPatterns] = useState<TriggerPattern[]>([]);
  const [notifications, setNotifications] = useState<InsightNotification[]>([]);
  const [analysis, setAnalysis] = useState<MoodAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<TriggerPattern | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [patternsData, notificationsData, analysisData] = await Promise.all([
        insightsService.getActivePatterns(),
        insightsService.getUnreadNotifications(),
        insightsService.getLatestAnalysis(),
      ]);
      setPatterns(patternsData);
      setNotifications(notificationsData);
      setAnalysis(analysisData);
    } catch (error) {
      toast.handleError('Load Insights', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const result = await insightsService.analyzePatterns();
      toast.success(result.message);
      setPatterns(result.patterns);
    } catch (error) {
      toast.handleError('Analyze Patterns', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDismissPattern = async (id: number) => {
    try {
      await insightsService.dismissPattern(id);
      setPatterns(patterns.filter(p => p.id !== id));
      setSelectedPattern(null);
      toast.info('Pattern dismissed');
    } catch (error) {
      toast.handleError('Dismiss Pattern', error);
    }
  };

  const handleNotificationFeedback = async (id: number, helpful: boolean) => {
    try {
      await insightsService.provideFeedback(id, helpful);
      await insightsService.markAsRead(id);
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success(helpful ? 'Thanks for the feedback! 🙏' : 'Noted. We\'ll improve!');
    } catch (error) {
      toast.handleError('Feedback', error);
    }
  };

  const handleGenerateAnalysis = async () => {
    try {
      const newAnalysis = await insightsService.generateAnalysis();
      setAnalysis(newAnalysis);
      toast.success('New analysis generated! 📊');
    } catch (error) {
      toast.handleError('Generate Analysis', error);
    }
  };

  if (isLoading) {
    return <InsightsSkeleton />;
  }

  return (
    <div className="min-h-screen p-4 md:p-6 transition-colors duration-300 relative z-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className={clsx(
                "text-2xl md:text-3xl font-bold bg-clip-text text-transparent flex items-center gap-2",
                isDark 
                  ? "bg-gradient-to-r from-violet-400 to-purple-400" 
                  : "bg-gradient-to-r from-violet-600 to-purple-600"
              )}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                Your Insights
              </h1>
              <p className={clsx("mt-2 text-sm md:text-base", isDark ? "text-slate-400" : "text-gray-500")}>
                AI-powered patterns and trends from your wellness journey
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg shadow-violet-500/30 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze Patterns
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <h2 className={clsx("text-lg font-bold mb-3 flex items-center gap-2", isDark ? "text-white" : "text-gray-800")}>
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Notifications
            </h2>
            <div className="space-y-3">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={clsx(
                    "rounded-xl p-4 shadow-sm border-l-4 border-amber-400",
                    isDark ? "bg-slate-800/80" : "bg-white"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={clsx("font-medium", isDark ? "text-white" : "text-gray-800")}>{notification.title}</h3>
                      <p className={clsx("text-sm mt-1", isDark ? "text-slate-400" : "text-gray-600")}>{notification.message}</p>
                      {typeof notification.action_data === 'object' && notification.action_data !== null && 'advice' in notification.action_data && (
                        <p className="text-sm text-violet-500 mt-2 flex items-center gap-1">
                          <Lightbulb className="w-4 h-4" />
                          {String((notification.action_data as Record<string, unknown>).advice)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleNotificationFeedback(notification.id, true)}
                        className={clsx(
                          "p-2 rounded-lg transition-colors",
                          isDark 
                            ? "hover:bg-green-900/30 text-slate-500 hover:text-green-400" 
                            : "hover:bg-green-50 text-gray-400 hover:text-green-500"
                        )}
                        title="Helpful"
                      >
                        <ThumbsUp className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleNotificationFeedback(notification.id, false)}
                        className={clsx(
                          "p-2 rounded-lg transition-colors",
                          isDark 
                            ? "hover:bg-red-900/30 text-slate-500 hover:text-red-400" 
                            : "hover:bg-red-50 text-gray-400 hover:text-red-500"
                        )}
                        title="Not helpful"
                      >
                        <ThumbsDown className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Mood Analysis Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={clsx(
            "rounded-2xl p-6 shadow-sm mb-6",
            isDark ? "bg-slate-800/80 border border-slate-700" : "bg-white"
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className={clsx("text-lg font-bold flex items-center gap-2", isDark ? "text-white" : "text-gray-800")}>
              {analysis?.trend_direction === 'improving' ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : analysis?.trend_direction === 'declining' ? (
                <TrendingDown className="w-5 h-5 text-amber-500" />
              ) : (
                <Minus className="w-5 h-5 text-blue-500" />
              )}
              Mood Trend
            </h2>
            <button
              onClick={handleGenerateAnalysis}
              className="text-sm text-violet-500 hover:text-violet-400 flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {analysis ? (
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <p className={clsx(
                    "text-4xl font-bold",
                    analysis.average_mood >= 4 && "text-green-600",
                    analysis.average_mood >= 3 && analysis.average_mood < 4 && "text-blue-600",
                    analysis.average_mood < 3 && "text-amber-600"
                  )}>
                    {analysis.average_mood.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-500">Recent Avg</p>
                </div>
                <div className={clsx(
                  "px-4 py-2 rounded-full text-sm font-medium",
                  analysis.trend_direction === 'improving' && "bg-green-100 text-green-700",
                  analysis.trend_direction === 'declining' && analysis.average_mood < 3 && "bg-amber-100 text-amber-700",
                  analysis.trend_direction === 'declining' && analysis.average_mood >= 3 && "bg-blue-100 text-blue-700",
                  analysis.trend_direction === 'stable' && analysis.average_mood >= 3.5 && "bg-green-100 text-green-700",
                  analysis.trend_direction === 'stable' && analysis.average_mood < 3.5 && "bg-blue-100 text-blue-700"
                )}>
                  {analysis.trend_direction === 'improving' ? '🌟 Improving!' :
                   analysis.trend_direction === 'declining' && analysis.average_mood < 3 ? '💙 Hang in there' :
                   analysis.trend_direction === 'declining' ? '📊 Slight dip' :
                   analysis.average_mood >= 3.5 ? '✨ Doing great!' :
                   '💪 Steady'}
                  {analysis.trend_percentage !== 0 && Math.abs(analysis.trend_percentage) > 5 && 
                   ` (${analysis.trend_percentage > 0 ? '+' : ''}${analysis.trend_percentage.toFixed(0)}%)`}
                </div>
              </div>
              <p className={clsx("mb-4", isDark ? "text-slate-300" : "text-gray-600")}>{analysis.summary}</p>

              {/* Highlights */}
              {analysis.highlights && analysis.highlights.length > 0 && (
                <div className={clsx(
                  "rounded-xl p-4 mb-4",
                  isDark ? "bg-emerald-900/30" : "bg-gradient-to-r from-emerald-50 to-teal-50"
                )}>
                  <h3 className={clsx("font-medium mb-2", isDark ? "text-emerald-400" : "text-emerald-800")}>✨ Highlights</h3>
                  <ul className={clsx("text-sm space-y-1", isDark ? "text-emerald-300" : "text-emerald-700")}>
                    {analysis.highlights.map((highlight, i) => (
                      <li key={i}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {analysis.recommendations.length > 0 && (
                <div className={clsx(
                  "rounded-xl p-4",
                  isDark ? "bg-violet-900/30" : "bg-violet-50"
                )}>
                  <h3 className={clsx("font-medium mb-2 flex items-center gap-2", isDark ? "text-violet-400" : "text-violet-800")}>
                    <Lightbulb className="w-4 h-4" />
                    {analysis.trend_direction === 'improving' || analysis.average_mood >= 3.5 
                      ? 'Keep It Going!' 
                      : 'Recommendations'}
                  </h3>
                  <ul className={clsx("text-sm space-y-1", isDark ? "text-violet-300" : "text-violet-700")}>
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className={clsx("mb-4", isDark ? "text-slate-400" : "text-gray-500")}>No analysis available yet</p>
              <button
                onClick={handleGenerateAnalysis}
                className="btn-primary"
              >
                Generate First Analysis
              </button>
            </div>
          )}
        </motion.div>

        {/* Trigger Patterns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className={clsx("text-lg font-bold mb-4 flex items-center gap-2", isDark ? "text-white" : "text-gray-800")}>
            <Tag className="w-5 h-5 text-violet-500" />
            Detected Patterns
          </h2>

          {patterns.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {patterns.map((pattern) => {
                const style = emotionStyles[pattern.emotion_type] || emotionStyles.stress;
                return (
                  <motion.button
                    key={pattern.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPattern(pattern)}
                    className={clsx(
                      "text-left rounded-2xl p-5 shadow-sm border-2 transition-all",
                      isDark ? "bg-slate-800/80 border-slate-700 hover:border-violet-500/50" : `${style.bg} border-transparent hover:border-violet-300`
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{style.icon}</span>
                      <div className="flex-1">
                        <h3 className={clsx("font-bold", isDark ? "text-white" : "text-gray-800")}>{pattern.pattern_name}</h3>
                        <p className={clsx("text-sm mt-1 line-clamp-2", isDark ? "text-slate-400" : "text-gray-600")}>
                          {pattern.description}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className={clsx(
                            "text-xs px-2 py-1 rounded-full",
                            isDark ? "bg-slate-700 text-slate-300" : `${style.bg} ${style.color}`
                          )}>
                            {pattern.emotion_type_display}
                          </span>
                          <span className={clsx("text-xs flex items-center gap-1", isDark ? "text-slate-500" : "text-gray-500")}>
                            {triggerIcons[pattern.trigger_type]}
                            {pattern.trigger_type_display}
                          </span>
                        </div>
                        {/* Confidence indicator */}
                        <div className="mt-3">
                          <div className={clsx("flex items-center justify-between text-xs mb-1", isDark ? "text-slate-500" : "text-gray-500")}>
                            <span>Confidence</span>
                            <span>{Math.round(pattern.confidence_score * 100)}%</span>
                          </div>
                          <div className={clsx("h-1.5 rounded-full overflow-hidden", isDark ? "bg-slate-700" : "bg-gray-200")}>
                            <div 
                              className="h-full bg-violet-500 rounded-full"
                              style={{ width: `${pattern.confidence_score * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={clsx("w-5 h-5", isDark ? "text-slate-500" : "text-gray-400")} />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className={clsx(
              "rounded-2xl p-8 text-center shadow-sm",
              isDark ? "bg-slate-800/80 border border-slate-700" : "bg-white"
            )}>
              <Brain className={clsx("w-12 h-12 mx-auto mb-4", isDark ? "text-slate-600" : "text-gray-300")} />
              <h3 className={clsx("font-medium mb-2", isDark ? "text-white" : "text-gray-800")}>No patterns detected yet</h3>
              <p className={clsx("text-sm mb-4", isDark ? "text-slate-400" : "text-gray-500")}>
                Keep logging your moods and journaling. We'll analyze your data to find patterns.
              </p>
              <button onClick={handleAnalyze} className="btn-primary">
                Run Analysis
              </button>
            </div>
          )}
        </motion.div>

        {/* Pattern Detail Modal */}
        <AnimatePresence>
          {selectedPattern && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedPattern(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">
                      {emotionStyles[selectedPattern.emotion_type]?.icon || '📊'}
                    </span>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">
                        {selectedPattern.pattern_name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Detected {selectedPattern.occurrence_count} times
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPattern(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-gray-600 mb-4">{selectedPattern.description}</p>

                {/* Details */}
                <div className="space-y-3 mb-6">
                  {selectedPattern.time_of_day && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        Usually occurs in the <strong>{selectedPattern.time_of_day}</strong>
                      </span>
                    </div>
                  )}
                  {selectedPattern.day_of_week && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        Common on <strong className="capitalize">{selectedPattern.day_of_week}s</strong>
                      </span>
                    </div>
                  )}
                  {selectedPattern.keywords.length > 0 && (
                    <div className="flex items-start gap-2 text-sm">
                      <Tag className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="flex flex-wrap gap-1">
                        {selectedPattern.keywords.map((keyword, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom Advice */}
                {selectedPattern.custom_advice && (
                  <div className="bg-violet-50 rounded-xl p-4 mb-4">
                    <h3 className="font-medium text-violet-800 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      What Might Help
                    </h3>
                    <p className="text-sm text-violet-700">{selectedPattern.custom_advice}</p>
                  </div>
                )}

                {/* Additional Advice Tips */}
                {selectedPattern.all_advice && selectedPattern.all_advice.length > 1 && (
                  <div className="bg-indigo-50 rounded-xl p-4 mb-4">
                    <h3 className="font-medium text-indigo-800 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      More Coping Strategies
                    </h3>
                    <ul className="space-y-2">
                      {selectedPattern.all_advice.slice(1).map((tip, idx) => (
                        <li key={idx} className="text-sm text-indigo-700 flex items-start gap-2">
                          <span className="text-indigo-400 mt-0.5">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Therapeutic Note */}
                {selectedPattern.therapeutic_note && (
                  <div className="bg-emerald-50 rounded-xl p-4 mb-6 border border-emerald-100">
                    <h3 className="font-medium text-emerald-800 mb-2 flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Understanding This Pattern
                    </h3>
                    <p className="text-sm text-emerald-700 italic">{selectedPattern.therapeutic_note}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDismissPattern(selectedPattern.id)}
                    className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Dismiss Pattern
                  </button>
                  <button
                    onClick={() => setSelectedPattern(null)}
                    className="flex-1 py-3 px-4 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
                  >
                    Got It
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
