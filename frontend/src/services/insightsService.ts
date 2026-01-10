import api from './api';

export interface TriggerPattern {
  id: number;
  trigger_type: string;
  trigger_type_display: string;
  emotion_type: string;
  emotion_type_display: string;
  pattern_name: string;
  description: string;
  time_of_day: string | null;
  day_of_week: string | null;
  keywords: string[];
  confidence_score: number;
  occurrence_count: number;
  suggested_coping: number[];
  custom_advice: string;
  is_active: boolean;
  is_dismissed: boolean;
  last_triggered: string | null;
  created_at: string;
  updated_at: string;
}

export interface InsightNotification {
  id: number;
  notification_type: string;
  notification_type_display: string;
  trigger_pattern: TriggerPattern | null;
  title: string;
  message: string;
  action_type: string | null;
  action_data: Record<string, unknown>;
  is_read: boolean;
  is_dismissed: boolean;
  is_helpful: boolean | null;
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface MoodAnalysis {
  id: number;
  period_type: 'weekly' | 'monthly';
  start_date: string;
  end_date: string;
  average_mood: number;
  mood_variance: number;
  dominant_emotion: string;
  trend_direction: 'improving' | 'stable' | 'declining';
  trend_percentage: number;
  summary: string;
  highlights: string[];
  recommendations: string[];
  detected_triggers: string[];
  created_at: string;
}

export interface ProactiveAlert {
  has_alert: boolean;
  notification?: InsightNotification;
}

export const insightsService = {
  // Get all trigger patterns
  async getPatterns(): Promise<TriggerPattern[]> {
    const response = await api.get('/insights/patterns/');
    return response.data;
  },

  // Get active high-confidence patterns
  async getActivePatterns(): Promise<TriggerPattern[]> {
    const response = await api.get('/insights/patterns/active/');
    return response.data;
  },

  // Run pattern analysis
  async analyzePatterns(): Promise<{
    patterns_found: number;
    patterns: TriggerPattern[];
    message: string;
  }> {
    const response = await api.post('/insights/patterns/analyze/');
    return response.data;
  },

  // Dismiss a pattern
  async dismissPattern(id: number): Promise<void> {
    await api.post(`/insights/patterns/${id}/dismiss/`);
  },

  // Get notifications
  async getNotifications(): Promise<InsightNotification[]> {
    const response = await api.get('/insights/notifications/');
    return response.data;
  },

  // Get unread notifications
  async getUnreadNotifications(): Promise<InsightNotification[]> {
    const response = await api.get('/insights/notifications/unread/');
    return response.data;
  },

  // Mark notification as read
  async markAsRead(id: number): Promise<void> {
    await api.post(`/insights/notifications/${id}/mark_read/`);
  },

  // Provide feedback on notification
  async provideFeedback(id: number, helpful: boolean): Promise<void> {
    await api.post(`/insights/notifications/${id}/feedback/`, { helpful });
  },

  // Check for proactive alerts
  async checkProactiveAlert(): Promise<ProactiveAlert> {
    const response = await api.get('/insights/proactive-alert/');
    return response.data;
  },

  // Get mood analysis
  async getMoodAnalyses(): Promise<MoodAnalysis[]> {
    const response = await api.get('/insights/analysis/');
    return response.data;
  },

  // Get latest analysis
  async getLatestAnalysis(): Promise<MoodAnalysis | null> {
    try {
      const response = await api.get('/insights/analysis/latest/');
      return response.data;
    } catch {
      return null;
    }
  },

  // Generate new analysis
  async generateAnalysis(): Promise<MoodAnalysis> {
    const response = await api.post('/insights/analysis/generate/');
    return response.data;
  },
};
