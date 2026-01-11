import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';

interface BreathingBubbleProps {
  onBack: () => void;
  onComplete: (wasHelpful: boolean) => void;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

const breathingPatterns = {
  '4-7-8': { inhale: 4, hold: 7, exhale: 8, rest: 0, name: 'Relaxing (4-7-8)' },
  'box': { inhale: 4, hold: 4, exhale: 4, rest: 4, name: 'Box Breathing' },
  'calming': { inhale: 4, hold: 2, exhale: 6, rest: 0, name: 'Calming' },
};

export default function BreathingBubble({ onBack, onComplete }: BreathingBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [countdown, setCountdown] = useState(4);
  const [cycles, setCycles] = useState(0);
  const [pattern, setPattern] = useState<keyof typeof breathingPatterns>('4-7-8');

  const currentPattern = breathingPatterns[pattern];

  const getPhaseInstruction = (phase: BreathPhase) => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'rest': return 'Rest';
    }
  };

  const getPhaseColor = (phase: BreathPhase) => {
    switch (phase) {
      case 'inhale': return 'from-blue-400 to-cyan-400';
      case 'hold': return 'from-purple-400 to-violet-400';
      case 'exhale': return 'from-teal-400 to-green-400';
      case 'rest': return 'from-indigo-400 to-blue-400';
    }
  };

  const getBubbleScale = (phase: BreathPhase) => {
    switch (phase) {
      case 'inhale': return 1.5;
      case 'hold': return 1.5;
      case 'exhale': return 1;
      case 'rest': return 1;
    }
  };

  const getNextPhase = useCallback((currentPhase: BreathPhase): BreathPhase => {
    const p = currentPattern;
    switch (currentPhase) {
      case 'inhale': return p.hold > 0 ? 'hold' : 'exhale';
      case 'hold': return 'exhale';
      case 'exhale': return p.rest > 0 ? 'rest' : 'inhale';
      case 'rest': return 'inhale';
    }
  }, [currentPattern]);

  const getPhaseDuration = useCallback((phase: BreathPhase): number => {
    const p = currentPattern;
    switch (phase) {
      case 'inhale': return p.inhale;
      case 'hold': return p.hold;
      case 'exhale': return p.exhale;
      case 'rest': return p.rest;
    }
  }, [currentPattern]);

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          const nextPhase = getNextPhase(phase);
          setPhase(nextPhase);
          
          if (nextPhase === 'inhale' && phase !== 'inhale') {
            setCycles(c => c + 1);
          }
          
          return getPhaseDuration(nextPhase);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, phase, getNextPhase, getPhaseDuration]);

  const handleStart = () => {
    setIsPlaying(true);
    setPhase('inhale');
    setCountdown(currentPattern.inhale);
    setCycles(0);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setPhase('inhale');
    setCountdown(currentPattern.inhale);
    setCycles(0);
  };

  const handlePatternChange = (newPattern: keyof typeof breathingPatterns) => {
    setPattern(newPattern);
    handleReset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-white mb-6">Breathing Exercise</h1>
        
        {/* Pattern Selector */}
        <div className="flex gap-2 mb-8 flex-wrap justify-center">
          {(Object.keys(breathingPatterns) as Array<keyof typeof breathingPatterns>).map((p) => (
            <button
              key={p}
              onClick={() => handlePatternChange(p)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                pattern === p
                  ? 'bg-white text-purple-900'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {breathingPatterns[p].name}
            </button>
          ))}
        </div>

        {/* Breathing Bubble */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Outer rings */}
          <motion.div
            className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full border-2 border-white/10"
            animate={{ scale: isPlaying ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-72 h-72 md:w-96 md:h-96 rounded-full border border-white/5"
            animate={{ scale: isPlaying ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
          />

          {/* Main bubble */}
          <motion.div
            className={`w-48 h-48 md:w-64 md:h-64 rounded-full bg-gradient-to-br ${getPhaseColor(phase)} shadow-2xl flex items-center justify-center`}
            animate={{
              scale: isPlaying ? getBubbleScale(phase) : 1,
            }}
            transition={{
              duration: getPhaseDuration(phase),
              ease: phase === 'inhale' ? 'easeOut' : phase === 'exhale' ? 'easeIn' : 'linear',
            }}
          >
            <div className="text-center text-white">
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl md:text-2xl font-medium mb-2"
              >
                {getPhaseInstruction(phase)}
              </motion.div>
              <div className="text-5xl md:text-6xl font-bold">
                {countdown}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Cycles Counter */}
        <div className="text-white/60 text-lg mb-6">
          Cycles completed: <span className="text-white font-semibold">{cycles}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {!isPlaying ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStart}
              className="px-8 py-4 bg-white text-purple-900 rounded-full font-semibold flex items-center gap-2 shadow-lg"
            >
              <Play className="w-5 h-5" fill="currentColor" />
              {cycles > 0 ? 'Resume' : 'Start'}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePause}
              className="px-8 py-4 bg-white/20 text-white rounded-full font-semibold flex items-center gap-2"
            >
              <Pause className="w-5 h-5" />
              Pause
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="p-4 bg-white/10 text-white rounded-full"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Completion prompt */}
        <AnimatePresence>
          {cycles >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 text-center"
            >
              <p className="text-white/80 mb-4">Great job! You've completed {cycles} cycles.</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => onComplete(true)}
                  className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                >
                  I feel calmer 😌
                </button>
                <button
                  onClick={() => onComplete(false)}
                  className="px-6 py-3 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition-colors"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tips */}
      <div className="mt-auto pt-6 text-center text-white/50 text-sm">
        <p>Tip: Find a comfortable position and focus on the bubble's movement</p>
      </div>
    </div>
  );
}
