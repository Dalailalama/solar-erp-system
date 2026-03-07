from django.http import HttpResponseForbidden


class VideoUserIsolationMiddleware:
    """
    Users in group `video_user` can only access the dedicated /video/ surface.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user = getattr(request, 'user', None)

        if user and user.is_authenticated and user.groups.filter(name='video_user').exists() and not (user.is_staff or user.is_superuser):
            allowed_prefixes = (
                '/video/',
                '/static/',
                '/media/',
                '/admin/',
            )
            allowed_exact = {
                '/accounts/logout/',
            }

            path = request.path
            if not path.startswith(allowed_prefixes) and path not in allowed_exact:
                return HttpResponseForbidden('This account is restricted to the video portal.')

        return self.get_response(request)
