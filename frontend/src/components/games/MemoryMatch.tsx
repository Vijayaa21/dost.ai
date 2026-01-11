import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Play, RotateCcw } from 'lucide-react';

interface MemoryMatchProps {
  onBack: () => void;
  onComplete: (wasHelpful: boolean) => void;
}

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const emojiSets = {
  emotions: ['😊', '😢', '😡', '😨', '🥰', '😴', '🤗', '😌'],
  nature: ['🌸', '🌻', '🌺', '🌷', '🌹', '🌼', '💐', '🌿'],
  animals: ['🦋', '🐢', '🦜', '🐰', '🦊', '🐻', '🦝', '🐨'],
  food: ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🥝', '🍒'],
};

const difficulties = {
  easy: { pairs: 4, gridCols: 4 },
  medium: { pairs: 6, gridCols: 4 },
  hard: { pairs: 8, gridCols: 4 },
};

export default function MemoryMatch({ onBack, onComplete }: MemoryMatchProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [difficulty, setDifficulty] = useState<keyof typeof difficulties>('easy');
  const [emojiSet, setEmojiSet] = useState<keyof typeof emojiSets>('emotions');
  const [timer, setTimer] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(() => {
    const saved = localStorage.getItem('memoryMatch_bestTime');
    return saved ? parseInt(saved) : null;
  });
  const [isChecking, setIsChecking] = useState(false);

  const initializeGame = useCallback(() => {
    const { pairs } = difficulties[difficulty];
    const selectedEmojis = emojiSets[emojiSet].slice(0, pairs);
    const cardPairs = [...selectedEmojis, ...selectedEmojis];
    
    const shuffled = cardPairs
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }))
      .sort(() => Math.random() - 0.5);

    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setTimer(0);
    setGameComplete(false);
    setGameStarted(true);
  }, [difficulty, emojiSet]);

  // Timer
  useEffect(() => {
    if (!gameStarted || gameComplete) return;

    const interval = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStarted, gameComplete]);

  // Check for matches
  useEffect(() => {
    if (flippedCards.length !== 2) return;

    setIsChecking(true);
    const [first, second] = flippedCards;
    const firstCard = cards[first];
    const secondCard = cards[second];

    if (firstCard.emoji === secondCard.emoji) {
      setTimeout(() => {
        setCards(prev =>
          prev.map((card, idx) =>
            idx === first || idx === second
              ? { ...card, isMatched: true }
              : card
          )
        );
        setMatches(m => m + 1);
        setFlippedCards([]);
        setIsChecking(false);
        
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }, 500);
    } else {
      setTimeout(() => {
        setCards(prev =>
          prev.map((card, idx) =>
            idx === first || idx === second
              ? { ...card, isFlipped: false }
              : card
          )
        );
        setFlippedCards([]);
        setIsChecking(false);
      }, 1000);
    }
  }, [flippedCards, cards]);

  // Check for game completion
  useEffect(() => {
    const { pairs } = difficulties[difficulty];
    if (matches === pairs && gameStarted) {
      setGameComplete(true);
      if (!bestTime || timer < bestTime) {
        setBestTime(timer);
        localStorage.setItem('memoryMatch_bestTime', timer.toString());
      }
    }
  }, [matches, difficulty, gameStarted, timer, bestTime]);

  const handleCardClick = (index: number) => {
    if (isChecking) return;
    if (flippedCards.length >= 2) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;
    if (flippedCards.includes(index)) return;

    setCards(prev =>
      prev.map((card, idx) =>
        idx === index ? { ...card, isFlipped: true } : card
      )
    );
    setFlippedCards(prev => [...prev, index]);
    setMoves(m => m + 1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStarRating = () => {
    const { pairs } = difficulties[difficulty];
    const optimalMoves = pairs * 2;
    const ratio = moves / optimalMoves;
    if (ratio <= 1.5) return 3;
    if (ratio <= 2.5) return 2;
    return 1;
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 md:p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>

        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <motion.div 
              className="text-6xl mb-4"
              animate={{ rotateY: [0, 180, 360] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              🧠
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Memory Match</h1>
            <p className="text-gray-600">Match pairs of cards to train your memory and focus</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {/* Theme Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Theme
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(emojiSets) as Array<keyof typeof emojiSets>).map((set) => (
                  <button
                    key={set}
                    onClick={() => setEmojiSet(set)}
                    className={`p-3 rounded-xl text-sm font-medium capitalize transition-all ${
                      emojiSet === set
                        ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                        : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    {emojiSets[set][0]} {set}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <div className="flex gap-2">
                {(Object.keys(difficulties) as Array<keyof typeof difficulties>).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`flex-1 p-3 rounded-xl text-sm font-medium capitalize transition-all ${
                      difficulty === diff
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {diff}
                    <div className="text-xs opacity-80">{difficulties[diff].pairs} pairs</div>
                  </button>
                ))}
              </div>
            </div>

            {bestTime && (
              <div className="mb-6 text-center text-sm text-gray-600">
                <Trophy className="w-4 h-4 inline mr-1 text-yellow-500" />
                Best time: {formatTime(bestTime)}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={initializeGame}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" fill="white" /> Start Game
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-xl"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Congratulations!
          </h2>

          <div className="flex justify-center gap-1 mb-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className="text-3xl">
                {i < getStarRating() ? '⭐' : '☆'}
              </span>
            ))}
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Time</span>
              <span className="font-semibold">{formatTime(timer)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Moves</span>
              <span className="font-semibold">{moves}</span>
            </div>
          </div>
          
          {timer === bestTime && (
            <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              🏆 New Best Time!
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => onComplete(true)}
              className="flex-1 py-3 bg-green-500 text-white rounded-xl font-medium"
            >
              I feel better!
            </button>
            <button
              onClick={initializeGame}
              className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-medium"
            >
              Play Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div className="flex items-center gap-4">
          <div className="bg-white px-4 py-2 rounded-full shadow-sm text-gray-700 font-medium">
            ⏱️ {formatTime(timer)}
          </div>
          <div className="bg-white px-4 py-2 rounded-full shadow-sm text-gray-700 font-medium">
            👆 {moves}
          </div>
          <button
            onClick={initializeGame}
            className="p-2 rounded-lg bg-white shadow-sm text-gray-600 hover:bg-gray-50"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Game Board */}
      <div className="max-w-lg mx-auto">
        <div className="grid grid-cols-4 gap-2 md:gap-3">
          {cards.map((card, index) => (
            <motion.button
              key={card.id}
              onClick={() => handleCardClick(index)}
              className="aspect-square relative"
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {card.isFlipped || card.isMatched ? (
                  <motion.div
                    key="front"
                    initial={{ rotateY: 90 }}
                    animate={{ rotateY: 0 }}
                    exit={{ rotateY: 90 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute inset-0 rounded-xl flex items-center justify-center text-3xl md:text-4xl ${
                      card.isMatched
                        ? 'bg-green-100 border-2 border-green-300'
                        : 'bg-white border-2 border-orange-200'
                    }`}
                  >
                    {card.emoji}
                  </motion.div>
                ) : (
                  <motion.div
                    key="back"
                    initial={{ rotateY: -90 }}
                    animate={{ rotateY: 0 }}
                    exit={{ rotateY: -90 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <span className="text-white text-2xl">?</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>

        {/* Progress */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Matches</span>
            <span>{matches} / {difficulties[difficulty].pairs}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-400 to-amber-500"
              initial={{ width: 0 }}
              animate={{ width: `${(matches / difficulties[difficulty].pairs) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
