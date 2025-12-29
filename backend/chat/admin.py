from django.contrib import admin
from .models import Conversation, Message, CrisisLog


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'title', 'is_active', 'created_at', 'updated_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['user__email', 'title']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'role', 'detected_emotion', 'is_crisis', 'created_at']
    list_filter = ['role', 'detected_emotion', 'is_crisis', 'created_at']
    search_fields = ['content']


@admin.register(CrisisLog)
class CrisisLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__email', 'trigger_phrase']
