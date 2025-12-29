import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Wind, Sparkles, Brain, Clock, Play, Pause, X, RefreshCw } from 'lucide-react';
import { copingService } from '../services/copingService';
import { CopingTool, Affirmation } from '../types';
import clsx from 'clsx';

const categoryIcons: Record<string, React.ReactNode> = {
  breathing: <Wind className="w-5 h-5" />,
  grounding: <Heart className="w-5 h-5" />,
  mindfulness: <Brain className="w-5 h-5" />,
  affirmation: <Sparkles className="w-5 h-5" />,
  relaxation: <Heart className="w-5 h-5" />,
  cognitive: <Brain className="w-5 h-5" />,
};

const categories = [
  { value: 'breathing', label: 'Breathing' },
  { value: 'grounding', label: 'Grounding' },
  { value: 'mindfulness', label: 'Mindfulness' },
  { value: 'relaxation', label: 'Relaxation' },
  { value: 'cognitive', label: 'Cognitive' },
];

export default function CopingToolkit() {
  const [tools, setTools] = useState<CopingTool[]>([]);
  const [selectedTool, setSelectedTool] = useState<CopingTool | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [affirmation, setAffirmation] = useState<Affirmation | null>(null);
  const [isExerciseActive, setIsExerciseActive] = useState(false);

  // Breathing exercise state
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale' | 'idle'>('idle');
  const [breathingCount, setBreathingCount] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(0);

  useEffect(() => {
    loadTools();
    loadAffirmation();
  }, [selectedCategory]);

  const loadTools = async () => {
    try {
      const data = await copingService.getTools(selectedCategory || undefined);
      setTools(data);
    } catch (error) {
      console.error('Failed to load tools:', error);
    }
  };

  const loadAffirmation = async () => {
    try {
      const data = await copingService.getAffirmation();
      setAffirmation(data);
    } catch (error) {
      console.error('Failed to load affirmation:', error);
    }
  };

  const openTool = async (id: number) => {
    try {
      const tool = await copingService.getTool(id);
      setSelectedTool(tool);
    } catch (error) {
      console.error('Failed to load tool:', error);
    }
  };

  const startBreathingExercise = () => {
    if (!selectedTool) return;
    setIsExerciseActive(true);
    setCurrentCycle(1);
    runBreathingCycle();
  };

  const runBreathingCycle = () => {
    if (!selectedTool) return;

    const { inhale_duration = 4, hold_duration = 4 } = selectedTool;

    // Inhale
    setBreathingPhase('inhale');
    let count = inhale_duration;
    setBreathingCount(count);
    
    const inhaleInterval = setInterval(() => {
      count--;
      setBreathingCount(count);
      if (count <= 0) {
        clearInterval(inhaleInterval);
        
        // Hold
        if (hold_duration > 0) {
          setBreathingPhase('hold');
          let holdCount = hold_duration;
          setBreathingCount(holdCount);
          
          const holdInterval = setInterval(() => {
            holdCount--;
            setBreathingCount(holdCount);
            if (holdCount <= 0) {
              clearInterval(holdInterval);
              runExhale();
            }
          }, 1000);
        } else {
          runExhale();
        }
      }
    }, 1000);
  };

  const runExhale = () => {
    if (!selectedTool) return;
    const { exhale_duration = 4, cycles = 4 } = selectedTool;

    setBreathingPhase('exhale');
    let count = exhale_duration;
    setBreathingCount(count);
    
    const exhaleInterval = setInterval(() => {
      count--;
      setBreathingCount(count);
      if (count <= 0) {
        clearInterval(exhaleInterval);
        
        // Check if more cycles
        setCurrentCycle(prev => {
          if (prev < cycles) {
            setTimeout(runBreathingCycle, 500);
            return prev + 1;
          } else {
            setIsExerciseActive(false);
            setBreathingPhase('idle');
            return 0;
          }
        });
      }
    }, 1000);
  };

  const stopExercise = () => {
    setIsExerciseActive(false);
    setBreathingPhase('idle');
    setCurrentCycle(0);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Coping Toolkit</h1>
          <p className="text-gray-600">Tools and exercises to help you feel better</p>
        </div>

        {/* Daily Affirmation */}
        {affirmation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="gradient-primary rounded-2xl p-6 text-white"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">Today's Affirmation</span>
                </div>
                <p className="text-xl font-medium">"{affirmation.text}"</p>
              </div>
              <button
                onClick={loadAffirmation}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={clsx(
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
              !selectedCategory
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={clsx(
                'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2',
                selectedCategory === cat.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {categoryIcons[cat.value]}
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-hover cursor-pointer"
              onClick={() => openTool(tool.id)}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-2xl">
                  {tool.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{tool.title}</h3>
                  <p className="text-sm text-gray-500 capitalize">{tool.category}</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm mt-3 line-clamp-2">{tool.description}</p>
              <div className="flex items-center gap-2 mt-3 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{tool.duration_minutes} min</span>
                <span className="mx-2">•</span>
                <span className="capitalize">{tool.difficulty}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tool Detail Modal */}
        <AnimatePresence>
          {selectedTool && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => { setSelectedTool(null); stopExercise(); }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center text-3xl">
                        {selectedTool.icon}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">{selectedTool.title}</h2>
                        <p className="text-sm text-gray-500">{selectedTool.duration_minutes} minutes</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setSelectedTool(null); stopExercise(); }}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-gray-600 mb-6">{selectedTool.description}</p>

                  {/* Breathing Exercise UI */}
                  {selectedTool.category === 'breathing' && (
                    <div className="mb-6">
                      {isExerciseActive ? (
                        <div className="text-center py-8">
                          <motion.div
                            animate={{
                              scale: breathingPhase === 'inhale' ? 1.3 : breathingPhase === 'exhale' ? 0.8 : 1,
                            }}
                            transition={{ duration: 1 }}
                            className="w-32 h-32 mx-auto rounded-full gradient-calm flex items-center justify-center mb-4"
                          >
                            <div className="text-center">
                              <p className="text-4xl font-bold text-white">{breathingCount}</p>
                              <p className="text-white text-sm capitalize">{breathingPhase}</p>
                            </div>
                          </motion.div>
                          <p className="text-gray-600 mb-4">
                            Cycle {currentCycle} of {selectedTool.cycles || 4}
                          </p>
                          <button
                            onClick={stopExercise}
                            className="btn-outline flex items-center gap-2 mx-auto"
                          >
                            <Pause className="w-4 h-4" />
                            Stop
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={startBreathingExercise}
                          className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                        >
                          <Play className="w-5 h-5" />
                          Start Breathing Exercise
                        </button>
                      )}
                    </div>
                  )}

                  {/* Instructions */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3">Instructions</h3>
                    <ol className="space-y-2">
                      {selectedTool.instructions.map((instruction, index) => (
                        <li key={index} className="flex gap-3 text-gray-600">
                          <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium flex-shrink-0">
                            {index + 1}
                          </span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Benefits */}
                  {selectedTool.benefits && (
                    <div className="bg-green-50 rounded-xl p-4 mb-4">
                      <h4 className="font-medium text-green-800 mb-1">Benefits</h4>
                      <p className="text-green-700 text-sm">{selectedTool.benefits}</p>
                    </div>
                  )}

                  {/* When to use */}
                  {selectedTool.when_to_use && (
                    <div className="bg-lavender-50 rounded-xl p-4">
                      <h4 className="font-medium text-lavender-800 mb-1">When to use</h4>
                      <p className="text-lavender-700 text-sm">{selectedTool.when_to_use}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
