from rest_framework import serializers
from .models import MoodEntry, MoodInsight


class MoodEntrySerializer(serializers.ModelSerializer):
    mood_label = serializers.SerializerMethodField()
    
    class Meta:
        model = MoodEntry
        fields = [
            'id', 'mood_score', 'mood_label', 'emotions', 'note', 
            'activities', 'sleep_quality', 'energy_level', 'created_at', 'date'
        ]
        read_only_fields = ['id', 'created_at', 'date']
    
    def get_mood_label(self, obj):
        labels = {1: '😢 Very Low', 2: '😔 Low', 3: '😐 Neutral', 4: '🙂 Good', 5: '😊 Great'}
        return labels.get(obj.mood_score, '')


class MoodInsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = MoodInsight
        fields = [
            'id', 'period_type', 'start_date', 'end_date', 
            'average_mood', 'dominant_emotions', 'patterns', 'suggestions', 'created_at'
        ]


class MoodStatsSerializer(serializers.Serializer):
    average_mood = serializers.FloatField()
    total_entries = serializers.IntegerField()
    mood_distribution = serializers.DictField()
    emotion_frequency = serializers.DictField()
    weekly_trend = serializers.ListField()
