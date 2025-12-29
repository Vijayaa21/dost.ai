from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user model for Dost AI."""
    
    TONE_CHOICES = [
        ('calm', 'Calm'),
        ('friendly', 'Friendly'),
        ('minimal', 'Minimal'),
    ]
    
    email = models.EmailField(unique=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    preferred_tone = models.CharField(max_length=20, choices=TONE_CHOICES, default='friendly')
    is_anonymous = models.BooleanField(default=False)
    onboarding_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Privacy settings
    data_collection_consent = models.BooleanField(default=True)
    reminder_enabled = models.BooleanField(default=True)
    reminder_time = models.TimeField(null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return self.email


class UserProfile(models.Model):
    """Extended profile information for users."""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    age_range = models.CharField(max_length=20, blank=True)
    primary_concerns = models.JSONField(default=list, blank=True)
    coping_preferences = models.JSONField(default=list, blank=True)
    
    def __str__(self):
        return f"Profile of {self.user.email}"
