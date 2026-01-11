import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Play } from 'lucide-react';

interface CatchStarsProps {
  onBack: () => void;
  onComplete: (wasHelpful: boolean) => void;
}

interface Star {
  id: number;
  x: number;
  y: number;
  type: 'star' | 'heart' | 'rainbow' | 'cloud';
  speed: number;
}

const itemTypes = {
  star: { emoji: '⭐', points: 10, color: 'from-yellow-300 to-yellow-500' },
  heart: { emoji: '💖', points: 20, color: 'from-pink-300 to-pink-500' },
  rainbow: { emoji: '🌈', points: 30, color: 'from-purple-300 to-purple-500' },
  cloud: { emoji: '☁️', points: -10, color: 'from-gray-300 to-gray-400' },
};

export default function CatchStars({ onBack, onComplete }: CatchStarsProps) {
  const [items, setItems] = useState<Star[]>([]);
  const [score, setScore] = useState(0);
  const [basketX, setBasketX] = useState(50);
  const [timeLeft, setTimeLeft] = useState(45);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [catchAnimation, setCatchAnimation] = useState<string | null>(null);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('catchStars_highScore');
    return saved ? parseInt(saved) : 0;
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const itemIdRef = useRef(0);

  const createItem = useCallback((): Star | null => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    
    const rand = Math.random();
    let type: Star['type'];
    if (rand < 0.5) type = 'star';
    else if (rand < 0.75) type = 'heart';
    else if (rand < 0.9) type = 'rainbow';
    else type = 'cloud';
    
    return {
      id: itemIdRef.current++,
      x: Math.random() * (rect.width - 60) + 30,
      y: -50,
      type,
      speed: Math.random() * 2 + 2,
    };
  }, []);

  // Spawn items
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const spawnInterval = setInterval(() => {
      const newItem = createItem();
      if (newItem) {
        setItems(prev => [...prev, newItem]);
      }
    }, 800);

    return () => clearInterval(spawnInterval);
  }, [gameStarted, gameOver, createItem]);

  // Move items & check catches
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const moveInterval = setInterval(() => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const basketY = rect.height - 80;
      const basketWidth = 80;
      const basketLeft = (basketX / 100) * rect.width - basketWidth / 2;

      setItems(prev => {
        const remaining: Star[] = [];
        
        prev.forEach(item => {
          const newY = item.y + item.speed * 3;
          
          // Check if caught
          if (
            newY >= basketY - 20 &&
            newY <= basketY + 20 &&
            item.x >= basketLeft &&
            item.x <= basketLeft + basketWidth
          ) {
            const points = itemTypes[item.type].points;
            setScore(s => Math.max(0, s + points));
            setCatchAnimation(itemTypes[item.type].emoji);
            setTimeout(() => setCatchAnimation(null), 300);
            
            if (navigator.vibrate && points > 0) {
              navigator.vibrate(30);
            }
            return; // Don't add to remaining
          }
          
          // Check if missed (fell off screen)
          if (newY > rect.height + 50) {
            return; // Don't add to remaining
          }
          
          remaining.push({ ...item, y: newY });
        });
        
        return remaining;
      });
    }, 30);

    return () => clearInterval(moveInterval);
  }, [gameStarted, gameOver, basketX]);

  // Timer
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameOver(true);
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('catchStars_highScore', score.toString());
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver, score, highScore]);

  // Mouse/touch controls
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setBasketX(Math.max(10, Math.min(90, x)));
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => handleMove(e.clientX);
  const handleTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX);

  // Keyboard controls
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setBasketX(prev => Math.max(10, prev - 5));
      } else if (e.key === 'ArrowRight') {
        setBasketX(prev => Math.min(90, prev + 5));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver]);

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(45);
    setItems([]);
    setBasketX(50);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900 p-4 flex flex-col">
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-8xl mb-6"
          >
            ⭐
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-4">Catch the Stars</h1>
          <p className="text-white/80 mb-2 max-w-md">
            Catch falling stars, hearts, and rainbows! Avoid the clouds ☁️
          </p>
          <div className="flex gap-4 text-sm text-white/60 mb-8">
            <span>⭐ +10</span>
            <span>💖 +20</span>
            <span>🌈 +30</span>
            <span>☁️ -10</span>
          </div>
          
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
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full font-bold text-xl shadow-lg flex items-center gap-2"
          >
            <Play className="w-6 h-6" fill="currentColor" /> Start Catching!
          </motion.button>
        </div>
        
        {/* Twinkling stars background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-white text-xs"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: Math.random() * 2 + 1, delay: Math.random() }}
            >
              ✦
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900 p-4 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-3xl p-8 text-center max-w-sm w-full"
        >
          <div className="text-6xl mb-4">🌟</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Wonderful!</h2>
          <p className="text-4xl font-bold text-purple-600 mb-4">{score} points</p>
          
          {score >= highScore && score > 0 && (
            <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              🏆 New High Score!
            </div>
          )}
          
          <p className="text-gray-600 mb-6">
            {score > 400 ? "You're a star catcher! ⭐" : 
             score > 200 ? "Great job spreading joy! 💖" : 
             "Keep reaching for the stars! 🌈"}
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900 p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <div className="flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-white font-bold">
            ⏱️ {timeLeft}s
          </div>
          <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-white font-bold">
            ⭐ {score}
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden rounded-2xl"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* Stars background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-white/30 text-xs"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ repeat: Infinity, duration: Math.random() * 3 + 1, delay: Math.random() }}
            >
              ✦
            </motion.div>
          ))}
        </div>

        {/* Falling items */}
        {items.map(item => (
          <motion.div
            key={item.id}
            className="absolute text-4xl"
            style={{ left: item.x, top: item.y }}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            {itemTypes[item.type].emoji}
          </motion.div>
        ))}

        {/* Catch animation */}
        {catchAnimation && (
          <motion.div
            initial={{ scale: 2, opacity: 1 }}
            animate={{ scale: 0, opacity: 0 }}
            className="absolute text-4xl z-20"
            style={{
              left: `${basketX}%`,
              bottom: 100,
              transform: 'translateX(-50%)',
            }}
          >
            {catchAnimation}
          </motion.div>
        )}

        {/* Basket */}
        <motion.div
          className="absolute bottom-4 text-6xl"
          style={{ left: `${basketX}%`, transform: 'translateX(-50%)' }}
        >
          🧺
        </motion.div>

        {/* Instructions */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-white/40 text-sm">
          Move mouse/finger or use ← → keys
        </div>
      </div>
    </div>
  );
}
