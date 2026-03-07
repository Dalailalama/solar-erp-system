from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # Allow letters, numbers, underscore, and hyphen in room names (e.g. demo-room)
    re_path(r'^ws/collaboration/(?P<room_name>[-\w]+)/$', consumers.CollaborationConsumer.as_asgi()),
]
