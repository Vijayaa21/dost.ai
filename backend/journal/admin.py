from django.contrib import admin
from .models import JournalEntry, JournalPrompt


@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'mood_at_writing', 'created_at']
    list_filter = ['created_at', 'mood_at_writing']
    search_fields = ['user__email', 'title', 'content']


@admin.register(JournalPrompt)
class JournalPromptAdmin(admin.ModelAdmin):
    list_display = ['prompt_text', 'category', 'is_active']
    list_filter = ['category', 'is_active']
