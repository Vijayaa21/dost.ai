// User types
export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  preferred_tone: 'calm' | 'friendly' | 'minimal';
  is_anonymous: boolean;
  onboarding_completed: boolean;
  data_collection_consent: boolean;
  reminder_enabled: boolean;
  reminder_time: string | null;
  created_at: string;
  profile?: UserProfile;
}

export interface UserProfile {
  bio: string;
  age_range: string;
  primary_concerns: string[];
  coping_preferences: string[];
}

// Chat types
export interface Message {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  detected_emotion: string | null;
  is_crisis: boolean;
  created_at: string;
}

export interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  messages: Message[];
  message_count: number;
  last_message?: {
    content: string;
    role: string;
    created_at: string;
  };
}

// Mood types
export interface MoodEntry {
  id: number;
  mood_score: number;
  mood_label: string;
  emotions: string[];
  note: string;
  activities: string[];
  sleep_quality: number | null;
  energy_level: number | null;
  created_at: string;
  date: string;
}

export interface MoodStats {
  average_mood: number;
  total_entries: number;
  mood_distribution: Record<number, number>;
  emotion_frequency: Record<string, number>;
  weekly_trend: Array<{
    date: string;
    mood_score: number;
    emotions: string[];
  }>;
}

// Journal types
export interface JournalEntry {
  id: number;
  title: string;
  content: string;
  tags: string[];
  mood_at_writing: number | null;
  ai_reflection_enabled: boolean;
  ai_reflection: string;
  ai_emotion_analysis: Record<string, string>;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  preview?: string;
}

export interface JournalPrompt {
  id?: number;
  prompt_text: string;
  category: string;
}

// Coping types
export interface CopingTool {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  duration_minutes: number;
  instructions: string[];
  benefits: string;
  when_to_use: string;
  icon: string;
  inhale_duration?: number;
  hold_duration?: number;
  exhale_duration?: number;
  cycles?: number;
}

export interface Affirmation {
  id?: number;
  text: string;
  category: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
}

export interface OnboardingData {
  preferred_tone: 'calm' | 'friendly' | 'minimal';
  age_range?: string;
  primary_concerns?: string[];
  coping_preferences?: string[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
}
