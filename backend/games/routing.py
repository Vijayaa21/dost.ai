from django.urls import path
from .consumers import GameConsumer

websocket_urlpatterns = [
    path('ws/game/<str:room_code>/', GameConsumer.as_asgi()),
]
