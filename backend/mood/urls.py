from django.urls import path
from .views import (
    MoodEntryListCreateView, MoodEntryDetailView, 
    TodayMoodView, MoodStatsView, MoodInsightListView
)

urlpatterns = [
    path('entries/', MoodEntryListCreateView.as_view(), name='mood_entries'),
    path('entries/<int:pk>/', MoodEntryDetailView.as_view(), name='mood_entry_detail'),
    path('today/', TodayMoodView.as_view(), name='today_mood'),
    path('stats/', MoodStatsView.as_view(), name='mood_stats'),
    path('insights/', MoodInsightListView.as_view(), name='mood_insights'),
]
