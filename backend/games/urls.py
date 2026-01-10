from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TherapeuticGameViewSet, GameSessionViewSet

router = DefaultRouter()
router.register(r'games', TherapeuticGameViewSet, basename='therapeutic-games')
router.register(r'sessions', GameSessionViewSet, basename='game-sessions')

urlpatterns = [
    path('', include(router.urls)),
]
