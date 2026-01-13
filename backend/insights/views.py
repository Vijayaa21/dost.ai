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
        """Generate a new mood analysis with focus on recent progress"""
        from mood.models import MoodEntry
        from datetime import date
        
        # Get mood data for last 7 days
        week_ago = timezone.now() - timedelta(days=7)
        mood_entries = MoodEntry.objects.filter(
            user=request.user,
            created_at__gte=week_ago
        ).order_by('created_at')
        
        if mood_entries.count() < 3:
            return Response({
                'message': 'Need at least 3 mood entries for analysis'
            }, status=400)
        
        # Calculate stats
        moods = [e.mood_score for e in mood_entries]
        avg_mood = sum(moods) / len(moods)
        
        # Focus on RECENT progress (last 3 days vs earlier)
        recent_entries = list(mood_entries)[-3:]  # Last 3 entries
        earlier_entries = list(mood_entries)[:-3] if len(mood_entries) > 3 else []
        
        recent_moods = [e.mood_score for e in recent_entries]
        recent_avg = sum(recent_moods) / len(recent_moods) if recent_moods else avg_mood
        
        earlier_moods = [e.mood_score for e in earlier_entries]
        earlier_avg = sum(earlier_moods) / len(earlier_moods) if earlier_moods else recent_avg
        
        # Determine trend based on recent days
        if recent_avg >= 3.5:
            # Recent days are good! Be positive
            if recent_avg > earlier_avg + 0.2:
                trend = 'improving'
                trend_message = "🌟 Great progress! Your recent days are looking brighter."
            elif recent_avg >= earlier_avg:
                trend = 'stable'
                trend_message = "✨ You're doing well! Keep up the positive momentum."
            else:
                trend = 'stable'
                trend_message = "💪 Staying strong! Your recent moods are in a good place."
        elif recent_avg > earlier_avg + 0.3:
            trend = 'improving'
            trend_message = "📈 Things are looking up! Your recent days show improvement."
        elif recent_avg < earlier_avg - 0.5:
            trend = 'declining'
            trend_message = "💙 It's been a tough few days. Remember, it's okay to not be okay."
        else:
            trend = 'stable'
            trend_message = "Your mood has been fairly consistent this week."
        
        # Calculate trend percentage based on recent vs earlier
        if earlier_avg > 0:
            trend_pct = ((recent_avg - earlier_avg) / earlier_avg * 100)
        else:
            trend_pct = 0
        
        # Generate encouraging summary
        if recent_avg >= 4:
            summary = f"🎉 You're doing amazing! Your recent average is {recent_avg:.1f}/5. {trend_message}"
        elif recent_avg >= 3:
            summary = f"Your recent average mood is {recent_avg:.1f}/5. {trend_message}"
        else:
            summary = f"Your recent average is {recent_avg:.1f}/5. {trend_message} Small steps count!"
        
        # Generate smart recommendations
        recommendations = []
        if trend == 'improving':
            recommendations = [
                "Keep doing what you're doing - it's working! 🌟",
                "Consider journaling about what's been helping",
                "Celebrate your progress, even small wins matter",
            ]
        elif recent_avg >= 3.5:
            recommendations = [
                "You're in a good place! Maintain your self-care routine",
                "Try to identify what's contributing to your positive mood",
                "Share your good vibes with someone you care about",
            ]
        else:
            recommendations = [
                "Try one small act of self-care today",
                "Reach out to someone you trust",
                "Remember: difficult days are temporary",
            ]
        
        # Generate highlights
        highlights = []
        if trend == 'improving':
            highlights.append(f"📈 Mood improved by {abs(trend_pct):.0f}% recently!")
        
        if recent_avg >= 4:
            highlights.append("⭐ Your recent moods are excellent!")
        elif recent_avg >= 3:
            highlights.append("💚 You're doing okay - that's worth celebrating")
        
        highlights.append(f"📊 Logged {mood_entries.count()} mood entries this week")
        
        # Best day
        best_entry = max(mood_entries, key=lambda e: e.mood_score)
        highlights.append(f"🌟 Best day: {best_entry.date.strftime('%A')} ({best_entry.mood_score}/5)")
        
        # Create analysis
        analysis = MoodAnalysis.objects.create(
            user=request.user,
            period_type='weekly',
            start_date=week_ago.date(),
            end_date=date.today(),
            average_mood=round(recent_avg, 2),  # Use recent average for display
            trend_direction=trend,
            trend_percentage=round(trend_pct, 1),
            summary=summary,
            highlights=highlights,
            recommendations=recommendations
        )
        
        return Response(MoodAnalysisSerializer(analysis).data)
