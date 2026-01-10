from django.contrib import admin
from .models import TherapeuticGame, GameSession, EmotionGameRecommendation


@admin.register(TherapeuticGame)
class TherapeuticGameAdmin(admin.ModelAdmin):
    list_display = ['name', 'emotion_category', 'game_type', 'intensity_level', 'is_active']
    list_filter = ['emotion_category', 'game_type', 'is_active', 'is_browser_playable']
    search_fields = ['name', 'description']


@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ['user', 'game', 'emotion_before', 'emotion_after', 'was_helpful', 'started_at']
    list_filter = ['emotion_before', 'was_helpful', 'started_at']
    search_fields = ['user__username', 'game__name']


@admin.register(EmotionGameRecommendation)
class EmotionGameRecommendationAdmin(admin.ModelAdmin):
    list_display = ['user', 'detected_emotion', 'recommended_game', 'source', 'was_accepted']
    list_filter = ['detected_emotion', 'source', 'was_accepted']
