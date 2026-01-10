from django.db import models
from django.conf import settings


class TherapeuticGame(models.Model):
    """Games categorized by emotional outlet type"""
    
    EMOTION_CATEGORIES = [
        ('anger', 'Anger / Frustration'),
        ('sadness', 'Sadness / Grief'),
        ('anxiety', 'Anxiety / Stress'),
        ('loneliness', 'Loneliness / Isolation'),
        ('boredom', 'Boredom / Restlessness'),
        ('love', 'Love / Affection'),
        ('joy', 'Joy / Excitement'),
        ('fear', 'Fear / Worry'),
    ]
    
    GAME_TYPES = [
        ('action', 'Action / Combat'),
        ('puzzle', 'Puzzle / Brain'),
        ('creative', 'Creative / Building'),
        ('social', 'Social / Multiplayer'),
        ('relaxing', 'Relaxing / Zen'),
        ('adventure', 'Adventure / Story'),
        ('sports', 'Sports / Competition'),
        ('music', 'Music / Rhythm'),
    ]
    
    name = models.CharField(max_length=100)
    description = models.TextField()
    emotion_category = models.CharField(max_length=20, choices=EMOTION_CATEGORIES)
    game_type = models.CharField(max_length=20, choices=GAME_TYPES)
    
    # Game metadata
    emoji = models.CharField(max_length=10, default='🎮')
    thumbnail_url = models.URLField(blank=True, null=True)
    game_url = models.URLField(blank=True, null=True)  # Link to play online
    is_browser_playable = models.BooleanField(default=True)
    
    # Why this game helps with this emotion
    therapeutic_benefit = models.TextField(help_text="How this game helps process the emotion")
    
    # Intensity level (1-5) - matches emotion intensity
    intensity_level = models.IntegerField(default=3, help_text="1=mild, 5=intense")
    
    # Duration
    avg_duration_minutes = models.IntegerField(default=10)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['emotion_category', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_emotion_category_display()})"


class GameSession(models.Model):
    """Track user game sessions for emotion pattern detection"""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='game_sessions'
    )
    game = models.ForeignKey(
        TherapeuticGame,
        on_delete=models.CASCADE,
        related_name='sessions'
    )
    
    # Emotion state before playing
    emotion_before = models.CharField(max_length=20)
    emotion_intensity_before = models.IntegerField(default=3, help_text="1-5 scale")
    
    # Emotion state after playing (optional - user can skip)
    emotion_after = models.CharField(max_length=20, blank=True, null=True)
    emotion_intensity_after = models.IntegerField(blank=True, null=True)
    
    # Session details
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(blank=True, null=True)
    duration_minutes = models.IntegerField(blank=True, null=True)
    
    # User feedback
    was_helpful = models.BooleanField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-started_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.game.name} ({self.started_at.date()})"


class EmotionGameRecommendation(models.Model):
    """Store AI-generated game recommendations based on chat/journal analysis"""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='game_recommendations'
    )
    
    detected_emotion = models.CharField(max_length=20)
    detected_intensity = models.IntegerField(default=3)
    recommended_game = models.ForeignKey(
        TherapeuticGame,
        on_delete=models.CASCADE,
        related_name='recommendations'
    )
    
    # Context of recommendation
    source = models.CharField(max_length=20, choices=[
        ('chat', 'From Chat'),
        ('journal', 'From Journal'),
        ('mood', 'From Mood Log'),
        ('manual', 'User Selected'),
    ])
    source_text = models.TextField(blank=True, null=True)  # The text that triggered this
    
    was_accepted = models.BooleanField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
