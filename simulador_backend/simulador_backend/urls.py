from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # Incluye las URLs de la aplicación 'api' bajo el prefijo 'api/'
    path('api/', include('api.urls')),
]
