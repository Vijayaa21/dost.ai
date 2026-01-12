from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Count, Avg, F
from django.shortcuts import get_object_or_404
from .models import TherapeuticGame, GameSession, EmotionGameRecommendation, MultiplayerGameSession, Player
from .serializers import (
    TherapeuticGameSerializer, GameSessionSerializer, 
    GameSessionEndSerializer, EmotionGameRecommendationSerializer,
    EmotionInputSerializer, MultiplayerGameSessionSerializer
)


class TherapeuticGameViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for browsing therapeutic games"""
    queryset = TherapeuticGame.objects.filter(is_active=True)
    serializer_class = TherapeuticGameSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by emotion category
        emotion = self.request.query_params.get('emotion')
        if emotion:
            queryset = queryset.filter(emotion_category=emotion)
        
        # Filter by game type
        game_type = self.request.query_params.get('type')
        if game_type:
            queryset = queryset.filter(game_type=game_type)
        
        # Filter by intensity
        intensity = self.request.query_params.get('intensity')
        if intensity:
            queryset = queryset.filter(intensity_level__lte=int(intensity))
        
        return queryset
    
    @action(detail=False, methods=['post'])
    def recommend(self, request):
        """Get game recommendations based on current emotion"""
        serializer = EmotionInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        emotion = serializer.validated_data['emotion']
        intensity = serializer.validated_data.get('intensity', 3)
        
        # Map common emotions to our categories
        emotion_mapping = {
            'angry': 'anger', 'frustrated': 'anger', 'irritated': 'anger', 'rage': 'anger',
            'want to hit': 'anger', 'want to punch': 'anger', 'furious': 'anger',
            'sad': 'sadness', 'depressed': 'sadness', 'grief': 'sadness', 'crying': 'sadness',
            'anxious': 'anxiety', 'stressed': 'anxiety', 'worried': 'anxiety', 'nervous': 'anxiety',
            'lonely': 'loneliness', 'isolated': 'loneliness', 'alone': 'loneliness',
            'bored': 'boredom', 'restless': 'boredom',
            'loving': 'love', 'affectionate': 'love', 'romantic': 'love', 'caring': 'love',
            'happy': 'joy', 'excited': 'joy', 'joyful': 'joy', 'elated': 'joy',
            'scared': 'fear', 'afraid': 'fear', 'terrified': 'fear',
        }
        
        # Normalize emotion
        normalized_emotion = emotion.lower().strip()
        category = emotion_mapping.get(normalized_emotion, normalized_emotion)
        
        # Get games matching the emotion category
        games = TherapeuticGame.objects.filter(
            is_active=True,
            emotion_category=category,
            intensity_level__lte=intensity + 1  # Allow slightly higher intensity
        ).order_by('?')[:5]  # Random selection
        
        # If no exact match, suggest based on intensity
        if not games.exists():
            if intensity >= 4:
                # High intensity - action games
                games = TherapeuticGame.objects.filter(
                    is_active=True,
                    game_type__in=['action', 'sports']
                ).order_by('?')[:5]
            else:
                # Lower intensity - calming games
                games = TherapeuticGame.objects.filter(
                    is_active=True,
                    game_type__in=['relaxing', 'puzzle']
                ).order_by('?')[:5]
        
        # Create recommendation records
        for game in games[:3]:  # Top 3
            EmotionGameRecommendation.objects.create(
                user=request.user,
                detected_emotion=category,
                detected_intensity=intensity,
                recommended_game=game,
                source='manual',
                source_text=serializer.validated_data.get('context', '')
            )
        
        return Response({
            'emotion': category,
            'intensity': intensity,
            'games': TherapeuticGameSerializer(games, many=True).data,
            'message': self._get_supportive_message(category, intensity)
        })
    
    def _get_supportive_message(self, emotion, intensity):
        """Get supportive message based on emotion"""
        messages = {
            'anger': "It's okay to feel angry. These games can help you release that energy safely. Take deep breaths between rounds! 💪",
            'sadness': "I'm sorry you're feeling down. These games might help lift your spirits or give you a gentle distraction. 💙",
            'anxiety': "When anxiety feels overwhelming, these calming games can help ground you. Remember to breathe. 🌿",
            'loneliness': "Feeling alone is hard. These games might help you feel connected or simply pass the time. You matter. 🤗",
            'boredom': "Looking for something to do? These games are fun ways to engage your mind! 🎯",
            'love': "What a beautiful feeling! Share these games with someone special or enjoy the warm feelings. 💕",
            'joy': "Wonderful that you're feeling good! These games can amplify that positive energy! 🎉",
            'fear': "It's brave to acknowledge fear. These games can help distract or empower you. You're stronger than you think. 🦁",
        }
        return messages.get(emotion, "Here are some games that might help you feel better! 🎮")
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get all emotion categories with game counts"""
        categories = []
        for code, name in TherapeuticGame.EMOTION_CATEGORIES:
            count = TherapeuticGame.objects.filter(
                is_active=True, 
                emotion_category=code
            ).count()
            categories.append({
                'code': code,
                'name': name,
                'count': count,
                'emoji': self._get_emotion_emoji(code)
            })
        return Response(categories)
    
    def _get_emotion_emoji(self, emotion):
        """Get emoji for emotion category"""
        emojis = {
            'anger': '😤',
            'sadness': '😢',
            'anxiety': '😰',
            'loneliness': '🥺',
            'boredom': '😑',
            'love': '🥰',
            'joy': '😄',
            'fear': '😨',
        }
        return emojis.get(emotion, '😐')


class GameSessionViewSet(viewsets.ModelViewSet):
    """Track game sessions"""
    serializer_class = GameSessionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return GameSession.objects.filter(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def end_session(self, request, pk=None):
        """End a game session with feedback"""
        session = self.get_object()
        serializer = GameSessionEndSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        session.ended_at = timezone.now()
        session.emotion_after = serializer.validated_data.get('emotion_after')
        session.emotion_intensity_after = serializer.validated_data.get('emotion_intensity_after')
        session.was_helpful = serializer.validated_data.get('was_helpful')
        session.notes = serializer.validated_data.get('notes')
        
        # Calculate duration
        if session.started_at:
            duration = (session.ended_at - session.started_at).total_seconds() / 60
            session.duration_minutes = int(duration)
        
        session.save()
        
        # Award pet XP if helpful
        if session.was_helpful:
            try:
                pet = request.user.wellness_pet
                pet.add_experience(15, 'game')  # 15 XP for helpful gaming session
            except:
                pass
        
        return Response(GameSessionSerializer(session).data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get user's gaming stats and emotion patterns"""
        sessions = self.get_queryset()
        
        # Emotion patterns from games
        emotion_counts = sessions.values('emotion_before').annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        # Helpfulness stats
        helpful_sessions = sessions.filter(was_helpful=True).count()
        total_feedback = sessions.exclude(was_helpful__isnull=True).count()
        
        # Most played games
        top_games = sessions.values(
            'game__name', 'game__emoji'
        ).annotate(count=Count('id')).order_by('-count')[:5]
        
        # Emotion improvement rate
        improved_sessions = sessions.filter(
            emotion_intensity_after__lt=F('emotion_intensity_before')
        ).count()
        sessions_with_after = sessions.exclude(emotion_intensity_after__isnull=True).count()
        
        return Response({
            'total_sessions': sessions.count(),
            'emotion_patterns': list(emotion_counts),
            'helpful_rate': helpful_sessions / total_feedback if total_feedback > 0 else 0,
            'top_games': list(top_games),
            'improvement_rate': improved_sessions / sessions_with_after if sessions_with_after > 0 else 0,
        })


# --- Multiplayer Game Views ---

class CreateGameRoomView(APIView):
    """Create a new multiplayer game room."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        game_type = request.data.get('game_type', 'tic-tac-toe')
        
        # Initialize game state based on game type
        initial_state = {}
        if game_type == 'tic-tac-toe':
            initial_state = {
                'board': [' '] * 9,
                'turn': 'X',
                'winner': None
            }
        elif game_type == 'connect-four':
            initial_state = {
                'board': [['empty'] * 7 for _ in range(6)],
                'currentTurn': 'red',
                'winner': None
            }
        elif game_type == 'rock-paper-scissors':
            initial_state = {
                'round': 1,
                'p1Choice': None,
                'p2Choice': None,
                'scores': {'player1': 0, 'player2': 0}
            }
        elif game_type == 'memory-match-mp':
            import random
            emojis = ['🎨', '🎭', '🎪', '🎬', '🎮', '🎯', '🎲', '🎸']
            cards_list = emojis + emojis
            random.shuffle(cards_list)
            initial_state = {
                'cards': [
                    {'id': i, 'emoji': emoji, 'isFlipped': False, 'isMatched': False}
                    for i, emoji in enumerate(cards_list)
                ],
                'currentTurn': 'player1',
                'scores': {'player1': 0, 'player2': 0},
                'winner': None
            }
        
        game_session = MultiplayerGameSession.objects.create(
            host=request.user,
            game_type=game_type,
            game_state=initial_state
        )
        
        # Automatically add the creator as the first player
        Player.objects.create(
            user=request.user,
            game_session=game_session,
            symbol='X'  # Creator is always first player (X/red/player1)
        )
        
        return Response(MultiplayerGameSessionSerializer(game_session).data, status=status.HTTP_201_CREATED)


class JoinGameRoomView(APIView):
    """Join an existing multiplayer game room by its code."""
    permission_classes = [IsAuthenticated]

    def post(self, request, room_code):
        game_session = get_object_or_404(MultiplayerGameSession, room_code=room_code)

        if game_session.status == 'finished':
            return Response({'error': 'This game has already finished.'}, status=status.HTTP_400_BAD_REQUEST)

        if game_session.is_full():
            return Response({'error': 'This game room is full.'}, status=status.HTTP_400_BAD_REQUEST)

        if game_session.players.filter(id=request.user.id).exists():
            return Response({'error': 'You are already in this game.'}, status=status.HTTP_400_BAD_REQUEST)

        # Determine symbol based on number of existing players
        player_count = game_session.players.count()
        symbol = 'X' if player_count == 0 else 'O'
        
        # Add user as a player
        Player.objects.create(user=request.user, game_session=game_session, symbol=symbol)

        # If room is now full, start the game
        if game_session.is_full():
            game_session.status = 'in-progress'
            game_session.save()

        return Response(MultiplayerGameSessionSerializer(game_session).data, status=status.HTTP_200_OK)


class GameRoomDetailView(APIView):
    """Get the details of a game room."""
    permission_classes = [IsAuthenticated]

    def get(self, request, room_code):
        game_session = get_object_or_404(MultiplayerGameSession, room_code=room_code)
        return Response(MultiplayerGameSessionSerializer(game_session).data)


class MakeMoveView(APIView):
    """Make a move in a multiplayer game - supports all game types."""
    permission_classes = [IsAuthenticated]

    def post(self, request, room_code):
        game_session = get_object_or_404(MultiplayerGameSession, room_code=room_code)

        if game_session.status == 'finished':
            return Response({'error': 'Game is already finished.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            player = Player.objects.get(user=request.user, game_session=game_session)
        except Player.DoesNotExist:
            return Response({'error': 'You are not a player in this game.'}, status=status.HTTP_403_FORBIDDEN)

        # For tic-tac-toe, handle the old position-based format
        if game_session.game_type == 'tic-tac-toe' and 'position' in request.data:
            return self._handle_tic_tac_toe(game_session, player, request.data.get('position'))
        
        # For all other games, accept arbitrary game state updates
        new_game_state = request.data
        
        # Validate that some data was sent
        if not new_game_state:
            return Response({'error': 'No game state provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update the game state
        game_session.game_state = new_game_state
        
        # Check if the game is finished based on the 'winner' field
        if new_game_state.get('winner'):
            game_session.status = 'finished'
        elif game_session.status == 'waiting':
            game_session.status = 'in-progress'
        
        game_session.save()

        return Response(MultiplayerGameSessionSerializer(game_session).data)

    def _handle_tic_tac_toe(self, game_session, player, position):
        """Handle tic-tac-toe specific move logic."""
        if game_session.status != 'in-progress':
            return Response({'error': 'Game is not in progress.'}, status=status.HTTP_400_BAD_REQUEST)

        game_state = game_session.game_state or {}
        board = game_state.get('board', [' '] * 9)
        current_turn = game_state.get('turn', 'X')

        if player.symbol != current_turn:
            return Response({'error': "It's not your turn."}, status=status.HTTP_400_BAD_REQUEST)

        if position is None or not (0 <= position < 9):
            return Response({'error': 'Invalid position.'}, status=status.HTTP_400_BAD_REQUEST)

        if board[position] != ' ':
            return Response({'error': 'Position already taken.'}, status=status.HTTP_400_BAD_REQUEST)

        # Make the move
        board[position] = player.symbol
        game_state['board'] = board

        # Check for winner
        winner = self._check_winner(board)
        if winner:
            game_state['winner'] = winner
            game_session.status = 'finished'
        elif ' ' not in board:
            game_state['winner'] = 'draw'
            game_session.status = 'finished'
        else:
            # Switch turn
            game_state['turn'] = 'O' if current_turn == 'X' else 'X'

        game_session.game_state = game_state
        game_session.save()

        return Response(MultiplayerGameSessionSerializer(game_session).data)

    def _check_winner(self, board):
        win_conditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],  # Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8],  # Columns
            [0, 4, 8], [2, 4, 6]              # Diagonals
        ]
        for condition in win_conditions:
            if board[condition[0]] == board[condition[1]] == board[condition[2]] != ' ':
                return board[condition[0]]
        return None
