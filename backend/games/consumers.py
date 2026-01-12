import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import MultiplayerGameSession, Player


class GameConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for real-time multiplayer games."""
    
    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        self.room_group_name = f'game_{self.room_code}'
        self.user = self.scope.get('user')
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
        
        # Send current game state to the newly connected client
        game_session = await self.get_game_session()
        if game_session:
            await self.send(text_data=json.dumps({
                'type': 'game_state',
                'game_state': game_session.game_state,
                'status': game_session.status,
                'players': await self.get_player_list(game_session),
            }))
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages."""
        data = json.loads(text_data)
        message_type = data.get('type')
        
        if message_type == 'join_game':
            await self.handle_join_game(data)
        elif message_type == 'make_move':
            await self.handle_make_move(data)
        elif message_type == 'get_state':
            await self.handle_get_state()
        elif message_type == 'chat_message':
            await self.handle_chat_message(data)
    
    async def handle_join_game(self, data):
        """Handle a player joining the game."""
        game_session = await self.get_game_session()
        if not game_session:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Game room not found.',
            }))
            return
        
        if game_session.status == 'finished':
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'This game has already finished.',
            }))
            return
        
        # Check if already a player
        is_player = await self.is_user_player(game_session)
        
        if not is_player:
            if await self.is_game_full(game_session):
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Game room is full.',
                }))
                return
            
            # Add as player
            await self.add_player(game_session)
        
        # Check if game should start
        game_session = await self.get_game_session()  # Refresh
        if await self.is_game_full(game_session) and game_session.status == 'waiting':
            await self.start_game(game_session)
            game_session = await self.get_game_session()  # Refresh again
        
        # Broadcast updated state to all players
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_update',
                'game_state': game_session.game_state,
                'status': game_session.status,
                'players': await self.get_player_list(game_session),
            }
        )
    
    async def handle_make_move(self, data):
        """Handle a player making a move."""
        game_session = await self.get_game_session()
        if not game_session:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Game room not found.',
            }))
            return
        
        if game_session.status != 'in-progress':
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Game is not in progress.',
            }))
            return
        
        # Verify user is a player
        is_player = await self.is_user_player(game_session)
        if not is_player:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'You are not a player in this game.',
            }))
            return
        
        # Update game state
        new_state = data.get('game_state', {})
        await self.update_game_state(game_session, new_state)
        
        # Refresh and broadcast
        game_session = await self.get_game_session()
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_update',
                'game_state': game_session.game_state,
                'status': game_session.status,
                'players': await self.get_player_list(game_session),
            }
        )
    
    async def handle_get_state(self):
        """Send current game state to the requesting client."""
        game_session = await self.get_game_session()
        if game_session:
            await self.send(text_data=json.dumps({
                'type': 'game_state',
                'game_state': game_session.game_state,
                'status': game_session.status,
                'players': await self.get_player_list(game_session),
            }))
    
    async def handle_chat_message(self, data):
        """Handle chat messages during the game."""
        message = data.get('message', '')
        username = self.user.username if self.user and self.user.is_authenticated else 'Anonymous'
        
        # Broadcast to all players in the game
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'username': username,
            }
        )
    
    # Handler for group_send messages
    async def game_update(self, event):
        """Send game update to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'game_update',
            'game_state': event['game_state'],
            'status': event['status'],
            'players': event['players'],
        }))
    
    async def chat_message(self, event):
        """Send chat message to WebSocket."""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'username': event['username'],
        }))
    
    # Database helper methods
    @database_sync_to_async
    def get_game_session(self):
        try:
            return MultiplayerGameSession.objects.get(room_code=self.room_code)
        except MultiplayerGameSession.DoesNotExist:
            return None
    
    @database_sync_to_async
    def get_player_list(self, game_session):
        players = []
        for player in game_session.player_set.all().select_related('user'):
            players.append({
                'id': player.id,
                'user_id': player.user.id,
                'username': player.user.username,
                'symbol': player.symbol,
                'score': player.score,
            })
        return players
    
    @database_sync_to_async
    def is_user_player(self, game_session):
        if not self.user or not self.user.is_authenticated:
            return False
        return game_session.players.filter(id=self.user.id).exists()
    
    @database_sync_to_async
    def is_game_full(self, game_session):
        return game_session.is_full()
    
    @database_sync_to_async
    def add_player(self, game_session):
        if not self.user or not self.user.is_authenticated:
            return
        player_count = game_session.players.count()
        symbol = 'X' if player_count == 0 else 'O'
        Player.objects.create(
            user=self.user,
            game_session=game_session,
            symbol=symbol
        )
    
    @database_sync_to_async
    def start_game(self, game_session):
        game_session.status = 'in-progress'
        game_session.save()
    
    @database_sync_to_async
    def update_game_state(self, game_session, new_state):
        game_session.game_state = new_state
        if new_state.get('winner'):
            game_session.status = 'finished'
        game_session.save()
