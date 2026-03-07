import json
from channels.generic.websocket import AsyncWebsocketConsumer


class CollaborationConsumer(AsyncWebsocketConsumer):
    def _display_name(self):
        full = self.user.get_full_name().strip() if self.user else ''
        return full or self.user.username

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'collaboration_{self.room_name}'
        self.user = self.scope['user']

        if not self.user.is_authenticated:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_presence',
                'event': 'joined',
                'username': self._display_name(),
                'user_id': self.user.id,
            },
        )

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_presence',
                    'event': 'left',
                    'username': self._display_name(),
                    'user_id': self.user.id,
                },
            )
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'collaboration_message',
                'sender_id': self.user.id,
                'sender_name': self._display_name(),
                'sender_channel': self.channel_name,
                'data': data,
            },
        )

    async def collaboration_message(self, event):
        # Skip only the same websocket connection; allow other tabs of same user
        if event.get('sender_channel') == self.channel_name:
            return

        incoming = event.get('data') or {}
        payload = {
            **incoming,
            'sender_id': event.get('sender_id'),
            'sender_name': event.get('sender_name') or 'User',
            'type': incoming.get('type') or 'message',
        }

        await self.send(text_data=json.dumps(payload))

    async def user_presence(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    'type': 'presence',
                    'event': event['event'],
                    'username': event['username'],
                    'user_id': event['user_id'],
                }
            )
        )
