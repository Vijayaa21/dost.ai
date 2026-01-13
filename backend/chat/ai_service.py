"""
AI Service for Dost AI - Handles communication with OpenAI/Gemini/Groq APIs.
Enhanced with therapeutic conversation techniques and fallback responses.
"""
import os
import re
import random
from django.conf import settings

# Crisis detection patterns
CRISIS_PATTERNS = [
    r'\b(suicide|suicidal|kill myself|end my life|want to die|better off dead)\b',
    r'\b(self.?harm|hurt myself|cutting|cutting myself)\b',
    r'\b(no reason to live|can\'t go on|give up on life)\b',
    r'\b(overdose|take pills|hang myself)\b',
]

CRISIS_RESPONSE = """I hear you, and I want you to know that what you're feeling matters. This sounds really serious, and I care about your safety 💙

Please reach out to someone who can help you through this right now:

🇮🇳 **India Crisis Helplines:**
- **iCall**: 9152987821
- **Vandrevala Foundation**: 1860-2662-345
- **NIMHANS**: 080-46110007
- **AASRA**: 9820466726

These are trained professionals who understand what you're going through. You don't have to face this alone.

I'm here too. Would you like to tell me what's been bringing up these thoughts?"""

EMOTION_KEYWORDS = {
    'happy': ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'good', 'blessed', 'glad', 'delighted', 'cheerful', 'pleased', 'grateful', 'thankful'],
    'sad': ['sad', 'depressed', 'down', 'unhappy', 'miserable', 'hopeless', 'cry', 'tears', 'heartbroken', 'devastated', 'gloomy', 'grief', 'loss', 'miss'],
    'anxious': ['anxious', 'worried', 'nervous', 'panic', 'afraid', 'scared', 'fear', 'tense', 'uneasy', 'restless', 'on edge', 'dread', 'apprehensive'],
    'angry': ['angry', 'mad', 'furious', 'irritated', 'frustrated', 'annoyed', 'rage', 'pissed', 'upset', 'bitter', 'resentful'],
    'stressed': ['stressed', 'overwhelmed', 'pressure', 'burden', 'exhausted', 'tired', 'drained', 'burnt out', 'swamped', 'struggling', 'too much'],
    'confused': ['confused', 'lost', 'uncertain', 'unsure', 'don\'t know', 'unclear', 'puzzled', 'bewildered', 'stuck', 'trapped'],
    'calm': ['calm', 'peaceful', 'relaxed', 'serene', 'content', 'at ease', 'composed', 'tranquil'],
    'hopeful': ['hopeful', 'optimistic', 'looking forward', 'positive', 'better', 'improving', 'progress', 'encouraged'],
    'lonely': ['lonely', 'alone', 'isolated', 'disconnected', 'abandoned', 'empty', 'solitary', 'nobody understands', 'no one cares'],
    'ashamed': ['ashamed', 'embarrassed', 'guilty', 'shame', 'regret', 'stupid', 'worthless', 'failure', 'can\'t do anything right'],
}

# Therapeutic responses based on emotion
EMOTION_THERAPEUTIC_CONTEXT = {
    'anxious': {
        'approach': 'ground them in present, normalize the anxiety, help identify what specifically they\'re worried about',
        'techniques': ['grounding', 'breathing', 'cognitive reframing'],
        'sample_openings': [
            "Anxiety can feel so overwhelming. Let's slow down together.",
            "That sounds really unsettling. Your body is trying to protect you, even if it doesn't feel that way.",
        ]
    },
    'sad': {
        'approach': 'create space for grief, validate without rushing to fix, explore the loss or disappointment',
        'techniques': ['validation', 'compassionate presence', 'gentle exploration'],
        'sample_openings': [
            "I can hear the heaviness in what you're sharing.",
            "It takes courage to acknowledge when we're hurting.",
        ]
    },
    'angry': {
        'approach': 'validate the anger as a messenger, explore what need isn\'t being met, help identify what\'s underneath',
        'techniques': ['validation', 'needs identification', 'gentle exploration'],
        'sample_openings': [
            "It sounds like something really crossed a line for you.",
            "That frustration makes complete sense given what happened.",
        ]
    },
    'stressed': {
        'approach': 'help break down the overwhelm, focus on one thing at a time, acknowledge the load they\'re carrying',
        'techniques': ['chunking', 'prioritization', 'self-compassion'],
        'sample_openings': [
            "You're carrying a lot right now.",
            "When everything feels urgent, it's hard to know where to start.",
        ]
    },
    'lonely': {
        'approach': 'remind them of connection, validate the pain of disconnection, explore what kind of connection they need',
        'techniques': ['connection reminder', 'validation', 'needs exploration'],
        'sample_openings': [
            "Feeling disconnected is one of the hardest things.",
            "I'm glad you're sharing this with me - you're not alone in this moment.",
        ]
    },
    'ashamed': {
        'approach': 'externalize the shame, challenge the inner critic, build self-compassion',
        'techniques': ['self-compassion', 'cognitive reframing', 'normalize'],
        'sample_openings': [
            "That inner critic sounds really loud right now.",
            "What you're feeling is so human. We all have moments like this.",
        ]
    },
    'confused': {
        'approach': 'help organize thoughts, validate uncertainty, explore what clarity would look like',
        'techniques': ['reflection', 'exploration', 'clarity building'],
        'sample_openings': [
            "It's okay to not have all the answers right now.",
            "Sitting with uncertainty is really uncomfortable.",
        ]
    },
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

# Rule-based fallback responses when AI API fails
FALLBACK_RESPONSES = {
    'greetings': {
        'patterns': ['hi', 'hello', 'hey', 'hii', 'heyy', 'heyyy', 'hiya', 'howdy', 'sup', 'yo'],
        'responses': [
            "Hey there! 💙 How are you feeling today?",
            "Hi! I'm glad you're here. What's on your mind?",
            "Hello! 💜 How's your heart doing today?",
            "Hey! It's good to see you. How are things going?",
            "Hi there! 💙 I'm here for you. What would you like to talk about?",
        ]
    },
    'how_are_you': {
        'patterns': ['how are you', 'how r u', 'how you doing', 'whats up', 'wassup', 'how do you feel'],
        'responses': [
            "I'm here and ready to listen to you 💙 But more importantly, how are *you* doing?",
            "Thanks for asking! I'm always here for you. How are you feeling today?",
            "I'm doing well, but I'd love to hear about you. What's going on in your world?",
            "I appreciate you asking 💜 I'm here to support you. How's everything with you?",
        ]
    },
    'good': {
        'patterns': ['good', 'great', 'fine', 'okay', 'ok', 'doing well', 'not bad', 'alright', 'im good', 'i am good'],
        'responses': [
            "That's wonderful to hear! 😊 What's been making things good for you?",
            "I'm glad you're doing okay! Anything in particular contributing to that?",
            "Nice! 💙 Is there anything on your mind you'd like to share, or just enjoying the moment?",
            "That's great! Sometimes it's nice to just check in when things are going well too 😊",
        ]
    },
    'sad': {
        'patterns': ['sad', 'down', 'unhappy', 'depressed', 'low', 'feeling down', 'not good', 'bad', 'terrible', 'awful'],
        'responses': [
            "I'm sorry you're feeling this way 💙 It takes courage to share that. What's weighing on you?",
            "That sounds really tough. I'm here to listen. Would you like to tell me more about what's going on?",
            "I hear you 💜 Sometimes we just need someone to sit with us in the hard moments. What's been happening?",
            "It's okay to not be okay. Thank you for being honest with me. What's been bringing you down?",
        ]
    },
    'anxious': {
        'patterns': ['anxious', 'worried', 'nervous', 'stressed', 'panic', 'overwhelmed', 'scared', 'afraid', 'anxiety'],
        'responses': [
            "Anxiety can feel so overwhelming 💙 Take a breath with me. What's making you feel this way?",
            "I hear you - that anxious feeling is really uncomfortable. What's on your mind right now?",
            "It's okay to feel anxious. Your feelings are valid 💜 Can you tell me more about what's causing this?",
            "Let's slow down together for a moment. What's the biggest worry on your mind right now?",
        ]
    },
    'angry': {
        'patterns': ['angry', 'mad', 'furious', 'frustrated', 'annoyed', 'irritated', 'pissed'],
        'responses': [
            "It sounds like something really got to you. That frustration is completely valid 💙 What happened?",
            "Anger is a powerful emotion - it usually tells us something important. What triggered this feeling?",
            "I can hear the frustration in your words 💜 Do you want to vent about what's bothering you?",
            "That sounds really frustrating. Sometimes we just need to let it out. I'm here to listen.",
        ]
    },
    'lonely': {
        'patterns': ['lonely', 'alone', 'isolated', 'no friends', 'nobody', 'no one', 'disconnected'],
        'responses': [
            "Loneliness can be so painful 💙 I want you to know that you're not alone right now - I'm here with you.",
            "That feeling of disconnection is really hard. Thank you for reaching out 💜 What's been going on?",
            "I'm glad you're talking to me. Even in lonely moments, connection is possible. Tell me more?",
            "Feeling alone is one of the hardest things. But you reached out, and that matters 💙 What's on your heart?",
        ]
    },
    'tired': {
        'patterns': ['tired', 'exhausted', 'drained', 'burnt out', 'no energy', 'sleepy', 'fatigue'],
        'responses': [
            "Being exhausted is so draining - emotionally and physically 💙 What's been taking your energy?",
            "That sounds like a lot to carry. Sometimes rest is the most important thing. What's been wearing you out?",
            "Burnout is real and it's hard 💜 Have you been able to take any time for yourself?",
            "I hear you - exhaustion can make everything feel harder. What's been going on?",
        ]
    },
    'confused': {
        'patterns': ['confused', 'lost', 'unsure', 'don\'t know', 'uncertain', 'stuck'],
        'responses': [
            "It's okay to feel uncertain 💙 Sometimes clarity comes from talking things through. What's on your mind?",
            "Being confused is uncomfortable, but it's also okay. What are you trying to figure out?",
            "Feeling stuck can be frustrating 💜 Let's explore this together. What's making you feel lost?",
            "Uncertainty is part of being human. I'm here to help you think through things. What's confusing you?",
        ]
    },
    'grateful': {
        'patterns': ['grateful', 'thankful', 'blessed', 'appreciate', 'thank you', 'thanks'],
        'responses': [
            "That's beautiful 💙 Gratitude is such a powerful feeling. What are you thankful for?",
            "I love that you're feeling grateful! What's bringing up those feelings?",
            "Appreciation is wonderful 💜 Tell me more about what's making you feel this way!",
            "That warms my heart to hear 💙 What's been going well for you?",
        ]
    },
    'default': {
        'responses': [
            "I hear you 💙 Tell me more about what's going on?",
            "Thanks for sharing that with me. How does that make you feel?",
            "I'm listening 💜 What else is on your mind?",
            "That's interesting. Can you tell me more about that?",
            "I appreciate you opening up. What would help you feel better right now?",
            "I'm here for you 💙 Is there something specific you'd like to talk about?",
            "Thanks for trusting me with this. What's the most important thing on your mind?",
            "I want to understand better. Can you share a bit more about how you're feeling?",
        ]
    }
}

def get_fallback_response(user_message: str, emotion: str = 'neutral') -> str:
    """Generate a rule-based response when AI APIs fail."""
    message_lower = user_message.lower().strip()
    
    # Check for greetings first
    for pattern in FALLBACK_RESPONSES['greetings']['patterns']:
        if message_lower == pattern or message_lower.startswith(pattern + ' ') or message_lower.startswith(pattern + ','):
            return random.choice(FALLBACK_RESPONSES['greetings']['responses'])
    
    # Check for "how are you" type messages
    for pattern in FALLBACK_RESPONSES['how_are_you']['patterns']:
        if pattern in message_lower:
            return random.choice(FALLBACK_RESPONSES['how_are_you']['responses'])
    
    # Check emotion-based patterns
    emotion_categories = ['good', 'sad', 'anxious', 'angry', 'lonely', 'tired', 'confused', 'grateful']
    for category in emotion_categories:
        if category in FALLBACK_RESPONSES:
            for pattern in FALLBACK_RESPONSES[category]['patterns']:
                if pattern in message_lower:
                    return random.choice(FALLBACK_RESPONSES[category]['responses'])
    
    # If we detected an emotion from keywords, use appropriate response
    if emotion in ['sad', 'anxious', 'angry', 'lonely', 'stressed']:
        emotion_map = {
            'sad': 'sad',
            'anxious': 'anxious',
            'angry': 'angry',
            'lonely': 'lonely',
            'stressed': 'anxious'
        }
        category = emotion_map.get(emotion, 'default')
        if category in FALLBACK_RESPONSES and 'responses' in FALLBACK_RESPONSES[category]:
            return random.choice(FALLBACK_RESPONSES[category]['responses'])
    
    # Default response
    return random.choice(FALLBACK_RESPONSES['default']['responses'])


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
    """Get response from AI provider with fallback to rule-based responses."""
    provider = settings.AI_PROVIDER
    
    # Get the last user message for fallback
    last_user_message = ""
    detected_emotion = "neutral"
    if messages:
        for msg in reversed(messages):
            if msg.get('role') == 'user':
                last_user_message = msg.get('content', '')
                break
    
    if emotion_context:
        detected_emotion = emotion_context.get('emotion', 'neutral')
    
    # Customize system prompt based on user's preferred tone
    tone_adjustments = {
        'calm': "Be that gentle, grounding presence. Speak softly, use calming words, and create a peaceful vibe. Help them feel safe and centered.",
        'friendly': "Be your natural warm, supportive self. Like talking to a wise friend who really gets it. Caring, insightful, but still conversational.",
        'minimal': "Keep responses brief but meaningful. Short sentences, clear empathy. Quality over quantity.",
    }
    
    system_prompt = settings.DOST_SYSTEM_PROMPT + f"\n\nTone for this conversation: {tone_adjustments.get(user_tone, tone_adjustments['friendly'])}"
    
    # Add enhanced emotion context to system prompt
    if emotion_context:
        emotion = emotion_context.get('emotion', 'neutral')
        emotion_info = f"\n\n**CURRENT EMOTIONAL STATE:** {emotion}"
        
        # Add therapeutic guidance based on detected emotion
        if emotion in EMOTION_THERAPEUTIC_CONTEXT:
            therapeutic_info = EMOTION_THERAPEUTIC_CONTEXT[emotion]
            emotion_info += f"\n**Therapeutic Approach:** {therapeutic_info['approach']}"
            emotion_info += f"\n**Techniques to consider:** {', '.join(therapeutic_info['techniques'])}"
        
        stress_level = emotion_context.get('stress_level', 'unknown')
        emotion_info += f"\n**Stress level:** {stress_level}"
        
        if stress_level == 'high':
            emotion_info += "\n**Note:** User is highly stressed - be extra gentle, keep responses focused, prioritize validation before anything else."
        
        conversation_impact = emotion_context.get('conversation_impact', {})
        if conversation_impact:
            trend = conversation_impact.get('trend', '')
            emotion_info += f"\n**Conversation trend:** {trend}"
            
            if conversation_impact.get('impact') == 'concerning':
                emotion_info += "\n**Note:** User may need extra support - focus on validation and creating safety."
            elif conversation_impact.get('impact') == 'positive':
                emotion_info += "\n**Note:** User seems to be responding well - continue current approach."
        
        system_prompt += emotion_info
    
    # Try AI providers in order of preference
    providers_to_try = []
    
    # Add configured provider first
    if provider == 'openai' and getattr(settings, 'OPENAI_API_KEY', ''):
        providers_to_try.append('openai')
    elif provider == 'gemini' and getattr(settings, 'GEMINI_API_KEY', ''):
        providers_to_try.append('gemini')
    
    # Add Groq as free fallback (very generous free tier)
    if getattr(settings, 'GROQ_API_KEY', ''):
        providers_to_try.append('groq')
    
    # Add other providers as fallback
    if 'gemini' not in providers_to_try and getattr(settings, 'GEMINI_API_KEY', ''):
        providers_to_try.append('gemini')
    if 'openai' not in providers_to_try and getattr(settings, 'OPENAI_API_KEY', ''):
        providers_to_try.append('openai')
    
    # Try each provider
    for prov in providers_to_try:
        try:
            if prov == 'openai':
                return _get_openai_response(messages, system_prompt)
            elif prov == 'gemini':
                return _get_gemini_response(messages, system_prompt)
            elif prov == 'groq':
                return _get_groq_response(messages, system_prompt)
        except Exception as e:
            print(f"{prov.upper()} API Error: {e}")
            continue
    
    # All AI providers failed - use rule-based fallback
    print("All AI providers failed, using rule-based fallback")
    return get_fallback_response(last_user_message, detected_emotion)


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
        model="gpt-4o-mini",  # Better for nuanced emotional responses
        messages=formatted_messages,
        max_tokens=250,  # Allow slightly longer responses for therapeutic quality
        temperature=0.8,  # Slightly more creative for natural conversation
    )
    
    return response.choices[0].message.content


def _get_gemini_response(messages: list, system_prompt: str) -> str:
    """Get response from Google Gemini API."""
    from google import genai
    
    client = genai.Client(api_key=settings.GEMINI_API_KEY)
    
    # Format conversation history with system prompt
    conversation_text = f"System Instructions: {system_prompt}\n\nConversation:\n"
    for msg in messages:
        role = "User" if msg['role'] == 'user' else "Dost"
        conversation_text += f"{role}: {msg['content']}\n"
    conversation_text += "Dost:"
    
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents=conversation_text
    )
    return response.text


def _get_groq_response(messages: list, system_prompt: str) -> str:
    """Get response from Groq API (free tier with generous limits)."""
    import requests
    
    api_key = getattr(settings, 'GROQ_API_KEY', '')
    if not api_key:
        raise ValueError("GROQ_API_KEY not configured")
    
    formatted_messages = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        formatted_messages.append({
            "role": msg['role'],
            "content": msg['content']
        })
    
    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        json={
            "model": "llama-3.3-70b-versatile",  # Free, fast, and good for conversation
            "messages": formatted_messages,
            "max_tokens": 250,
            "temperature": 0.8
        },
        timeout=30
    )
    
    if response.status_code != 200:
        raise Exception(f"Groq API error: {response.status_code} - {response.text}")
    
    return response.json()['choices'][0]['message']['content']


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
