from django.db import models
from django.conf import settings


class TriggerPattern(models.Model):
    """Detected patterns that trigger emotional states"""
    TRIGGER_TYPES = [
        ('time', 'Time-based'),        # Sunday anxiety, morning blues
        ('topic', 'Topic-based'),      # Work stress, relationships
        ('activity', 'Activity-based'), # Before meetings, after exercise
        ('weather', 'Weather-based'),   # Rainy days
        ('social', 'Social'),           # After calls, isolation
        ('sleep', 'Sleep-related'),     # Poor sleep -> low mood
        ('custom', 'Custom Pattern'),
    ]
    
    EMOTION_TYPES = [
        ('anxiety', 'Anxiety'),
        ('sadness', 'Sadness'),
        ('anger', 'Anger'),
        ('stress', 'Stress'),
        ('low_energy', 'Low Energy'),
        ('overwhelm', 'Overwhelm'),
        ('loneliness', 'Loneliness'),
        ('positive', 'Positive Emotion'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='trigger_patterns'
    )
    
    trigger_type = models.CharField(max_length=20, choices=TRIGGER_TYPES)
    emotion_type = models.CharField(max_length=20, choices=EMOTION_TYPES)
    
    # Pattern details
    pattern_name = models.CharField(max_length=100)  # "Sunday Evening Anxiety"
    description = models.TextField()  # "You tend to feel anxious on Sunday evenings"
    
    # When this trigger occurs
    time_of_day = models.CharField(max_length=20, blank=True, null=True)  # morning, afternoon, evening, night
    day_of_week = models.CharField(max_length=20, blank=True, null=True)  # monday, sunday, etc.
    keywords = models.JSONField(default=list)  # Topics/words that trigger
    
    # Pattern strength (how confident we are)
    confidence_score = models.FloatField(default=0.5)  # 0-1
    occurrence_count = models.IntegerField(default=1)  # How many times detected
    
    # Coping suggestions
    suggested_coping = models.JSONField(default=list)  # List of coping tool IDs
    custom_advice = models.TextField(blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_dismissed = models.BooleanField(default=False)  # User dismissed this insight
    last_triggered = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.pattern_name} - {self.user.username}"
    
    class Meta:
        ordering = ['-confidence_score', '-occurrence_count']


class InsightNotification(models.Model):
    """Proactive notifications sent to users about their patterns"""
    NOTIFICATION_TYPES = [
        ('trigger_alert', 'Trigger Alert'),      # "It's Sunday evening - usually a tough time"
        ('pattern_detected', 'New Pattern'),     # "We noticed a pattern..."
        ('positive_trend', 'Positive Trend'),    # "Your mood has improved!"
        ('streak_reminder', 'Streak Reminder'),  # "Don't break your streak!"
        ('coping_suggestion', 'Coping Tip'),     # "Try breathing exercise"
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='insight_notifications'
    )
    trigger_pattern = models.ForeignKey(
        TriggerPattern,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications'
    )
    
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=100)
    message = models.TextField()
    
    # Action suggestions
    action_type = models.CharField(max_length=50, blank=True, null=True)  # 'breathing', 'journal', 'chat'
    action_data = models.JSONField(default=dict, blank=True)
    
    # Status
    is_read = models.BooleanField(default=False)
    is_dismissed = models.BooleanField(default=False)
    is_helpful = models.BooleanField(null=True, blank=True)  # User feedback
    
    scheduled_for = models.DateTimeField(null=True, blank=True)  # For proactive alerts
    sent_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.notification_type}: {self.title}"
    
    class Meta:
        ordering = ['-created_at']


class MoodAnalysis(models.Model):
    """Weekly/monthly mood analysis summaries"""
    PERIOD_TYPES = [
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='mood_analyses'
    )
    
    period_type = models.CharField(max_length=10, choices=PERIOD_TYPES)
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Analysis data
    average_mood = models.FloatField()
    mood_variance = models.FloatField(default=0)
    dominant_emotion = models.CharField(max_length=50, blank=True)
    
    # Trends
    trend_direction = models.CharField(max_length=20)  # improving, stable, declining
    trend_percentage = models.FloatField(default=0)
    
    # AI-generated insights
    summary = models.TextField()
    highlights = models.JSONField(default=list)  # Key points
    recommendations = models.JSONField(default=list)  # Suggestions
    
    # Triggers detected in this period
    detected_triggers = models.JSONField(default=list)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.period_type} analysis for {self.user.username} ({self.start_date})"
    
    class Meta:
        ordering = ['-start_date']
        verbose_name_plural = 'Mood Analyses'
