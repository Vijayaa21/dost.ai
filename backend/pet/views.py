from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from .models import PetType, WellnessPet, PetActivity, XP_REWARDS, HAPPINESS_BOOSTS
from .serializers import (
    PetTypeSerializer, WellnessPetSerializer, PetActivitySerializer,
    PetInteractionSerializer, PetFeedSerializer
)


class PetTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """List available pet types"""
    queryset = PetType.objects.all()
    serializer_class = PetTypeSerializer
    permission_classes = [IsAuthenticated]


class WellnessPetViewSet(viewsets.ModelViewSet):
    """Main pet management viewset"""
    serializer_class = WellnessPetSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return WellnessPet.objects.filter(user=self.request.user)
    
    def get_object(self):
        """Get or create pet for current user"""
        pet, created = WellnessPet.objects.get_or_create(
            user=self.request.user,
            defaults={'name': 'Buddy'}
        )
        # Check for stat decay
        pet.decay_stats()
        return pet
    
    def list(self, request):
        """Get user's pet (auto-create if doesn't exist)"""
        pet = self.get_object()
        serializer = self.get_serializer(pet)
        return Response(serializer.data)
    
    def create(self, request):
        """Create or update user's pet"""
        pet, created = WellnessPet.objects.get_or_create(
            user=request.user,
            defaults=request.data
        )
        if not created:
            serializer = self.get_serializer(pet, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
        else:
            serializer = self.get_serializer(pet)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    
    @action(detail=False, methods=['post'])
    def interact(self, request):
        """Log an interaction with the pet (awards XP)"""
        serializer = PetInteractionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        pet = self.get_object()
        activity_type = serializer.validated_data['activity_type']
        description = serializer.validated_data.get('description', '')
        
        # Calculate rewards
        xp = XP_REWARDS.get(activity_type, 10)
        happiness_boost = HAPPINESS_BOOSTS.get(activity_type, 5)
        
        # Update pet streak
        pet.update_streak()
        
        # Add streak bonus
        streak_bonus = min(pet.current_streak * 2, 20)  # Max 20 bonus XP
        
        # Apply changes
        pet.happiness = min(100, pet.happiness + happiness_boost)
        pet.energy = min(100, pet.energy + 5)
        
        leveled_up = pet.add_experience(xp + streak_bonus, activity_type)
        
        # Log the activity
        activity = PetActivity.objects.create(
            pet=pet,
            activity_type=activity_type,
            xp_earned=xp + streak_bonus,
            happiness_change=happiness_boost,
            energy_change=5,
            description=description or f"Completed {activity_type}"
        )
        
        response_data = {
            'pet': WellnessPetSerializer(pet).data,
            'activity': PetActivitySerializer(activity).data,
            'xp_earned': xp + streak_bonus,
            'streak_bonus': streak_bonus,
            'leveled_up': leveled_up,
            'message': self._get_pet_message(pet, activity_type, leveled_up)
        }
        
        return Response(response_data)
    
    @action(detail=False, methods=['post'])
    def feed(self, request):
        """Feed the pet to boost stats"""
        serializer = PetFeedSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        pet = self.get_object()
        boost_type = serializer.validated_data['boost_type']
        
        pet.feed(boost_type)
        
        return Response({
            'pet': WellnessPetSerializer(pet).data,
            'message': f"Yay! {pet.name}'s {boost_type} increased! 🎉"
        })
    
    @action(detail=False, methods=['post'])
    def equip(self, request):
        """Equip an accessory"""
        accessory = request.data.get('accessory')
        pet = self.get_object()
        
        if accessory and accessory not in pet.unlocked_accessories:
            return Response(
                {'error': 'Accessory not unlocked'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        pet.equipped_accessory = accessory
        pet.save()
        
        return Response({
            'pet': WellnessPetSerializer(pet).data,
            'message': f"{pet.name} is now wearing the {accessory}! ✨" if accessory else f"{pet.name} removed accessories"
        })
    
    @action(detail=False, methods=['get'])
    def activities(self, request):
        """Get pet's activity history"""
        pet = self.get_object()
        activities = pet.activities.all()[:20]
        serializer = PetActivitySerializer(activities, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get pet stats summary"""
        pet = self.get_object()
        
        # Get activity counts by type
        from django.db.models import Sum, Count
        activity_summary = pet.activities.values('activity_type').annotate(
            count=Count('id'),
            total_xp=Sum('xp_earned')
        )
        
        return Response({
            'pet': WellnessPetSerializer(pet).data,
            'total_activities': pet.activities.count(),
            'activity_breakdown': list(activity_summary),
            'achievements': self._get_achievements(pet)
        })
    
    def _get_pet_message(self, pet, activity_type, leveled_up):
        """Generate a cute message from the pet"""
        messages = {
            'mood_log': [
                f"{pet.name} is happy you checked in! 💕",
                f"Thanks for sharing how you feel! {pet.name} appreciates it! 🌟",
            ],
            'journal': [
                f"{pet.name} loves when you write! Keep it up! 📝",
                f"Your thoughts matter! {pet.name} is proud of you! ✨",
            ],
            'chat': [
                f"{pet.name} enjoyed our conversation! 💬",
                f"Talking helps! {pet.name} is here for you! 🤗",
            ],
            'breathing': [
                f"Deep breaths! {pet.name} feels calmer too! 🌬️",
                f"Great job practicing mindfulness! {pet.name} is relaxed! 😌",
            ],
            'coping': [
                f"{pet.name} is proud of you for using coping tools! 🛠️",
                f"Self-care matters! {pet.name} approves! 💪",
            ],
        }
        
        import random
        base_message = random.choice(messages.get(activity_type, [f"{pet.name} is happy! 🎉"]))
        
        if leveled_up:
            base_message += f" 🎊 LEVEL UP! {pet.name} is now level {pet.level}!"
        
        return base_message
    
    def _get_achievements(self, pet):
        """Get unlocked achievements"""
        achievements = []
        
        if pet.level >= 5:
            achievements.append({'name': 'Rising Star', 'icon': '⭐', 'desc': 'Reached level 5'})
        if pet.level >= 10:
            achievements.append({'name': 'Dedicated', 'icon': '🏆', 'desc': 'Reached level 10'})
        if pet.longest_streak >= 7:
            achievements.append({'name': 'Week Warrior', 'icon': '🔥', 'desc': '7-day streak'})
        if pet.longest_streak >= 30:
            achievements.append({'name': 'Monthly Master', 'icon': '👑', 'desc': '30-day streak'})
        if pet.total_xp >= 1000:
            achievements.append({'name': 'XP Hunter', 'icon': '💎', 'desc': 'Earned 1000+ XP'})
        
        return achievements
