import json
import uuid
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer


class VideoCallConsumer(AsyncWebsocketConsumer):
    """One-to-one video signaling + lobby presence/invite events."""

    room_participants = {}
    online_channels = {}  # user_id -> set(channel_name)
    call_sessions = {}    # room_id -> {'caller_id': int, 'callee_id': int, 'status': str}

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'video_{self.room_name}'
        self.user = self.scope.get('user')
        self.user_group = None

        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001)
            return

        if not await self._has_video_access():
            await self.close(code=4003)
            return

        self.user_group = f'video_user_{self.user.id}'

        await self.channel_layer.group_add(self.user_group, self.channel_name)
        await self.channel_layer.group_add('video_presence', self.channel_name)

        channels = VideoCallConsumer.online_channels.setdefault(self.user.id, set())
        channels.add(self.channel_name)

        if self.room_name != 'lobby':
            if not self._can_join_room(self.room_name, self.user.id):
                await self.close(code=4005)
                return

            members = VideoCallConsumer.room_participants.setdefault(self.room_group_name, set())
            if len(members) >= 2 and self.channel_name not in members:
                await self.close(code=4004)
                return

            members.add(self.channel_name)
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()

        await self._broadcast_presence_changed()

        if self.room_name != 'lobby':
            members = VideoCallConsumer.room_participants.get(self.room_group_name, set())
            await self.send_json({
                'type': 'room-state',
                'participants': len(members),
                'is_full': len(members) >= 2,
            })
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'peer_joined',
                    'sender_channel': self.channel_name,
                    'user': {'id': self.user.id, 'name': await self._display_name()},
                },
            )

    async def disconnect(self, close_code):
        if self.user_group:
            await self.channel_layer.group_discard(self.user_group, self.channel_name)
        await self.channel_layer.group_discard('video_presence', self.channel_name)

        if hasattr(self, 'room_group_name') and self.room_name != 'lobby':
            members = VideoCallConsumer.room_participants.get(self.room_group_name)
            if members and self.channel_name in members:
                members.remove(self.channel_name)
                if not members:
                    VideoCallConsumer.room_participants.pop(self.room_group_name, None)

            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
            await self.channel_layer.group_send(
                self.room_group_name,
                {'type': 'peer_left', 'sender_channel': self.channel_name},
            )

        channels = VideoCallConsumer.online_channels.get(self.user.id)
        if channels and self.channel_name in channels:
            channels.remove(self.channel_name)
            if not channels:
                VideoCallConsumer.online_channels.pop(self.user.id, None)

        await self._broadcast_presence_changed()

    async def receive(self, text_data):
        payload = json.loads(text_data)
        msg_type = payload.get('type')

        if msg_type in {'offer', 'answer', 'ice-candidate', 'hangup'}:
            if self.room_name == 'lobby':
                return
            await self._relay_room_signal(payload)
            return

        if msg_type == 'call-request':
            await self._handle_call_request(payload)
            return

        if msg_type == 'call-accept':
            await self._handle_call_accept(payload)
            return

        if msg_type == 'call-reject':
            await self._handle_call_reject(payload)
            return

    async def _relay_room_signal(self, payload):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'signal',
                'sender_channel': self.channel_name,
                'payload': {
                    **payload,
                    'from': {'id': self.user.id, 'name': await self._display_name()},
                },
            },
        )

    async def _handle_call_request(self, payload):
        try:
            target_user_id = int(payload.get('target_user_id'))
        except (TypeError, ValueError):
            await self.send_json({'type': 'call-error', 'message': 'Invalid target user.'})
            return

        if target_user_id == self.user.id:
            await self.send_json({'type': 'call-error', 'message': 'Cannot call yourself.'})
            return

        if target_user_id not in VideoCallConsumer.online_channels:
            await self.send_json({'type': 'call-unavailable', 'target_user_id': target_user_id})
            return

        room_id = uuid.uuid4().hex[:12]
        VideoCallConsumer.call_sessions[room_id] = {
            'caller_id': self.user.id,
            'callee_id': target_user_id,
            'status': 'ringing',
        }

        caller = {'id': self.user.id, 'name': await self._display_name()}

        await self.channel_layer.group_send(
            f'video_user_{target_user_id}',
            {
                'type': 'call_invite',
                'sender_channel': self.channel_name,
                'room_id': room_id,
                'caller': caller,
            },
        )

        await self.send_json({'type': 'call-ringing', 'room_id': room_id, 'target_user_id': target_user_id})

    async def _handle_call_accept(self, payload):
        room_id = (payload.get('room_id') or '').strip()
        session = VideoCallConsumer.call_sessions.get(room_id)
        if not session:
            await self.send_json({'type': 'call-error', 'message': 'Call session not found.'})
            return

        if session['callee_id'] != self.user.id:
            await self.send_json({'type': 'call-error', 'message': 'Not authorized to accept this call.'})
            return

        session['status'] = 'accepted'

        await self.channel_layer.group_send(
            f'video_user_{session["caller_id"]}',
            {
                'type': 'call_accepted',
                'sender_channel': self.channel_name,
                'room_id': room_id,
                'callee': {'id': self.user.id, 'name': await self._display_name()},
            },
        )

        await self.send_json({'type': 'call-joined', 'room_id': room_id})

    async def _handle_call_reject(self, payload):
        room_id = (payload.get('room_id') or '').strip()
        session = VideoCallConsumer.call_sessions.get(room_id)
        if not session:
            return

        if session['callee_id'] != self.user.id:
            return

        VideoCallConsumer.call_sessions.pop(room_id, None)

        await self.channel_layer.group_send(
            f'video_user_{session["caller_id"]}',
            {
                'type': 'call_rejected',
                'sender_channel': self.channel_name,
                'room_id': room_id,
                'callee': {'id': self.user.id, 'name': await self._display_name()},
            },
        )

    def _can_join_room(self, room_id, user_id):
        session = VideoCallConsumer.call_sessions.get(room_id)
        if not session:
            # Allow ad-hoc room joins for manually shared links
            return True
        return user_id in {session['caller_id'], session['callee_id']}

    async def _broadcast_presence_changed(self):
        await self.channel_layer.group_send('video_presence', {'type': 'presence_changed'})

    async def presence_changed(self, event):
        await self.send_json({'type': 'presence-changed'})

    async def signal(self, event):
        if event.get('sender_channel') == self.channel_name:
            return
        await self.send_json(event['payload'])

    async def peer_joined(self, event):
        if event.get('sender_channel') == self.channel_name:
            return
        await self.send_json({'type': 'peer-joined', 'user': event.get('user')})

    async def peer_left(self, event):
        if event.get('sender_channel') == self.channel_name:
            return
        await self.send_json({'type': 'peer-left'})

    async def call_invite(self, event):
        if event.get('sender_channel') == self.channel_name:
            return
        await self.send_json({'type': 'call-invite', 'room_id': event['room_id'], 'caller': event['caller']})

    async def call_accepted(self, event):
        if event.get('sender_channel') == self.channel_name:
            return
        await self.send_json({'type': 'call-accepted', 'room_id': event['room_id'], 'callee': event.get('callee')})

    async def call_rejected(self, event):
        if event.get('sender_channel') == self.channel_name:
            return
        await self.send_json({'type': 'call-rejected', 'room_id': event['room_id'], 'callee': event.get('callee')})

    async def send_json(self, data):
        await self.send(text_data=json.dumps(data))

    @classmethod
    def online_user_ids(cls):
        return {uid for uid, channels in cls.online_channels.items() if channels}

    @database_sync_to_async
    def _has_video_access(self):
        return self.user.is_staff or self.user.is_superuser or self.user.groups.filter(name='video_user').exists()

    @database_sync_to_async
    def _display_name(self):
        full = self.user.get_full_name().strip()
        return full or self.user.username
