from rest_framework import serializers
from .models import CopingTool, CopingToolUsage, Affirmation


class CopingToolSerializer(serializers.ModelSerializer):
    class Meta:
        model = CopingTool
        fields = [
            'id', 'title', 'description', 'category', 'difficulty',
            'duration_minutes', 'instructions', 'benefits', 'when_to_use',
            'icon', 'inhale_duration', 'hold_duration', 'exhale_duration', 'cycles'
        ]


class CopingToolListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing tools."""
    class Meta:
        model = CopingTool
        fields = ['id', 'title', 'category', 'difficulty', 'duration_minutes', 'icon']


class CopingToolUsageSerializer(serializers.ModelSerializer):
    tool_title = serializers.CharField(source='tool.title', read_only=True)
    
    class Meta:
        model = CopingToolUsage
        fields = [
            'id', 'tool', 'tool_title', 'completed', 
            'mood_before', 'mood_after', 'feedback', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class AffirmationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Affirmation
        fields = ['id', 'text', 'category']
