from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserProfile


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'username', 'preferred_tone', 'onboarding_completed', 'created_at']
    list_filter = ['preferred_tone', 'onboarding_completed', 'is_anonymous']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-created_at']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Dost Settings', {
            'fields': ('preferred_tone', 'is_anonymous', 'onboarding_completed', 
                      'data_collection_consent', 'reminder_enabled', 'reminder_time')
        }),
    )


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'age_range']
    search_fields = ['user__email']
