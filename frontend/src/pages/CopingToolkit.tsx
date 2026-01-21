import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pause, Wind, Eye, Dumbbell, Heart, Headphones, RotateCcw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import clsx from 'clsx';

// Tool types
type ToolType = 'breathing' | 'grounding' | 'muscle' | 'sounds' | 'gratitude';

interface CopingToolCard {
  id: string;
  type: ToolType;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
}

// Tool definitions
const copingTools: CopingToolCard[] = [
  {
    id: 'breathing-478',
    type: 'breathing',
    title: '4-7-8 Breathing',
    subtitle: 'INSTANT CALM FOR RACING HEARTS',
    icon: <Wind className="w-5 h-5" />,
    color: 'text-cyan-500',
    bgGradient: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'sounds',
    type: 'sounds',
    title: 'Zen Soundscapes',
    subtitle: 'AUDIO TEXTURES TO FADE THE WORLD',
    icon: <Headphones className="w-5 h-5" />,
    color: 'text-teal-500',
    bgGradient: 'from-teal-600 to-emerald-700',
  },
  {
    id: 'grounding-54321',
    type: 'grounding',
    title: '5-4-3-2-1 Grounding',
    subtitle: 'ANCHOR YOURSELF IN REALITY',
    icon: <Eye className="w-5 h-5" />,
    color: 'text-orange-500',
    bgGradient: 'from-orange-400 to-amber-500',
  },
  {
    id: 'muscle-relaxation',
    type: 'muscle',
    title: 'Muscle Relaxation',
    subtitle: 'RELEASE THE WEIGHT YOU CARRY',
    icon: <Dumbbell className="w-5 h-5" />,
    color: 'text-purple-500',
    bgGradient: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'gratitude',
    type: 'gratitude',
    title: 'Gratitude Jar',
    subtitle: 'COLLECT MOMENTS OF LIGHT',
    icon: <Heart className="w-5 h-5" />,
    color: 'text-rose-500',
    bgGradient: 'from-rose-400 to-pink-500',
  },
  {
    id: 'breathing-box',
    type: 'breathing',
    title: 'Box Breathing',
    subtitle: 'BALANCE YOUR NERVOUS SYSTEM',
    icon: <Wind className="w-5 h-5" />,
    color: 'text-indigo-500',
    bgGradient: 'from-indigo-500 to-purple-600',
  },
];

// Sound options
const soundOptions = [
  { id: 'rain', name: 'Soft Rain', icon: '💧' },
  { id: 'brown', name: 'Deep Brown', icon: '🌊' },
  { id: 'forest', name: 'Forest Ambience', icon: '🌲' },
  { id: 'waves', name: 'Ocean Waves', icon: '🌊' },
];

// Grounding steps
const groundingSteps = [
  { count: 5, sense: 'SEE', prompt: 'Name 5 things you can see around you', color: 'from-blue-500 to-cyan-500' },
  { count: 4, sense: 'TOUCH', prompt: 'Name 4 things you can physically feel', color: 'from-green-500 to-emerald-500' },
  { count: 3, sense: 'HEAR', prompt: 'Name 3 things you can hear right now', color: 'from-yellow-500 to-orange-500' },
  { count: 2, sense: 'SMELL', prompt: 'Name 2 things you can smell', color: 'from-purple-500 to-pink-500' },
  { count: 1, sense: 'TASTE', prompt: 'Name 1 thing you can taste', color: 'from-rose-500 to-red-500' },
];

// Muscle groups for PMR
const muscleGroups = [
  { id: 'hands', name: 'Hands & Forearms', instruction: 'Make tight fists, squeeze for 5 seconds, then release', emoji: '✊' },
  { id: 'arms', name: 'Upper Arms', instruction: 'Bend your elbows, tense your biceps, hold, then release', emoji: '💪' },
  { id: 'shoulders', name: 'Shoulders', instruction: 'Raise shoulders to ears, hold the tension, then drop', emoji: '🙆' },
  { id: 'face', name: 'Face', instruction: 'Scrunch your face tightly, hold, then relax completely', emoji: '😣' },
  { id: 'chest', name: 'Chest', instruction: 'Take a deep breath, hold it, feel the tension, exhale', emoji: '🫁' },
  { id: 'stomach', name: 'Stomach', instruction: 'Tighten your abdominal muscles, hold, then release', emoji: '🧘' },
  { id: 'legs', name: 'Legs', instruction: 'Stretch your legs, point your toes, hold, then relax', emoji: '🦵' },
  { id: 'feet', name: 'Feet', instruction: 'Curl your toes tightly, hold the tension, then release', emoji: '🦶' },
];

export default function CopingToolkit() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTool, setActiveTool] = useState<CopingToolCard | null>(null);
  const { isDark } = useTheme();
  
  // Breathing state
  const [breathingPhase, setBreathingPhase] = useState<'ready' | 'inhale' | 'hold' | 'exhale' | 'complete'>('ready');
  const [breathingCount, setBreathingCount] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [totalCycles] = useState(4);
  const breathingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Grounding state
  const [groundingStep, setGroundingStep] = useState(0);
  const [groundingInputs, setGroundingInputs] = useState<string[][]>([[], [], [], [], []]);
  const [currentInput, setCurrentInput] = useState('');
  
  // Muscle relaxation state
  const [muscleStep, setMuscleStep] = useState(0);
  const [musclePhase, setMusclePhase] = useState<'ready' | 'tense' | 'release' | 'rest' | 'complete'>('ready');
  const [muscleCount, setMuscleCount] = useState(0);
  const muscleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Sound state
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  
  // Gratitude state
  const [gratitudeItems, setGratitudeItems] = useState<string[]>([]);
  const [gratitudeInput, setGratitudeInput] = useState('');

  // Check URL params for direct navigation
  useEffect(() => {
    const exercise = searchParams.get('exercise');
    const category = searchParams.get('category');
    
    if (category === 'breathing' || exercise) {
      const tool = copingTools.find(t => t.type === 'breathing');
      if (tool) setActiveTool(tool);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
      if (muscleTimerRef.current) clearInterval(muscleTimerRef.current);
    };
  }, []);

  // Close tool and reset state
  const closeTool = () => {
    setActiveTool(null);
    resetBreathing();
    resetGrounding();
    resetMuscle();
    setPlayingSound(null);
  };

  // ========== BREATHING EXERCISE ==========
  const getBreathingConfig = () => {
    if (activeTool?.id === 'breathing-478') {
      return { inhale: 4, hold: 7, exhale: 8 };
    }
    return { inhale: 4, hold: 4, exhale: 4 }; // Box breathing
  };

  const startBreathing = () => {
    setBreathingPhase('inhale');
    setCurrentCycle(1);
    runBreathingPhase('inhale');
  };

  const runBreathingPhase = (phase: 'inhale' | 'hold' | 'exhale') => {
    const config = getBreathingConfig();
    const duration = phase === 'inhale' ? config.inhale : phase === 'hold' ? config.hold : config.exhale;
    
    setBreathingPhase(phase);
    setBreathingCount(duration);
    
    let count = duration;
    breathingTimerRef.current = setInterval(() => {
      count--;
      setBreathingCount(count);
      
      if (count <= 0) {
        if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
        
        if (phase === 'inhale') {
          runBreathingPhase('hold');
        } else if (phase === 'hold') {
          runBreathingPhase('exhale');
        } else {
          // Exhale complete - check for next cycle
          setCurrentCycle(prev => {
            if (prev < totalCycles) {
              setTimeout(() => runBreathingPhase('inhale'), 500);
              return prev + 1;
            } else {
              setBreathingPhase('complete');
              return prev;
            }
          });
        }
      }
    }, 1000);
  };

  const resetBreathing = () => {
    if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
    setBreathingPhase('ready');
    setBreathingCount(0);
    setCurrentCycle(0);
  };

  // ========== GROUNDING EXERCISE ==========
  const addGroundingItem = () => {
    if (!currentInput.trim()) return;
    
    const step = groundingSteps[groundingStep];
    const newInputs = [...groundingInputs];
    
    if (newInputs[groundingStep].length < step.count) {
      newInputs[groundingStep] = [...newInputs[groundingStep], currentInput.trim()];
      setGroundingInputs(newInputs);
      setCurrentInput('');
      
      // Auto advance to next step if complete
      if (newInputs[groundingStep].length >= step.count && groundingStep < 4) {
        setTimeout(() => setGroundingStep(groundingStep + 1), 500);
      }
    }
  };

  const resetGrounding = () => {
    setGroundingStep(0);
    setGroundingInputs([[], [], [], [], []]);
    setCurrentInput('');
  };

  // ========== MUSCLE RELAXATION ==========
  const startMuscleExercise = () => {
    setMusclePhase('tense');
    setMuscleCount(5);
    runMusclePhase('tense');
  };

  const runMusclePhase = (phase: 'tense' | 'release' | 'rest') => {
    const duration = phase === 'tense' ? 5 : phase === 'release' ? 3 : 5;
    setMusclePhase(phase);
    setMuscleCount(duration);
    
    let count = duration;
    muscleTimerRef.current = setInterval(() => {
      count--;
      setMuscleCount(count);
      
      if (count <= 0) {
        if (muscleTimerRef.current) clearInterval(muscleTimerRef.current);
        
        if (phase === 'tense') {
          runMusclePhase('release');
        } else if (phase === 'release') {
          runMusclePhase('rest');
        } else {
          // Rest complete - next muscle group
          if (muscleStep < muscleGroups.length - 1) {
            setMuscleStep(prev => prev + 1);
            setTimeout(() => runMusclePhase('tense'), 500);
          } else {
            setMusclePhase('complete');
          }
        }
      }
    }, 1000);
  };

  const resetMuscle = () => {
    if (muscleTimerRef.current) clearInterval(muscleTimerRef.current);
    setMuscleStep(0);
    setMusclePhase('ready');
    setMuscleCount(0);
  };

  // ========== SOUNDS ==========
  const toggleSound = (soundId: string) => {
    if (playingSound === soundId) {
      setPlayingSound(null);
    } else {
      setPlayingSound(soundId);
    }
  };

  // ========== GRATITUDE ==========
  const addGratitude = () => {
    if (!gratitudeInput.trim()) return;
    setGratitudeItems([...gratitudeItems, gratitudeInput.trim()]);
    setGratitudeInput('');
  };

  // ========== RENDER TOOL MODALS ==========
  const renderBreathingExercise = () => {
    const config = getBreathingConfig();
    const circleScale = breathingPhase === 'inhale' ? 1.4 : breathingPhase === 'exhale' ? 0.7 : 1;
    
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br ${activeTool?.bgGradient}`}
      >
        <button onClick={closeTool} className="absolute top-6 right-6 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
          <X className="w-6 h-6 text-white" />
        </button>
        
        <div className="text-center">
          {breathingPhase === 'ready' ? (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-64 h-64 mx-auto rounded-full bg-white/90 flex items-center justify-center mb-8 shadow-2xl"
              >
                <span className="text-4xl font-bold text-indigo-900">Ready?</span>
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {activeTool?.id === 'breathing-478' ? '4-7-8 Method' : 'Box Breathing'}
              </h2>
              <p className="text-white/80 mb-8">Release the noise, focus on the flow.</p>
              <button
                onClick={startBreathing}
                className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-full hover:bg-white/90 transition-all shadow-lg"
              >
                Start Now
              </button>
            </>
          ) : breathingPhase === 'complete' ? (
            <>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-64 h-64 mx-auto rounded-full bg-white/90 flex items-center justify-center mb-8"
              >
                <div className="text-center">
                  <span className="text-5xl">✨</span>
                  <p className="text-xl font-bold text-indigo-900 mt-2">Well done!</p>
                </div>
              </motion.div>
              <p className="text-white/80 mb-8">You completed {totalCycles} cycles</p>
              <button
                onClick={resetBreathing}
                className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-full hover:bg-white/90 flex items-center gap-2 mx-auto"
              >
                <RotateCcw className="w-5 h-5" />
                Do Again
              </button>
            </>
          ) : (
            <>
              <motion.div
                animate={{ scale: circleScale }}
                transition={{ duration: breathingCount > 0 ? 1 : 0.3, ease: "easeInOut" }}
                className="w-64 h-64 mx-auto rounded-full bg-white/90 flex items-center justify-center mb-8 shadow-2xl"
              >
                <div className="text-center">
                  <span className="text-6xl font-bold text-indigo-900">{breathingCount}</span>
                  <p className="text-lg text-indigo-600 capitalize font-medium">{breathingPhase}</p>
                </div>
              </motion.div>
              <p className="text-white/60 mb-4">Cycle {currentCycle} of {totalCycles}</p>
              <div className="flex justify-center gap-4 text-white/80 text-sm">
                <span>Inhale: {config.inhale}s</span>
                <span>Hold: {config.hold}s</span>
                <span>Exhale: {config.exhale}s</span>
              </div>
              <button
                onClick={resetBreathing}
                className="mt-8 px-6 py-2 bg-white/20 text-white rounded-full hover:bg-white/30 flex items-center gap-2 mx-auto"
              >
                <Pause className="w-4 h-4" />
                Stop
              </button>
            </>
          )}
        </div>
      </motion.div>
    );
  };

  const renderGroundingExercise = () => {
    const step = groundingSteps[groundingStep];
    const isComplete = groundingStep >= 5 || (groundingStep === 4 && groundingInputs[4].length >= 1);
    
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br ${step?.color || 'from-green-500 to-teal-600'}`}
      >
        <button onClick={closeTool} className="absolute top-6 right-6 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
          <X className="w-6 h-6 text-white" />
        </button>
        
        <div className="text-center max-w-lg mx-auto px-6">
          {isComplete ? (
            <>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-48 h-48 mx-auto rounded-full bg-white/90 flex items-center justify-center mb-8"
              >
                <span className="text-6xl">🌟</span>
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-4">You're grounded!</h2>
              <p className="text-white/80 mb-8">Take a moment to notice how you feel now.</p>
              <button
                onClick={resetGrounding}
                className="px-8 py-3 bg-white text-green-600 font-semibold rounded-full hover:bg-white/90"
              >
                Start Over
              </button>
            </>
          ) : (
            <>
              <motion.div
                key={groundingStep}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-32 h-32 mx-auto rounded-full bg-white/90 flex items-center justify-center mb-6"
              >
                <span className="text-5xl font-bold text-gray-800">{step.count}</span>
              </motion.div>
              
              <h2 className="text-2xl font-bold text-white mb-2">{step.sense}</h2>
              <p className="text-white/80 mb-6">{step.prompt}</p>
              
              {/* Progress dots */}
              <div className="flex justify-center gap-2 mb-6">
                {Array.from({ length: step.count }).map((_, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'w-3 h-3 rounded-full transition-all',
                      i < groundingInputs[groundingStep].length ? 'bg-white' : 'bg-white/30'
                    )}
                  />
                ))}
              </div>
              
              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addGroundingItem()}
                  placeholder={`Type something you can ${step.sense.toLowerCase()}...`}
                  className="flex-1 px-4 py-3 rounded-full bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:border-white"
                />
                <button
                  onClick={addGroundingItem}
                  className="px-6 py-3 bg-white text-gray-800 font-semibold rounded-full hover:bg-white/90"
                >
                  Add
                </button>
              </div>
              
              {/* Listed items */}
              {groundingInputs[groundingStep].length > 0 && (
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {groundingInputs[groundingStep].map((item, i) => (
                    <span key={i} className="px-3 py-1 bg-white/20 rounded-full text-white text-sm">
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    );
  };

  const renderMuscleRelaxation = () => {
    const muscle = muscleGroups[muscleStep];
    
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br ${activeTool?.bgGradient}`}
      >
        <button onClick={closeTool} className="absolute top-6 right-6 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
          <X className="w-6 h-6 text-white" />
        </button>
        
        <div className="text-center max-w-lg mx-auto px-6">
          {musclePhase === 'ready' ? (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-48 h-48 mx-auto rounded-full bg-white/90 flex items-center justify-center mb-8"
              >
                <span className="text-6xl">💆</span>
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-4">Progressive Muscle Relaxation</h2>
              <p className="text-white/80 mb-8">Tense and release each muscle group to melt away stress</p>
              <button
                onClick={startMuscleExercise}
                className="px-8 py-3 bg-white text-purple-600 font-semibold rounded-full hover:bg-white/90"
              >
                Begin Journey
              </button>
            </>
          ) : musclePhase === 'complete' ? (
            <>
              <motion.div className="w-48 h-48 mx-auto rounded-full bg-white/90 flex items-center justify-center mb-8">
                <span className="text-6xl">😌</span>
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-4">Completely Relaxed</h2>
              <p className="text-white/80 mb-8">Your body has released all tension</p>
              <button onClick={resetMuscle} className="px-8 py-3 bg-white text-purple-600 font-semibold rounded-full">
                Do Again
              </button>
            </>
          ) : (
            <>
              {/* Progress */}
              <div className="flex justify-center gap-1 mb-8">
                {muscleGroups.map((_, i) => (
                  <div
                    key={i}
                    className={clsx(
                      'w-8 h-1 rounded-full transition-all',
                      i <= muscleStep ? 'bg-white' : 'bg-white/30'
                    )}
                  />
                ))}
              </div>
              
              <motion.div
                key={`${muscleStep}-${musclePhase}`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: musclePhase === 'tense' ? 1.1 : 1, opacity: 1 }}
                className="w-48 h-48 mx-auto rounded-full bg-white/90 flex items-center justify-center mb-6"
              >
                <div className="text-center">
                  <span className="text-4xl">{muscle.emoji}</span>
                  <p className="text-4xl font-bold text-purple-900 mt-2">{muscleCount}</p>
                  <p className="text-purple-600 capitalize text-sm">{musclePhase}</p>
                </div>
              </motion.div>
              
              <h2 className="text-2xl font-bold text-white mb-2">{muscle.name}</h2>
              <p className="text-white/80 mb-6">{muscle.instruction}</p>
              
              <p className="text-white/60 text-lg">
                {musclePhase === 'tense' ? '💪 Squeeze tight!' : musclePhase === 'release' ? '😮‍💨 Let go...' : '😌 Feel the relaxation'}
              </p>
            </>
          )}
        </div>
      </motion.div>
    );
  };

  const renderSoundsExercise = () => {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br ${activeTool?.bgGradient}`}
      >
        <button onClick={closeTool} className="absolute top-6 right-6 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
          <X className="w-6 h-6 text-white" />
        </button>
        
        <div className="text-center max-w-md mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-2">Zen Sounds</h2>
          <p className="text-white/70 mb-8">Audio textures to reset your environment.</p>
          
          <div className="space-y-4">
            {soundOptions.map((sound) => (
              <button
                key={sound.id}
                onClick={() => toggleSound(sound.id)}
                className={clsx(
                  'w-full p-5 rounded-2xl flex items-center gap-4 transition-all',
                  playingSound === sound.id
                    ? 'bg-white/30 border-2 border-white'
                    : 'bg-white/10 border-2 border-white/20 hover:bg-white/20'
                )}
              >
                <span className="text-2xl">{sound.icon}</span>
                <span className="text-white font-semibold text-lg">{sound.name}</span>
                {playingSound === sound.id && (
                  <div className="ml-auto flex items-center gap-2">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [8, 20, 8] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                          className="w-1 bg-white rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
          
          <p className="text-white/50 text-sm mt-8">
            🎧 Best with headphones
          </p>
          <p className="text-white/40 text-xs mt-2">
            (Audio files coming soon - visual demo)
          </p>
        </div>
      </motion.div>
    );
  };

  const renderGratitudeExercise = () => {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br ${activeTool?.bgGradient}`}
      >
        <button onClick={closeTool} className="absolute top-6 right-6 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
          <X className="w-6 h-6 text-white" />
        </button>
        
        <div className="text-center max-w-md mx-auto px-6">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-32 h-32 mx-auto mb-6"
          >
            <span className="text-8xl">🫙</span>
          </motion.div>
          
          <h2 className="text-3xl font-bold text-white mb-2">Gratitude Jar</h2>
          <p className="text-white/70 mb-6">What's something good in your life right now?</p>
          
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={gratitudeInput}
              onChange={(e) => setGratitudeInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addGratitude()}
              placeholder="I'm grateful for..."
              className="flex-1 px-4 py-3 rounded-full bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:border-white"
            />
            <button
              onClick={addGratitude}
              className="px-6 py-3 bg-white text-rose-500 font-semibold rounded-full hover:bg-white/90"
            >
              Add
            </button>
          </div>
          
          {/* Gratitude items */}
          {gratitudeItems.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {gratitudeItems.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="px-4 py-3 bg-white/20 rounded-xl text-white text-left"
                >
                  💝 {item}
                </motion.div>
              ))}
            </div>
          )}
          
          {gratitudeItems.length === 0 && (
            <p className="text-white/50 text-sm">Your jar is empty. Add something you're thankful for!</p>
          )}
        </div>
      </motion.div>
    );
  };

  // Main render
  return (
    <div className="min-h-screen p-6 relative z-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={clsx("text-3xl font-bold mb-2", isDark ? "text-white" : "text-gray-800")}>Coping Hub</h1>
          <p className={clsx(isDark ? "text-slate-300" : "text-gray-600")}>Select a tool to find your center.</p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {copingTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setActiveTool(tool)}
              className={clsx(
                "rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all cursor-pointer group border",
                isDark
                  ? "bg-slate-800/50 border-slate-700 hover:bg-slate-700/50"
                  : "bg-white border-gray-100"
              )}
            >
              <div className="flex items-center gap-4">
                {/* Icon/Image */}
                <div className={`w-24 h-24 rounded-xl bg-gradient-to-br ${tool.bgGradient} flex items-center justify-center text-white text-4xl shadow-lg group-hover:scale-105 transition-transform`}>
                  {tool.type === 'breathing' && '🌬️'}
                  {tool.type === 'sounds' && '🎧'}
                  {tool.type === 'grounding' && '🌿'}
                  {tool.type === 'muscle' && '💆'}
                  {tool.type === 'gratitude' && '🫙'}
                </div>
                
                <div className="flex-1">
                  <div className={clsx("inline-flex p-2 rounded-lg mb-2", tool.color, isDark ? "bg-slate-700" : "bg-gray-100")}>
                    {tool.icon}
                  </div>
                  <h3 className={clsx("text-lg font-semibold", isDark ? "text-white" : "text-gray-800")}>{tool.title}</h3>
                  <p className={clsx("text-xs tracking-wide", isDark ? "text-slate-400" : "text-gray-500")}>{tool.subtitle}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tool Modals */}
      <AnimatePresence>
        {activeTool?.type === 'breathing' && renderBreathingExercise()}
        {activeTool?.type === 'grounding' && renderGroundingExercise()}
        {activeTool?.type === 'muscle' && renderMuscleRelaxation()}
        {activeTool?.type === 'sounds' && renderSoundsExercise()}
        {activeTool?.type === 'gratitude' && renderGratitudeExercise()}
      </AnimatePresence>
    </div>
  );
}
