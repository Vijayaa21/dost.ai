from django.contrib import admin
from .models import CopingTool, CopingToolUsage, Affirmation


@admin.register(CopingTool)
class CopingToolAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'difficulty', 'duration_minutes', 'is_active']
    list_filter = ['category', 'difficulty', 'is_active']
    search_fields = ['title', 'description']


@admin.register(CopingToolUsage)
class CopingToolUsageAdmin(admin.ModelAdmin):
    list_display = ['user', 'tool', 'completed', 'mood_before', 'mood_after', 'created_at']
    list_filter = ['completed', 'created_at']


@admin.register(Affirmation)
class AffirmationAdmin(admin.ModelAdmin):
    list_display = ['text', 'category', 'is_active']
    list_filter = ['category', 'is_active']
