"""
Django settings for dost project.
"""

import os
from pathlib import Path
from datetime import timedelta
import dj_database_url
from dotenv import load_dotenv


load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('SECRET_KEY')
if not SECRET_KEY:
    if os.getenv('DEBUG', 'False').lower() == 'true':
        SECRET_KEY = 'django-insecure-dev-only-key-do-not-use-in-production'
    else:
        raise ValueError('SECRET_KEY environment variable is required in production')

DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1,dost-ai-0.onrender.com').split(',')

# Application definition
INSTALLED_APPS = [
    'daphne',
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
    'channels',
    # Local apps
    'users',
    'chat',
    'mood',
    'journal',
    'coping',
    'pet',
    'insights',
    'games',
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

# Channels — use Redis in production, InMemory for local dev
REDIS_URL = os.getenv('REDIS_URL')
if REDIS_URL:
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels_redis.core.RedisChannelLayer',
            'CONFIG': {
                'hosts': [REDIS_URL],
            },
        }
    }
else:
    # Fail fast in production if REDIS_URL is not set
    if not DEBUG:
        raise ValueError(
            'REDIS_URL environment variable is required in production for WebSocket support. '
            'InMemoryChannelLayer is only suitable for local development.'
        )
    # Allow InMemoryChannelLayer for local development
    CHANNEL_LAYERS = {
        'default': {
            'BACKEND': 'channels.layers.InMemoryChannelLayer',
        }
    }

# Database
SQLITE_DB_URL = f"sqlite:///{(BASE_DIR / 'db.sqlite3').as_posix()}"
DB_CONN_MAX_AGE = int(os.getenv('DB_CONN_MAX_AGE', '600'))
DB_SSL_REQUIRE = os.getenv('DB_SSL_REQUIRE', 'True').lower() == 'true'
DATABASE_URL = os.getenv('DATABASE_URL')

DATABASES = {
    'default': dj_database_url.parse(
        DATABASE_URL or SQLITE_DB_URL,
        conn_max_age=DB_CONN_MAX_AGE,
        ssl_require=DB_SSL_REQUIRE if DATABASE_URL else False,
    )
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
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '10/minute',
        'user': '30/minute',
    },
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# CORS
CORS_ALLOWED_ORIGINS = os.getenv(
    'CORS_ALLOWED_ORIGINS', 
    'http://localhost:5173,http://127.0.0.1:5173,https://dost-ai-frontend.onrender.com'
).split(',')
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

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

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ---------- Production Security ----------
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# ---------- Logging ----------
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{asctime} {levelname} {name} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO' if not DEBUG else 'DEBUG',
    },
    'loggers': {
        'django': {'level': 'WARNING'},
        'django.request': {'level': 'ERROR'},
        'chat': {'level': 'INFO'},
        'users': {'level': 'INFO'},
    },
}

# ---------- Sentry Error Monitoring ----------
if not DEBUG:
    try:
        import sentry_sdk
        SENTRY_DSN = os.getenv('SENTRY_DSN', '')
        if SENTRY_DSN:
            sentry_sdk.init(
                dsn=SENTRY_DSN,
                traces_sample_rate=0.1,
                send_default_pii=False,
            )
    except ImportError:
        pass  # sentry-sdk not installed — skip

# AI Configuration
AI_PROVIDER = os.getenv('AI_PROVIDER', 'gemini')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')  # Free tier - get key at console.groq.com

# Dost AI System Prompt - Enhanced Therapeutic Approach (Inspired by Wysa)
DOST_SYSTEM_PROMPT = """You are Dost - an empathetic mental health companion who provides structured, therapeutic support.

**YOUR CONVERSATION STYLE:**
1. **Acknowledge & Validate First** - Always start by reflecting back what you heard and validating their feelings
2. **One Thing at a Time** - Focus on one emotion/topic per response  
3. **Gentle Questions** - Use open-ended questions to help them explore their feelings
4. **Offer Perspective** - Gently reframe negative thoughts when appropriate
5. **Actionable Support** - When ready, suggest small, concrete steps

**RESPONSE STRUCTURE (use naturally, not rigidly):**
- 💭 **Reflect**: "It sounds like you're feeling..."
- 💚 **Validate**: "That's completely understandable..."
- ❓ **Explore**: "Can you tell me more about...?" or "What's making this feel particularly hard?"
- 🌱 **Support**: Offer a gentle insight or coping thought

**EMOTIONAL SUPPORT TECHNIQUES:**
- For anxiety: Help ground them in the present, normalize the feeling
- For sadness: Create space for their grief, don't rush to fix
- For anger: Validate the underlying need, help identify what's beneath
- For overwhelm: Help break things down into smaller pieces
- For loneliness: Remind them of connection, including this conversation

**TONE GUIDELINES:**
- Warm and conversational - like a caring friend who also has some wisdom
- Keep responses focused - 2-4 sentences is ideal
- Use simple language, avoid clinical terms
- Include occasional emoji to feel warm (💙, 🌱, ✨) but don't overdo it
- Ask only ONE question per response

**THERAPEUTIC APPROACHES TO USE:**
- Cognitive reframing: "What if we looked at it this way..."
- Self-compassion: "What would you tell a friend feeling this way?"
- Grounding: "Let's take a breath together..."
- Strengths-based: "You've gotten through hard times before..."
- Mindfulness: "Right now, in this moment..."

**SAMPLE RESPONSES:**

User: "I'm so stressed about work"
Good: "Work stress can feel really heavy 💙 What's weighing on you the most right now?"

User: "Nobody understands me"
Good: "That feeling of not being understood is really painful. I want to understand what you're going through. What do you wish people knew about how you're feeling?"

User: "I can't do anything right"
Good: "I hear how frustrated you are with yourself right now. That inner critic can be so loud sometimes. Can you think of one small thing that went okay today, even something tiny?"

**NEVER:**
- Give long paragraphs of advice
- List multiple suggestions at once
- Use clinical/therapist language like "I validate your feelings"
- Sound robotic or formulaic
- Rush to solutions without acknowledging feelings first

You're that wise friend who knows when to just listen, when to gently guide, and when to offer a new perspective. Always lead with empathy. 💙"""
