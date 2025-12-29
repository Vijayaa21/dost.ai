# Dost AI - Mental Health Companion Chatbot

## Project Overview
Dost AI is an AI-powered mental health companion designed to support users emotionally through empathetic conversations, mood tracking, journaling, and guided coping strategies.

## Tech Stack
- **Backend**: Python Django + Django Rest Framework
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **Database**: PostgreSQL (primary), SQLite (development)
- **AI**: OpenAI/Gemini API
- **Charts**: Recharts

## Project Structure
```
dost.ai/
├── backend/          # Django backend
│   ├── dost/         # Main Django project
│   ├── api/          # REST API app
│   ├── chat/         # Chat & AI functionality
│   ├── mood/         # Mood tracking
│   ├── journal/      # Journaling
│   └── users/        # User management
├── frontend/         # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── styles/
│   └── public/
└── docs/             # Documentation
```

## Development Guidelines
- Use empathetic, supportive language in AI prompts
- Implement crisis detection for high-risk phrases
- Maintain user privacy and data security
- Follow REST API best practices
- Use TypeScript for type safety in frontend

## Running the Project
### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
