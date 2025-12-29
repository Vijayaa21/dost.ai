from django.db import models
from django.conf import settings


class Conversation(models.Model):
    """A conversation session between user and Dost AI."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='conversations'
    )
    title = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Conversation {self.id} - {self.user.email}"
    
    def get_recent_messages(self, limit=10):
        """Get recent messages for context."""
        return self.messages.order_by('-created_at')[:limit][::-1]


class Message(models.Model):
    """A single message in a conversation."""
    
    ROLE_CHOICES = [
        ('user', 'User'),
        ('assistant', 'Assistant'),
        ('system', 'System'),
    ]
    
    EMOTION_CHOICES = [
        ('happy', 'Happy'),
        ('sad', 'Sad'),
        ('anxious', 'Anxious'),
        ('angry', 'Angry'),
        ('calm', 'Calm'),
        ('stressed', 'Stressed'),
        ('confused', 'Confused'),
        ('hopeful', 'Hopeful'),
        ('neutral', 'Neutral'),
    ]
    
    conversation = models.ForeignKey(
        Conversation, 
        on_delete=models.CASCADE, 
        related_name='messages'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    detected_emotion = models.CharField(
        max_length=20, 
        choices=EMOTION_CHOICES, 
        blank=True, 
        null=True
    )
    is_crisis = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."


class CrisisLog(models.Model):
    """Log of detected crisis situations for safety monitoring."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='crisis_logs'
    )
    message = models.ForeignKey(Message, on_delete=models.CASCADE)
    trigger_phrase = models.TextField()
    response_given = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Crisis log for {self.user.email} at {self.created_at}"
