from django.db import models
from django.conf import settings


class JournalEntry(models.Model):
    """User journal entry with AI reflection support."""
    
    TAG_CHOICES = [
        ('anxiety', 'Anxiety'),
        ('stress', 'Stress'),
        ('calm', 'Calm'),
        ('gratitude', 'Gratitude'),
        ('achievement', 'Achievement'),
        ('relationship', 'Relationship'),
        ('work', 'Work'),
        ('health', 'Health'),
        ('growth', 'Personal Growth'),
        ('reflection', 'Reflection'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='journal_entries'
    )
    title = models.CharField(max_length=255, blank=True)
    content = models.TextField()
    tags = models.JSONField(default=list)
    mood_at_writing = models.IntegerField(null=True, blank=True)  # 1-5 scale
    
    # AI Reflection
    ai_reflection_enabled = models.BooleanField(default=True)
    ai_reflection = models.TextField(blank=True)
    ai_emotion_analysis = models.JSONField(default=dict)  # Detected emotions
    
    # Privacy
    is_private = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Journal Entries'
    
    def __str__(self):
        return f"{self.user.email} - {self.title or 'Untitled'} - {self.created_at.date()}"


class JournalPrompt(models.Model):
    """Pre-defined journal prompts to help users reflect."""
    
    CATEGORY_CHOICES = [
        ('gratitude', 'Gratitude'),
        ('reflection', 'Self-Reflection'),
        ('goals', 'Goals & Dreams'),
        ('emotions', 'Emotional Exploration'),
        ('relationships', 'Relationships'),
        ('growth', 'Personal Growth'),
    ]
    
    prompt_text = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.category}: {self.prompt_text[:50]}..."
