import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Play, ArrowLeftCircle, ArrowRightCircle } from 'lucide-react';

interface NeonCruiseProps {
  onBack: () => void;
  onComplete: (wasHelpful: boolean) => void;
}

export default function NeonCruise({ onBack, onComplete }: NeonCruiseProps) {
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('neonCruise_highScore');
    return saved ? parseInt(saved) : 0;
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef({
    car: { x: 175, lane: 1, w: 60, h: 100 },
    lanes: [80, 175, 270],
    obstacles: [] as { x: number; y: number; w: number; h: number; speed: number }[],
    frames: 0,
  });

  const startGame = useCallback(() => {
    setGameStarted(true);
    setGameOver(false);
    setIsWon(false);
    setScore(0);
    gameStateRef.current = {
      car: { x: 175, lane: 1, w: 60, h: 100 },
      lanes: [80, 175, 270],
      obstacles: [],
      frames: 0,
    };
  }, []);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    const state = gameStateRef.current;

    const loop = () => {
      // Clear and draw background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Road lines (speed up animation with level)
      const currentLevel = Math.floor(state.frames / 300) + 1;
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 4;
      ctx.setLineDash([40, 40]);
      ctx.lineDashOffset = state.frames * -(20 + currentLevel * 5);
      [130, 220, 310].forEach(x => {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Player movement (smooth)
      state.car.x += (state.lanes[state.car.lane] - state.car.x) * 0.15;

      // Draw car with glow
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#6366f1';
      ctx.fillStyle = '#6366f1';
      
      // Car body
      ctx.beginPath();
      ctx.roundRect(state.car.x, 480, state.car.w, state.car.h, 15);
      ctx.fill();
      
      ctx.shadowBlur = 0;

      // Car details
      ctx.fillStyle = '#818cf8';
      ctx.fillRect(state.car.x + 10, 490, 15, 20); // Left window
      ctx.fillRect(state.car.x + state.car.w - 25, 490, 15, 20); // Right window

      // Headlights
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#fef3c7';
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(state.car.x + 10, 485, 12, 6);
      ctx.fillRect(state.car.x + state.car.w - 22, 485, 12, 6);
      ctx.shadowBlur = 0;

      // Taillights
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(state.car.x + 8, 570, 12, 6);
      ctx.fillRect(state.car.x + state.car.w - 20, 570, 12, 6);

      // Calculate speed based on level (currentLevel already defined above)
      const baseSpeed = 10 + currentLevel * 2; // Speed increases with level
      const spawnRate = Math.max(15, 30 - currentLevel * 3); // Spawn faster at higher levels

      // Spawn obstacles
      if (state.frames % spawnRate === 0) {
        state.obstacles.push({
          x: state.lanes[Math.floor(Math.random() * 3)],
          y: -120,
          w: 55,
          h: 70,
          speed: baseSpeed + Math.random() * 3,
        });
      }

      // Draw and move obstacles
      state.obstacles.forEach((o, i) => {
        o.y += o.speed;

        // Draw obstacle car
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#f43f5e';
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.roundRect(o.x, o.y, o.w, o.h, 10);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Obstacle details
        ctx.fillStyle = '#fda4af';
        ctx.fillRect(o.x + 8, o.y + 10, 12, 15);
        ctx.fillRect(o.x + o.w - 20, o.y + 10, 12, 15);

        // Collision detection
        const carLeft = state.car.x;
        const carRight = state.car.x + state.car.w;
        const carTop = 480;
        const carBottom = 580;
        const obsLeft = o.x;
        const obsRight = o.x + o.w;
        const obsTop = o.y;
        const obsBottom = o.y + o.h;

        if (
          carLeft < obsRight &&
          carRight > obsLeft &&
          carTop < obsBottom &&
          carBottom > obsTop
        ) {
          // Collision!
          setGameOver(true);
          if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('neonCruise_highScore', score.toString());
          }
          return;
        }

        if (o.y > canvas.height) {
          state.obstacles.splice(i, 1);
        }
      });

      state.frames++;
      const newScore = Math.floor(state.frames / 5);
      setScore(newScore);

      if (state.frames > 1500) {
        setIsWon(true);
        setGameOver(true);
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('neonCruise_highScore', newScore.toString());
        }
        return;
      }

      frameId = requestAnimationFrame(loop);
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && state.car.lane > 0) {
        state.car.lane--;
      }
      if (e.key === 'ArrowRight' && state.car.lane < 2) {
        state.car.lane++;
      }
    };

    window.addEventListener('keydown', handleKey);
    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('keydown', handleKey);
    };
  }, [gameStarted, gameOver, highScore, score]);

  const moveLeft = () => {
    if (gameStateRef.current.car.lane > 0) {
      gameStateRef.current.car.lane--;
    }
  };

  const moveRight = () => {
    if (gameStateRef.current.car.lane < 2) {
      gameStateRef.current.car.lane++;
    }
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 flex flex-col">
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-8xl mb-6"
          >
            🏎️
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-4">Neon Cruise</h1>
          <p className="text-white/80 mb-2 max-w-md">
            Fast-paced flow state. Dodge obstacles at high speed to achieve focus!
          </p>
          <p className="text-indigo-300 text-sm mb-8">
            Use arrow keys or tap the buttons to move
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
            className="px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-xl shadow-lg flex items-center gap-2"
          >
            <Play className="w-6 h-6" fill="currentColor" /> Start Racing!
          </motion.button>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-3xl p-8 text-center max-w-sm w-full"
        >
          <div className="text-6xl mb-4">{isWon ? '🏆' : '💥'}</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isWon ? 'You Won!' : 'Crash!'}
          </h2>
          <p className="text-4xl font-bold text-indigo-600 mb-4">{score} pts</p>

          {score >= highScore && score > 0 && (
            <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              🏆 New High Score!
            </div>
          )}

          <p className="text-gray-600 mb-6">
            {isWon
              ? 'Amazing focus! You reached the finish line! 🌟'
              : score > 150
              ? 'Great run! Almost there! 💪'
              : 'Keep cruising to improve! 🚗'}
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
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium"
            >
              Play Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <div className="bg-indigo-600/50 backdrop-blur px-4 py-2 rounded-full text-white font-bold">
          🎯 FOCUS: {score}
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={400}
          height={700}
          className="max-h-[70vh] aspect-[4/7] rounded-3xl border-4 border-slate-800 shadow-2xl"
        />
        
        {/* Mobile Controls */}
        <div className="flex gap-8 mt-6">
          <button
            onTouchStart={moveLeft}
            onClick={moveLeft}
            className="w-20 h-20 bg-indigo-600/50 backdrop-blur rounded-full flex items-center justify-center text-white active:bg-indigo-500"
          >
            <ArrowLeftCircle className="w-10 h-10" />
          </button>
          <button
            onTouchStart={moveRight}
            onClick={moveRight}
            className="w-20 h-20 bg-indigo-600/50 backdrop-blur rounded-full flex items-center justify-center text-white active:bg-indigo-500"
          >
            <ArrowRightCircle className="w-10 h-10" />
          </button>
        </div>
        <p className="mt-4 text-slate-500 text-sm font-medium">
          Use Arrow Keys or Tap to Move
        </p>
      </div>
    </div>
  );
}
