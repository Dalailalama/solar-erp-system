from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.http import require_http_methods

from .consumers import VideoCallConsumer


def _is_video_user(user):
    return user.is_authenticated and (
        user.is_staff or user.is_superuser or user.groups.filter(name='video_user').exists()
    )


@require_http_methods(["GET", "POST"])
def video_login(request):
    if request.user.is_authenticated:
        if _is_video_user(request.user):
            return redirect('/video/')
        return redirect('/app/')

    context = {'error': ''}
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')
        user = authenticate(request, username=username, password=password)
        if user is None:
            context['error'] = 'Invalid username or password.'
        elif not _is_video_user(user):
            context['error'] = 'This account does not have video portal access.'
        else:
            login(request, user)
            return redirect('/video/')

    return render(request, 'video/login.html', context)


def video_logout(request):
    logout(request)
    return redirect('/video/login/')


@login_required
def video_spa(request, path=''):
    if not _is_video_user(request.user):
        return redirect('/app/')
    return render(request, 'video/index.html')


@login_required
@require_http_methods(["GET"])
def me(request):
    return JsonResponse({
        'id': request.user.id,
        'username': request.user.username,
        'display_name': request.user.get_full_name().strip() or request.user.username,
    })


@login_required
@require_http_methods(["GET"])
def video_users(request):
    if not _is_video_user(request.user):
        return JsonResponse({'detail': 'Forbidden'}, status=403)

    online_ids = VideoCallConsumer.online_user_ids()
    users = (
        User.objects
        .filter(groups__name='video_user', is_active=True)
        .exclude(id=request.user.id)
        .distinct()
        .order_by('username')
    )

    data = [
        {
            'id': u.id,
            'username': u.username,
            'display_name': u.get_full_name().strip() or u.username,
            'online': u.id in online_ids,
            'is_self': u.id == request.user.id,
        }
        for u in users
    ]

    return JsonResponse({'users': data})

