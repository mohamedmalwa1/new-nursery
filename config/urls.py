# config/urls.py  (جذْر المشروع)
from django.contrib import admin
from django.urls import path, include

# Swagger (drf-spectacular)
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [

    # لوحة تحكّم Django
    path('admin/', admin.site.urls),

    # ملفّ مخطَّط OpenAPI وواجهة Swagger
    path('api/schema/', SpectacularAPIView.as_view(),             name='schema'),
    path('api/docs/',   SpectacularSwaggerView.as_view(url_name='schema'),
                                                                  name='swagger-ui'),

    # كلّ مسارات تطبيقك موجودة فى nursery/urls.py وتُقدَّم تحت ‎/api/**
    path('api/', include('nursery.urls')),
]

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns += [
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

