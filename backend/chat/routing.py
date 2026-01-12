from django.urls import path
from .consumers import ChatConsumer
from games.consumers import GameConsumer

websocket_urlpatterns = [
    path('ws/chat/<int:conversation_id>/', ChatConsumer.as_asgi()),
    path('ws/game/<str:room_code>/', GameConsumer.as_asgi()),
]
