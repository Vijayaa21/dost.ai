"""
ASGI config for dost project.

Routes HTTP traffic to Django and WebSocket traffic through
JWT-authenticated channel routing for chat and game consumers.
"""
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dost.settings')

django_asgi_app = get_asgi_application()

# Import after Django setup to avoid AppRegistryNotReady
from chat.routing import websocket_urlpatterns
from dost.middleware import JWTAuthMiddleware

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddleware(
        URLRouter(websocket_urlpatterns)
    ),
})
