import uuid
from django.db import models
from django.conf import settings


def default_game_state():
    return {'board': list(' ' * 9), 'turn': 'X', 'winner': None}


class MultiplayerGameSession(models.Model):
    """Model for a real-time multiplayer game session (e.g., a game room)."""
    
    GAME_TYPE_CHOICES = [
        ('tic-tac-toe', 'Tic Tac Toe'),
        # Add other game types here in the future
    ]
    
    STATUS_CHOICES = [
        ('waiting', 'Waiting for players'),
        ('in-progress', 'In Progress'),
        ('finished', 'Finished'),
        ('abandoned', 'Abandoned'),
    ]

    room_code = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    game_type = models.CharField(max_length=50, choices=GAME_TYPE_CHOICES, default='tic-tac-toe')
    host = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='hosted_games'
    )
    players = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='game_sessions_played',
        through='Player'
    )
    max_players = models.PositiveIntegerField(default=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting')
    
    # Store game-specific state as JSON. E.g., for Tic Tac Toe: board, current turn, winner.
    game_state = models.JSONField(default=default_game_state)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_game_type_display()} Room - {self.room_code}"

    def is_full(self):
        return self.players.count() >= self.max_players


class Player(models.Model):
    """Through model to connect users to a multiplayer game session."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    game_session = models.ForeignKey(MultiplayerGameSession, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    score = models.IntegerField(default=0)
    
    # Symbol for games like Tic Tac Toe ('X' or 'O')
    symbol = models.CharField(max_length=1, blank=True)

    class Meta:
        unique_together = ('user', 'game_session')

    def __str__(self):
        return f"{self.user.username} in {self.game_session.room_code}"


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
