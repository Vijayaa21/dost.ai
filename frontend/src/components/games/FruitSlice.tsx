import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Play } from 'lucide-react';

interface FruitSliceProps {
  onBack: () => void;
  onComplete: (wasHelpful: boolean) => void;
}

interface Fruit {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  emoji: string;
  sliced: boolean;
  rotation: number;
}

const fruits = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🥝', '🍉', '🍌', '🥥'];
const bombs = ['💣'];

export default function FruitSlice({ onBack, onComplete }: FruitSliceProps) {
  const [gameItems, setGameItems] = useState<Fruit[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [sliceTrail, setSliceTrail] = useState<{ x: number; y: number }[]>([]);
  const [isSlicing, setIsSlicing] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('fruitSlice_highScore');
    return saved ? parseInt(saved) : 0;
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const itemIdRef = useRef(0);

  const createFruit = useCallback(() => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const isBomb = Math.random() < 0.1; // 10% chance of bomb
    
    return {
      id: itemIdRef.current++,
      x: Math.random() * (rect.width - 150) + 75,
      y: rect.height + 80,
      vx: (Math.random() - 0.5) * 2.5,
      vy: -(Math.random() * 8 + 16), // Much higher launch for better visibility
      emoji: isBomb ? bombs[0] : fruits[Math.floor(Math.random() * fruits.length)],
      sliced: false,
      rotation: Math.random() * 360,
    };
  }, []);

  // Spawn fruits
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const spawnInterval = setInterval(() => {
      const count = Math.floor(Math.random() * 3) + 1;
      const newFruits: Fruit[] = [];
      for (let i = 0; i < count; i++) {
        const fruit = createFruit();
        if (fruit) newFruits.push(fruit);
      }
      setGameItems(prev => [...prev, ...newFruits]);
    }, 1200);

    return () => clearInterval(spawnInterval);
  }, [gameStarted, gameOver, createFruit]);

  // Physics update
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gravity = 0.4;
    const updateInterval = setInterval(() => {
      setGameItems(prev => {
        const updated = prev.map(item => ({
          ...item,
          x: item.x + item.vx,
          y: item.y + item.vy,
          vy: item.vy + gravity,
          rotation: item.rotation + item.vx * 2,
        }));

        // Check for missed fruits
        const missed = updated.filter(
          item => item.y > (containerRef.current?.getBoundingClientRect().height || 800) + 100 && !item.sliced && !item.emoji.includes('💣')
        );
        
        if (missed.length > 0) {
          setLives(l => {
            const newLives = l - missed.length;
            if (newLives <= 0) {
              setGameOver(true);
              if (score > highScore) {
                setHighScore(score);
                localStorage.setItem('fruitSlice_highScore', score.toString());
              }
            }
            return Math.max(0, newLives);
          });
          setCombo(0);
        }

        return updated.filter(
          item => item.y < (containerRef.current?.getBoundingClientRect().height || 800) + 150
        );
      });
    }, 30);

    return () => clearInterval(updateInterval);
  }, [gameStarted, gameOver, score, highScore]);

  const handleSlice = useCallback((x: number, y: number) => {
    if (!isSlicing) return;
    
    setSliceTrail(prev => [...prev.slice(-10), { x, y }]);
    
    setGameItems(prev => {
      let slicedCount = 0;
      const updated = prev.map(item => {
        if (item.sliced) return item;
        
        const distance = Math.sqrt(
          Math.pow(x - item.x - 50, 2) + Math.pow(y - item.y - 50, 2)
        );
        
        if (distance < 70) { // Bigger hit area for larger fruits
          if (item.emoji === '💣') {
            // Hit bomb - game over
            setLives(0);
            setGameOver(true);
            if (score > highScore) {
              setHighScore(score);
              localStorage.setItem('fruitSlice_highScore', score.toString());
            }
            return { ...item, sliced: true };
          }
          slicedCount++;
          return { ...item, sliced: true };
        }
        return item;
      });
      
      if (slicedCount > 0) {
        const points = slicedCount * 10 * (combo + 1);
        setScore(s => s + points);
        setCombo(c => c + slicedCount);
        setShowCombo(true);
        setTimeout(() => setShowCombo(false), 500);
        
        if (navigator.vibrate) {
          navigator.vibrate(30);
        }
      }
      
      return updated;
    });
  }, [isSlicing, combo, score, highScore]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    handleSlice(e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    handleSlice(touch.clientX - rect.left, touch.clientY - rect.top);
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setLives(3);
    setCombo(0);
    setGameItems([]);
  };

  // Reset combo after no slice
  useEffect(() => {
    if (!gameStarted) return;
    const timer = setTimeout(() => setCombo(0), 1000);
    return () => clearTimeout(timer);
  }, [combo, gameStarted]);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 p-4 flex flex-col">
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-8xl mb-6"
          >
            🍉
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-4">Fruit Slice</h1>
          <p className="text-white/80 mb-2 max-w-md">
            Swipe to slice fruits and release your frustration! Avoid the bombs! 💣
          </p>
          <p className="text-white/60 text-sm mb-8">
            Slice multiple fruits for combo points!
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
            className="px-8 py-4 bg-white text-red-600 rounded-full font-bold text-xl shadow-lg flex items-center gap-2"
          >
            <Play className="w-6 h-6" fill="currentColor" /> Start Slicing!
          </motion.button>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 p-4 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-3xl p-8 text-center max-w-sm w-full"
        >
          <div className="text-6xl mb-4">{lives === 0 && score > 100 ? '🎉' : '💥'}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Game Over!</h2>
          <p className="text-4xl font-bold text-red-500 mb-4">{score} points</p>
          
          {score >= highScore && score > 0 && (
            <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              🏆 New High Score!
            </div>
          )}
          
          <p className="text-gray-600 mb-6">
            {score > 300 ? "Incredible slicing skills! 🗡️" : 
             score > 150 ? "Great stress release! 🍎" : 
             "Keep slicing to improve! 🥝"}
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
              className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium"
            >
              Play Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <div className="flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-white font-bold">
            {'❤️'.repeat(lives)}{'🖤'.repeat(3 - lives)}
          </div>
          <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-white font-bold">
            🎯 {score}
          </div>
        </div>
      </div>

      {/* Combo indicator */}
      <AnimatePresence>
        {showCombo && combo > 1 && (
          <motion.div
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: -20 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-6 py-2 rounded-full font-bold text-xl z-20"
          >
            {combo}x COMBO! 🔥
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Area */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden rounded-2xl bg-gradient-to-b from-amber-100 to-amber-200 cursor-crosshair select-none"
        onMouseDown={() => setIsSlicing(true)}
        onMouseUp={() => { setIsSlicing(false); setSliceTrail([]); }}
        onMouseLeave={() => { setIsSlicing(false); setSliceTrail([]); }}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsSlicing(true)}
        onTouchEnd={() => { setIsSlicing(false); setSliceTrail([]); }}
        onTouchMove={handleTouchMove}
      >
        {/* Slice trail */}
        <svg className="absolute inset-0 pointer-events-none z-10">
          {sliceTrail.length > 1 && (
            <path
              d={`M ${sliceTrail.map(p => `${p.x},${p.y}`).join(' L ')}`}
              stroke="white"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.8}
            />
          )}
        </svg>

        {/* Fruits */}
        <AnimatePresence>
          {gameItems.map(item => (
            <motion.div
              key={item.id}
              initial={{ scale: 1 }}
              animate={item.sliced ? { scale: 0, opacity: 0 } : { scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute select-none pointer-events-none drop-shadow-lg"
              style={{
                left: item.x,
                top: item.y,
                transform: `rotate(${item.rotation}deg)`,
                fontSize: '5rem', // Much bigger fruits: 80px instead of ~48px
                filter: item.emoji === '💣' ? 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
              }}
            >
              {item.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Instruction */}
        {gameItems.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-amber-600/50 text-lg">
            Swipe to slice! 🗡️
          </div>
        )}
      </div>
    </div>
  );
}
