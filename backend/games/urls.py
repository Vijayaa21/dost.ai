from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TherapeuticGameViewSet, GameSessionViewSet,
    CreateGameRoomView, JoinGameRoomView, GameRoomDetailView, MakeMoveView
)

router = DefaultRouter()
router.register(r'games', TherapeuticGameViewSet, basename='therapeutic-games')
router.register(r'sessions', GameSessionViewSet, basename='game-sessions')

urlpatterns = [
    path('', include(router.urls)),
    
    # Multiplayer game endpoints
    path('multiplayer/create/', CreateGameRoomView.as_view(), name='create-game-room'),
    path('multiplayer/<uuid:room_code>/join/', JoinGameRoomView.as_view(), name='join-game-room'),
    path('multiplayer/<uuid:room_code>/', GameRoomDetailView.as_view(), name='game-room-detail'),
    path('multiplayer/<uuid:room_code>/move/', MakeMoveView.as_view(), name='make-move'),
]
