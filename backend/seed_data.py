"""
Seed data for Dost AI - Coping Tools and Affirmations
Run: python manage.py shell < seed_data.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dost.settings')
django.setup()

from coping.models import CopingTool, Affirmation
from journal.models import JournalPrompt

# Coping Tools
coping_tools = [
    {
        "title": "4-7-8 Breathing",
        "description": "A calming breathing technique that helps reduce anxiety and promote relaxation.",
        "category": "breathing",
        "difficulty": "easy",
        "duration_minutes": 3,
        "instructions": [
            "Find a comfortable seated position",
            "Close your eyes and relax your shoulders",
            "Inhale quietly through your nose for 4 seconds",
            "Hold your breath for 7 seconds",
            "Exhale completely through your mouth for 8 seconds",
            "Repeat the cycle 4 times"
        ],
        "benefits": "Reduces anxiety, helps with sleep, promotes relaxation",
        "when_to_use": "When feeling anxious, before sleep, during stressful moments",
        "icon": "🌬️",
        "inhale_duration": 4,
        "hold_duration": 7,
        "exhale_duration": 8,
        "cycles": 4
    },
    {
        "title": "Box Breathing",
        "description": "A simple technique used by Navy SEALs to stay calm under pressure.",
        "category": "breathing",
        "difficulty": "easy",
        "duration_minutes": 4,
        "instructions": [
            "Sit upright in a comfortable chair",
            "Slowly exhale all your air",
            "Inhale slowly for 4 seconds",
            "Hold for 4 seconds",
            "Exhale slowly for 4 seconds",
            "Hold for 4 seconds",
            "Repeat 4-6 times"
        ],
        "benefits": "Improves focus, reduces stress, balances the nervous system",
        "when_to_use": "Before important meetings, when overwhelmed, to improve concentration",
        "icon": "📦",
        "inhale_duration": 4,
        "hold_duration": 4,
        "exhale_duration": 4,
        "cycles": 6
    },
    {
        "title": "5-4-3-2-1 Grounding",
        "description": "A sensory awareness technique to bring you back to the present moment.",
        "category": "grounding",
        "difficulty": "easy",
        "duration_minutes": 5,
        "instructions": [
            "Take a deep breath",
            "Name 5 things you can SEE around you",
            "Name 4 things you can TOUCH",
            "Name 3 things you can HEAR",
            "Name 2 things you can SMELL",
            "Name 1 thing you can TASTE",
            "Take another deep breath"
        ],
        "benefits": "Reduces anxiety, stops panic attacks, brings focus to present",
        "when_to_use": "During anxiety or panic attacks, when feeling disconnected",
        "icon": "🌍"
    },
    {
        "title": "Body Scan Meditation",
        "description": "A mindfulness practice to release tension throughout your body.",
        "category": "mindfulness",
        "difficulty": "medium",
        "duration_minutes": 10,
        "instructions": [
            "Lie down or sit comfortably",
            "Close your eyes and take 3 deep breaths",
            "Focus attention on your feet - notice any sensations",
            "Slowly move attention up through your legs",
            "Notice your hips and lower back",
            "Feel your stomach and chest",
            "Relax your shoulders and arms",
            "Release tension in your neck and face",
            "Take a final deep breath and open your eyes"
        ],
        "benefits": "Releases physical tension, improves body awareness, promotes relaxation",
        "when_to_use": "Before sleep, after stressful events, when body feels tense",
        "icon": "🧘"
    },
    {
        "title": "Progressive Muscle Relaxation",
        "description": "Systematically tense and release muscles to release physical stress.",
        "category": "relaxation",
        "difficulty": "medium",
        "duration_minutes": 15,
        "instructions": [
            "Find a quiet, comfortable place",
            "Start with your feet - tense for 5 seconds, then release",
            "Move to your calves - tense and release",
            "Continue with thighs, stomach, chest",
            "Tense and release hands, arms, shoulders",
            "Finally, scrunch your face, then release",
            "Notice the difference between tension and relaxation"
        ],
        "benefits": "Reduces muscle tension, improves sleep, decreases anxiety",
        "when_to_use": "Before bed, when physically tense, during high stress",
        "icon": "💪"
    },
    {
        "title": "Thought Defusion",
        "description": "A cognitive technique to create distance from difficult thoughts.",
        "category": "cognitive",
        "difficulty": "medium",
        "duration_minutes": 5,
        "instructions": [
            "Notice the difficult thought you're having",
            "Say to yourself: 'I'm having the thought that...'",
            "Now add: 'I notice I'm having the thought that...'",
            "Imagine the thought as a cloud passing in the sky",
            "Watch it drift by without grabbing onto it",
            "Return your attention to the present moment"
        ],
        "benefits": "Reduces power of negative thoughts, builds psychological flexibility",
        "when_to_use": "When caught in negative thinking patterns, during rumination",
        "icon": "🧠"
    },
]

# Create coping tools
for tool_data in coping_tools:
    CopingTool.objects.get_or_create(
        title=tool_data["title"],
        defaults=tool_data
    )

print(f"Created {len(coping_tools)} coping tools")

# Affirmations
affirmations = [
    ("I am worthy of love and belonging.", "self_love"),
    ("I choose to be kind to myself today.", "self_love"),
    ("I am enough, exactly as I am.", "self_love"),
    ("My feelings are valid and important.", "self_love"),
    ("I deserve rest and self-care.", "self_love"),
    
    ("I am capable of handling whatever comes my way.", "confidence"),
    ("I trust myself to make good decisions.", "confidence"),
    ("I have overcome challenges before and I will again.", "confidence"),
    ("My voice and opinions matter.", "confidence"),
    ("I am growing stronger every day.", "confidence"),
    
    ("I choose peace over worry.", "calm"),
    ("I release what I cannot control.", "calm"),
    ("This moment is temporary, and I am safe.", "calm"),
    ("I breathe in calm, I breathe out tension.", "calm"),
    ("I am grounded in the present moment.", "calm"),
    
    ("I have the strength to face today's challenges.", "strength"),
    ("I am resilient and can bounce back from setbacks.", "strength"),
    ("Difficult times help me grow stronger.", "strength"),
    ("I am braver than I believe.", "strength"),
    
    ("I am grateful for the small joys in my life.", "gratitude"),
    ("I appreciate the people who support me.", "gratitude"),
    ("There is always something to be thankful for.", "gratitude"),
    ("I choose to focus on what's going right.", "gratitude"),
    
    ("Every day is a new opportunity to grow.", "growth"),
    ("I am learning and improving constantly.", "growth"),
    ("Mistakes are opportunities for learning.", "growth"),
    ("I embrace change as a path to growth.", "growth"),
]

for text, category in affirmations:
    Affirmation.objects.get_or_create(text=text, defaults={"category": category})

print(f"Created {len(affirmations)} affirmations")

# Journal Prompts
journal_prompts = [
    ("What are three things you're grateful for today?", "gratitude"),
    ("Describe a small moment that brought you joy recently.", "gratitude"),
    ("Who is someone you appreciate and why?", "gratitude"),
    
    ("How are you really feeling right now? Take a moment to check in.", "emotions"),
    ("What emotion has been most present for you this week?", "emotions"),
    ("Is there something you've been avoiding feeling? What might it be?", "emotions"),
    
    ("What's one thing you'd like to let go of?", "reflection"),
    ("What lesson has a recent challenge taught you?", "reflection"),
    ("If your emotions could speak, what would they say?", "reflection"),
    
    ("What's one small goal you'd like to achieve this week?", "goals"),
    ("Describe your ideal day. What would it look like?", "goals"),
    ("What's something you've always wanted to try?", "goals"),
    
    ("How can you show yourself more compassion today?", "growth"),
    ("What's a limiting belief you'd like to challenge?", "growth"),
    ("What would you tell your younger self?", "growth"),
    
    ("Who in your life makes you feel supported?", "relationships"),
    ("Is there a conversation you've been putting off?", "relationships"),
    ("How can you nurture an important relationship this week?", "relationships"),
]

for prompt_text, category in journal_prompts:
    JournalPrompt.objects.get_or_create(
        prompt_text=prompt_text, 
        defaults={"category": category}
    )

print(f"Created {len(journal_prompts)} journal prompts")
print("Seed data created successfully!")
