"""
AI Service for Dost AI - Handles communication with OpenAI/Gemini APIs.
"""
import os
import re
from django.conf import settings

# Crisis detection patterns
CRISIS_PATTERNS = [
    r'\b(suicide|suicidal|kill myself|end my life|want to die|better off dead)\b',
    r'\b(self.?harm|hurt myself|cutting|cutting myself)\b',
    r'\b(no reason to live|can\'t go on|give up on life)\b',
    r'\b(overdose|take pills|hang myself)\b',
]

CRISIS_RESPONSE = """I hear you, and I want you to know that what you're feeling matters. Please know that you're not alone in this.

If you're having thoughts of hurting yourself, please reach out to a crisis helpline right away:

🇮🇳 **India Crisis Helplines:**
- **iCall**: 9152987821
- **Vandrevala Foundation**: 1860-2662-345
- **NIMHANS**: 080-46110007
- **AASRA**: 9820466726

These are trained professionals who care and want to help. Would you like to talk about what's been making you feel this way?"""

EMOTION_KEYWORDS = {
    'happy': ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'good', 'blessed', 'glad', 'delighted', 'cheerful', 'pleased'],
    'sad': ['sad', 'depressed', 'down', 'unhappy', 'miserable', 'hopeless', 'cry', 'tears', 'heartbroken', 'devastated', 'gloomy'],
    'anxious': ['anxious', 'worried', 'nervous', 'panic', 'afraid', 'scared', 'fear', 'tense', 'uneasy', 'restless', 'on edge'],
    'angry': ['angry', 'mad', 'furious', 'irritated', 'frustrated', 'annoyed', 'rage', 'pissed', 'upset', 'bitter'],
    'stressed': ['stressed', 'overwhelmed', 'pressure', 'burden', 'exhausted', 'tired', 'drained', 'burnt out', 'swamped', 'struggling'],
    'confused': ['confused', 'lost', 'uncertain', 'unsure', 'don\'t know', 'unclear', 'puzzled', 'bewildered'],
    'calm': ['calm', 'peaceful', 'relaxed', 'serene', 'content', 'at ease', 'composed', 'tranquil'],
    'hopeful': ['hopeful', 'optimistic', 'looking forward', 'positive', 'better', 'improving', 'progress', 'encouraged'],
    'lonely': ['lonely', 'alone', 'isolated', 'disconnected', 'abandoned', 'empty', 'solitary'],
}

# Coping exercise recommendations based on emotional state
COPING_RECOMMENDATIONS = {
    'anxious': {
        'category': 'breathing',
        'message': 'Take a breath with me? 💙',
        'exercises': [
            {'name': 'Box Breathing', 'id': 1, 'duration': '2 min'},
            {'name': '4-7-8 Breathing', 'id': 2, 'duration': '3 min'},
        ]
    },
    'stressed': {
        'category': 'breathing',
        'message': 'Let\'s slow down for a sec 💙',
        'exercises': [
            {'name': 'Deep Breathing', 'id': 3, 'duration': '2 min'},
            {'name': 'Body Scan', 'id': 4, 'duration': '5 min'},
        ]
    },
    'sad': {
        'category': 'grounding',
        'message': 'This might help a little 💙',
        'exercises': [
            {'name': '5-4-3-2-1 Grounding', 'id': 5, 'duration': '3 min'},
            {'name': 'Gratitude Moment', 'id': 6, 'duration': '2 min'},
        ]
    },
    'angry': {
        'category': 'relaxation',
        'message': 'Want to let some of that out? 💙',
        'exercises': [
            {'name': 'Progressive Muscle Relaxation', 'id': 7, 'duration': '5 min'},
            {'name': 'Calm Breathing', 'id': 8, 'duration': '2 min'},
        ]
    },
    'lonely': {
        'category': 'mindfulness',
        'message': 'You\'re not alone 💙',
        'exercises': [
            {'name': 'Self-Compassion', 'id': 9, 'duration': '3 min'},
            {'name': 'Loving Kindness', 'id': 10, 'duration': '5 min'},
        ]
    },
    'overwhelmed': {
        'category': 'grounding',
        'message': 'One thing at a time 💙',
        'exercises': [
            {'name': 'Grounding Exercise', 'id': 5, 'duration': '3 min'},
            {'name': 'Simple Breathing', 'id': 1, 'duration': '2 min'},
        ]
    },
}

def get_coping_recommendation(emotion: str, stress_level: str) -> dict | None:
    """Get coping exercise recommendation based on emotion and stress level."""
    # Only recommend for medium/high stress or negative emotions
    if stress_level in ['high', 'medium'] or emotion in COPING_RECOMMENDATIONS:
        recommendation = COPING_RECOMMENDATIONS.get(emotion)
        if recommendation:
            return {
                'show_coping': True,
                'message': recommendation['message'],
                'category': recommendation['category'],
                'exercises': recommendation['exercises']
            }
    return None


def detect_crisis(text: str) -> bool:
    """Detect if the message contains crisis-related content."""
    text_lower = text.lower()
    for pattern in CRISIS_PATTERNS:
        if re.search(pattern, text_lower, re.IGNORECASE):
            return True
    return False


def detect_emotion(text: str) -> str:
    """Detect the primary emotion from the message with intensity scoring."""
    text_lower = text.lower()
    emotion_scores = {}
    
    for emotion, keywords in EMOTION_KEYWORDS.items():
        score = sum(1 for keyword in keywords if keyword in text_lower)
        if score > 0:
            emotion_scores[emotion] = score
    
    if emotion_scores:
        return max(emotion_scores, key=emotion_scores.get)
    return 'neutral'


def analyze_stress_level(text: str) -> dict:
    """Analyze stress indicators in the message."""
    text_lower = text.lower()
    
    high_stress_indicators = ['overwhelmed', 'can\'t handle', 'too much', 'breaking down', 
                              'exhausted', 'burnt out', 'giving up', 'can\'t cope']
    
    medium_stress_indicators = ['stressed', 'pressure', 'worried', 'anxious', 
                                'struggling', 'difficult', 'hard time']
    
    low_stress_indicators = ['calm', 'relaxed', 'okay', 'manageable', 'handling', 
                            'better', 'improving']
    
    high_stress_count = sum(1 for indicator in high_stress_indicators if indicator in text_lower)
    medium_stress_count = sum(1 for indicator in medium_stress_indicators if indicator in text_lower)
    low_stress_count = sum(1 for indicator in low_stress_indicators if indicator in text_lower)
    
    if high_stress_count > 0:
        level = 'high'
    elif medium_stress_count > 0:
        level = 'medium'
    elif low_stress_count > 0:
        level = 'low'
    else:
        level = 'neutral'
    
    return {
        'level': level,
        'indicators_found': high_stress_count + medium_stress_count,
        'positive_indicators': low_stress_count
    }


def detect_conversation_impact(messages: list) -> dict:
    """
    Analyze if the conversation is helping the user feel better.
    Compares emotional tone across messages.
    """
    if len(messages) < 2:
        return {'impact': 'neutral', 'trend': 'starting conversation'}
    
    # Analyze emotional progression
    recent_emotions = []
    stress_levels = []
    
    for msg in messages[-5:]:  # Look at last 5 messages
        if msg['role'] == 'user':
            emotion = detect_emotion(msg['content'])
            stress = analyze_stress_level(msg['content'])
            recent_emotions.append(emotion)
            stress_levels.append(stress['level'])
    
    if not recent_emotions:
        return {'impact': 'neutral', 'trend': 'listening'}
    
    # Check for positive progression
    positive_emotions = ['happy', 'hopeful', 'calm']
    negative_emotions = ['sad', 'anxious', 'angry', 'stressed']
    
    recent_positive = sum(1 for e in recent_emotions[-2:] if e in positive_emotions)
    recent_negative = sum(1 for e in recent_emotions[-2:] if e in negative_emotions)
    
    # Determine impact
    if recent_positive > recent_negative:
        impact = 'positive'
        trend = 'User seems to be feeling lighter'
    elif recent_negative > recent_positive:
        impact = 'concerning'
        trend = 'User may need more support'
    else:
        impact = 'neutral'
        trend = 'User is opening up'
    
    return {
        'impact': impact,
        'trend': trend,
        'recent_emotions': recent_emotions,
        'stress_progression': stress_levels
    }


def get_ai_response(messages: list, user_tone: str = 'friendly', emotion_context: dict = None) -> str:
    """Get response from AI provider (OpenAI or Gemini) with emotion awareness."""
    provider = settings.AI_PROVIDER
    
    # Customize system prompt based on user's preferred tone
    tone_adjustments = {
        'calm': "Be that chill friend who helps them feel grounded. Speak softly, use calming words, and create a peaceful vibe. Like sitting together in comfortable silence.",
        'friendly': "Be your natural warm, chatty self! Like catching up with your best friend over chai. Casual, caring, and real.",
        'minimal': "Keep it short and sweet - like texting a close friend. Brief but meaningful. No fluff, just genuine support.",
    }
    
    system_prompt = settings.DOST_SYSTEM_PROMPT + f"\n\nVibe check: {tone_adjustments.get(user_tone, tone_adjustments['friendly'])}"
    
    # Add emotion context to system prompt if available
    if emotion_context:
        emotion_info = f"\n\nCurrent user emotional state: {emotion_context.get('emotion', 'neutral')}"
        stress_info = f"\nStress level: {emotion_context.get('stress_level', 'unknown')}"
        conversation_impact = emotion_context.get('conversation_impact', {})
        if conversation_impact:
            emotion_info += f"\nConversation impact: {conversation_impact.get('trend', '')}"
        
        system_prompt += emotion_info + stress_info
    
    try:
        if provider == 'openai':
            return _get_openai_response(messages, system_prompt)
        else:
            return _get_gemini_response(messages, system_prompt)
    except Exception as e:
        print(f"AI Error: {e}")
        return "I'm here for you. Sometimes I have trouble finding the right words, but please know that your feelings are valid. Would you like to share more about what's on your mind?"


def _get_openai_response(messages: list, system_prompt: str) -> str:
    """Get response from OpenAI API."""
    from openai import OpenAI
    
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    
    formatted_messages = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        formatted_messages.append({
            "role": msg['role'],
            "content": msg['content']
        })
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=formatted_messages,
        max_tokens=150,
        temperature=0.7,
    )
    
    return response.choices[0].message.content


def _get_gemini_response(messages: list, system_prompt: str) -> str:
    """Get response from Google Gemini API."""
    import google.generativeai as genai
    
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    # Format conversation history
    conversation_text = f"System Instructions: {system_prompt}\n\n"
    for msg in messages:
        role = "User" if msg['role'] == 'user' else "Dost"
        conversation_text += f"{role}: {msg['content']}\n"
    conversation_text += "Dost:"
    
    response = model.generate_content(conversation_text)
    return response.text


def get_chat_response(user_message: str, conversation_history: list, user_tone: str = 'friendly') -> dict:
    """
    Main function to get chat response with crisis detection, emotion analysis, and stress tracking.
    
    Returns:
        dict with 'response', 'is_crisis', 'detected_emotion', 'stress_level', 'conversation_impact', and 'coping_suggestion'
    """
    # Check for crisis content first
    is_crisis = detect_crisis(user_message)
    
    if is_crisis:
        return {
            'response': CRISIS_RESPONSE,
            'is_crisis': True,
            'detected_emotion': 'distressed',
            'stress_level': 'critical',
            'conversation_impact': {'impact': 'crisis', 'trend': 'immediate support needed'},
            'coping_suggestion': None
        }
    
    # Detect emotion
    detected_emotion = detect_emotion(user_message)
    
    # Analyze stress level
    stress_analysis = analyze_stress_level(user_message)
    
    # Analyze conversation impact
    conversation_impact = detect_conversation_impact(conversation_history)
    
    # Get coping recommendation based on emotion/stress
    coping_suggestion = get_coping_recommendation(detected_emotion, stress_analysis['level'])
    
    # Prepare emotion context for AI
    emotion_context = {
        'emotion': detected_emotion,
        'stress_level': stress_analysis['level'],
        'conversation_impact': conversation_impact
    }
    
    # Get AI response with emotion awareness
    messages = conversation_history + [{'role': 'user', 'content': user_message}]
    ai_response = get_ai_response(messages, user_tone, emotion_context)
    
    return {
        'response': ai_response,
        'is_crisis': False,
        'detected_emotion': detected_emotion,
        'stress_level': stress_analysis['level'],
        'conversation_impact': conversation_impact,
        'coping_suggestion': coping_suggestion
    }
