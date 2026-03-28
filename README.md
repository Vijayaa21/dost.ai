# 🌱 Dost AI - Mental Health Companion Chatbot

> Your supportive AI friend for emotional wellness, mood tracking, journaling, and coping strategies.

![Dost AI](https://img.shields.io/badge/Dost-AI-6366f1?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.10+-blue?style=flat-square)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square)

## 📸 Screenshots

### Home Dashboard
![Home Dashboard](./docs/screenshots/home-dashboard.jpg)

*Beautiful watercolor-inspired home page with daily mood check-in, affirmations, and quick access to coping tools.*

### Quick Tools
![Quick Tools](./docs/screenshots/quick-tools.jpg)

*Easy access to breathing exercises and zen sounds for instant calm.*

## ✨ Features

### 🗣️ AI Conversational Support
- Natural, empathetic conversations powered by OpenAI/Gemini
- Emotion-aware responses
- Contextual memory per user
- Crisis detection & safe escalation

### 📊 Mood Tracking & Analytics
- Daily mood check-ins with emojis
- Weekly & monthly emotional insights
- Mood trends visualization
- Emotion pattern detection

### 📔 Journaling with AI Reflection
- Free-text journaling
- AI-powered summaries and reflections
- Emotion tagging
- Writing prompts

### 🧘 Coping Tools & Wellness Exercises
- Breathing exercises (4-7-8, Box Breathing)
- Grounding techniques (5-4-3-2-1)
- Mindfulness exercises
- Daily affirmations

### 🔐 Privacy & Safety
- Secure authentication (JWT)
- Delete data anytime
- Crisis resources (India helplines)
- No diagnosis or medical advice

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 4.2 + Django Rest Framework
- **Authentication**: JWT (SimpleJWT)
- **Database**: SQLite (local fallback) / Neon Serverless PostgreSQL
- **AI**: OpenAI API / Google Gemini API
- **Real-time**: Django Channels

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **State**: Zustand
- **Routing**: React Router v6

## 📁 Project Structure

```
dost.ai/
├── backend/
│   ├── dost/           # Django project settings
│   ├── users/          # User authentication & profiles
│   ├── chat/           # AI chat functionality
│   ├── mood/           # Mood tracking
│   ├── journal/        # Journaling feature
│   ├── coping/         # Coping tools & exercises
│   ├── manage.py
│   ├── requirements.txt
│   └── seed_data.py    # Initial data for coping tools
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API service functions
│   │   ├── store/      # Zustand state management
│   │   ├── types/      # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
copy .env.example .env  # Windows
# cp .env.example .env  # macOS/Linux

# Edit .env and add your API keys
# GEMINI_API_KEY=your-gemini-api-key
# or
# OPENAI_API_KEY=your-openai-api-key

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Seed coping tools data
python manage.py shell < seed_data.py

# Run server
python manage.py runserver
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Access the App
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- Admin Panel: http://localhost:8000/admin

## 🔑 Environment Variables

### Backend (.env)
```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# AI Provider (openai or gemini)
AI_PROVIDER=gemini
OPENAI_API_KEY=your-openai-key
GEMINI_API_KEY=your-gemini-key

# Database (Neon Serverless Postgres)
DATABASE_URL=postgresql://<user>:<password>@<neon-host>/<database>?sslmode=require
DB_SSL_REQUIRE=True
DB_CONN_MAX_AGE=600

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login (returns JWT)
- `POST /api/auth/refresh/` - Refresh token
- `GET /api/auth/profile/` - Get user profile
- `POST /api/auth/onboarding/` - Complete onboarding

### Chat
- `GET /api/chat/conversations/` - List conversations
- `POST /api/chat/send/` - Send message & get AI response
- `DELETE /api/chat/conversations/{id}/` - Delete conversation

### Mood
- `GET /api/mood/entries/` - List mood entries
- `POST /api/mood/entries/` - Create mood entry
- `GET /api/mood/stats/` - Get mood statistics
- `GET /api/mood/today/` - Get today's mood

### Journal
- `GET /api/journal/entries/` - List journal entries
- `POST /api/journal/entries/` - Create entry
- `GET /api/journal/prompt/` - Get writing prompt

### Coping Tools
- `GET /api/coping/tools/` - List coping tools
- `GET /api/coping/affirmation/` - Get daily affirmation
- `GET /api/coping/recommend/` - Get recommended tool

## 🎨 Design System

### Colors
- **Primary**: Indigo (#6366f1)
- **Lavender**: Purple (#a855f7)
- **Calm Blue**: #89CFF0
- **Calm Green**: #98D8C8
- **Cream**: #FFF8E7

### Typography
- Font: Inter (Google Fonts)
- Rounded, friendly UI elements

## 🚨 Crisis Resources (India)

If someone expresses crisis thoughts, the app provides:
- **iCall**: 9152987821
- **Vandrevala Foundation**: 1860-2662-345
- **NIMHANS**: 080-46110007
- **AASRA**: 9820466726

## ⚠️ Disclaimer

Dost AI is **not a replacement for professional mental health care**. It is designed to be a supportive companion, not a therapist. If you're experiencing a mental health emergency, please contact a professional or call emergency services.

## 📝 License

MIT License - See LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Made with 💙 for mental wellness.
