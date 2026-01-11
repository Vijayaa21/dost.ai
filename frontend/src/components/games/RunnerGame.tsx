import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, RotateCcw, Star, Heart, Sparkles } from 'lucide-react';

interface RunnerGameProps {
  onBack: () => void;
  onComplete: (improved: boolean) => void;
}

interface Obstacle {
  id: number;
  x: number;
  type: string;
  height: number;
  width: number;
  y: number;
  emoji: string;
  isBonus?: boolean;
}

interface GameState {
  playerY: number;
  playerVelocity: number;
  isJumping: boolean;
  isDucking: boolean;
  obstacles: Obstacle[];
  score: number;
  frameId: number | null;
  speed: number;
}

const INITIAL_SPEED = 8;
const JUMP_STRENGTH = 18;
const GRAVITY = 0.9;
const PLAYER_X = 80;
const GROUND_HEIGHT = 100;

export default function RunnerGame({ onBack, onComplete }: RunnerGameProps) {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('runner_best');
    return saved ? parseInt(saved) : 0;
  });
  const [stars, setStars] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [playerY, setPlayerY] = useState(0);
  const [isDucking, setIsDucking] = useState(false);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);

  const gameRef = useRef<GameState>({
    playerY: 0,
    playerVelocity: 0,
    isJumping: false,
    isDucking: false,
    obstacles: [],
    score: 0,
    frameId: null,
    speed: INITIAL_SPEED
  });

  const endGame = useCallback(() => {
    const finalScore = gameRef.current.score;
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('runner_best', finalScore.toString());
    }
    if (gameRef.current.frameId) {
      cancelAnimationFrame(gameRef.current.frameId);
    }
    setGameState('GAMEOVER');
  }, [highScore]);

  const spawnObstacle = useCallback((): Obstacle => {
    const obstacleTypes = [
      { type: 'tree', height: 70, width: 50, y: 0, emoji: '🌲' },
      { type: 'rock', height: 45, width: 50, y: 0, emoji: '🪨' },
      { type: 'bush', height: 40, width: 55, y: 0, emoji: '🌳' },
      { type: 'bird', height: 45, width: 55, y: 80, emoji: '🦜' },
      { type: 'star', height: 40, width: 40, y: 60, emoji: '⭐', isBonus: true },
    ];

    const level = Math.floor(gameRef.current.score / 400);
    const r = Math.random();
    
    let pick;
    if (r < 0.1) pick = obstacleTypes[4];
    else if (r < 0.25 && level >= 1) pick = obstacleTypes[3];
    else if (r < 0.45) pick = obstacleTypes[2];
    else if (r < 0.7) pick = obstacleTypes[1];
    else pick = obstacleTypes[0];

    return {
      id: Date.now() + Math.random(),
      x: window.innerWidth + 80,
      ...pick
    };
  }, []);

  const gameLoop = useCallback(() => {
    if (gameState !== 'PLAYING') return;

    const g = gameRef.current;
    
    g.score += 1;
    
    if (g.score % 150 === 0) {
      g.speed = Math.min(16, INITIAL_SPEED + g.score / 600);
      setSpeed(Math.round(g.speed));
    }
    if (g.score % 10 === 0) setScore(g.score);

    if (g.isJumping) {
      g.playerVelocity -= GRAVITY;
      g.playerY += g.playerVelocity;
      if (g.playerY <= 0) {
        g.playerY = 0;
        g.isJumping = false;
        g.playerVelocity = 0;
      }
    }
    setPlayerY(g.playerY);

    const spawnChance = 0.018 + g.score / 15000;
    if (Math.random() < spawnChance) {
      const gap = Math.max(200, 350 - Math.floor(g.score / 300) * 15);
      if (g.obstacles.length === 0 || g.obstacles[g.obstacles.length - 1].x < window.innerWidth - gap) {
        g.obstacles.push(spawnObstacle());
      }
    }

    let hit = false;
    const remaining: Obstacle[] = [];
    
    for (const obs of g.obstacles) {
      obs.x -= g.speed;

      const pHeight = g.isDucking ? 35 : 65;
      const pBox = { l: PLAYER_X + 12, r: PLAYER_X + 48, b: g.playerY, t: g.playerY + pHeight };
      const oBox = { l: obs.x + 8, r: obs.x + obs.width - 8, b: obs.y, t: obs.y + obs.height };

      const collide = pBox.r > oBox.l && pBox.l < oBox.r && pBox.t > oBox.b && pBox.b < oBox.t;

      if (collide) {
        if (obs.isBonus) {
          setStars(s => s + 1);
          continue;
        } else {
          hit = true;
          break;
        }
      }
      if (obs.x > -80) remaining.push(obs);
    }

    if (hit) {
      endGame();
      return;
    }

    g.obstacles = remaining;
    setObstacles([...remaining]);

    g.frameId = requestAnimationFrame(gameLoop);
  }, [gameState, endGame, spawnObstacle]);

  const startGame = useCallback(() => {
    gameRef.current = {
      playerY: 0,
      playerVelocity: 0,
      isJumping: false,
      isDucking: false,
      obstacles: [],
      score: 0,
      frameId: null,
      speed: INITIAL_SPEED
    };
    setScore(0);
    setStars(0);
    setSpeed(INITIAL_SPEED);
    setPlayerY(0);
    setIsDucking(false);
    setObstacles([]);
    setGameState('PLAYING');
  }, []);

  const jump = useCallback(() => {
    if (gameState === 'START') {
      startGame();
      return;
    }
    const g = gameRef.current;
    if (!g.isJumping && !g.isDucking && gameState === 'PLAYING') {
      g.isJumping = true;
      g.playerVelocity = JUMP_STRENGTH;
    }
  }, [gameState, startGame]);

  const duck = useCallback((ducking: boolean) => {
    if (gameState === 'PLAYING') {
      gameRef.current.isDucking = ducking;
      setIsDucking(ducking);
    }
  }, [gameState]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        duck(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') duck(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [jump, duck]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      gameRef.current.frameId = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameRef.current.frameId) {
        cancelAnimationFrame(gameRef.current.frameId);
      }
    };
  }, [gameState, gameLoop]);

  return (
    <div 
      className="relative w-full h-screen overflow-hidden select-none touch-none"
      style={{
        background: 'linear-gradient(180deg, #87CEEB 0%, #E0F6FF 50%, #B8E8B8 85%, #7CB87C 100%)'
      }}
    >
      {/* Sun */}
      <div className="absolute top-8 right-12 w-20 h-20 rounded-full bg-yellow-300 shadow-[0_0_60px_rgba(255,220,0,0.6)]" />
      
      {/* Mountains */}
      <svg className="absolute bottom-24 left-0 w-full h-40 opacity-30" viewBox="0 0 1200 200" preserveAspectRatio="none">
        <path d="M0,200 L0,120 Q150,40 300,100 T600,80 T900,110 T1200,90 L1200,200 Z" fill="#5a8a5a"/>
      </svg>

      {/* Clouds */}
      <Cloud x={10} y={8} size={80} delay={0} />
      <Cloud x={35} y={15} size={60} delay={2} />
      <Cloud x={60} y={5} size={70} delay={4} />
      <Cloud x={85} y={12} size={55} delay={1} />

      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-30">
        <div className="flex flex-col gap-3">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 bg-white/80 hover:bg-white text-gray-700 font-semibold px-4 py-2 rounded-2xl shadow-lg backdrop-blur-sm transition-all"
          >
            <ArrowLeft size={18} /> Back
          </button>
          
          {gameState === 'PLAYING' && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg"
            >
              <div className="flex items-center gap-2 text-orange-500 font-bold text-sm">
                <Sparkles size={14} />
                Speed {speed}
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl px-6 py-3 shadow-xl">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider text-center">Distance</p>
            <p className="text-4xl font-black text-gray-800 tabular-nums">{score}<span className="text-lg text-gray-400">m</span></p>
          </div>
          
          <div className="flex gap-2">
            <div className="bg-yellow-400/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
              <Star size={16} fill="white" className="text-white" />
              <span className="font-bold text-white">{stars}</span>
            </div>
            <div className="bg-emerald-500/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
              <span className="text-xs text-white/80">Best</span>
              <span className="font-bold text-white">{highScore}m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={jump}
        onTouchStart={(e) => {
          const startY = e.touches[0].clientY;
          const handleMove = (ev: TouchEvent) => {
            if (ev.touches[0].clientY > startY + 40) duck(true);
          };
          const handleEnd = () => {
            duck(false);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleEnd);
          };
          window.addEventListener('touchmove', handleMove);
          window.addEventListener('touchend', handleEnd);
          jump();
        }}
      >
        {/* Ground */}
        <div 
          className="absolute bottom-0 left-0 right-0 overflow-hidden"
          style={{ height: GROUND_HEIGHT }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-green-400 to-green-600" />
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-b from-amber-600 to-amber-800" />
          <div className="absolute top-0 left-0 right-0 h-6 flex items-end overflow-hidden">
            <motion.div 
              className="flex whitespace-nowrap"
              animate={{ x: [0, -200] }}
              transition={{ duration: 20 / speed, repeat: Infinity, ease: 'linear' }}
            >
              {Array.from({ length: 50 }).map((_, i) => (
                <span key={i} className="text-3xl">🌿</span>
              ))}
            </motion.div>
          </div>
          <div className="absolute top-6 left-0 right-0 h-1 bg-green-700/30" />
        </div>

        {/* Obstacles */}
        {obstacles.map((obs) => (
          <motion.div
            key={obs.id}
            className="absolute pointer-events-none"
            style={{
              left: obs.x,
              bottom: GROUND_HEIGHT + obs.y,
              fontSize: obs.type === 'tree' ? '4.5rem' : '3.5rem',
            }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            {obs.isBonus ? (
              <motion.span
                animate={{ y: [-5, 5, -5], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {obs.emoji}
              </motion.span>
            ) : (
              obs.emoji
            )}
          </motion.div>
        ))}

        {/* Player */}
        <motion.div
          className="absolute pointer-events-none z-20"
          style={{
            left: PLAYER_X,
            bottom: GROUND_HEIGHT + playerY,
          }}
          animate={{
            scaleY: isDucking ? 0.5 : 1,
            scaleX: isDucking ? 1.2 : 1,
          }}
          transition={{ duration: 0.1 }}
        >
          <div className="relative">
            <span className="text-7xl block" style={{ transformOrigin: 'bottom', transform: 'scaleX(-1)' }}>
              {playerY > 10 ? '🏃‍♂️' : (score % 20 < 10 ? '🏃' : '🏃‍♂️')}
            </span>
            {playerY > 20 && (
              <motion.div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-2xl opacity-50"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                💨
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {gameState === 'START' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -30 }}
              className="bg-white rounded-[2rem] p-8 shadow-2xl max-w-md w-full text-center"
            >
              <motion.div 
                className="text-8xl mb-4"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🏃‍♂️
              </motion.div>
              
              <h1 className="text-4xl font-black text-gray-800 mb-2">Happy Runner</h1>
              <p className="text-gray-500 mb-8">Run, jump & collect stars!</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-2xl p-4 text-left">
                  <p className="text-sky-600 font-bold text-xs mb-2">⌨️ KEYBOARD</p>
                  <p className="text-gray-600 text-sm">Space / ↑ to Jump</p>
                  <p className="text-gray-600 text-sm">↓ to Duck</p>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-4 text-left">
                  <p className="text-pink-600 font-bold text-xs mb-2">👆 TOUCH</p>
                  <p className="text-gray-600 text-sm">Tap to Jump</p>
                  <p className="text-gray-600 text-sm">Swipe ↓ to Duck</p>
                </div>
              </div>

              <motion.button
                onClick={startGame}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-black py-5 rounded-2xl text-xl shadow-lg flex items-center justify-center gap-3"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Play fill="currentColor" size={24} /> START RUNNING
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {gameState === 'GAMEOVER' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2rem] p-8 shadow-2xl max-w-sm w-full text-center"
            >
              <motion.div 
                className="text-7xl mb-3"
                initial={{ rotate: -20, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
              >
                😅
              </motion.div>
              
              <h2 className="text-3xl font-black text-gray-800 mb-1">Oops!</h2>
              <p className="text-gray-500 mb-6">Great run though!</p>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-5 mb-6 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-semibold">Distance</span>
                  <span className="text-2xl font-black text-emerald-500">{score}m</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-semibold">Stars</span>
                  <span className="text-2xl font-black text-yellow-500 flex items-center gap-1">
                    <Star size={20} fill="currentColor" /> {stars}
                  </span>
                </div>
              </div>

              {score >= highScore && score > 0 && (
                <motion.div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold py-3 px-5 rounded-full mb-6 flex items-center justify-center gap-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  🏆 NEW BEST RECORD!
                </motion.div>
              )}

              <div className="flex gap-3">
                <motion.button
                  onClick={() => onComplete(true)}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Heart size={18} fill="currentColor" /> Done
                </motion.button>
                <motion.button
                  onClick={startGame}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <RotateCcw size={18} /> Retry
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Cloud({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  return (
    <motion.div
      className="absolute text-white/60 pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, fontSize: size }}
      animate={{ x: [0, -30, 0] }}
      transition={{ duration: 20 + delay * 2, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      ☁️
    </motion.div>
  );
}
