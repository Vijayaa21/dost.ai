from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Conversation, Message, CrisisLog
from .serializers import (
    ConversationSerializer, ConversationListSerializer, 
    MessageSerializer, ChatInputSerializer
)
from .ai_service import get_chat_response


class ConversationListView(generics.ListCreateAPIView):
    """List all conversations or create a new one."""
    serializer_class = ConversationListSerializer
    
    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ConversationDetailView(generics.RetrieveDestroyAPIView):
    """Get or delete a specific conversation."""
    serializer_class = ConversationSerializer
    
    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user)


class ChatView(APIView):
    """Send a message and get AI response."""
    
    def post(self, request):
        serializer = ChatInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user_message = serializer.validated_data['message']
        conversation_id = serializer.validated_data.get('conversation_id')
        
        # Get or create conversation
        if conversation_id:
            try:
                conversation = Conversation.objects.get(id=conversation_id, user=request.user)
            except Conversation.DoesNotExist:
                return Response(
                    {"error": "Conversation not found"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Create new conversation with title from first message
            title = user_message[:50] + "..." if len(user_message) > 50 else user_message
            conversation = Conversation.objects.create(user=request.user, title=title)
        
        # Get conversation history for context
        recent_messages = conversation.get_recent_messages(limit=10)
        history = [{'role': msg.role, 'content': msg.content} for msg in recent_messages]
        
        # Get AI response
        user_tone = request.user.preferred_tone
        result = get_chat_response(user_message, history, user_tone)
        
        # Save user message
        user_msg = Message.objects.create(
            conversation=conversation,
            role='user',
            content=user_message,
            detected_emotion=result['detected_emotion'],
            is_crisis=result['is_crisis']
        )
        
        # Save assistant response
        assistant_msg = Message.objects.create(
            conversation=conversation,
            role='assistant',
            content=result['response'],
            is_crisis=result['is_crisis']
        )
        
        # Log crisis if detected
        if result['is_crisis']:
            CrisisLog.objects.create(
                user=request.user,
                message=user_msg,
                trigger_phrase=user_message,
                response_given=result['response']
            )
        
        # Update conversation
        conversation.save()  # Updates updated_at
        
        return Response({
            'conversation_id': conversation.id,
            'user_message': MessageSerializer(user_msg).data,
            'assistant_message': MessageSerializer(assistant_msg).data
        })


class DeleteChatHistoryView(APIView):
    """Delete all chat history for the user."""
    
    def delete(self, request):
        Conversation.objects.filter(user=request.user).delete()
        return Response({"message": "Chat history deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
