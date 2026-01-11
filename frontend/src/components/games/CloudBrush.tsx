import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Play, Sun } from 'lucide-react';

interface CloudBrushProps {
  onBack: () => void;
  onComplete: (wasHelpful: boolean) => void;
}

export default function CloudBrush({ onBack, onComplete }: CloudBrushProps) {
  const [percent, setPercent] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('cloudBrush_highScore');
    return saved ? parseInt(saved) : 0;
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const totalPixelsRef = useRef(0);
  const clearedPixelsRef = useRef(0);

  const startGame = () => {
    setGameStarted(true);
    setIsWon(false);
    setPercent(0);
    clearedPixelsRef.current = 0;
  };

  useEffect(() => {
    if (!gameStarted || isWon) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill background with clouds
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw fluffy clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const r = 40 + Math.random() * 60;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add some gray clouds
    ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const r = 30 + Math.random() * 50;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    totalPixelsRef.current = canvas.width * canvas.height;
    clearedPixelsRef.current = 0;

    const draw = (e: MouseEvent | TouchEvent) => {
      if (!('buttons' in e) || (e as MouseEvent).buttons !== 1) {
        if (e.type !== 'touchmove') return;
      }

      const r = canvas.getBoundingClientRect();
      const ev = 'touches' in e ? e.touches[0] : e;
      const x = (ev.clientX - r.left) * (canvas.width / r.width);
      const y = (ev.clientY - r.top) * (canvas.height / r.height);

      ctx.globalCompositeOperation = 'destination-out';
      
      // Draw brush stroke
      const brushSize = 50;
      ctx.beginPath();
      ctx.arc(x, y, brushSize, 0, Math.PI * 2);
      ctx.fill();

      // Track cleared area
      clearedPixelsRef.current += Math.PI * brushSize * brushSize * 0.5;
      const newPercent = Math.min(100, (clearedPixelsRef.current / totalPixelsRef.current) * 100 * 4);
      setPercent(newPercent);

      if (newPercent >= 95) {
        setIsWon(true);
        const finalScore = Math.floor(newPercent);
        if (finalScore > highScore) {
          setHighScore(finalScore);
          localStorage.setItem('cloudBrush_highScore', finalScore.toString());
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      draw(e);
    };

    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, [gameStarted, isWon, highScore]);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-300 via-sky-400 to-indigo-500 p-4 flex flex-col">
        <div className="flex items-center mb-6">
          <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <motion.div
            animate={{ y: [0, -10, 0], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="text-8xl mb-6"
          >
            ☁️
          </motion.div>
          <h1 className="text-4xl font-bold text-white mb-4">Cloud Brush</h1>
          <p className="text-white/80 mb-2 max-w-md">
            Clear away the clouds to reveal the hidden sun! A calming, meditative experience.
          </p>
          <p className="text-sky-100 text-sm mb-8">
            Brush away your worries with each stroke
          </p>

          {highScore > 0 && (
            <div className="flex items-center gap-2 text-yellow-200 mb-6">
              <Trophy className="w-5 h-5" />
              <span>Best Clear: {highScore}%</span>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
            className="px-8 py-4 bg-white text-sky-600 rounded-full font-bold text-xl shadow-lg flex items-center gap-2"
          >
            <Play className="w-6 h-6" fill="currentColor" /> Start Clearing!
          </motion.button>
        </div>
      </div>
    );
  }

  if (isWon) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-300 via-sky-400 to-indigo-500 p-4 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-3xl p-8 text-center max-w-sm w-full"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="text-6xl mb-4"
          >
            ☀️
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sky Cleared!</h2>
          <p className="text-4xl font-bold text-sky-500 mb-4">{Math.floor(percent)}% Clear</p>

          <p className="text-gray-600 mb-6">
            The sun is shining! You've cleared away the clouds and found clarity. ✨
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
              className="flex-1 py-3 bg-sky-500 text-white rounded-xl font-medium"
            >
              Play Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-400 p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-white font-bold">
          ☁️ Clear: {Math.floor(percent)}%
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 relative overflow-hidden rounded-2xl">
        {/* Sun behind clouds */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-sky-400 to-sky-300">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="text-center"
          >
            <Sun size={200} className="text-yellow-300 drop-shadow-[0_0_60px_rgba(253,224,71,0.6)]" />
            <p className="mt-4 text-white font-bold text-2xl tracking-wider">
              CLEAR SKY
            </p>
          </motion.div>
        </div>

        {/* Cloud canvas overlay */}
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="absolute inset-0 w-full h-full cursor-pointer"
        />

        {/* Progress bar */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white/30 backdrop-blur rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-yellow-400"
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-white/80 text-sm py-4">
        Click and drag to brush away the clouds ☁️
      </div>
    </div>
  );
}
