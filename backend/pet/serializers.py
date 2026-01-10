from rest_framework import serializers
from .models import PetType, WellnessPet, PetActivity


class PetTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PetType
        fields = ['id', 'name', 'species', 'description', 'base_image', 'personality']


class PetActivitySerializer(serializers.ModelSerializer):
    activity_display = serializers.CharField(source='get_activity_type_display', read_only=True)
    
    class Meta:
        model = PetActivity
        fields = [
            'id', 'activity_type', 'activity_display', 'xp_earned',
            'happiness_change', 'energy_change', 'description', 'created_at'
        ]


class WellnessPetSerializer(serializers.ModelSerializer):
    pet_type = PetTypeSerializer(read_only=True)
    pet_type_id = serializers.PrimaryKeyRelatedField(
        queryset=PetType.objects.all(),
        source='pet_type',
        write_only=True,
        required=False
    )
    mood = serializers.CharField(read_only=True)
    xp_for_next_level = serializers.IntegerField(read_only=True)
    level_progress = serializers.IntegerField(read_only=True)
    recent_activities = serializers.SerializerMethodField()
    
    class Meta:
        model = WellnessPet
        fields = [
            'id', 'name', 'pet_type', 'pet_type_id',
            'happiness', 'energy', 'health', 'mood',
            'level', 'experience', 'total_xp',
            'xp_for_next_level', 'level_progress',
            'current_streak', 'longest_streak', 'last_interaction',
            'unlocked_accessories', 'equipped_accessory',
            'recent_activities', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'happiness', 'energy', 'health', 'level', 'experience',
            'total_xp', 'current_streak', 'longest_streak', 'last_interaction',
            'unlocked_accessories', 'created_at', 'updated_at'
        ]
    
    def get_recent_activities(self, obj):
        activities = obj.activities.all()[:5]
        return PetActivitySerializer(activities, many=True).data


class PetInteractionSerializer(serializers.Serializer):
    """For logging pet interactions"""
    activity_type = serializers.ChoiceField(choices=PetActivity.ACTIVITY_TYPES)
    description = serializers.CharField(required=False, allow_blank=True)


class PetFeedSerializer(serializers.Serializer):
    """For feeding/boosting pet stats"""
    boost_type = serializers.ChoiceField(choices=['happiness', 'energy'])
