from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token
from .views import TreeViewSet, UserRegistrationView

# Crea un router y registra nuestro viewset con él.
router = DefaultRouter()
router.register(r'trees', TreeViewSet, basename='tree')

# Las URLs de la API son determinadas automáticamente por el router.
urlpatterns = [
    path('', include(router.urls)),
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', obtain_auth_token, name='login'), # Endpoint para obtener el token
]