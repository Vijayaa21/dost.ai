from django.urls import path
from .views import ConversationListView, ConversationDetailView, ChatView, DeleteChatHistoryView

urlpatterns = [
    path('conversations/', ConversationListView.as_view(), name='conversation_list'),
    path('conversations/<int:pk>/', ConversationDetailView.as_view(), name='conversation_detail'),
    path('send/', ChatView.as_view(), name='chat_send'),
    path('delete-history/', DeleteChatHistoryView.as_view(), name='delete_chat_history'),
]
