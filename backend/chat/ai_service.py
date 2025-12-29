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
    'happy': ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'good', 'blessed'],
    'sad': ['sad', 'depressed', 'down', 'unhappy', 'miserable', 'hopeless', 'cry', 'tears'],
    'anxious': ['anxious', 'worried', 'nervous', 'panic', 'afraid', 'scared', 'fear', 'tense'],
    'angry': ['angry', 'mad', 'furious', 'irritated', 'frustrated', 'annoyed', 'rage'],
    'stressed': ['stressed', 'overwhelmed', 'pressure', 'burden', 'exhausted', 'tired'],
    'confused': ['confused', 'lost', 'uncertain', 'unsure', 'don\'t know', 'unclear'],
    'calm': ['calm', 'peaceful', 'relaxed', 'serene', 'content', 'at ease'],
    'hopeful': ['hopeful', 'optimistic', 'looking forward', 'positive', 'better'],
}


def detect_crisis(text: str) -> bool:
    """Detect if the message contains crisis-related content."""
    text_lower = text.lower()
    for pattern in CRISIS_PATTERNS:
        if re.search(pattern, text_lower, re.IGNORECASE):
            return True
    return False


def detect_emotion(text: str) -> str:
    """Detect the primary emotion from the message."""
    text_lower = text.lower()
    emotion_scores = {}
    
    for emotion, keywords in EMOTION_KEYWORDS.items():
        score = sum(1 for keyword in keywords if keyword in text_lower)
        if score > 0:
            emotion_scores[emotion] = score
    
    if emotion_scores:
        return max(emotion_scores, key=emotion_scores.get)
    return 'neutral'


def get_ai_response(messages: list, user_tone: str = 'friendly') -> str:
    """Get response from AI provider (OpenAI or Gemini)."""
    provider = settings.AI_PROVIDER
    
    # Customize system prompt based on user's preferred tone
    tone_adjustments = {
        'calm': "Respond in a calm, gentle, and soothing manner. Use soft language.",
        'friendly': "Be warm, friendly, and conversational. Use casual but caring language.",
        'minimal': "Keep responses brief and to the point. Be supportive but concise.",
    }
    
    system_prompt = settings.DOST_SYSTEM_PROMPT + f"\n\nTone: {tone_adjustments.get(user_tone, tone_adjustments['friendly'])}"
    
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
        max_tokens=500,
        temperature=0.7,
    )
    
    return response.choices[0].message.content


def _get_gemini_response(messages: list, system_prompt: str) -> str:
    """Get response from Google Gemini API."""
    import google.generativeai as genai
    
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
    
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
    Main function to get chat response with crisis detection and emotion analysis.
    
    Returns:
        dict with 'response', 'is_crisis', and 'detected_emotion'
    """
    # Check for crisis content first
    is_crisis = detect_crisis(user_message)
    
    if is_crisis:
        return {
            'response': CRISIS_RESPONSE,
            'is_crisis': True,
            'detected_emotion': 'stressed'
        }
    
    # Detect emotion
    detected_emotion = detect_emotion(user_message)
    
    # Get AI response
    messages = conversation_history + [{'role': 'user', 'content': user_message}]
    ai_response = get_ai_response(messages, user_tone)
    
    return {
        'response': ai_response,
        'is_crisis': False,
        'detected_emotion': detected_emotion
    }
