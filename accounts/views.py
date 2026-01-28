from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
def login_page(request):
    """Render the login page"""
    # If user is already logged in, redirect to index
    if request.user.is_authenticated:
        return redirect('/app/')
    return render(request, 'accounts/login.html')

@login_required
def user_list_page(request):
    """Render the user list page"""
    return render(request, 'accounts/user_list.html')

def settings_page(request):
    """Render the settings page"""
    print("testtttttttt")
    return render(request, 'accounts/settings.html')

