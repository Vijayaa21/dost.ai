from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta


class PetType(models.Model):
    """Different pet types users can choose from"""
    name = models.CharField(max_length=50)  # e.g., "Luna the Cat", "Groot the Plant"
    species = models.CharField(max_length=30)  # cat, dog, plant, bunny
    description = models.TextField()
    base_image = models.CharField(max_length=100)  # SVG/image identifier
    
    # Personality traits affect responses
    personality = models.CharField(max_length=50, default='friendly')  # friendly, calm, playful
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.name} ({self.species})"
    
    class Meta:
        ordering = ['name']


class WellnessPet(models.Model):
    """User's virtual wellness companion"""
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='wellness_pet'
    )
    pet_type = models.ForeignKey(
        PetType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    name = models.CharField(max_length=50, default='Buddy')
    
    # Pet stats (0-100)
    happiness = models.IntegerField(default=70)
    energy = models.IntegerField(default=70)
    health = models.IntegerField(default=100)
    
    # Growth system
    level = models.IntegerField(default=1)
    experience = models.IntegerField(default=0)
    total_xp = models.IntegerField(default=0)
    
    # Streak tracking
    current_streak = models.IntegerField(default=0)
    longest_streak = models.IntegerField(default=0)
    last_interaction = models.DateField(null=True, blank=True)
    
    # Customization unlocks (JSON list of unlocked items)
    unlocked_accessories = models.JSONField(default=list)
    equipped_accessory = models.CharField(max_length=50, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} (Level {self.level}) - {self.user.username}"
    
    @property
    def mood(self):
        """Calculate pet's current mood based on stats"""
        avg = (self.happiness + self.energy + self.health) / 3
        if avg >= 80:
            return 'ecstatic'
        elif avg >= 60:
            return 'happy'
        elif avg >= 40:
            return 'neutral'
        elif avg >= 20:
            return 'sad'
        else:
            return 'very_sad'
    
    @property
    def xp_for_next_level(self):
        """XP needed for next level (increases each level)"""
        return 100 + (self.level * 50)
    
    @property
    def level_progress(self):
        """Progress to next level as percentage"""
        return min(100, int((self.experience / self.xp_for_next_level) * 100))
    
    def add_experience(self, amount, activity_type='general'):
        """Add XP and handle level ups"""
        self.experience += amount
        self.total_xp += amount
        
        leveled_up = False
        while self.experience >= self.xp_for_next_level:
            self.experience -= self.xp_for_next_level
            self.level += 1
            leveled_up = True
            
            # Boost stats on level up
            self.happiness = min(100, self.happiness + 10)
            self.energy = min(100, self.energy + 10)
            
            # Unlock accessories at certain levels
            self._check_accessory_unlocks()
        
        self.save()
        return leveled_up
    
    def _check_accessory_unlocks(self):
        """Unlock accessories based on level"""
        level_unlocks = {
            2: 'bow',
            3: 'hat',
            5: 'glasses',
            7: 'scarf',
            10: 'crown',
            15: 'wings',
        }
        for lvl, accessory in level_unlocks.items():
            if self.level >= lvl and accessory not in self.unlocked_accessories:
                self.unlocked_accessories.append(accessory)
    
    def update_streak(self):
        """Update interaction streak"""
        today = timezone.now().date()
        
        if self.last_interaction is None:
            self.current_streak = 1
        elif self.last_interaction == today:
            pass  # Already interacted today
        elif self.last_interaction == today - timedelta(days=1):
            self.current_streak += 1
        else:
            # Streak broken
            self.current_streak = 1
        
        self.last_interaction = today
        self.longest_streak = max(self.longest_streak, self.current_streak)
        self.save()
    
    def decay_stats(self):
        """Called daily to decrease stats if no interaction"""
        today = timezone.now().date()
        if self.last_interaction and self.last_interaction < today:
            days_inactive = (today - self.last_interaction).days
            decay = min(30, days_inactive * 5)
            
            self.happiness = max(10, self.happiness - decay)
            self.energy = max(10, self.energy - decay)
            self.save()
    
    def feed(self, boost_type='happiness'):
        """Boost a stat"""
        if boost_type == 'happiness':
            self.happiness = min(100, self.happiness + 15)
        elif boost_type == 'energy':
            self.energy = min(100, self.energy + 15)
        self.save()


class PetActivity(models.Model):
    """Log of activities that affect the pet"""
    ACTIVITY_TYPES = [
        ('mood_log', 'Mood Check-in'),
        ('journal', 'Journal Entry'),
        ('chat', 'Chat Session'),
        ('breathing', 'Breathing Exercise'),
        ('coping', 'Coping Exercise'),
        ('login', 'Daily Login'),
        ('streak_bonus', 'Streak Bonus'),
    ]
    
    pet = models.ForeignKey(
        WellnessPet,
        on_delete=models.CASCADE,
        related_name='activities'
    )
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    xp_earned = models.IntegerField(default=0)
    happiness_change = models.IntegerField(default=0)
    energy_change = models.IntegerField(default=0)
    description = models.CharField(max_length=200, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.activity_type} - {self.xp_earned} XP"
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Pet Activities'


# XP rewards for different activities
XP_REWARDS = {
    'mood_log': 15,
    'journal': 25,
    'chat': 10,
    'breathing': 20,
    'coping': 20,
    'login': 5,
    'streak_bonus': 10,  # Per day of streak
}

# Happiness boosts for activities
HAPPINESS_BOOSTS = {
    'mood_log': 5,
    'journal': 8,
    'chat': 7,
    'breathing': 10,
    'coping': 10,
    'login': 3,
}
