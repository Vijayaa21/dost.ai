import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pause, Wind, Eye, Dumbbell, Heart, Headphones, RotateCcw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import clsx from 'clsx';

// Tool types
type ToolType = 'breathing' | 'grounding' | 'muscle' | 'sounds' | 'gratitude';

type SoundProfile = 'rain' | 'brown' | 'forest' | 'waves';

interface SoundOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  profile: SoundProfile;
  audioUrl: string;
}

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
    color: 'text-amber-600',
    bgGradient: 'from-amber-400 to-orange-500',
  },
  {
    id: 'sounds',
    type: 'sounds',
    title: 'Zen Soundscapes',
    subtitle: 'AUDIO TEXTURES TO FADE THE WORLD',
    icon: <Headphones className="w-5 h-5" />,
    color: 'text-emerald-600',
    bgGradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'grounding-54321',
    type: 'grounding',
    title: '5-4-3-2-1 Grounding',
    subtitle: 'ANCHOR YOURSELF IN REALITY',
    icon: <Eye className="w-5 h-5" />,
    color: 'text-orange-600',
    bgGradient: 'from-orange-400 to-rose-400',
  },
  {
    id: 'muscle-relaxation',
    type: 'muscle',
    title: 'Muscle Relaxation',
    subtitle: 'RELEASE THE WEIGHT YOU CARRY',
    icon: <Dumbbell className="w-5 h-5" />,
    color: 'text-rose-600',
    bgGradient: 'from-rose-500 to-red-500',
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
    color: 'text-amber-600',
    bgGradient: 'from-amber-500 to-rose-500',
  },
];

const copingMeta: Record<string, { duration: string; focus: string; intent: string }> = {
  'breathing-478': { duration: '4 min', focus: 'Slow the heart', intent: 'Ease anxiety quickly with paced breath.' },
  'breathing-box': { duration: '3 min', focus: 'Balance the mind', intent: 'Create steady rhythm and clarity.' },
  'grounding-54321': { duration: '5 min', focus: 'Anchor now', intent: 'Return attention to your senses.' },
  'muscle-relaxation': { duration: '6 min', focus: 'Release tension', intent: 'Unwind muscle groups gently.' },
  gratitude: { duration: '4 min', focus: 'Lift mood', intent: 'Collect small wins and warmth.' },
  sounds: { duration: 'Any time', focus: 'Soften noise', intent: 'Set a calm backdrop for rest.' },
};

// Sound options
const soundOptions: SoundOption[] = [
  {
    id: 'rain',
    name: 'Soft Rain',
    icon: '💧',
    description: 'Airy, shimmering rain fall',
    profile: 'rain',
    audioUrl: '/audio/desifreemusic-relaxing-sleep-music-with-soft-ambient-rain-369762.mp3',
  },
  {
    id: 'brown',
    name: 'Deep Brown',
    icon: '🌊',
    description: 'Low, grounding rumble',
    profile: 'brown',
    audioUrl: '/audio/meditativetiger-deep-focus-lofi-ambient-brown-noise-therapy-507895.mp3',
  },
  {
    id: 'forest',
    name: 'Forest Drift',
    icon: '🌲',
    description: 'Earthy hush with gentle chirps',
    profile: 'forest',
    audioUrl: '/audio/38534292-golden-forest-with-birds-and-running-stream-sounds-171319.mp3',
  },
  {
    id: 'waves',
    name: 'Ocean Waves',
    icon: '🌊',
    description: 'Slow swells for steady calm',
    profile: 'waves',
    audioUrl: '/audio/38534292-golden-forest-with-birds-and-running-stream-sounds-171319.mp3',
  },
];

// Grounding steps
const groundingSteps = [
  { count: 5, sense: 'SEE', prompt: 'Name 5 things you can see around you', color: 'from-amber-400 to-orange-500' },
  { count: 4, sense: 'TOUCH', prompt: 'Name 4 things you can physically feel', color: 'from-emerald-400 to-teal-500' },
  { count: 3, sense: 'HEAR', prompt: 'Name 3 things you can hear right now', color: 'from-orange-400 to-rose-400' },
  { count: 2, sense: 'SMELL', prompt: 'Name 2 things you can smell', color: 'from-rose-400 to-pink-500' },
  { count: 1, sense: 'TASTE', prompt: 'Name 1 thing you can taste', color: 'from-red-400 to-rose-500' },
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
  const [soundVolume, setSoundVolume] = useState(0.22);
  const [soundWarmth, setSoundWarmth] = useState(0.6);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sleepTimerRef = useRef<number | null>(null);
  const soundNodesRef = useRef<{
    audio?: HTMLAudioElement;
    sourceNode?: MediaElementAudioSourceNode;
    filter?: BiquadFilterNode;
    masterGain?: GainNode;
    baseFilterFrequency?: number;
  } | null>(null);
  
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
    stopSound();
  };

  const openToolById = (toolId: string) => {
    const tool = copingTools.find((item) => item.id === toolId);
    if (tool) setActiveTool(tool);
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
  const ensureAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioContextConstructor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextConstructor) return null;
      audioCtxRef.current = new AudioContextConstructor();
    }
    return audioCtxRef.current;
  };

  const stopSound = () => {
    const nodes = soundNodesRef.current;
    if (!nodes) return;

    if (nodes.audio) {
      nodes.audio.pause();
      nodes.audio.currentTime = 0;
    }
    if (nodes.sourceNode) nodes.sourceNode.disconnect();
    if (nodes.filter) nodes.filter.disconnect();
    if (nodes.masterGain) nodes.masterGain.disconnect();
    if (sleepTimerRef.current) {
      window.clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }

    soundNodesRef.current = null;
    setPlayingSound(null);
  };

  const startSound = async (soundId: string) => {
    stopSound();
    const option = soundOptions.find((sound) => sound.id === soundId);
    if (!option) return;

    const context = ensureAudioContext();
    if (!context) return;
    await context.resume();

    const audio = new Audio(option.audioUrl);
    audio.loop = true;
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';

    const sourceNode = context.createMediaElementSource(audio);
    const filter = context.createBiquadFilter();
    const masterGain = context.createGain();

    filter.type = 'lowpass';
    filter.frequency.value = 720;
    masterGain.gain.value = Math.min(soundVolume, 0.6);

    sourceNode.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(context.destination);

    const nodes: NonNullable<typeof soundNodesRef.current> = {
      audio,
      sourceNode,
      filter,
      masterGain,
      baseFilterFrequency: filter.frequency.value,
    };

    if (option.profile === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.value = 520;
      nodes.baseFilterFrequency = 520;
    }

    if (option.profile === 'brown') {
      filter.type = 'lowpass';
      filter.frequency.value = 180;
      nodes.baseFilterFrequency = 180;
    }

    if (option.profile === 'waves') {
      filter.type = 'lowpass';
      filter.frequency.value = 160;
      nodes.baseFilterFrequency = 160;
    }

    if (option.profile === 'forest') {
      filter.type = 'lowpass';
      filter.frequency.value = 320;
      nodes.baseFilterFrequency = 320;
    }

    soundNodesRef.current = nodes;
    setPlayingSound(soundId);
    try {
      await audio.play();
    } catch (error) {
      stopSound();
    }
  };

  const applyWarmth = () => {
    const nodes = soundNodesRef.current;
    if (!nodes?.filter || !nodes.baseFilterFrequency) return;
    const baseFrequency = nodes.baseFilterFrequency;
    const warmthBoost = 1 + soundWarmth * 0.8;
    nodes.filter.frequency.value = Math.min(baseFrequency * warmthBoost, 1200);
  };

  const setSleepTimer = (minutes: number | null) => {
    if (sleepTimerRef.current) {
      window.clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    setSleepTimerMinutes(minutes);
    if (minutes && playingSound) {
      sleepTimerRef.current = window.setTimeout(() => {
        stopSound();
      }, minutes * 60 * 1000);
    }
  };

  const toggleSound = (soundId: string) => {
    if (playingSound === soundId) {
      stopSound();
    } else {
      void startSound(soundId);
    }
  };

  // ========== GRATITUDE ==========
  const addGratitude = () => {
    if (!gratitudeInput.trim()) return;
    setGratitudeItems([...gratitudeItems, gratitudeInput.trim()]);
    setGratitudeInput('');
  };

  useEffect(() => {
    if (soundNodesRef.current?.masterGain) {
      soundNodesRef.current.masterGain.gain.value = Math.min(soundVolume, 0.6);
    }
  }, [soundVolume]);

  useEffect(() => {
    applyWarmth();
  }, [soundWarmth, playingSound]);

  useEffect(() => {
    if (!sleepTimerMinutes || !playingSound) return;
    setSleepTimer(sleepTimerMinutes);
  }, [sleepTimerMinutes, playingSound]);

  useEffect(() => {
    return () => {
      stopSound();
    };
  }, []);

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
                <span className="text-4xl font-bold text-amber-900">Ready?</span>
              </motion.div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {activeTool?.id === 'breathing-478' ? '4-7-8 Method' : 'Box Breathing'}
              </h2>
              <p className="text-white/80 mb-8">Release the noise, focus on the flow.</p>
              <button
                onClick={startBreathing}
                className="px-8 py-3 bg-white text-amber-700 font-semibold rounded-full hover:bg-white/90 transition-all shadow-lg"
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
                  <p className="text-xl font-bold text-amber-900 mt-2">Well done!</p>
                </div>
              </motion.div>
              <p className="text-white/80 mb-8">You completed {totalCycles} cycles</p>
              <button
                onClick={resetBreathing}
                className="px-8 py-3 bg-white text-amber-700 font-semibold rounded-full hover:bg-white/90 flex items-center gap-2 mx-auto"
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
                  <span className="text-6xl font-bold text-amber-900">{breathingCount}</span>
                  <p className="text-lg text-amber-700 capitalize font-medium">{breathingPhase}</p>
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
                  <p className="text-4xl font-bold text-rose-900 mt-2">{muscleCount}</p>
                  <p className="text-rose-600 capitalize text-sm">{musclePhase}</p>
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
        
        <div className="max-w-4xl w-full px-6 mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">Zen Sounds</h2>
            <p className="text-white/70">Let the room soften around you.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 items-center justify-items-end">
            <div className="rounded-3xl border border-white/20 bg-white/10 p-6 text-right w-full">
              <div className="flex items-center justify-between text-white/80 text-sm">
                <span>{playingSound ? `Now playing: ${soundOptions.find((sound) => sound.id === playingSound)?.name}` : 'Choose a soundscape'}</span>
                <button
                  onClick={() => stopSound()}
                  className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs"
                >
                  Stop
                </button>
              </div>

              <div className="mt-6 grid gap-5">
                <div>
                  <label className="block text-xs text-white/60 mb-2">Volume</label>
                  <input
                    type="range"
                    min={0}
                    max={0.7}
                    step={0.01}
                    value={soundVolume}
                    onChange={(event) => setSoundVolume(Number(event.target.value))}
                    className="w-full accent-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-2">Warmth</label>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={soundWarmth}
                    onChange={(event) => setSoundWarmth(Number(event.target.value))}
                    className="w-full accent-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/60 mb-2">Sleep timer</label>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {[5, 10, 15, 30].map((minutes) => (
                      <button
                        key={minutes}
                        onClick={() => setSleepTimer(minutes)}
                        className={clsx(
                          'px-3 py-1 rounded-full text-xs transition-colors',
                          sleepTimerMinutes === minutes
                            ? 'bg-white text-slate-900'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        )}
                      >
                        {minutes} min
                      </button>
                    ))}
                    <button
                      onClick={() => setSleepTimer(null)}
                      className={clsx(
                        'px-3 py-1 rounded-full text-xs transition-colors',
                        sleepTimerMinutes === null
                          ? 'bg-white text-slate-900'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      )}
                    >
                      Off
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-white/10 border border-white/10 p-4">
                <p className="text-white/70 text-sm">Tip</p>
                <p className="text-white text-sm mt-1">Lower volume + higher warmth feels like a soft blanket of sound.</p>
              </div>
            </div>

            <div className="space-y-4 w-full">
              {soundOptions.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => toggleSound(sound.id)}
                  className={clsx(
                    'w-full p-5 rounded-2xl flex items-center gap-4 transition-all text-right border-2',
                    playingSound === sound.id
                      ? 'bg-white/30 border-white shadow-lg shadow-white/10'
                      : 'bg-white/10 border-white/20 hover:bg-white/20'
                  )}
                >
                  <div className="flex-1">
                    <p className="text-white font-semibold text-lg">{sound.name}</p>
                    <p className="text-white/60 text-sm">{sound.description}</p>
                  </div>
                  <span className="text-2xl">{sound.icon}</span>
                  {playingSound === sound.id && (
                    <div className="flex items-center gap-2">
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

              <p className="text-white/60 text-sm text-right">🎧 Best with headphones</p>
            </div>
          </div>
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
      <div
        className={clsx(
          'absolute inset-0 -z-10',
          isDark
            ? 'bg-gradient-to-br from-stone-950 via-amber-950/40 to-stone-900'
            : 'bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50'
        )}
      />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="grid lg:grid-cols-[1.3fr,0.7fr] gap-6 mb-10">
          <div
            className={clsx(
              'rounded-3xl p-6 border shadow-sm',
              isDark ? 'bg-slate-900/70 border-slate-700' : 'bg-white border-amber-100'
            )}
          >
            <span className={clsx('text-xs font-semibold uppercase tracking-[0.3em]', isDark ? 'text-amber-200/80' : 'text-amber-700')}>
              Coping Hub
            </span>
            <h1 className={clsx('text-3xl md:text-4xl font-bold mt-3', isDark ? 'text-white' : 'text-slate-800')}>
              Find your center in minutes
            </h1>
            <p className={clsx('mt-3 text-sm md:text-base', isDark ? 'text-slate-300' : 'text-slate-600')}>
              Pick a tool that matches your moment. Short, focused exercises designed to calm the body and clear the mind.
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              <button
                onClick={() => openToolById('breathing-478')}
                className={clsx(
                  'px-4 py-2 rounded-full text-sm font-semibold transition-colors',
                  isDark ? 'bg-amber-400/20 text-amber-200 hover:bg-amber-400/30' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                )}
              >
                Start 4-7-8
              </button>
              <button
                onClick={() => openToolById('sounds')}
                className={clsx(
                  'px-4 py-2 rounded-full text-sm font-semibold transition-colors',
                  isDark ? 'bg-emerald-400/20 text-emerald-200 hover:bg-emerald-400/30' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                )}
              >
                Zen sounds
              </button>
              <button
                onClick={() => openToolById('grounding-54321')}
                className={clsx(
                  'px-4 py-2 rounded-full text-sm font-semibold transition-colors',
                  isDark ? 'bg-rose-400/20 text-rose-200 hover:bg-rose-400/30' : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                )}
              >
                Grounding reset
              </button>
            </div>
          </div>

          <div
            className={clsx(
              'rounded-3xl p-6 border shadow-sm flex flex-col justify-between',
              isDark ? 'bg-slate-900/70 border-slate-700' : 'bg-white border-amber-100'
            )}
          >
            <div>
              <p className={clsx('text-xs uppercase tracking-[0.3em] font-semibold', isDark ? 'text-rose-200/70' : 'text-rose-600')}>
                Quick Reset
              </p>
              <h2 className={clsx('text-2xl font-semibold mt-3', isDark ? 'text-white' : 'text-slate-800')}>
                3-minute calm ritual
              </h2>
              <p className={clsx('mt-2 text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
                Pair slow breath with a soundscape for rapid nervous system relief.
              </p>
            </div>
            <button
              onClick={() => openToolById('breathing-box')}
              className={clsx(
                'mt-6 px-4 py-2 rounded-full text-sm font-semibold transition-colors',
                isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-900 text-white hover:bg-slate-800'
              )}
            >
              Begin box breathing
            </button>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {copingTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => setActiveTool(tool)}
              className={clsx(
                'rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer group border',
                isDark
                  ? 'bg-slate-900/60 border-slate-700 hover:bg-slate-800/70'
                  : 'bg-white border-amber-100'
              )}
            >
              <div className="flex items-start gap-4">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${tool.bgGradient} flex items-center justify-center text-white text-3xl shadow-lg group-hover:scale-105 transition-transform`}>
                  {tool.type === 'breathing' && '🌬️'}
                  {tool.type === 'sounds' && '🎧'}
                  {tool.type === 'grounding' && '🌿'}
                  {tool.type === 'muscle' && '💆'}
                  {tool.type === 'gratitude' && '🫙'}
                </div>
                
                <div className="flex-1">
                  <div className={clsx('inline-flex p-2 rounded-lg mb-3', tool.color, isDark ? 'bg-slate-800' : 'bg-amber-50')}>
                    {tool.icon}
                  </div>
                  <h3 className={clsx('text-lg font-semibold', isDark ? 'text-white' : 'text-slate-800')}>{tool.title}</h3>
                  <p className={clsx('text-xs tracking-wide', isDark ? 'text-slate-400' : 'text-slate-500')}>{tool.subtitle}</p>
                  <p className={clsx('text-sm mt-3', isDark ? 'text-slate-300' : 'text-slate-600')}>
                    {copingMeta[tool.id]?.intent ?? 'Tap to begin a focused session and follow guided steps.'}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className={clsx(
                      'px-3 py-1 rounded-full text-xs font-semibold',
                      isDark ? 'bg-white/10 text-white' : 'bg-amber-100 text-amber-800'
                    )}>
                      {copingMeta[tool.id]?.duration ?? 'Quick'}
                    </span>
                    <span className={clsx(
                      'px-3 py-1 rounded-full text-xs font-semibold',
                      isDark ? 'bg-white/10 text-white' : 'bg-rose-100 text-rose-700'
                    )}>
                      {copingMeta[tool.id]?.focus ?? 'Reset'}
                    </span>
                  </div>
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
