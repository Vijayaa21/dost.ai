from django.db import models
from django.conf import settings


class MoodEntry(models.Model):
    """Daily mood check-in entry."""
    
    MOOD_CHOICES = [
        (1, '😢 Very Low'),
        (2, '😔 Low'),
        (3, '😐 Neutral'),
        (4, '🙂 Good'),
        (5, '😊 Great'),
    ]
    
    EMOTION_TAGS = [
        ('happy', 'Happy'),
        ('sad', 'Sad'),
        ('anxious', 'Anxious'),
        ('angry', 'Angry'),
        ('calm', 'Calm'),
        ('stressed', 'Stressed'),
        ('excited', 'Excited'),
        ('tired', 'Tired'),
        ('hopeful', 'Hopeful'),
        ('confused', 'Confused'),
        ('grateful', 'Grateful'),
        ('lonely', 'Lonely'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='mood_entries'
    )
    mood_score = models.IntegerField(choices=MOOD_CHOICES)
    emotions = models.JSONField(default=list)  # List of emotion tags
    note = models.TextField(blank=True)
    activities = models.JSONField(default=list)  # What user was doing
    sleep_quality = models.IntegerField(null=True, blank=True)  # 1-5
    energy_level = models.IntegerField(null=True, blank=True)  # 1-5
    created_at = models.DateTimeField(auto_now_add=True)
    date = models.DateField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Mood Entries'
        unique_together = ['user', 'date']  # One entry per day
    
    def __str__(self):
        return f"{self.user.email} - {self.date} - Score: {self.mood_score}"


class MoodInsight(models.Model):
    """AI-generated weekly/monthly mood insights."""
    
    PERIOD_CHOICES = [
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='mood_insights'
    )
    period_type = models.CharField(max_length=20, choices=PERIOD_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    average_mood = models.FloatField()
    dominant_emotions = models.JSONField(default=list)
    patterns = models.TextField()  # AI-generated pattern analysis
    suggestions = models.TextField()  # AI-generated suggestions
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.period_type} insight - {self.start_date}"
