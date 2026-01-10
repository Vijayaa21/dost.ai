"""
AI-powered trigger pattern detection service.
Analyzes mood entries, journal entries, and chat messages to detect patterns.
"""
import os
import json
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Avg, Count
from collections import defaultdict
from django.db import models


# Try to import Google GenAI (new package)
try:
    from google import genai
    from google.genai import types
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False


class TriggerAnalysisService:
    """Analyzes user data to detect emotional triggers and patterns"""
    
    def __init__(self):
        if GEMINI_AVAILABLE:
            api_key = os.getenv('GEMINI_API_KEY')
            if api_key:
                self.client = genai.Client(api_key=api_key)
                self.model_name = 'gemini-2.0-flash'
            else:
                self.client = None
                self.model_name = None
        else:
            self.client = None
            self.model_name = None
    
    def analyze_patterns(self, user):
        """Main analysis function - analyzes all user data for patterns"""
        from mood.models import MoodEntry
        from journal.models import JournalEntry
        from chat.models import Message
        from .models import TriggerPattern
        
        # Get data from last 30 days
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        mood_entries = MoodEntry.objects.filter(
            user=user,
            created_at__gte=thirty_days_ago
        ).order_by('created_at')
        
        journal_entries = JournalEntry.objects.filter(
            user=user,
            created_at__gte=thirty_days_ago
        )
        
        messages = Message.objects.filter(
            conversation__user=user,
            role='user',
            created_at__gte=thirty_days_ago
        )
        
        patterns = []
        
        # 1. Time-based pattern analysis
        time_patterns = self._analyze_time_patterns(mood_entries)
        patterns.extend(time_patterns)
        
        # 2. Day of week patterns
        day_patterns = self._analyze_day_patterns(mood_entries)
        patterns.extend(day_patterns)
        
        # 3. Topic/keyword patterns (using AI if available)
        if self.client and (journal_entries.exists() or messages.exists()):
            topic_patterns = self._analyze_topic_patterns(user, journal_entries, messages)
            patterns.extend(topic_patterns)
        
        # Save patterns to database
        saved_patterns = []
        for pattern_data in patterns:
            pattern, created = TriggerPattern.objects.update_or_create(
                user=user,
                pattern_name=pattern_data['pattern_name'],
                defaults=pattern_data
            )
            if not created:
                pattern.occurrence_count += 1
                pattern.confidence_score = min(0.95, pattern.confidence_score + 0.05)
                pattern.save()
            saved_patterns.append(pattern)
        
        return saved_patterns
    
    def _analyze_time_patterns(self, mood_entries):
        """Detect time-of-day mood patterns"""
        patterns = []
        
        time_mood_data = defaultdict(list)
        
        for entry in mood_entries:
            hour = entry.created_at.hour
            if 5 <= hour < 12:
                time_of_day = 'morning'
            elif 12 <= hour < 17:
                time_of_day = 'afternoon'
            elif 17 <= hour < 21:
                time_of_day = 'evening'
            else:
                time_of_day = 'night'
            
            time_mood_data[time_of_day].append(entry.mood_score)
        
        # Check for consistent low moods at specific times
        for time_of_day, moods in time_mood_data.items():
            if len(moods) >= 3:
                avg_mood = sum(moods) / len(moods)
                if avg_mood <= 2.5:
                    patterns.append({
                        'trigger_type': 'time',
                        'emotion_type': 'low_energy' if time_of_day == 'morning' else 'stress',
                        'pattern_name': f'{time_of_day.title()} Blues',
                        'description': f'You tend to feel lower in the {time_of_day}. Average mood: {avg_mood:.1f}/5',
                        'time_of_day': time_of_day,
                        'confidence_score': min(0.9, len(moods) * 0.1),
                        'occurrence_count': len(moods),
                        'custom_advice': self._get_time_advice(time_of_day),
                    })
        
        return patterns
    
    def _analyze_day_patterns(self, mood_entries):
        """Detect day-of-week mood patterns"""
        patterns = []
        
        day_mood_data = defaultdict(list)
        day_names = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        
        for entry in mood_entries:
            day = day_names[entry.created_at.weekday()]
            day_mood_data[day].append(entry.mood_score)
        
        for day, moods in day_mood_data.items():
            if len(moods) >= 2:
                avg_mood = sum(moods) / len(moods)
                if avg_mood <= 2.5:
                    emotion = 'anxiety' if day == 'sunday' else 'stress'
                    patterns.append({
                        'trigger_type': 'time',
                        'emotion_type': emotion,
                        'pattern_name': f'{day.title()} Pattern',
                        'description': f'Your mood tends to dip on {day.title()}s. Average mood: {avg_mood:.1f}/5',
                        'day_of_week': day,
                        'confidence_score': min(0.85, len(moods) * 0.15),
                        'occurrence_count': len(moods),
                        'custom_advice': self._get_day_advice(day),
                    })
        
        return patterns
    
    def _analyze_topic_patterns(self, user, journal_entries, messages):
        """Use AI to detect topic-based triggers"""
        patterns = []
        
        # Prepare text for analysis
        texts = []
        for entry in journal_entries[:10]:
            texts.append(f"Journal ({entry.created_at.date()}): {entry.content[:500]}")
        
        for msg in messages[:20]:
            texts.append(f"Chat: {msg.content[:200]}")
        
        if not texts:
            return patterns
        
        combined_text = "\n\n".join(texts)
        
        try:
            prompt = f"""Analyze these journal entries and chat messages for emotional patterns.
            
{combined_text}

Identify up to 3 recurring topics or themes that seem to trigger negative emotions.
For each trigger, provide:
1. A short name (e.g., "Work Stress", "Relationship Anxiety")
2. The emotion type (anxiety, sadness, stress, anger, overwhelm)
3. Keywords associated with this trigger
4. A brief supportive description

Respond in JSON format:
[{{"name": "...", "emotion": "...", "keywords": ["..."], "description": "..."}}]

Only include clear patterns with evidence. Return empty array [] if no clear patterns found."""

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            response_text = response.text.strip()
            
            # Parse JSON from response
            if response_text.startswith('```'):
                response_text = response_text.split('```')[1]
                if response_text.startswith('json'):
                    response_text = response_text[4:]
            
            detected = json.loads(response_text)
            
            for item in detected[:3]:
                patterns.append({
                    'trigger_type': 'topic',
                    'emotion_type': item.get('emotion', 'stress'),
                    'pattern_name': item.get('name', 'Unknown Trigger'),
                    'description': item.get('description', 'A detected pattern in your entries'),
                    'keywords': item.get('keywords', []),
                    'confidence_score': 0.7,
                    'occurrence_count': 1,
                })
        except Exception as e:
            print(f"AI analysis error: {e}")
        
        return patterns
    
    def _get_time_advice(self, time_of_day):
        """Get coping advice for time-based patterns"""
        advice = {
            'morning': "Try a gentle morning routine: stretch, hydrate, and take 5 deep breaths before starting your day.",
            'afternoon': "The afternoon slump is common. Try a short walk or a quick mindfulness break.",
            'evening': "Evening anxiety often relates to the day's events. Try journaling to process your thoughts.",
            'night': "Nighttime worries are normal. Try the 4-7-8 breathing technique before bed.",
        }
        return advice.get(time_of_day, "Take a moment to pause and check in with yourself.")
    
    def _get_day_advice(self, day):
        """Get coping advice for day-based patterns"""
        advice = {
            'sunday': "Sunday anxiety about the week ahead is common. Plan something enjoyable for Sunday evening.",
            'monday': "Start your week with self-compassion. Set realistic goals and take breaks.",
            'friday': "End-of-week exhaustion is real. Allow yourself to unwind.",
        }
        return advice.get(day, "Be gentle with yourself on difficult days.")
    
    def get_proactive_alert(self, user):
        """Check if user should receive a proactive notification"""
        from .models import TriggerPattern, InsightNotification
        
        now = timezone.now()
        current_hour = now.hour
        current_day = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'][now.weekday()]
        
        # Determine current time of day
        if 5 <= current_hour < 12:
            time_of_day = 'morning'
        elif 12 <= current_hour < 17:
            time_of_day = 'afternoon'
        elif 17 <= current_hour < 21:
            time_of_day = 'evening'
        else:
            time_of_day = 'night'
        
        # Find matching active patterns
        matching_patterns = TriggerPattern.objects.filter(
            user=user,
            is_active=True,
            is_dismissed=False
        ).filter(
            models.Q(time_of_day=time_of_day) | 
            models.Q(day_of_week=current_day)
        )
        
        for pattern in matching_patterns:
            # Check if we already sent a notification recently
            recent_notification = InsightNotification.objects.filter(
                user=user,
                trigger_pattern=pattern,
                created_at__gte=now - timedelta(hours=12)
            ).exists()
            
            if not recent_notification and pattern.confidence_score >= 0.5:
                return {
                    'pattern': pattern,
                    'title': f"Heads up about {pattern.pattern_name}",
                    'message': pattern.description,
                    'advice': pattern.custom_advice,
                }
        
        return None


# Import models for Q lookup
