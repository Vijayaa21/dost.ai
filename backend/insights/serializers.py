from rest_framework import serializers
from .models import TriggerPattern, InsightNotification, MoodAnalysis


class TriggerPatternSerializer(serializers.ModelSerializer):
    trigger_type_display = serializers.CharField(source='get_trigger_type_display', read_only=True)
    emotion_type_display = serializers.CharField(source='get_emotion_type_display', read_only=True)
    
    class Meta:
        model = TriggerPattern
        fields = [
            'id', 'trigger_type', 'trigger_type_display',
            'emotion_type', 'emotion_type_display',
            'pattern_name', 'description',
            'time_of_day', 'day_of_week', 'keywords',
            'confidence_score', 'occurrence_count',
            'suggested_coping', 'custom_advice',
            'is_active', 'is_dismissed', 'last_triggered',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'occurrence_count', 'confidence_score']


class InsightNotificationSerializer(serializers.ModelSerializer):
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    trigger_pattern = TriggerPatternSerializer(read_only=True)
    
    class Meta:
        model = InsightNotification
        fields = [
            'id', 'notification_type', 'notification_type_display',
            'trigger_pattern', 'title', 'message',
            'action_type', 'action_data',
            'is_read', 'is_dismissed', 'is_helpful',
            'scheduled_for', 'sent_at', 'created_at'
        ]


class MoodAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = MoodAnalysis
        fields = [
            'id', 'period_type', 'start_date', 'end_date',
            'average_mood', 'mood_variance', 'dominant_emotion',
            'trend_direction', 'trend_percentage',
            'summary', 'highlights', 'recommendations',
            'detected_triggers', 'created_at'
        ]
