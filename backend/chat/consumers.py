import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Conversation, Message
from .ai_service import get_chat_response


class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time chat."""
    
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message', '')
        
        if not message:
            return
        
        # Get conversation and user
        conversation = await self.get_conversation()
        if not conversation:
            await self.send(text_data=json.dumps({
                'error': 'Conversation not found'
            }))
            return
        
        user = conversation.user
        
        # Get conversation history
        history = await self.get_conversation_history(conversation)
        
        # Send typing indicator
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'is_typing': True
        }))
        
        # Get AI response
        result = get_chat_response(message, history, user.preferred_tone)
        
        # Save messages
        user_msg = await self.save_message(
            conversation, 'user', message, 
            result['detected_emotion'], result['is_crisis']
        )
        assistant_msg = await self.save_message(
            conversation, 'assistant', result['response'], 
            None, result['is_crisis']
        )
        
        # Send response
        await self.send(text_data=json.dumps({
            'type': 'message',
            'user_message': {
                'id': user_msg.id,
                'role': 'user',
                'content': message,
                'detected_emotion': result['detected_emotion'],
                'is_crisis': result['is_crisis']
            },
            'assistant_message': {
                'id': assistant_msg.id,
                'role': 'assistant',
                'content': result['response'],
                'is_crisis': result['is_crisis']
            }
        }))
    
    @database_sync_to_async
    def get_conversation(self):
        try:
            return Conversation.objects.select_related('user').get(id=self.conversation_id)
        except Conversation.DoesNotExist:
            return None
    
    @database_sync_to_async
    def get_conversation_history(self, conversation):
        messages = conversation.get_recent_messages(limit=10)
        return [{'role': msg.role, 'content': msg.content} for msg in messages]
    
    @database_sync_to_async
    def save_message(self, conversation, role, content, emotion, is_crisis):
        return Message.objects.create(
            conversation=conversation,
            role=role,
            content=content,
            detected_emotion=emotion,
            is_crisis=is_crisis
        )
