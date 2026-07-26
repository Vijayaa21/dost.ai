"""
WebSocket consumer for real-time chat with Dost AI.

Uses the async AI service so outbound LLM HTTP calls never block the
ASGI event loop. All ORM access is wrapped with @database_sync_to_async.
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Conversation, Message, CrisisLog
from .ai_service import get_chat_response_async


class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time chat."""

    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'
        self.user = self.scope.get('user')

        # Reject unauthenticated connections
        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001)
            return

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

        # Get conversation and verify ownership
        conversation = await self.get_conversation()
        if not conversation:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Conversation not found'
            }))
            return

        # Get conversation history
        history = await self.get_conversation_history(conversation)

        # Send typing indicator to the client
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'is_typing': True
        }))

        # Get user's preferred tone
        user_tone = await self.get_user_tone()

        # ----- THIS IS THE KEY FIX -----
        # Previously this was a blocking synchronous call that froze the
        # entire ASGI event loop while waiting for the LLM to respond.
        # Now it awaits the async version.
        result = await get_chat_response_async(message, history, user_tone)

        # Save messages to the database
        user_msg = await self.save_message(
            conversation, 'user', message,
            result['detected_emotion'], result['is_crisis']
        )
        assistant_msg = await self.save_message(
            conversation, 'assistant', result['response'],
            None, result['is_crisis']
        )

        # Log crisis if detected
        if result['is_crisis']:
            await self.save_crisis_log(
                user_msg, message, result['response']
            )

        # Update conversation timestamp
        await self.touch_conversation(conversation)

        # Build response payload
        response_data = {
            'type': 'message',
            'user_message': {
                'id': user_msg.id,
                'role': 'user',
                'content': message,
                'detected_emotion': result['detected_emotion'],
                'is_crisis': result['is_crisis'],
                'created_at': user_msg.created_at.isoformat(),
            },
            'assistant_message': {
                'id': assistant_msg.id,
                'role': 'assistant',
                'content': result['response'],
                'is_crisis': result['is_crisis'],
                'created_at': assistant_msg.created_at.isoformat(),
            }
        }

        # Include coping suggestion if available
        if result.get('coping_suggestion'):
            response_data['coping_suggestion'] = result['coping_suggestion']

        # Send response (also clears the typing indicator on the client)
        await self.send(text_data=json.dumps(response_data))

    # ------------------------------------------------------------------
    # Database helper methods — all wrapped with @database_sync_to_async
    # ------------------------------------------------------------------

    @database_sync_to_async
    def get_conversation(self):
        try:
            return Conversation.objects.select_related('user').get(
                id=self.conversation_id,
                user=self.user
            )
        except Conversation.DoesNotExist:
            return None

    @database_sync_to_async
    def get_conversation_history(self, conversation):
        messages = conversation.get_recent_messages(limit=10)
        return [{'role': msg.role, 'content': msg.content} for msg in messages]

    @database_sync_to_async
    def get_user_tone(self):
        return self.user.preferred_tone

    @database_sync_to_async
    def save_message(self, conversation, role, content, emotion, is_crisis):
        return Message.objects.create(
            conversation=conversation,
            role=role,
            content=content,
            detected_emotion=emotion,
            is_crisis=is_crisis
        )

    @database_sync_to_async
    def save_crisis_log(self, user_msg, trigger_phrase, response_given):
        return CrisisLog.objects.create(
            user=self.user,
            message=user_msg,
            trigger_phrase=trigger_phrase,
            response_given=response_given
        )

    @database_sync_to_async
    def touch_conversation(self, conversation):
        conversation.save()  # Updates updated_at
