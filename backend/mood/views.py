from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Avg, Count
from django.utils import timezone
from datetime import timedelta
from collections import Counter
from .models import MoodEntry, MoodInsight
from .serializers import MoodEntrySerializer, MoodInsightSerializer, MoodStatsSerializer


class MoodEntryListCreateView(generics.ListCreateAPIView):
    """List all mood entries or create a new one."""
    serializer_class = MoodEntrySerializer
    
    def get_queryset(self):
        queryset = MoodEntry.objects.filter(user=self.request.user)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        # Check if entry already exists for today
        today = timezone.now().date()
        existing = MoodEntry.objects.filter(user=request.user, date=today).first()
        
        if existing:
            # Update existing entry
            serializer = self.get_serializer(existing, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        # Create new entry
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MoodEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a mood entry."""
    serializer_class = MoodEntrySerializer
    
    def get_queryset(self):
        return MoodEntry.objects.filter(user=self.request.user)


class TodayMoodView(APIView):
    """Get today's mood entry."""
    
    def get(self, request):
        today = timezone.now().date()
        entry = MoodEntry.objects.filter(user=request.user, date=today).first()
        
        if entry:
            return Response(MoodEntrySerializer(entry).data)
        return Response({"message": "No mood entry for today"}, status=status.HTTP_404_NOT_FOUND)


class MoodStatsView(APIView):
    """Get mood statistics and analytics."""
    
    def get(self, request):
        user = request.user
        period = request.query_params.get('period', 'week')
        
        # Determine date range
        today = timezone.now().date()
        if period == 'week':
            start_date = today - timedelta(days=7)
        elif period == 'month':
            start_date = today - timedelta(days=30)
        elif period == 'year':
            start_date = today - timedelta(days=365)
        else:
            start_date = today - timedelta(days=7)
        
        entries = MoodEntry.objects.filter(
            user=user, 
            date__gte=start_date, 
            date__lte=today
        )
        
        if not entries.exists():
            return Response({
                "average_mood": 0,
                "total_entries": 0,
                "mood_distribution": {},
                "emotion_frequency": {},
                "weekly_trend": []
            })
        
        # Calculate statistics
        avg_mood = entries.aggregate(avg=Avg('mood_score'))['avg'] or 0
        total_entries = entries.count()
        
        # Mood distribution
        mood_dist = dict(entries.values('mood_score').annotate(count=Count('id')).values_list('mood_score', 'count'))
        
        # Emotion frequency
        all_emotions = []
        for entry in entries:
            all_emotions.extend(entry.emotions)
        emotion_freq = dict(Counter(all_emotions).most_common(10))
        
        # Weekly trend - rolling 7 days ending today (most recent 7 days)
        seven_days_ago = today - timedelta(days=6)
        weekly_entries_qs = MoodEntry.objects.filter(
            user=user,
            date__gte=seven_days_ago,
            date__lte=today
        ).order_by('date')
        
        # Create a dict for quick lookup
        entries_by_date = {entry.date: entry for entry in weekly_entries_qs}
        
        # Build rolling week data (last 6 days + today)
        weekly_trend = []
        for i in range(7):
            day_date = seven_days_ago + timedelta(days=i)
            entry = entries_by_date.get(day_date)
            weekly_trend.append({
                'date': day_date.isoformat(),
                'mood_score': entry.mood_score if entry else 0,
                'emotions': entry.emotions if entry else [],
                'day_label': day_date.strftime('%a').upper()
            })
        
        return Response({
            "average_mood": round(avg_mood, 2),
            "total_entries": total_entries,
            "mood_distribution": mood_dist,
            "emotion_frequency": emotion_freq,
            "weekly_trend": weekly_trend
        })


class MoodInsightListView(generics.ListAPIView):
    """Get mood insights for the user."""
    serializer_class = MoodInsightSerializer
    
    def get_queryset(self):
        return MoodInsight.objects.filter(user=self.request.user)
