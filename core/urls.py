from django.urls import path, re_path
from . import views

app_name = 'core'

urlpatterns = [
    path('', views.index, name='index'),
    # Catch-all route for SPA client-side routing
    # This allows /app/anything to work
    re_path(r'^.*$', views.index, name='spa_catchall'),
]
