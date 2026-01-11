from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from .serializers import (
    UserSerializer, RegisterSerializer, ChangePasswordSerializer, OnboardingSerializer
)
from .models import UserProfile

User = get_user_model()


class FriendsListView(generics.ListAPIView):
    """List a user's friends."""
    serializer_class = UserSerializer

    def get_queryset(self):
        return self.request.user.friends.all()


class InviteLinkView(APIView):
    """Get the user's unique invite link."""
    
    def get(self, request):
        user = request.user
        return Response({"invite_code": user.invite_code})


class RegisterView(generics.CreateAPIView):
    """Register a new user."""
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "message": "User registered successfully.",
            "user": UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveUpdateAPIView):
    """Get or update user profile."""
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """Change user password."""
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({"message": "Password changed successfully."})


class OnboardingView(APIView):
    """Complete user onboarding."""
    
    def post(self, request):
        serializer = OnboardingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        user.preferred_tone = serializer.validated_data['preferred_tone']
        user.onboarding_completed = True
        user.save()
        
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.age_range = serializer.validated_data.get('age_range', '')
        profile.primary_concerns = serializer.validated_data.get('primary_concerns', [])
        profile.coping_preferences = serializer.validated_data.get('coping_preferences', [])
        profile.save()
        
        return Response({
            "message": "Onboarding completed successfully.",
            "user": UserSerializer(user).data
        })


class DeleteAccountView(APIView):
    """Delete user account and all associated data."""
    
    def delete(self, request):
        user = request.user
        user.delete()
        return Response({"message": "Account deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
