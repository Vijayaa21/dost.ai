from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PetTypeViewSet, WellnessPetViewSet

router = DefaultRouter()
router.register(r'types', PetTypeViewSet, basename='pet-types')
router.register(r'', WellnessPetViewSet, basename='pet')

urlpatterns = [
    path('', include(router.urls)),
]
