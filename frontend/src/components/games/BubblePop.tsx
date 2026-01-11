import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy } from 'lucide-react';

interface BubblePopProps {
  onBack: () => void;
  onComplete: (wasHelpful: boolean) => void;
}

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
}

const colors = [
  'from-red-400 to-red-600',
  'from-orange-400 to-orange-600',
  'from-yellow-400 to-yellow-600',
  'from-green-400 to-green-600',
  'from-blue-400 to-blue-600',
  'from-purple-400 to-purple-600',
  'from-pink-400 to-pink-600',
];

export default function BubblePop({ onBack, onComplete }: BubblePopProps) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('bubblePop_highScore');
    return saved ? parseInt(saved) : 0;
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const bubbleIdRef = useRef(0);

  const createBubble = useCallback(() => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    
    return {
      id: bubbleIdRef.current++,
      x: Math.random() * (rect.width - 120) + 60,
      y: rect.height + 80,
      size: Math.random() * 50 + 70, // Bigger bubbles: 70-120px instead of 40-80px
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 1.5 + 0.8, // Slightly slower for better visibility
    };
  }, []);

  // Spawn bubbles
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const spawnInterval = setInterval(() => {
      const newBubble = createBubble();
      if (newBubble) {
        setBubbles(prev => [...prev, newBubble]);
      }
    }, 500);

    return () => clearInterval(spawnInterval);
  }, [gameStarted, gameOver, createBubble]);

  // Move bubbles
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const moveInterval = setInterval(() => {
      setBubbles(prev => 
        prev
          .map(bubble => ({ ...bubble, y: bubble.y - bubble.speed * 3 }))
          .filter(bubble => bubble.y > -100)
      );
    }, 30);

    return () => clearInterval(moveInterval);
  }, [gameStarted, gameOver]);

  // Timer
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true);
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('bubblePop_highScore', score.toString());
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver, score, highScore]);

  const popBubble = (id: number, size: number) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
    const points = Math.floor((100 - size) / 10) + 5;
    setScore(prev => prev + points);
    
    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(60);
    setBubbles([]);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4 flex flex-col">
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-8xl mb-6"
          >
            🫧
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-4">Bubble Pop</h1>
          <p className="text-white/80 mb-2 max-w-md">
            Pop as many bubbles as you can! Release your stress with every pop.
          </p>
          <p className="text-white/60 text-sm mb-8">
            Smaller bubbles = more points!
          </p>
          
          {highScore > 0 && (
            <div className="flex items-center gap-2 text-yellow-300 mb-6">
              <Trophy className="w-5 h-5" />
              <span>High Score: {highScore}</span>
            </div>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-xl shadow-lg"
          >
            Start Popping!
          </motion.button>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-3xl p-8 text-center max-w-sm w-full"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Time's Up!</h2>
          <p className="text-4xl font-bold text-purple-600 mb-4">{score} points</p>
          
          {score > highScore - score && score === highScore && (
            <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              🏆 New High Score!
            </div>
          )}
          
          <p className="text-gray-600 mb-6">
            {score > 200 ? "Amazing stress relief! 🌟" : 
             score > 100 ? "Great job releasing tension! 💪" : 
             "Keep popping for more relief! 🫧"}
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={() => onComplete(true)}
              className="flex-1 py-3 bg-green-500 text-white rounded-xl font-medium"
            >
              I feel better!
            </button>
            <button
              onClick={startGame}
              className="flex-1 py-3 bg-purple-500 text-white rounded-xl font-medium"
            >
              Play Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <div className="flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-white font-bold">
            ⏱️ {timeLeft}s
          </div>
          <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-white font-bold">
            🎯 {score}
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden rounded-2xl bg-gradient-to-b from-sky-200 to-sky-400"
      >
        <AnimatePresence>
          {bubbles.map(bubble => (
            <motion.button
              key={bubble.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onPointerDown={(e) => { e.preventDefault(); popBubble(bubble.id, bubble.size); }}
              onTouchStart={(e) => { e.preventDefault(); popBubble(bubble.id, bubble.size); }}
              className={`absolute rounded-full bg-gradient-to-br ${bubble.color} shadow-2xl cursor-pointer border-4 border-white/30 touch-none`}
              style={{
                left: bubble.x,
                top: bubble.y,
                width: bubble.size,
                height: bubble.size,
                boxShadow: `0 0 ${bubble.size / 3}px rgba(255,255,255,0.5), inset 0 0 ${bubble.size / 4}px rgba(255,255,255,0.3)`,
              }}
            >
              {/* Shine effect */}
              <div 
                className="absolute bg-white/60 rounded-full" 
                style={{
                  top: bubble.size * 0.12,
                  left: bubble.size * 0.12,
                  width: bubble.size * 0.25,
                  height: bubble.size * 0.25,
                }}
              />
              <div 
                className="absolute bg-white/30 rounded-full" 
                style={{
                  top: bubble.size * 0.35,
                  left: bubble.size * 0.08,
                  width: bubble.size * 0.12,
                  height: bubble.size * 0.12,
                }}
              />
            </motion.button>
          ))}
        </AnimatePresence>
        
        {/* Hint */}
        {bubbles.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-white/50">
            Bubbles incoming...
          </div>
        )}
      </div>
    </div>
  );
}
