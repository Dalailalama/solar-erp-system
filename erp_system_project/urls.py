from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from ninja import NinjaAPI

from core.api import router as core_router
from accounts.api import router as accounts_router
from CRM.api import router as crm_router

api = NinjaAPI(title="ERP API", version="1.0.0")
api.add_router("/core/", core_router)
api.add_router("/accounts/", accounts_router)
api.add_router("/crm/", crm_router)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api.urls),
    path('accounts/', include('accounts.urls')),
    path('video/', include('video.urls')), # Dedicated video portal
    path('', include('website.urls')), # Public website at root
    path('app/', include('core.urls')), # app SPA at /app/
    path('crm/', include('CRM.urls')), # CRM
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

