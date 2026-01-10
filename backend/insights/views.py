from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.utils import timezone
from datetime import timedelta

from .models import TriggerPattern, InsightNotification, MoodAnalysis
from .serializers import (
    TriggerPatternSerializer, InsightNotificationSerializer, MoodAnalysisSerializer
)
from .analysis_service import TriggerAnalysisService


class TriggerPatternViewSet(viewsets.ModelViewSet):
    """Manage trigger patterns"""
    serializer_class = TriggerPatternSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return TriggerPattern.objects.filter(
            user=self.request.user,
            is_dismissed=False
        )
    
    @action(detail=False, methods=['post'])
    def analyze(self, request):
        """Run pattern analysis on user's data"""
        service = TriggerAnalysisService()
        patterns = service.analyze_patterns(request.user)
        
        return Response({
            'patterns_found': len(patterns),
            'patterns': TriggerPatternSerializer(patterns, many=True).data,
            'message': f"Analysis complete! Found {len(patterns)} pattern(s)."
        })
    
    @action(detail=True, methods=['post'])
    def dismiss(self, request, pk=None):
        """Dismiss a pattern (user doesn't find it helpful)"""
        pattern = self.get_object()
        pattern.is_dismissed = True
        pattern.save()
        
        return Response({'message': 'Pattern dismissed'})
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get only active, high-confidence patterns"""
        patterns = self.get_queryset().filter(
            is_active=True,
            confidence_score__gte=0.5
        )
        return Response(TriggerPatternSerializer(patterns, many=True).data)


class InsightNotificationViewSet(viewsets.ModelViewSet):
    """Manage insight notifications"""
    serializer_class = InsightNotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return InsightNotification.objects.filter(
            user=self.request.user,
            is_dismissed=False
        )
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread notifications"""
        notifications = self.get_queryset().filter(is_read=False)
        return Response(InsightNotificationSerializer(notifications, many=True).data)
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})
    
    @action(detail=True, methods=['post'])
    def feedback(self, request, pk=None):
        """Provide feedback on notification helpfulness"""
        notification = self.get_object()
        notification.is_helpful = request.data.get('helpful', None)
        notification.save()
        return Response({'status': 'feedback recorded'})


class ProactiveAlertView(APIView):
    """Check for proactive alerts based on current time and patterns"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        service = TriggerAnalysisService()
        alert = service.get_proactive_alert(request.user)
        
        if alert:
            # Create notification record
            notification = InsightNotification.objects.create(
                user=request.user,
                trigger_pattern=alert['pattern'],
                notification_type='trigger_alert',
                title=alert['title'],
                message=alert['message'],
                action_type='coping',
                action_data={'advice': alert['advice']},
                sent_at=timezone.now()
            )
            
            return Response({
                'has_alert': True,
                'notification': InsightNotificationSerializer(notification).data
            })
        
        return Response({'has_alert': False})


class MoodAnalysisViewSet(viewsets.ReadOnlyModelViewSet):
    """View mood analysis summaries"""
    serializer_class = MoodAnalysisSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return MoodAnalysis.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """Get most recent analysis"""
        analysis = self.get_queryset().first()
        if analysis:
            return Response(MoodAnalysisSerializer(analysis).data)
        return Response({'message': 'No analysis available yet'}, status=404)
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate a new mood analysis"""
        from mood.models import MoodEntry
        from datetime import date
        
        # Get mood data for last 7 days
        week_ago = timezone.now() - timedelta(days=7)
        mood_entries = MoodEntry.objects.filter(
            user=request.user,
            created_at__gte=week_ago
        )
        
        if mood_entries.count() < 3:
            return Response({
                'message': 'Need at least 3 mood entries for analysis'
            }, status=400)
        
        # Calculate stats
        moods = [e.mood_score for e in mood_entries]
        avg_mood = sum(moods) / len(moods)
        
        # Simple trend calculation
        first_half = moods[:len(moods)//2] if len(moods) > 1 else moods
        second_half = moods[len(moods)//2:] if len(moods) > 1 else moods
        
        first_avg = sum(first_half) / len(first_half) if first_half else avg_mood
        second_avg = sum(second_half) / len(second_half) if second_half else avg_mood
        
        if second_avg > first_avg + 0.3:
            trend = 'improving'
        elif second_avg < first_avg - 0.3:
            trend = 'declining'
        else:
            trend = 'stable'
        
        trend_pct = ((second_avg - first_avg) / first_avg * 100) if first_avg > 0 else 0
        
        # Create analysis
        analysis = MoodAnalysis.objects.create(
            user=request.user,
            period_type='weekly',
            start_date=week_ago.date(),
            end_date=date.today(),
            average_mood=avg_mood,
            trend_direction=trend,
            trend_percentage=trend_pct,
            summary=f"Your average mood this week was {avg_mood:.1f}/5. The trend is {trend}.",
            highlights=[
                f"Logged {mood_entries.count()} mood entries",
                f"Trend: {trend.title()}",
            ],
            recommendations=[
                "Keep tracking your moods daily",
                "Try journaling when you feel low",
            ]
        )
        
        return Response(MoodAnalysisSerializer(analysis).data)
