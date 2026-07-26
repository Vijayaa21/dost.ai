"""
WebSocket consumer for real-time chat with Dost AI.

Uses the async AI service so outbound LLM HTTP calls never block the
ASGI event loop. All ORM access is wrapped with @database_sync_to_async.
"""
import json
import time
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.core.cache import cache
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
        typing_indicator_sent = False
        try:
            # Parse JSON with error handling
            try:
                data = json.loads(text_data)
            except json.JSONDecodeError:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Invalid JSON format'
                }))
                return

            message = data.get('message', '')

            if not message:
                return

            # Validate message length (10000 characters max)
            if len(message) > 10000:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Message too long (max 10000 characters)'
                }))
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
            typing_indicator_sent = True

            # Get user's preferred tone
            user_tone = await self.get_user_tone()

            # Rate limiting: 30 messages per minute per user (matching REST throttle)
            rate_limit_key = f'chat_ws_rate_{self.user.id}'
            rate_limit_window = 60  # seconds
            rate_limit_max = 30

            # Get current request timestamps from cache
            request_times = cache.get(rate_limit_key, [])
            now = time.time()

            # Remove timestamps outside the current window
            request_times = [t for t in request_times if now - t < rate_limit_window]

            # Check if rate limit exceeded
            if len(request_times) >= rate_limit_max:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Rate limit exceeded. Please wait a moment before sending another message.'
                }))
                return

            # Add current request timestamp
            request_times.append(now)
            cache.set(rate_limit_key, request_times, rate_limit_window)

            # Get AI response (async, non-blocking)
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

        except Exception as e:
            # Log the error and send user-visible error response
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error processing message: {e}", exc_info=True)

            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'An error occurred processing your message. Please try again.'
            }))

        finally:
            # Always clear typing indicator if it was sent
            if typing_indicator_sent:
                await self.send(text_data=json.dumps({
                    'type': 'typing',
                    'is_typing': False
                }))

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
