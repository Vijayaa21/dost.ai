"""
URL configuration for dost project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def api_root(request):
    """Root endpoint for health checks and API info."""
    return JsonResponse({
        'status': 'ok',
        'message': 'Welcome to Dost AI API',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth/',
            'chat': '/api/chat/',
            'mood': '/api/mood/',
            'journal': '/api/journal/',
            'coping': '/api/coping/',
        }
    })


urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/mood/', include('mood.urls')),
    path('api/journal/', include('journal.urls')),
    path('api/coping/', include('coping.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
