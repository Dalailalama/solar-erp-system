from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('login/', views.login_page, name='login'),
    path('users/', views.user_list_page, name='user_list'),
    path('settings/', views.settings_page, name='settings'),
]
