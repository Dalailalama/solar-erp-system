import json
from channels.generic.websocket import AsyncWebsocketConsumer

class CollaborationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'collaboration_{self.room_name}'
        self.user = self.scope["user"]

        if not self.user.is_authenticated:
            await self.close()
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        # Notify others about new user joining
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_presence',
                'event': 'joined',
                'username': self.user.username,
                'user_id': self.user.id
            }
        )

    async def disconnect(self, close_code):
        # Leave room group
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_presence',
                    'event': 'left',
                    'username': self.user.username,
                    'user_id': self.user.id
                }
            )
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    # Receive message from WebSocket
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')

        # Broadcast message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'collaboration_message',
                'sender_id': self.user.id,
                'sender_name': self.user.username,
                'data': data
            }
        )

    # Receive message from room group
    async def collaboration_message(self, event):
        # Don't send back to the sender
        if event['sender_id'] == self.user.id:
            return

        # Send message to WebSocket
        await self.send(text_data=json.dumps(event['data']))

    # Receive presence message from room group
    async def user_presence(self, event):
        # Send presence update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'presence',
            'event': event['event'],
            'username': event['username'],
            'user_id': event['user_id']
        }))
