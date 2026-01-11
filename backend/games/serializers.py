from rest_framework import serializers
from .models import TherapeuticGame, GameSession, EmotionGameRecommendation, MultiplayerGameSession, Player
from django.contrib.auth import get_user_model

User = get_user_model()


class PlayerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Player
        fields = ['id', 'username', 'symbol', 'score', 'joined_at']


class MultiplayerGameSessionSerializer(serializers.ModelSerializer):
    host_username = serializers.CharField(source='host.username', read_only=True)
    player_list = PlayerSerializer(source='player_set', many=True, read_only=True)
    player_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MultiplayerGameSession
        fields = [
            'id', 'room_code', 'game_type', 'host', 'host_username',
            'player_list', 'player_count', 'max_players', 'status', 'game_state',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'room_code', 'host', 'status', 'game_state', 'created_at', 'updated_at']

    def get_player_count(self, obj):
        return obj.players.count()


class TherapeuticGameSerializer(serializers.ModelSerializer):
    emotion_display = serializers.CharField(source='get_emotion_category_display', read_only=True)
    game_type_display = serializers.CharField(source='get_game_type_display', read_only=True)
    
    class Meta:
        model = TherapeuticGame
        fields = [
            'id', 'name', 'description', 'emotion_category', 'emotion_display',
            'game_type', 'game_type_display', 'emoji', 'thumbnail_url', 'game_url',
            'is_browser_playable', 'therapeutic_benefit', 'intensity_level',
            'avg_duration_minutes'
        ]


class GameSessionSerializer(serializers.ModelSerializer):
    game = TherapeuticGameSerializer(read_only=True)
    game_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = GameSession
        fields = [
            'id', 'game', 'game_id', 'emotion_before', 'emotion_intensity_before',
            'emotion_after', 'emotion_intensity_after', 'started_at', 'ended_at',
            'duration_minutes', 'was_helpful', 'notes'
        ]
        read_only_fields = ['started_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class GameSessionEndSerializer(serializers.Serializer):
    """Serializer for ending a game session"""
    emotion_after = serializers.CharField(required=False, allow_blank=True)
    emotion_intensity_after = serializers.IntegerField(required=False, min_value=1, max_value=5)
    was_helpful = serializers.BooleanField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True)


class EmotionGameRecommendationSerializer(serializers.ModelSerializer):
    game = TherapeuticGameSerializer(source='recommended_game', read_only=True)
    
    class Meta:
        model = EmotionGameRecommendation
        fields = [
            'id', 'detected_emotion', 'detected_intensity', 'game',
            'source', 'was_accepted', 'created_at'
        ]


class EmotionInputSerializer(serializers.Serializer):
    """Input for getting game recommendations"""
    emotion = serializers.CharField()
    intensity = serializers.IntegerField(min_value=1, max_value=5, default=3)
    context = serializers.CharField(required=False, allow_blank=True)
