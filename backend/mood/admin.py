from django.contrib import admin
from .models import MoodEntry, MoodInsight


@admin.register(MoodEntry)
class MoodEntryAdmin(admin.ModelAdmin):
    list_display = ['user', 'mood_score', 'date', 'created_at']
    list_filter = ['mood_score', 'date']
    search_fields = ['user__email']


@admin.register(MoodInsight)
class MoodInsightAdmin(admin.ModelAdmin):
    list_display = ['user', 'period_type', 'start_date', 'end_date', 'average_mood']
    list_filter = ['period_type']
    search_fields = ['user__email']
