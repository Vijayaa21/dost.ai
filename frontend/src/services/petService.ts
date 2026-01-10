import api from './api';

export interface PetType {
  id: number;
  name: string;
  species: string;
  description: string;
  base_image: string;
  personality: string;
}

export interface PetActivity {
  id: number;
  activity_type: string;
  activity_display: string;
  xp_earned: number;
  happiness_change: number;
  energy_change: number;
  description: string;
  created_at: string;
}

export interface WellnessPet {
  id: number;
  name: string;
  pet_type: PetType | null;
  happiness: number;
  energy: number;
  health: number;
  mood: 'ecstatic' | 'happy' | 'neutral' | 'sad' | 'very_sad';
  level: number;
  experience: number;
  total_xp: number;
  xp_for_next_level: number;
  level_progress: number;
  current_streak: number;
  longest_streak: number;
  last_interaction: string | null;
  unlocked_accessories: string[];
  equipped_accessory: string | null;
  recent_activities: PetActivity[];
  created_at: string;
  updated_at: string;
}

export interface PetInteractionResponse {
  pet: WellnessPet;
  activity: PetActivity;
  xp_earned: number;
  streak_bonus: number;
  leveled_up: boolean;
  message: string;
}

export interface PetStats {
  pet: WellnessPet;
  total_activities: number;
  activity_breakdown: Array<{
    activity_type: string;
    count: number;
    total_xp: number;
  }>;
  achievements: Array<{
    name: string;
    icon: string;
    desc: string;
  }>;
}

export const petService = {
  // Get user's pet (auto-creates if doesn't exist)
  async getPet(): Promise<WellnessPet> {
    const response = await api.get('/pet/');
    return response.data;
  },

  // Update pet name or type
  async updatePet(data: { name?: string; pet_type_id?: number }): Promise<WellnessPet> {
    const response = await api.post('/pet/', data);
    return response.data;
  },

  // Log an interaction (awards XP)
  async interact(activityType: string, description?: string): Promise<PetInteractionResponse> {
    const response = await api.post('/pet/interact/', {
      activity_type: activityType,
      description,
    });
    return response.data;
  },

  // Feed the pet to boost stats
  async feed(boostType: 'happiness' | 'energy'): Promise<{ pet: WellnessPet; message: string }> {
    const response = await api.post('/pet/feed/', { boost_type: boostType });
    return response.data;
  },

  // Equip an accessory
  async equip(accessory: string | null): Promise<{ pet: WellnessPet; message: string }> {
    const response = await api.post('/pet/equip/', { accessory });
    return response.data;
  },

  // Get pet activity history
  async getActivities(): Promise<PetActivity[]> {
    const response = await api.get('/pet/activities/');
    return response.data;
  },

  // Get pet stats and achievements
  async getStats(): Promise<PetStats> {
    const response = await api.get('/pet/stats/');
    return response.data;
  },

  // Get available pet types
  async getPetTypes(): Promise<PetType[]> {
    const response = await api.get('/pet/types/');
    return response.data;
  },
};
