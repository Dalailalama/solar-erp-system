import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { getWsOrigin } from '../core/utils/runtimeUrls.js';

const VideoHome = {
    template: `
        <div class="video-shell">
            <header class="video-topbar">
                <h1>Video Users</h1>
                <a href="/video/logout/" class="video-link-btn">Logout</a>
            </header>

            <main class="video-card">
                <div class="video-row video-row-between">
                    <h2>Available Users</h2>
                    <button class="video-btn video-btn-muted" @click="loadUsers">Refresh</button>
                </div>

                <p class="video-hint">Only users in group <code>video_user</code> appear here.</p>

                <div v-if="error" class="video-error">{{ error }}</div>

                <ul class="video-user-list">
                    <li v-for="u in users" :key="u.id" class="video-user-item">
                        <div>
                            <div class="video-user-name">{{ u.display_name }}</div>
                            <div class="video-user-meta">@{{ u.username }}</div>
                        </div>
                        <div class="video-row">
                            <span :class="['video-presence', u.online ? 'online' : 'offline']">
                                {{ u.online ? 'Online' : 'Offline' }}
                            </span>
                            <button
                                class="video-btn"
                                :disabled="u.is_self || !u.online || callingUserId === u.id"
                                @click="callUser(u)"
                            >
                                {{ callingUserId === u.id ? 'Calling...' : 'Video Call' }}
                            </button>
                        </div>
                    </li>
                </ul>
            </main>

            <div v-if="incomingCall" class="video-modal-backdrop">
                <div class="video-modal">
                    <h3>Incoming Call</h3>
                    <p><strong>{{ incomingCall.caller?.name || 'User' }}</strong> is calling you.</p>
                    <div class="video-row">
                        <button class="video-btn" @click="acceptCall">Accept</button>
                        <button class="video-btn video-btn-muted" @click="rejectCall">Reject</button>
                    </div>
                </div>
            </div>

            <div v-if="toastMessage" class="video-toast">{{ toastMessage }}</div>
        </div>
    `,
    data() {
        return {
            users: [],
            error: '',
            ws: null,
            incomingCall: null,
            callingUserId: null,
            toastMessage: '',
            refreshTimer: null,
        };
    },
    async mounted() {
        await this.loadUsers();
        this.connectLobby();
        this.refreshTimer = setInterval(() => this.loadUsers(), 15000);
    },
    beforeUnmount() {
        if (this.refreshTimer) clearInterval(this.refreshTimer);
        this.ws?.close();
    },
    methods: {
        async loadUsers() {
            this.error = '';
            try {
                const res = await fetch('/video/api/users/', { credentials: 'same-origin' });
                if (!res.ok) throw new Error('Failed to load users');
                const data = await res.json();
                this.users = data.users || [];
            } catch (e) {
                this.error = e.message || 'Unable to fetch users';
            }
        },
        connectLobby() {
            const wsUrl = `${getWsOrigin()}/ws/video/lobby/`;
            this.ws = new WebSocket(wsUrl);

            this.ws.onmessage = async (event) => {
                const msg = JSON.parse(event.data);

                if (msg.type === 'presence-changed') {
                    await this.loadUsers();
                    return;
                }

                if (msg.type === 'call-invite') {
                    this.incomingCall = msg;
                    return;
                }

                if (msg.type === 'call-ringing') {
                    this.toast('Ringing...');
                    return;
                }

                if (msg.type === 'call-unavailable') {
                    this.callingUserId = null;
                    this.toast('User is offline or unavailable');
                    return;
                }

                if (msg.type === 'call-accepted') {
                    this.callingUserId = null;
                    this.$router.push(`/room/${msg.room_id}`);
                    return;
                }

                if (msg.type === 'call-rejected') {
                    this.callingUserId = null;
                    this.toast('Call rejected');
                    return;
                }

                if (msg.type === 'call-error') {
                    this.callingUserId = null;
                    this.toast(msg.message || 'Call error');
                }
            };
        },
        send(payload) {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify(payload));
            }
        },
        callUser(user) {
            this.callingUserId = user.id;
            this.send({ type: 'call-request', target_user_id: user.id });
        },
        acceptCall() {
            if (!this.incomingCall?.room_id) return;
            const roomId = this.incomingCall.room_id;
            this.send({ type: 'call-accept', room_id: roomId });
            this.incomingCall = null;
            this.$router.push(`/room/${roomId}`);
        },
        rejectCall() {
            if (!this.incomingCall?.room_id) return;
            this.send({ type: 'call-reject', room_id: this.incomingCall.room_id });
            this.incomingCall = null;
        },
        toast(message) {
            this.toastMessage = message;
            setTimeout(() => {
                this.toastMessage = '';
            }, 2500);
        },
    },
};

const VideoRoom = {
    template: `
        <div class="video-shell">
            <header class="video-topbar">
                <h1>Room: {{ roomId }}</h1>
                <div class="video-row">
                    <button class="video-link-btn" @click="copyCurrentLink">Copy Link</button>
                    <button class="video-link-btn" @click="leaveCall">Leave</button>
                </div>
            </header>

            <main class="video-room-grid">
                <section class="video-panel">
                    <h3>Local</h3>
                    <video ref="localVideo" autoplay muted playsinline class="video-player"></video>
                </section>

                <section class="video-panel">
                    <h3>Remote</h3>
                    <video ref="remoteVideo" autoplay playsinline class="video-player"></video>
                    <p class="video-status">{{ status }}</p>
                </section>
            </main>

            <footer class="video-controls">
                <button class="video-btn" @click="toggleMic">{{ micEnabled ? 'Mute Mic' : 'Unmute Mic' }}</button>
                <button class="video-btn" @click="toggleCam">{{ camEnabled ? 'Turn Off Cam' : 'Turn On Cam' }}</button>
            </footer>
        </div>
    `,
    data() {
        return {
            roomId: this.$route.params.room,
            status: 'Connecting...',
            socket: null,
            pc: null,
            localStream: null,
            remoteStream: null,
            micEnabled: true,
            camEnabled: true,
            makingOffer: false,
            polite: true,
        };
    },
    async mounted() {
        try {
            await this.initMedia();
            await this.initSocket();
        } catch (error) {
            console.error('[Video] Media initialization failed:', error);
        }
    },
    beforeUnmount() {
        this.cleanup();
    },
    methods: {
        async initMedia() {
            const mediaDevices = navigator.mediaDevices;
            const canCapture = mediaDevices && typeof mediaDevices.getUserMedia === 'function';

            if (!canCapture) {
                this.status = window.isSecureContext
                    ? 'Camera/Mic not supported in this browser.'
                    : 'Camera/Mic requires HTTPS (or localhost).';
                throw new Error('getUserMedia is unavailable');
            }

            try {
                this.localStream = await mediaDevices.getUserMedia({ video: true, audio: true });
                this.$refs.localVideo.srcObject = this.localStream;
            } catch (error) {
                this.status = 'Camera/Mic permission denied or unavailable.';
                throw error;
            }
        },
        async initSocket() {
            const wsUrl = `${getWsOrigin()}/ws/video/${this.roomId}/`;
            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                this.status = 'Waiting for peer...';
            };

            this.socket.onmessage = async (event) => {
                const msg = JSON.parse(event.data);
                await this.handleSignal(msg);
            };

            this.socket.onclose = () => {
                this.status = 'Disconnected';
            };
        },
        ensurePc() {
            if (this.pc) return;
            if (!this.localStream) {
                this.status = 'Local media is not available.';
                return;
            }

            this.pc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
            });

            this.remoteStream = new MediaStream();
            this.$refs.remoteVideo.srcObject = this.remoteStream;
            this.localStream.getTracks().forEach((t) => this.pc.addTrack(t, this.localStream));

            this.pc.ontrack = (event) => {
                event.streams[0].getTracks().forEach((t) => this.remoteStream.addTrack(t));
                this.status = 'Connected';
            };

            this.pc.onicecandidate = (event) => {
                if (event.candidate) {
                    this.send({ type: 'ice-candidate', candidate: event.candidate });
                }
            };
        },
        async handleSignal(msg) {
            if (msg.type === 'room-state') {
                this.polite = msg.participants > 1;
                return;
            }

            if (msg.type === 'peer-joined') {
                this.ensurePc();
                await this.createAndSendOffer();
                return;
            }

            if (msg.type === 'offer') {
                this.ensurePc();
                const offerCollision = this.makingOffer || this.pc.signalingState !== 'stable';
                if (offerCollision && !this.polite) return;

                await this.pc.setRemoteDescription(new RTCSessionDescription(msg.offer));
                const answer = await this.pc.createAnswer();
                await this.pc.setLocalDescription(answer);
                this.send({ type: 'answer', answer: this.pc.localDescription });
                return;
            }

            if (msg.type === 'answer' && this.pc) {
                await this.pc.setRemoteDescription(new RTCSessionDescription(msg.answer));
                this.status = 'Connected';
                return;
            }

            if (msg.type === 'ice-candidate' && this.pc && msg.candidate) {
                try { await this.pc.addIceCandidate(msg.candidate); } catch (_) {}
                return;
            }

            if (msg.type === 'peer-left' || msg.type === 'hangup') {
                this.status = 'Peer left the room';
            }
        },
        async createAndSendOffer() {
            this.ensurePc();
            try {
                this.makingOffer = true;
                const offer = await this.pc.createOffer();
                await this.pc.setLocalDescription(offer);
                this.send({ type: 'offer', offer: this.pc.localDescription });
                this.status = 'Calling...';
            } finally {
                this.makingOffer = false;
            }
        },
        send(payload) {
            if (this.socket?.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify(payload));
            }
        },
        toggleMic() {
            this.micEnabled = !this.micEnabled;
            this.localStream?.getAudioTracks().forEach((t) => (t.enabled = this.micEnabled));
        },
        toggleCam() {
            this.camEnabled = !this.camEnabled;
            this.localStream?.getVideoTracks().forEach((t) => (t.enabled = this.camEnabled));
        },
        async copyCurrentLink() {
            await navigator.clipboard.writeText(window.location.href);
        },
        leaveCall() {
            this.cleanup();
            this.$router.push('/');
        },
        cleanup() {
            try { this.send({ type: 'hangup' }); } catch (_) {}
            this.socket?.close();
            this.pc?.close();
            this.localStream?.getTracks().forEach((t) => t.stop());
            this.remoteStream?.getTracks().forEach((t) => t.stop());
        },
    },
};

const router = createRouter({
    history: createWebHistory('/video/'),
    routes: [
        { path: '/', component: VideoHome },
        { path: '/room/:room', component: VideoRoom },
    ],
});

createApp({ template: '<router-view />' }).use(router).mount('#video-app');



