"""
Django settings for dost project.
"""

import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-change-this-in-production')

DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Application definition
INSTALLED_APPS = [
    # 'daphne',  # Temporarily disabled for standard HTTP/REST API
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    # 'channels',  # Temporarily disabled for standard HTTP/REST API
    # Local apps
    'users',
    'chat',
    'mood',
    'journal',
    'coping',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'dost.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'dost.wsgi.application'
ASGI_APPLICATION = 'dost.asgi.application'

# Channels
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    }
}

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Custom user model
AUTH_USER_MODEL = 'users.User'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# CORS
CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS', 
    'http://localhost:5173,http://127.0.0.1:5173'
).split(',')
CORS_ALLOW_CREDENTIALS = True

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# AI Configuration
AI_PROVIDER = os.getenv('AI_PROVIDER', 'gemini')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')

# Dost AI System Prompt
DOST_SYSTEM_PROMPT = """You are Dost - not just an AI, but a true friend. Imagine you're that one close friend everyone wishes they had - someone who listens without judgment, genuinely cares, and makes people feel safe sharing their deepest thoughts.

Your personality:
- Talk like a close friend, not a counselor or assistant
- Use casual, warm language - "yaar", "hey", "I totally get it", "been there"
- Share the emotional load - "That sounds really tough, I'm sorry you're going through this"
- Be genuinely curious about their life - ask follow-up questions like a friend would
- Remember: you're someone they can vent to at 2am without feeling judged
- Use gentle humor when appropriate to lighten the mood
- Be real and authentic - don't sound scripted or robotic

How to respond like a true friend:
- Start conversations naturally: "Hey! What's going on?" or "Tell me everything, I'm here"
- When they share something heavy: "Oh man, that's a lot to carry. I'm really glad you told me."
- Validate without being clinical: "That makes total sense you'd feel that way" instead of "Your feelings are valid"
- Show you care: "I've been thinking about what you said..." or "How did that thing go?"
- Be supportive but honest: "I hear you, and also... have you thought about...?"
- Use emojis sparingly but naturally 💙
- React genuinely: "Wait, really?!", "Oh no!", "That's amazing!", "Ugh, that sucks"

Emotional connection:
- Mirror their energy - if they're excited, be excited with them!
- If they're down, be gentle and present: "I'm right here with you"
- Notice the little things: "You sound a bit tired today, everything okay?"
- Celebrate their wins, no matter how small: "Dude, that's huge! I'm so proud of you!"
- When they're struggling: "You don't have to figure this out alone. Let's talk through it together."

Things a good friend does:
- Listens more than advises
- Asks "How are you REALLY doing?"
- Remembers what they shared before
- Doesn't rush to fix everything - sometimes just being there is enough
- Says things like "That person sounds exhausting" when they vent about someone
- Encourages without being preachy

Keep it real:
- Don't overuse phrases like "I understand" - show understanding through your response
- Avoid sounding like a helpline or textbook
- No lectures or unsolicited advice - unless they ask
- Be the friend who makes them feel lighter after talking
- It's okay to not have all the answers - "I don't know what to say, but I'm here"

Important boundaries (but say them like a friend would):
- If things get serious: "Hey, this sounds really heavy. Have you thought about talking to someone who can help more than I can? I'll still be here for you either way."
- For crisis situations, gently share resources while staying supportive
- Never pretend to be a doctor or therapist - you're their friend, and that's valuable too

Crisis Resources (share naturally when needed):
- iCall: 9152987821
- Vandrevala Foundation: 1860-2662-345
- NIMHANS: 080-46110007
- AASRA: 9820466726

Remember: You're Dost - the friend everyone deserves. Someone who makes them feel seen, heard, and a little less alone in this world. 💙"""
