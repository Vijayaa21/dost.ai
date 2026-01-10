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

# Pet Types
from pet.models import PetType

pet_types = [
    {
        "name": "Luna the Cat",
        "species": "cat",
        "description": "A calming companion who loves quiet moments and peaceful meditation.",
        "base_image": "cat",
        "personality": "calm",
    },
    {
        "name": "Buddy the Dog",
        "species": "dog",
        "description": "An energetic friend who celebrates every small victory with you.",
        "base_image": "dog",
        "personality": "playful",
    },
    {
        "name": "Sprout the Plant",
        "species": "plant",
        "description": "A gentle growing friend that flourishes alongside your mental health journey.",
        "base_image": "plant",
        "personality": "calm",
    },
    {
        "name": "Pip the Bunny",
        "species": "bunny",
        "description": "A soft, cuddly companion for comfort during tough times.",
        "base_image": "bunny",
        "personality": "friendly",
    },
]

for pet_data in pet_types:
    PetType.objects.get_or_create(
        name=pet_data["name"],
        defaults={
            "species": pet_data["species"],
            "description": pet_data["description"],
            "base_image": pet_data["base_image"],
            "personality": pet_data["personality"],
        }
    )

print(f"Created {len(pet_types)} pet types")

# Therapeutic Games
from games.models import TherapeuticGame

therapeutic_games = [
    # ANGER games
    {
        "name": "Stress Ball Smash",
        "description": "A virtual stress ball you can squeeze, punch, and throw. Release your frustration safely!",
        "emotion_category": "anger",
        "game_type": "action",
        "emoji": "🥊",
        "game_url": "https://poki.com/en/g/kick-the-buddy",
        "therapeutic_benefit": "Provides a safe outlet for aggressive feelings without hurting anyone",
        "intensity_level": 5,
        "avg_duration_minutes": 10,
    },
    {
        "name": "Brick Breaker Fury",
        "description": "Smash bricks with satisfying destruction. Watch things break apart!",
        "emotion_category": "anger",
        "game_type": "action",
        "emoji": "🧱",
        "game_url": "https://poki.com/en/g/atari-breakout",
        "therapeutic_benefit": "Channeling destructive urges into a controlled game environment",
        "intensity_level": 4,
        "avg_duration_minutes": 15,
    },
    {
        "name": "Boxing Workout",
        "description": "Virtual boxing where you can throw punches at targets. Great for releasing tension!",
        "emotion_category": "anger",
        "game_type": "sports",
        "emoji": "🥋",
        "game_url": "https://poki.com/en/g/boxing-random",
        "therapeutic_benefit": "Physical release through virtual exercise, reduces cortisol",
        "intensity_level": 5,
        "avg_duration_minutes": 10,
    },
    
    # SADNESS games
    {
        "name": "Cozy Garden",
        "description": "Plant and grow a peaceful virtual garden. Watch beautiful flowers bloom.",
        "emotion_category": "sadness",
        "game_type": "relaxing",
        "emoji": "🌻",
        "game_url": "https://poki.com/en/g/garden-bloom",
        "therapeutic_benefit": "Nurturing activities boost serotonin and create sense of purpose",
        "intensity_level": 1,
        "avg_duration_minutes": 15,
    },
    {
        "name": "Wholesome Cats",
        "description": "Pet and care for adorable virtual cats. They'll purr and show you love!",
        "emotion_category": "sadness",
        "game_type": "relaxing",
        "emoji": "🐱",
        "game_url": "https://poki.com/en/g/my-virtual-pet-shop",
        "therapeutic_benefit": "Virtual pet interaction releases oxytocin, the love hormone",
        "intensity_level": 1,
        "avg_duration_minutes": 10,
    },
    {
        "name": "Color Fill Therapy",
        "description": "A relaxing coloring game with beautiful patterns. Express yourself through colors.",
        "emotion_category": "sadness",
        "game_type": "creative",
        "emoji": "🎨",
        "game_url": "https://poki.com/en/g/happy-glass",
        "therapeutic_benefit": "Art therapy reduces anxiety and provides gentle distraction",
        "intensity_level": 2,
        "avg_duration_minutes": 20,
    },
    
    # ANXIETY games
    {
        "name": "Zen Puzzles",
        "description": "Calming puzzle games with gentle music. Focus your mind on something peaceful.",
        "emotion_category": "anxiety",
        "game_type": "puzzle",
        "emoji": "🧩",
        "game_url": "https://poki.com/en/g/jigsaw-puzzle",
        "therapeutic_benefit": "Puzzles engage the logical brain, reducing anxious thoughts",
        "intensity_level": 2,
        "avg_duration_minutes": 15,
    },
    {
        "name": "Bubble Pop Calm",
        "description": "Pop bubbles in a satisfying, rhythmic way. Simple and soothing.",
        "emotion_category": "anxiety",
        "game_type": "relaxing",
        "emoji": "🫧",
        "game_url": "https://poki.com/en/g/bubble-shooter",
        "therapeutic_benefit": "Repetitive motions and sounds create a meditative state",
        "intensity_level": 1,
        "avg_duration_minutes": 10,
    },
    {
        "name": "Flow Connect",
        "description": "Connect matching colors without overlapping. Meditative and satisfying.",
        "emotion_category": "anxiety",
        "game_type": "puzzle",
        "emoji": "🔮",
        "game_url": "https://poki.com/en/g/flow-free-online",
        "therapeutic_benefit": "Pattern completion gives sense of control and accomplishment",
        "intensity_level": 2,
        "avg_duration_minutes": 15,
    },
    
    # LONELINESS games
    {
        "name": "Virtual Pet World",
        "description": "Adopt and care for a virtual pet companion who's always happy to see you!",
        "emotion_category": "loneliness",
        "game_type": "social",
        "emoji": "🐕",
        "game_url": "https://poki.com/en/g/pou",
        "therapeutic_benefit": "Virtual companionship provides comfort and routine",
        "intensity_level": 2,
        "avg_duration_minutes": 15,
    },
    {
        "name": "Story Adventure",
        "description": "An interactive story where you make choices and meet characters.",
        "emotion_category": "loneliness",
        "game_type": "adventure",
        "emoji": "📖",
        "game_url": "https://poki.com/en/g/fireboy-and-watergirl",
        "therapeutic_benefit": "Story engagement creates emotional connection with characters",
        "intensity_level": 3,
        "avg_duration_minutes": 20,
    },
    
    # LOVE games
    {
        "name": "Heart Match",
        "description": "Match hearts and spread love! A cute matching game about connection.",
        "emotion_category": "love",
        "game_type": "puzzle",
        "emoji": "💕",
        "game_url": "https://poki.com/en/g/candy-crush",
        "therapeutic_benefit": "Express positive feelings through play, share with loved ones",
        "intensity_level": 2,
        "avg_duration_minutes": 10,
    },
    {
        "name": "Kindness Quest",
        "description": "Help characters solve problems and spread kindness in their world.",
        "emotion_category": "love",
        "game_type": "adventure",
        "emoji": "🌈",
        "game_url": "https://poki.com/en/g/adventures-with-anxiety",
        "therapeutic_benefit": "Acting kindly in games reinforces positive behavior patterns",
        "intensity_level": 2,
        "avg_duration_minutes": 15,
    },
    
    # JOY games
    {
        "name": "Dance Party",
        "description": "A rhythm game to celebrate! Move and groove to fun music.",
        "emotion_category": "joy",
        "game_type": "music",
        "emoji": "💃",
        "game_url": "https://poki.com/en/g/dancing-line",
        "therapeutic_benefit": "Music and movement amplify positive emotions",
        "intensity_level": 4,
        "avg_duration_minutes": 10,
    },
    {
        "name": "Victory Run",
        "description": "An endless runner to celebrate your wins! Keep the momentum going!",
        "emotion_category": "joy",
        "game_type": "action",
        "emoji": "🏃",
        "game_url": "https://poki.com/en/g/subway-surfers",
        "therapeutic_benefit": "Achievement-based games enhance feelings of success",
        "intensity_level": 3,
        "avg_duration_minutes": 15,
    },
    
    # FEAR games
    {
        "name": "Hero Training",
        "description": "Train to become brave! Face small challenges and grow your courage.",
        "emotion_category": "fear",
        "game_type": "adventure",
        "emoji": "🦸",
        "game_url": "https://poki.com/en/g/minecraft-classic",
        "therapeutic_benefit": "Gradual exposure to challenges builds confidence",
        "intensity_level": 3,
        "avg_duration_minutes": 15,
    },
    {
        "name": "Safe Space Builder",
        "description": "Build your own cozy, safe space in this creative building game.",
        "emotion_category": "fear",
        "game_type": "creative",
        "emoji": "🏠",
        "game_url": "https://poki.com/en/g/bloxd-io",
        "therapeutic_benefit": "Creating safe spaces provides sense of control and security",
        "intensity_level": 2,
        "avg_duration_minutes": 20,
    },
    
    # BOREDOM games
    {
        "name": "Quick Trivia",
        "description": "Test your knowledge with fun trivia questions! Learn something new.",
        "emotion_category": "boredom",
        "game_type": "puzzle",
        "emoji": "🧠",
        "game_url": "https://poki.com/en/g/trivia-crack",
        "therapeutic_benefit": "Mental stimulation combats boredom and improves mood",
        "intensity_level": 3,
        "avg_duration_minutes": 10,
    },
    {
        "name": "Speed Race",
        "description": "Fast-paced racing for an adrenaline boost! Feel the excitement.",
        "emotion_category": "boredom",
        "game_type": "sports",
        "emoji": "🏎️",
        "game_url": "https://poki.com/en/g/moto-x3m",
        "therapeutic_benefit": "Excitement and challenge break the monotony",
        "intensity_level": 4,
        "avg_duration_minutes": 15,
    },
]

for game_data in therapeutic_games:
    TherapeuticGame.objects.get_or_create(
        name=game_data["name"],
        defaults=game_data
    )

print(f"Created {len(therapeutic_games)} therapeutic games")
print("Seed data created successfully!")
