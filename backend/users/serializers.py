from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom token serializer that uses email instead of username."""
    username_field = 'email'


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['bio', 'age_range', 'primary_concerns', 'coping_preferences']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    friends = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    invited_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'avatar', 'preferred_tone', 'is_anonymous', 'onboarding_completed',
            'data_collection_consent', 'reminder_enabled', 'reminder_time',
            'profile', 'created_at', 'invite_code', 'invited_by', 'friends'
        ]
        read_only_fields = ['id', 'email', 'created_at', 'invite_code', 'invited_by', 'friends']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    invite_code = serializers.UUIDField(required=False, write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'password_confirm', 'first_name', 'last_name', 'invite_code']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords don't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        invite_code = validated_data.pop('invite_code', None)
        
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)

        if invite_code:
            try:
                inviter = User.objects.get(invite_code=invite_code)
                user.invited_by = inviter
                user.save()
                
                # Add each other as friends
                inviter.friends.add(user)
                user.friends.add(inviter)

            except User.DoesNotExist:
                # Silently fail if invite code is invalid, or you could raise a validation error
                pass
                
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


class OnboardingSerializer(serializers.Serializer):
    preferred_tone = serializers.ChoiceField(choices=User.TONE_CHOICES)
    age_range = serializers.CharField(required=False, allow_blank=True)
    primary_concerns = serializers.ListField(child=serializers.CharField(), required=False)
    coping_preferences = serializers.ListField(child=serializers.CharField(), required=False)
