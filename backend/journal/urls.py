from django.urls import path
from .views import (
    JournalEntryListCreateView, JournalEntryDetailView, 
    JournalPromptView, JournalStatsView
)

urlpatterns = [
    path('entries/', JournalEntryListCreateView.as_view(), name='journal_entries'),
    path('entries/<int:pk>/', JournalEntryDetailView.as_view(), name='journal_entry_detail'),
    path('prompt/', JournalPromptView.as_view(), name='journal_prompt'),
    path('stats/', JournalStatsView.as_view(), name='journal_stats'),
]
