from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
import random
from .models import CopingTool, CopingToolUsage, Affirmation
from .serializers import (
    CopingToolSerializer, CopingToolListSerializer,
    CopingToolUsageSerializer, AffirmationSerializer
)


class CopingToolListView(generics.ListAPIView):
    """List all coping tools."""
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.request.query_params.get('detail') == 'true':
            return CopingToolSerializer
        return CopingToolListSerializer
    
    def get_queryset(self):
        queryset = CopingTool.objects.filter(is_active=True)
        
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        
        difficulty = self.request.query_params.get('difficulty')
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        
        return queryset


class CopingToolDetailView(generics.RetrieveAPIView):
    """Get a specific coping tool."""
    permission_classes = [AllowAny]
    serializer_class = CopingToolSerializer
    queryset = CopingTool.objects.filter(is_active=True)


class CopingToolUsageView(generics.ListCreateAPIView):
    """Track coping tool usage."""
    serializer_class = CopingToolUsageSerializer
    
    def get_queryset(self):
        return CopingToolUsage.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RecommendedToolView(APIView):
    """Get recommended coping tool based on current emotion."""
    permission_classes = [AllowAny]
    
    def get(self, request):
        emotion = request.query_params.get('emotion', '')
        
        # Map emotions to helpful tool categories
        emotion_tool_map = {
            'anxious': ['breathing', 'grounding'],
            'stressed': ['breathing', 'mindfulness', 'relaxation'],
            'sad': ['affirmation', 'mindfulness'],
            'angry': ['breathing', 'grounding'],
            'overwhelmed': ['breathing', 'grounding'],
            'confused': ['mindfulness', 'cognitive'],
        }
        
        categories = emotion_tool_map.get(emotion.lower(), ['breathing', 'mindfulness'])
        
        tools = CopingTool.objects.filter(
            is_active=True, 
            category__in=categories
        )
        
        if tools.exists():
            tool = random.choice(list(tools))
            return Response(CopingToolSerializer(tool).data)
        
        # Return any tool if no specific match
        tool = CopingTool.objects.filter(is_active=True).first()
        if tool:
            return Response(CopingToolSerializer(tool).data)
        
        return Response({"message": "No coping tools available"}, status=status.HTTP_404_NOT_FOUND)


class AffirmationView(APIView):
    """Get a random affirmation."""
    permission_classes = [AllowAny]
    
    def get(self, request):
        category = request.query_params.get('category')
        
        affirmations = Affirmation.objects.filter(is_active=True)
        if category:
            affirmations = affirmations.filter(category=category)
        
        if affirmations.exists():
            affirmation = random.choice(list(affirmations))
            return Response(AffirmationSerializer(affirmation).data)
        
        # Fallback affirmations
        fallback = [
            "I am worthy of love and respect.",
            "I choose peace over worry.",
            "I am stronger than I know.",
            "I am enough, just as I am.",
            "I deserve happiness and peace.",
        ]
        return Response({
            "text": random.choice(fallback),
            "category": "self_love"
        })


class CopingStatsView(APIView):
    """Get user's coping tool usage statistics."""
    
    def get(self, request):
        usages = CopingToolUsage.objects.filter(user=request.user)
        
        total_sessions = usages.count()
        completed_sessions = usages.filter(completed=True).count()
        
        # Most used tools
        from django.db.models import Count
        most_used = usages.values('tool__title').annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        # Average mood improvement
        mood_improvements = []
        for usage in usages.filter(mood_before__isnull=False, mood_after__isnull=False):
            mood_improvements.append(usage.mood_after - usage.mood_before)
        
        avg_improvement = sum(mood_improvements) / len(mood_improvements) if mood_improvements else 0
        
        return Response({
            "total_sessions": total_sessions,
            "completed_sessions": completed_sessions,
            "most_used_tools": list(most_used),
            "average_mood_improvement": round(avg_improvement, 2)
        })
