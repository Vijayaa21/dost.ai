from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q
import random
from .models import JournalEntry, JournalPrompt
from .serializers import JournalEntrySerializer, JournalEntryListSerializer, JournalPromptSerializer
from chat.ai_service import detect_emotion


class JournalEntryListCreateView(generics.ListCreateAPIView):
    """List all journal entries or create a new one."""
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return JournalEntryListSerializer
        return JournalEntrySerializer
    
    def get_queryset(self):
        queryset = JournalEntry.objects.filter(user=self.request.user)
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(content__icontains=search)
            )
        
        # Filter by tag
        tag = self.request.query_params.get('tag')
        if tag:
            queryset = queryset.filter(tags__contains=[tag])
        
        return queryset
    
    def perform_create(self, serializer):
        entry = serializer.save(user=self.request.user)
        
        # Generate AI reflection if enabled
        if entry.ai_reflection_enabled:
            self._generate_ai_reflection(entry)
    
    def _generate_ai_reflection(self, entry):
        """Generate AI reflection for the journal entry."""
        from chat.ai_service import get_ai_response
        
        # Detect emotions
        detected_emotion = detect_emotion(entry.content)
        entry.ai_emotion_analysis = {'primary_emotion': detected_emotion}
        
        # Generate reflection
        try:
            reflection_prompt = f"""The user has written the following journal entry. Provide a brief, supportive reflection (2-3 sentences) that:
1. Acknowledges their feelings
2. Offers a gentle observation or insight
3. Encourages continued self-reflection

Journal entry:
{entry.content}

Provide only the reflection, no preamble."""
            
            messages = [{'role': 'user', 'content': reflection_prompt}]
            reflection = get_ai_response(messages, 'calm')
            entry.ai_reflection = reflection
        except Exception as e:
            entry.ai_reflection = "Thank you for sharing your thoughts. Journaling is a wonderful practice for self-reflection."
        
        entry.save()


class JournalEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete a journal entry."""
    serializer_class = JournalEntrySerializer
    
    def get_queryset(self):
        return JournalEntry.objects.filter(user=self.request.user)


class JournalPromptView(APIView):
    """Get a random journal prompt."""
    
    def get(self, request):
        category = request.query_params.get('category')
        
        prompts = JournalPrompt.objects.filter(is_active=True)
        if category:
            prompts = prompts.filter(category=category)
        
        if prompts.exists():
            prompt = random.choice(list(prompts))
            return Response(JournalPromptSerializer(prompt).data)
        
        # Fallback prompts if none in database
        fallback_prompts = [
            "What are three things you're grateful for today?",
            "Describe a moment that made you smile recently.",
            "What's one thing you'd like to let go of?",
            "How are you really feeling right now?",
            "What's something kind you did for yourself today?",
        ]
        return Response({
            "prompt_text": random.choice(fallback_prompts),
            "category": "reflection"
        })


class JournalStatsView(APIView):
    """Get journal statistics."""
    
    def get(self, request):
        entries = JournalEntry.objects.filter(user=request.user)
        
        total_entries = entries.count()
        
        # Tag frequency
        all_tags = []
        for entry in entries:
            all_tags.extend(entry.tags)
        
        from collections import Counter
        tag_frequency = dict(Counter(all_tags).most_common(10))
        
        # Writing streak
        from django.utils import timezone
        from datetime import timedelta
        
        today = timezone.now().date()
        streak = 0
        current_date = today
        
        while entries.filter(created_at__date=current_date).exists():
            streak += 1
            current_date -= timedelta(days=1)
        
        return Response({
            "total_entries": total_entries,
            "tag_frequency": tag_frequency,
            "writing_streak": streak
        })
