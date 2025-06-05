from django.contrib import admin
from django.urls import path, include

# drf-spectacular for OpenAPI / Swagger
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

# Simple JWT views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # 1) Django admin
    path('admin/', admin.site.urls),

    # 2) OpenAPI / Swagger (optional)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # 3) Include **all standard DRF endpoints** (viewsets, etc.) at /api/…
    path('api/', include('nursery.urls')),

    # 4) Include **all PDF‐report endpoints** under /api/…
    path('api/', include('nursery.urls_pdf')),

    # 5) JWT token endpoints (if you use JWT auth)
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

