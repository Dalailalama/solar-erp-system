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
        <div class="video-room-shell">
            <video ref="remoteVideo" autoplay playsinline class="video-remote"></video>
            <video ref="localVideo" autoplay muted playsinline :class="['video-local', { mirrored: currentFacingMode === 'user' }]" ></video>

            <div class="video-status-badge">{{ status }}</div>

            <footer class="video-call-controls">
                <button class="video-icon-btn" :aria-label="micEnabled ? 'Mute' : 'Unmute'" @click="toggleMic">
                    <svg v-if="micEnabled" viewBox="0 0 24 24" class="video-icon" aria-hidden="true">
                        <path d="M12 14a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v4a3 3 0 0 0 3 3z"></path>
                        <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V21H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-3.08A7 7 0 0 0 19 11z"></path>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" class="video-icon" aria-hidden="true">
                        <path d="M4.7 3.3a1 1 0 0 0-1.4 1.4l5.2 5.2V11a3 3 0 0 0 4.77 2.42l1.5 1.5A5 5 0 0 1 7 11a1 1 0 1 0-2 0 7 7 0 0 0 6 6.92V21H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-3.08a6.9 6.9 0 0 0 3.18-1.1l3.1 3.1a1 1 0 1 0 1.42-1.42z"></path>
                        <path d="M12 4a3 3 0 0 0-3 3v.17l6 6V7a3 3 0 0 0-3-3z"></path>
                    </svg>
                </button>

                <button class="video-icon-btn" :aria-label="camEnabled ? 'Turn camera off' : 'Turn camera on'" @click="toggleCam">
                    <svg v-if="camEnabled" viewBox="0 0 24 24" class="video-icon" aria-hidden="true">
                        <path d="M15 8a1 1 0 0 1 1-1h1.5L21 4.5v15l-3.5-2.5H16a1 1 0 0 1-1-1V8z"></path>
                        <rect x="3" y="6" width="12" height="12" rx="2" ry="2"></rect>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" class="video-icon" aria-hidden="true">
                        <path d="M3 7a2 2 0 0 1 2-2h8.2l-2 2H5v10h10v-6.2l2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"></path>
                        <path d="M21 4.5 17.5 7H16a1 1 0 0 0-1 1v.5l6 6.01V4.5z"></path>
                        <path d="m4.7 3.3-1.4 1.4 16 16 1.4-1.4z"></path>
                    </svg>
                </button>

                <button
                    class="video-icon-btn"
                    aria-label="Switch camera"
                    :disabled="!canSwitchCamera"
                    @click="switchCamera"
                >
                    <svg viewBox="0 0 24 24" class="video-icon" aria-hidden="true">
                        <path d="M7 7h10a2 2 0 0 1 2 2v1h-2V9H7v1H5V9a2 2 0 0 1 2-2z"></path>
                        <path d="M5 14h2v1h10v-1h2v1a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-1z"></path>
                        <path d="m9 11-2 2 2 2v-1h6v-2H9v-1z"></path>
                        <path d="m15 13 2-2-2-2v1H9v2h6v1z"></path>
                    </svg>
                </button>

                <button class="video-icon-btn danger" aria-label="Leave call" @click="leaveCall">
                    <svg viewBox="0 0 24 24" class="video-icon" aria-hidden="true">
                        <path d="M3 13.2v2.3a2 2 0 0 0 2 2h1.8l2.2-3.2h6l2.2 3.2H19a2 2 0 0 0 2-2v-2.3l-3-1.8a11.4 11.4 0 0 0-12 0z"></path>
                    </svg>
                </button>
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
            currentFacingMode: 'user',
            canSwitchCamera: false,
        };
    },
    async mounted() {
        document.body.classList.add('video-room-page');
        try {
            await this.initMedia();
            await this.initSocket();
        } catch (error) {
            console.error('[Video] Media initialization failed:', error);
        }
    },
    beforeUnmount() {
        document.body.classList.remove('video-room-page');
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

            this.canSwitchCamera = this.isLikelyMobile();

            try {
                this.localStream = await this.requestStream(this.currentFacingMode);
                this.attachLocalStream();
            } catch (error) {
                this.status = 'Camera/Mic permission denied or unavailable.';
                throw error;
            }
        },
        async requestStream(facingMode) {
            const base = {
                audio: true,
                video: {
                    facingMode: { ideal: facingMode },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            };

            try {
                return await navigator.mediaDevices.getUserMedia(base);
            } catch (_) {
                return navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            }
        },
        attachLocalStream() {
            this.$refs.localVideo.srcObject = this.localStream;
            this.localStream.getAudioTracks().forEach((t) => { t.enabled = this.micEnabled; });
            this.localStream.getVideoTracks().forEach((t) => { t.enabled = this.camEnabled; });
        },
        isLikelyMobile() {
            return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
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
            if (!this.pc) return;

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
        async switchCamera() {
            if (!this.canSwitchCamera) return;

            this.currentFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';

            try {
                const newStream = await this.requestStream(this.currentFacingMode);
                const oldStream = this.localStream;
                this.localStream = newStream;
                this.attachLocalStream();

                const videoTrack = this.localStream.getVideoTracks()[0];
                if (videoTrack && this.pc) {
                    const sender = this.pc.getSenders().find((s) => s.track && s.track.kind === 'video');
                    if (sender) {
                        await sender.replaceTrack(videoTrack);
                    }
                }

                oldStream?.getTracks().forEach((t) => t.stop());
            } catch (error) {
                this.status = 'Unable to switch camera.';
                console.error('[Video] Switch camera failed:', error);
            }
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


