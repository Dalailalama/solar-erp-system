from django.urls import path, re_path

from . import views

app_name = 'video'

urlpatterns = [
    path('login/', views.video_login, name='login'),
    path('logout/', views.video_logout, name='logout'),
    path('api/me/', views.me, name='me'),
    path('api/users/', views.video_users, name='users'),
    path('', views.video_spa, name='index'),
    re_path(r'^(?P<path>.*)$', views.video_spa, name='spa_catchall'),
]
