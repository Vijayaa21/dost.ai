"""
AI-powered trigger pattern detection service.
Analyzes mood entries, journal entries, and chat messages to detect patterns.
Enhanced with therapeutic insights and actionable recommendations.
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


# Enhanced advice templates with therapeutic grounding
TIME_ADVICE_TEMPLATES = {
    'morning': {
        'title': 'Morning Blues',
        'insight': 'Morning can be tough when we wake up with yesterday\'s worries or face the weight of a new day.',
        'advice': [
            'Start with one small act of self-care before checking your phone',
            'Try a 3-minute stretch to wake up your body gently',
            'Write down one tiny thing you\'re looking forward to today',
            'Give yourself 10 extra minutes - rushing increases cortisol'
        ],
        'therapeutic_note': 'Morning moods often reflect sleep quality and unresolved thoughts from yesterday. Be gentle with yourself as you transition into the day.'
    },
    'afternoon': {
        'title': 'Afternoon Dip',
        'insight': 'The afternoon slump is common - your body\'s circadian rhythm naturally dips, and the day\'s stresses accumulate.',
        'advice': [
            'Take a 5-minute walk outside - natural light helps reset energy',
            'Have a healthy snack and water (dehydration affects mood)',
            'Do a 2-minute breathing exercise to reset your nervous system',
            'If possible, step away from screens for a few minutes'
        ],
        'therapeutic_note': 'Afternoon energy drops are biological, not a personal failing. Small resets can help you reclaim the rest of your day.'
    },
    'evening': {
        'title': 'Evening Anxiety',
        'insight': 'Evening often brings reflection time, and the mind can replay the day\'s events or worry about tomorrow.',
        'advice': [
            'Try a "brain dump" journal session - write all worries on paper',
            'Create a transition ritual between work and rest',
            'Limit screen exposure an hour before bed',
            'Practice the 4-7-8 breathing technique to activate calm'
        ],
        'therapeutic_note': 'Evening anxiety often comes from the day\'s unprocessed emotions finally having space to surface. Acknowledge them rather than pushing them away.'
    },
    'night': {
        'title': 'Nighttime Worries',
        'insight': 'Nighttime can amplify worries - the quiet and darkness remove distractions, leaving space for anxious thoughts.',
        'advice': [
            'Try the "worry window" technique: schedule worry time earlier',
            'Keep a notepad by your bed to capture racing thoughts',
            'Practice progressive muscle relaxation before sleep',
            'Listen to calming sounds or guided sleep meditation'
        ],
        'therapeutic_note': 'Night thoughts often feel bigger than day thoughts. Remember: your capacity to solve problems is lower at night, so capture thoughts for tomorrow-you to handle.'
    }
}

DAY_ADVICE_TEMPLATES = {
    'sunday': {
        'title': 'Sunday Scaries',
        'insight': 'Sunday anxiety about the week ahead is incredibly common - you\'re not alone in feeling this.',
        'advice': [
            'Plan one enjoyable thing for Sunday evening to look forward to',
            'Prep the week minimally - just tomorrow, not the whole week',
            'Remind yourself: Monday will come whether you worry or not',
            'Connect with someone - isolation amplifies Sunday anxiety'
        ],
        'therapeutic_note': 'Sunday anxiety is anticipatory stress. Most of what we worry about either doesn\'t happen or is more manageable than we imagined.'
    },
    'monday': {
        'title': 'Monday Blues',
        'insight': 'Mondays represent a transition from rest to responsibility - that shift is genuinely challenging.',
        'advice': [
            'Start with your most engaging task, not your hardest',
            'Set just 3 priorities for the day, not a massive to-do list',
            'Schedule something small to look forward to mid-day',
            'Be extra gentle with yourself - Monday energy is rebuilding'
        ],
        'therapeutic_note': 'Monday is a fresh start, but fresh starts take energy. Pace yourself and celebrate small wins.'
    },
    'friday': {
        'title': 'Friday Exhaustion',
        'insight': 'By Friday, the week\'s accumulated stress peaks - it\'s normal to feel drained.',
        'advice': [
            'Lower your expectations for productivity',
            'Plan something restorative for the evening',
            'Reflect on one thing you handled well this week',
            'Start your weekend wind-down earlier than usual'
        ],
        'therapeutic_note': 'Friday fatigue is your body asking for rest. Honor that signal rather than pushing through.'
    }
}


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
            # Extract data that should be saved to model
            model_data = {
                'trigger_type': pattern_data.get('trigger_type', 'custom'),
                'emotion_type': pattern_data.get('emotion_type', 'stress'),
                'description': pattern_data.get('description', ''),
                'time_of_day': pattern_data.get('time_of_day'),
                'day_of_week': pattern_data.get('day_of_week'),
                'keywords': pattern_data.get('keywords', []),
                'confidence_score': pattern_data.get('confidence_score', 0.5),
                'occurrence_count': pattern_data.get('occurrence_count', 1),
                'custom_advice': pattern_data.get('custom_advice', ''),
                'therapeutic_note': pattern_data.get('therapeutic_note', ''),
                'all_advice': pattern_data.get('all_advice', []),
            }
            
            pattern, created = TriggerPattern.objects.update_or_create(
                user=user,
                pattern_name=pattern_data['pattern_name'],
                defaults=model_data
            )
            if not created:
                pattern.occurrence_count += 1
                pattern.confidence_score = min(0.95, pattern.confidence_score + 0.05)
                # Update therapeutic info if provided
                if pattern_data.get('therapeutic_note'):
                    pattern.therapeutic_note = pattern_data['therapeutic_note']
                if pattern_data.get('all_advice'):
                    pattern.all_advice = pattern_data['all_advice']
                pattern.save()
            saved_patterns.append(pattern)
        
        return saved_patterns
    
    def _analyze_time_patterns(self, mood_entries):
        """Detect time-of-day mood patterns with enhanced therapeutic insights"""
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
                    template = TIME_ADVICE_TEMPLATES.get(time_of_day, {})
                    patterns.append({
                        'trigger_type': 'time',
                        'emotion_type': 'low_energy' if time_of_day == 'morning' else 'stress',
                        'pattern_name': template.get('title', f'{time_of_day.title()} Pattern'),
                        'description': template.get('insight', f'You tend to feel lower in the {time_of_day}. Average mood: {avg_mood:.1f}/5'),
                        'time_of_day': time_of_day,
                        'confidence_score': min(0.9, len(moods) * 0.1),
                        'occurrence_count': len(moods),
                        'custom_advice': template.get('advice', [self._get_time_advice(time_of_day)])[0],
                        'therapeutic_note': template.get('therapeutic_note', ''),
                        'all_advice': template.get('advice', []),
                    })
        
        return patterns
    
    def _analyze_day_patterns(self, mood_entries):
        """Detect day-of-week mood patterns with enhanced therapeutic insights"""
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
                    template = DAY_ADVICE_TEMPLATES.get(day, {})
                    patterns.append({
                        'trigger_type': 'time',
                        'emotion_type': emotion,
                        'pattern_name': template.get('title', f'{day.title()} Pattern'),
                        'description': template.get('insight', f'Your mood tends to dip on {day.title()}s. Average mood: {avg_mood:.1f}/5'),
                        'day_of_week': day,
                        'confidence_score': min(0.85, len(moods) * 0.15),
                        'occurrence_count': len(moods),
                        'custom_advice': template.get('advice', [self._get_day_advice(day)])[0] if template.get('advice') else self._get_day_advice(day),
                        'therapeutic_note': template.get('therapeutic_note', ''),
                        'all_advice': template.get('advice', []),
                    })
        
        return patterns
    
    def _analyze_topic_patterns(self, user, journal_entries, messages):
        """Use AI to detect topic-based triggers with therapeutic insights"""
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
            prompt = f"""You are a compassionate mental health insights analyzer. Analyze these journal entries and chat messages to identify emotional patterns and triggers.

{combined_text}

Your task:
1. Identify up to 3 recurring topics or themes that seem connected to negative emotions
2. For each pattern, provide supportive, non-judgmental insights
3. Include practical, evidence-based coping suggestions

For each trigger pattern, provide:
1. "name": A gentle, non-clinical name (e.g., "Work Pressure", "Relationship Worries", "Self-Doubt Moments")
2. "emotion": Primary emotion type (anxiety, sadness, stress, anger, overwhelm, loneliness, shame)
3. "keywords": Key words/phrases associated with this trigger
4. "description": A compassionate description that normalizes the experience (2-3 sentences)
5. "insight": A therapeutic insight about why this might be happening
6. "coping_tips": Array of 2-3 specific, actionable coping strategies

Important guidelines:
- Be warm and validating in all descriptions
- Avoid clinical or diagnostic language
- Focus on patterns, not problems
- Offer hope and agency in coping tips

Respond in JSON format:
[{{"name": "...", "emotion": "...", "keywords": ["..."], "description": "...", "insight": "...", "coping_tips": ["..."]}}]

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
                coping_tips = item.get('coping_tips', [])
                patterns.append({
                    'trigger_type': 'topic',
                    'emotion_type': item.get('emotion', 'stress'),
                    'pattern_name': item.get('name', 'Unknown Trigger'),
                    'description': item.get('description', 'A detected pattern in your entries'),
                    'keywords': item.get('keywords', []),
                    'confidence_score': 0.7,
                    'occurrence_count': 1,
                    'custom_advice': coping_tips[0] if coping_tips else '',
                    'therapeutic_note': item.get('insight', ''),
                    'all_advice': coping_tips,
                })
        except Exception as e:
            print(f"AI analysis error: {e}")
        
        return patterns
    
    def _get_time_advice(self, time_of_day):
        """Get coping advice for time-based patterns"""
        template = TIME_ADVICE_TEMPLATES.get(time_of_day, {})
        advice_list = template.get('advice', [])
        if advice_list:
            return advice_list[0]
        
        # Fallback advice
        fallback = {
            'morning': "Try a gentle morning routine: stretch, hydrate, and take 5 deep breaths before starting your day.",
            'afternoon': "The afternoon slump is common. Try a short walk or a quick mindfulness break.",
            'evening': "Evening anxiety often relates to the day's events. Try journaling to process your thoughts.",
            'night': "Nighttime worries are normal. Try the 4-7-8 breathing technique before bed.",
        }
        return fallback.get(time_of_day, "Take a moment to pause and check in with yourself.")
    
    def _get_day_advice(self, day):
        """Get coping advice for day-based patterns"""
        template = DAY_ADVICE_TEMPLATES.get(day, {})
        advice_list = template.get('advice', [])
        if advice_list:
            return advice_list[0]
        
        # Fallback advice
        fallback = {
            'sunday': "Sunday anxiety about the week ahead is common. Plan something enjoyable for Sunday evening.",
            'monday': "Start your week with self-compassion. Set realistic goals and take breaks.",
            'friday': "End-of-week exhaustion is real. Allow yourself to unwind.",
        }
        return fallback.get(day, "Be gentle with yourself on difficult days.")
    
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
