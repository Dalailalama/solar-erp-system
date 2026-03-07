"""
ASGI config for erp_system_project project.
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'erp_system_project.settings')

django_asgi_app = get_asgi_application()

from core.routing import websocket_urlpatterns as core_ws_urlpatterns
from video.routing import websocket_urlpatterns as video_ws_urlpatterns

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AuthMiddlewareStack(
        URLRouter(core_ws_urlpatterns + video_ws_urlpatterns)
    ),
})
