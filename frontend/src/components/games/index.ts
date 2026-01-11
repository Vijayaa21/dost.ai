// Built-in games that work without backend
export { default as BubblePop } from './BubblePop';
export { default as FruitSlice } from './FruitSlice';
export { default as CatchStars } from './CatchStars';
export { default as MemoryMatch } from './MemoryMatch';
export { default as BreathingBubble } from './BreathingBubble';
export { default as ColorCanvas } from './ColorCanvas';
export { default as NeonCruise } from './NeonCruise';
export { default as ColorSort } from './ColorSort';
export { default as CloudBrush } from './CloudBrush';
export { default as RunnerGame } from './RunnerGame';
export { default as TicTacToe } from './TicTacToe';

// Game metadata for the games page
export interface BuiltInGame {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  emotions: string[];
  duration: string;
  benefit: string;
  isMultiplayer?: boolean;
}

export const builtInGames: BuiltInGame[] = [
  {
    id: 'bubble-pop',
    name: 'Bubble Pop',
    description: 'Pop colorful bubbles to release stress and tension. The faster you pop, the higher your score!',
    emoji: '🫧',
    color: 'from-blue-400 to-purple-500',
    emotions: ['anger', 'anxiety', 'boredom'],
    duration: '1-2 min',
    benefit: 'Releases tension through satisfying popping action',
  },
  {
    id: 'fruit-slice',
    name: 'Fruit Slice',
    description: 'Swipe to slice flying fruits! A satisfying way to channel frustration into fun.',
    emoji: '🍉',
    color: 'from-orange-400 to-red-500',
    emotions: ['anger', 'boredom', 'joy'],
    duration: '2-3 min',
    benefit: 'Channel frustration into satisfying slicing action',
  },
  {
    id: 'catch-stars',
    name: 'Catch the Stars',
    description: 'Catch falling stars, hearts, and rainbows while avoiding clouds. An uplifting experience!',
    emoji: '⭐',
    color: 'from-indigo-500 to-purple-600',
    emotions: ['sadness', 'loneliness', 'joy'],
    duration: '1-2 min',
    benefit: 'Uplifting gameplay that brings joy and focus',
  },
  {
    id: 'memory-match',
    name: 'Memory Match',
    description: 'Match pairs of cards to train your memory. A calming game that improves focus.',
    emoji: '🧠',
    color: 'from-amber-400 to-orange-500',
    emotions: ['anxiety', 'boredom', 'sadness'],
    duration: '3-5 min',
    benefit: 'Improves focus and provides mental distraction',
  },
  {
    id: 'breathing-bubble',
    name: 'Breathing Exercise',
    description: 'Follow the calming bubble to practice guided breathing. Perfect for anxiety relief.',
    emoji: '🌬️',
    color: 'from-cyan-400 to-blue-500',
    emotions: ['anxiety', 'fear', 'anger'],
    duration: '3-5 min',
    benefit: 'Calms the nervous system through guided breathing',
  },
  {
    id: 'color-canvas',
    name: 'Creative Canvas',
    description: 'Express yourself through colors and art. Draw freely to process emotions creatively.',
    emoji: '🎨',
    color: 'from-pink-400 to-purple-500',
    emotions: ['sadness', 'loneliness', 'love', 'joy'],
    duration: 'Unlimited',
    benefit: 'Creative expression helps process emotions',
  },
  {
    id: 'runner-game',
    name: 'Happy Runner',
    description: 'Jump and run in this endless runner! Collect hearts and feel the joy of movement.',
    emoji: '🏃‍♂️',
    color: 'from-sky-400 to-cyan-500',
    emotions: ['boredom', 'sadness', 'joy'],
    duration: '2-5 min',
    benefit: 'Active gameplay boosts mood through achievement',
  },
  {
    id: 'neon-cruise',
    name: 'Neon Cruise',
    description: 'Fast-paced racing game! Dodge obstacles at high speed to achieve flow state focus.',
    emoji: '🏎️',
    color: 'from-indigo-500 to-purple-700',
    emotions: ['boredom', 'anxiety', 'anger'],
    duration: '2-5 min',
    benefit: 'Achieves flow state through focused gameplay',
  },
  {
    id: 'color-sort',
    name: 'Color Sort',
    description: 'Relaxing puzzle game! Sort colors into bottles to calm your mind and find clarity.',
    emoji: '🧪',
    color: 'from-amber-400 to-orange-600',
    emotions: ['anxiety', 'boredom', 'sadness'],
    duration: '3-10 min',
    benefit: 'Calming logic puzzles reduce overthinking',
  },
  {
    id: 'cloud-brush',
    name: 'Cloud Brush',
    description: 'Meditative clearing game! Brush away clouds to reveal the hidden sun and find peace.',
    emoji: '☁️',
    color: 'from-sky-300 to-indigo-400',
    emotions: ['sadness', 'anxiety', 'loneliness'],
    duration: '1-3 min',
    benefit: 'Metaphorical clearing brings mental clarity',
  },
  {
    id: 'tic-tac-toe',
    name: 'Tic Tac Toe',
    description: 'Classic multiplayer game! Play with a friend online and enjoy some friendly competition.',
    emoji: '⭕',
    color: 'from-indigo-400 to-purple-500',
    emotions: ['loneliness', 'boredom', 'joy'],
    duration: '2-5 min',
    benefit: 'Connect with friends through playful competition',
    isMultiplayer: true,
  },
];

// Map emotions to recommended games
export const emotionGameMap: Record<string, string[]> = {
  anger: ['bubble-pop', 'fruit-slice', 'breathing-bubble', 'neon-cruise'],
  sadness: ['catch-stars', 'color-canvas', 'runner-game', 'memory-match', 'cloud-brush'],
  anxiety: ['breathing-bubble', 'memory-match', 'bubble-pop', 'color-sort', 'cloud-brush'],
  loneliness: ['catch-stars', 'color-canvas', 'runner-game', 'cloud-brush', 'tic-tac-toe'],
  boredom: ['fruit-slice', 'runner-game', 'bubble-pop', 'memory-match', 'neon-cruise', 'color-sort', 'tic-tac-toe'],
  love: ['color-canvas', 'catch-stars'],
  joy: ['fruit-slice', 'catch-stars', 'runner-game', 'color-canvas', 'neon-cruise', 'tic-tac-toe'],
  fear: ['breathing-bubble', 'memory-match', 'catch-stars', 'color-sort'],
};

// Get supportive message based on emotion
export const getEmotionMessage = (emotion: string): string => {
  const messages: Record<string, string> = {
    anger: "Let's channel that energy into something fun! These games help release tension in a healthy way.",
    sadness: "I hope these uplifting games bring a smile to your face. Remember, it's okay to take a break and play.",
    anxiety: "Take a deep breath. These calming games can help you find your center and relax.",
    loneliness: "You're not alone. Let these games be your companion for a while.",
    boredom: "Time for some excitement! These games will get your mind engaged and entertained.",
    love: "Express those warm feelings through creative play!",
    joy: "Let's celebrate! These games will keep the good vibes going.",
    fear: "You're safe here. These gentle games can help calm your worries.",
  };
  return messages[emotion] || "Here are some games that might help you feel better.";
};
