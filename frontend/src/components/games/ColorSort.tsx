import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Play, RotateCcw } from 'lucide-react';

interface ColorSortProps {
  onBack: () => void;
  onComplete: (wasHelpful: boolean) => void;
}

export default function ColorSort({ onBack, onComplete }: ColorSortProps) {
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [bottles, setBottles] = useState<string[][]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('colorSort_highScore');
    return saved ? parseInt(saved) : 0;
  });

  const possibleColors = [
    '#ef4444', // red
    '#3b82f6', // blue
    '#22c55e', // green
    '#eab308', // yellow
    '#a855f7', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
  ];

  const initGame = useCallback((lvl: number = 1) => {
    const numColors = Math.min(2 + lvl, 6); // 3-6 colors based on level
    const activeColors = [...possibleColors].sort(() => Math.random() - 0.5).slice(0, numColors);

    // Create pool of 4 units per color
    let pool: string[] = [];
    activeColors.forEach(c => {
      for (let i = 0; i < 4; i++) pool.push(c);
    });
    pool = pool.sort(() => Math.random() - 0.5);

    // Create bottles - fill some with colors
    const newBottles: string[][] = Array.from({ length: numColors + 2 }, () => []);
    let bottleIdx = 0;
    while (pool.length > 0) {
      if (newBottles[bottleIdx].length < 4) {
        newBottles[bottleIdx].push(pool.pop()!);
      } else {
        bottleIdx++;
      }
    }

    setBottles(newBottles);
    setIsWon(false);
    setSelected(null);
    setLevel(lvl);
  }, []);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    initGame(1);
  };

  useEffect(() => {
    if (gameStarted && !isWon) {
      initGame(level);
    }
  }, []);

  const handleBottle = (idx: number) => {
    if (isWon) return;

    if (selected === null) {
      // Select bottle if it has balls
      if (bottles[idx].length > 0) {
        setSelected(idx);
      }
    } else {
      const source = [...bottles[selected]];
      const target = [...bottles[idx]];
      const topColor = source[source.length - 1];

      // Check if move is valid
      if (
        idx !== selected &&
        target.length < 4 &&
        (target.length === 0 || target[target.length - 1] === topColor)
      ) {
        // Move the ball
        const newBottles = bottles.map((b, i) => {
          if (i === selected) return b.slice(0, -1);
          if (i === idx) return [...b, topColor];
          return b;
        });

        setBottles(newBottles);
        setScore(s => s + 1);

        // Check win condition
        const won = newBottles.every(
          b => b.length === 0 || (b.length === 4 && b.every(c => c === b[0]))
        );

        if (won) {
          setIsWon(true);
          const totalScore = score + 1 + level * 50;
          if (totalScore > highScore) {
            setHighScore(totalScore);
            localStorage.setItem('colorSort_highScore', totalScore.toString());
          }
        }
      }
      setSelected(null);
    }
  };

  const nextLevel = () => {
    initGame(level + 1);
    setScore(0);
    setIsWon(false);
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 p-4 flex flex-col">
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-8xl mb-6"
          >
            🧪
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-4">Color Sort</h1>
          <p className="text-white/80 mb-2 max-w-md">
            Sort the colors into bottles! A satisfying puzzle to calm your mind.
          </p>
          <p className="text-amber-100 text-sm mb-8">
            Tap bottles to move colors. Fill each bottle with one color!
          </p>

          {highScore > 0 && (
            <div className="flex items-center gap-2 text-yellow-200 mb-6">
              <Trophy className="w-5 h-5" />
              <span>Best: Level {Math.floor(highScore / 50)}</span>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="px-8 py-4 bg-white text-orange-600 rounded-full font-bold text-xl shadow-lg flex items-center gap-2"
          >
            <Play className="w-6 h-6" fill="currentColor" /> Start Sorting!
          </motion.button>
        </div>
      </div>
    );
  }

  if (isWon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 p-4 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-3xl p-8 text-center max-w-sm w-full"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Level {level} Complete!</h2>
          <p className="text-4xl font-bold text-orange-500 mb-4">{score} moves</p>

          <p className="text-gray-600 mb-6">
            {score <= level * 4
              ? 'Perfect sorting! 🌟'
              : score <= level * 6
              ? 'Great job! 💪'
              : 'Level cleared! Keep improving! 🧪'}
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={nextLevel}
              className="w-full py-3 bg-orange-500 text-white rounded-xl font-medium"
            >
              Next Level →
            </button>
            <div className="flex gap-3">
              <button
                onClick={() => onComplete(true)}
                className="flex-1 py-3 bg-green-500 text-white rounded-xl font-medium"
              >
                I feel better!
              </button>
              <button
                onClick={() => initGame(level)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium"
              >
                Retry Level
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 text-white px-4 py-2 rounded-full font-bold">
            Level {level}
          </div>
          <div className="bg-slate-800 text-white px-4 py-2 rounded-full font-bold">
            Moves: {score}
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => initGame(level)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-300 hover:bg-slate-400 rounded-full text-slate-700 font-medium transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Reset Level
        </button>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center">
        <div className="flex gap-3 md:gap-6 flex-wrap justify-center content-center p-4">
          <AnimatePresence>
            {bottles.map((bottle, i) => (
              <motion.button
                key={i}
                initial={{ scale: 0, y: 50 }}
                animate={{
                  scale: 1,
                  y: selected === i ? -20 : 0,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onClick={() => handleBottle(i)}
                className={`w-16 md:w-20 h-52 md:h-64 border-4 rounded-b-[2rem] flex flex-col-reverse p-1.5 gap-1 transition-all relative bg-white/60 backdrop-blur ${
                  selected === i
                    ? 'ring-4 ring-indigo-400 shadow-2xl border-indigo-300'
                    : 'border-slate-300 shadow-lg hover:border-slate-400'
                }`}
              >
                {bottle.map((color, j) => (
                  <motion.div
                    key={j}
                    initial={{ scale: 0, y: -20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: j * 0.05 }}
                    className="h-[22%] w-full rounded-2xl shadow-inner"
                    style={{
                      backgroundColor: color,
                      boxShadow: `inset 0 2px 4px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.2)`,
                    }}
                  />
                ))}
                {/* Bottle neck */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-slate-300 rounded-t-lg" />
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-slate-500 text-sm py-4">
        Tap a bottle to select, then tap another to pour
      </div>
    </div>
  );
}
