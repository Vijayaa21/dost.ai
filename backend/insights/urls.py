from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TriggerPatternViewSet, InsightNotificationViewSet,
    MoodAnalysisViewSet, ProactiveAlertView
)

router = DefaultRouter()
router.register(r'patterns', TriggerPatternViewSet, basename='trigger-patterns')
router.register(r'notifications', InsightNotificationViewSet, basename='notifications')
router.register(r'analysis', MoodAnalysisViewSet, basename='mood-analysis')

urlpatterns = [
    path('', include(router.urls)),
    path('proactive-alert/', ProactiveAlertView.as_view(), name='proactive-alert'),
]
