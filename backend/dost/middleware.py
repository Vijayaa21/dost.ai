"""
JWT Authentication Middleware for Django Channels WebSocket connections.

The frontend sends JWT tokens via query string: ws://host/ws/chat/1/?token=<jwt>
This middleware extracts the token, validates it via SimpleJWT, and attaches
the authenticated user to scope["user"].
"""
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.contrib.auth import get_user_model
from urllib.parse import parse_qs

User = get_user_model()


@database_sync_to_async
def get_user_from_token(token_str):
    """Validate a JWT access token and return the associated user."""
    from django.db import close_old_connections

    try:
        # Close stale database connections before ORM access
        close_old_connections()

        access_token = AccessToken(token_str)
        user_id = access_token["user_id"]

        # Retrieve user only if active
        user = User.objects.get(id=user_id)
        if user.is_active:
            return user
        else:
            return AnonymousUser()
    except (TokenError, InvalidToken, User.DoesNotExist, KeyError):
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """
    Custom middleware that authenticates WebSocket connections using JWT tokens
    passed as a query string parameter (?token=<jwt>).

    Falls back to AnonymousUser if no token is provided or token is invalid.
    """

    async def __call__(self, scope, receive, send):
        # Parse the query string for the token parameter
        query_string = scope.get("query_string", b"").decode("utf-8")
        query_params = parse_qs(query_string)
        token_list = query_params.get("token", [])

        if token_list:
            token_str = token_list[0]
            scope["user"] = await get_user_from_token(token_str)
        else:
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)
