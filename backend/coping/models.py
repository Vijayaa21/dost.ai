from django.db import models
from django.conf import settings


class CopingTool(models.Model):
    """Mental wellness exercises and coping tools."""
    
    CATEGORY_CHOICES = [
        ('breathing', 'Breathing Exercises'),
        ('grounding', 'Grounding Techniques'),
        ('mindfulness', 'Mindfulness'),
        ('affirmation', 'Affirmations'),
        ('relaxation', 'Relaxation'),
        ('cognitive', 'Cognitive Techniques'),
    ]
    
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('advanced', 'Advanced'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='easy')
    duration_minutes = models.IntegerField(default=5)
    instructions = models.JSONField(default=list)  # Step-by-step instructions
    benefits = models.TextField(blank=True)
    when_to_use = models.TextField(blank=True)  # Situations when this tool helps
    icon = models.CharField(max_length=50, default='🧘')
    is_active = models.BooleanField(default=True)
    
    # For breathing exercises
    inhale_duration = models.IntegerField(null=True, blank=True)
    hold_duration = models.IntegerField(null=True, blank=True)
    exhale_duration = models.IntegerField(null=True, blank=True)
    cycles = models.IntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['category', 'title']
    
    def __str__(self):
        return f"{self.category}: {self.title}"


class CopingToolUsage(models.Model):
    """Track when users use coping tools."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='coping_usages'
    )
    tool = models.ForeignKey(
        CopingTool, 
        on_delete=models.CASCADE, 
        related_name='usages'
    )
    completed = models.BooleanField(default=False)
    mood_before = models.IntegerField(null=True, blank=True)  # 1-5
    mood_after = models.IntegerField(null=True, blank=True)  # 1-5
    feedback = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} used {self.tool.title}"


class Affirmation(models.Model):
    """Daily affirmations."""
    
    CATEGORY_CHOICES = [
        ('self_love', 'Self-Love'),
        ('confidence', 'Confidence'),
        ('calm', 'Calm & Peace'),
        ('strength', 'Strength'),
        ('gratitude', 'Gratitude'),
        ('growth', 'Growth'),
    ]
    
    text = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.text[:50]}..."
