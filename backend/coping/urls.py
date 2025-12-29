from django.urls import path
from .views import (
    CopingToolListView, CopingToolDetailView, CopingToolUsageView,
    RecommendedToolView, AffirmationView, CopingStatsView
)

urlpatterns = [
    path('tools/', CopingToolListView.as_view(), name='coping_tools'),
    path('tools/<int:pk>/', CopingToolDetailView.as_view(), name='coping_tool_detail'),
    path('usage/', CopingToolUsageView.as_view(), name='coping_usage'),
    path('recommend/', RecommendedToolView.as_view(), name='recommended_tool'),
    path('affirmation/', AffirmationView.as_view(), name='affirmation'),
    path('stats/', CopingStatsView.as_view(), name='coping_stats'),
]
