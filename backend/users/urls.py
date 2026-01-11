from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, ProfileView, ChangePasswordView, OnboardingView, DeleteAccountView,
    FriendsListView, InviteLinkView
)
from .serializers import CustomTokenObtainPairSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token view that uses email instead of username."""
    serializer_class = CustomTokenObtainPairSerializer


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('onboarding/', OnboardingView.as_view(), name='onboarding'),
    path('delete-account/', DeleteAccountView.as_view(), name='delete_account'),
    
    # Friends and Invites
    path('friends/', FriendsListView.as_view(), name='friends_list'),
    path('invite-link/', InviteLinkView.as_view(), name='invite_link'),
]
