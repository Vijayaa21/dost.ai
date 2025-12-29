from rest_framework import serializers
from .models import JournalEntry, JournalPrompt


class JournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = [
            'id', 'title', 'content', 'tags', 'mood_at_writing',
            'ai_reflection_enabled', 'ai_reflection', 'ai_emotion_analysis',
            'is_private', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'ai_reflection', 'ai_emotion_analysis', 'created_at', 'updated_at']


class JournalEntryListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing entries."""
    preview = serializers.SerializerMethodField()
    
    class Meta:
        model = JournalEntry
        fields = ['id', 'title', 'preview', 'tags', 'mood_at_writing', 'created_at']
    
    def get_preview(self, obj):
        return obj.content[:150] + "..." if len(obj.content) > 150 else obj.content


class JournalPromptSerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalPrompt
        fields = ['id', 'prompt_text', 'category']
