import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { getWsOrigin } from '../core/utils/runtimeUrls.js';

const QUALITY_PROFILES = {
    low: { maxBitrate: 180000, maxFramerate: 10, scaleResolutionDownBy: 2.5 },
    balanced: { maxBitrate: 550000, maxFramerate: 15, scaleResolutionDownBy: 1.6 },
    high: { maxBitrate: 1400000, maxFramerate: 24, scaleResolutionDownBy: 1 },
};

function getIceServers() {
    const custom = window.__VIDEO_ICE_SERVERS__;
    if (Array.isArray(custom) && custom.length) return custom;
    return [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
    ];
}

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
                                :disabled="!u.online || callingUserId === u.id"
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
                this.users = (data.users || []).filter((u) => !u.is_self);
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
            <video ref="remoteVideo" autoplay playsinline :class="['video-remote', { mirrored: mirrorRemote }]" ></video>
            <video ref="localVideo" autoplay muted playsinline :class="['video-local', { mirrored: currentFacingMode === 'user' }]" ></video>

            <div class="video-status-badge">{{ status }} | {{ qualityLabel }}</div>

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
            socketReconnectTimer: null,
            pc: null,
            localStream: null,
            remoteStream: null,
            micEnabled: true,
            camEnabled: true,
            makingOffer: false,
            polite: true,
            currentFacingMode: 'user',
            canSwitchCamera: false,
            qualityProfile: 'balanced',
            qualityLabel: 'Quality: Adaptive',
            pendingIceCandidates: [],
            statsTimer: null,
            poorNetworkTicks: 0,
            goodNetworkTicks: 0,
            reconnectAttempts: 0,
            maxReconnectAttempts: 4,
            manualClose: false,
            peerEnded: false,
            mirrorRemote: true,
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
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
                video: {
                    facingMode: { ideal: facingMode },
                    width: { ideal: 640, max: 1280 },
                    height: { ideal: 360, max: 720 },
                    frameRate: { ideal: 15, max: 24 },
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
                if (this.manualClose || this.peerEnded) {
                    this.status = 'Disconnected';
                    return;
                }
                this.status = 'Signaling disconnected. Reconnecting...';
                clearTimeout(this.socketReconnectTimer);
                this.socketReconnectTimer = setTimeout(() => {
                    this.initSocket();
                }, 1800);
            };
        },
        ensurePc() {
            if (this.pc) return;
            if (!this.localStream) {
                this.status = 'Local media is not available.';
                return;
            }

            this.pc = new RTCPeerConnection({
                iceServers: getIceServers(),
                bundlePolicy: 'max-bundle',
                rtcpMuxPolicy: 'require',
            });

            this.remoteStream = new MediaStream();
            this.$refs.remoteVideo.srcObject = this.remoteStream;
            this.localStream.getTracks().forEach((t) => this.pc.addTrack(t, this.localStream));

            this.pc.ontrack = (event) => {
                event.streams[0].getTracks().forEach((t) => {
                    if (!this.remoteStream.getTracks().some((rt) => rt.id === t.id)) {
                        this.remoteStream.addTrack(t);
                    }
                });
                this.status = 'Connected';
                this.reconnectAttempts = 0;
            };

            this.pc.onicecandidate = (event) => {
                if (event.candidate) {
                    this.send({ type: 'ice-candidate', candidate: event.candidate });
                }
            };

            this.pc.oniceconnectionstatechange = () => {
                const s = this.pc?.iceConnectionState;
                if (!s) return;
                if (s === 'connected' || s === 'completed') {
                    this.status = 'Connected';
                    this.reconnectAttempts = 0;
                    return;
                }
                if (s === 'disconnected') {
                    this.status = 'Network unstable. Trying to recover...';
                    this.handleReconnect();
                    return;
                }
                if (s === 'failed') {
                    this.status = 'Connection failed. Reconnecting...';
                    this.applyQualityProfile('low');
                    this.handleReconnect();
                }
            };

            this.pc.onconnectionstatechange = () => {
                const s = this.pc?.connectionState;
                if (!s) return;
                if (s === 'failed') {
                    this.status = 'Peer connection failed. Reconnecting...';
                    this.handleReconnect();
                }
            };

            this.applyQualityProfile(this.qualityProfile);
            this.startStatsMonitor();
        },
        async handleReconnect() {
            if (!this.pc || this.reconnectAttempts >= this.maxReconnectAttempts) {
                if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                    this.status = 'Unable to recover connection. Please rejoin call.';
                }
                return;
            }

            this.reconnectAttempts += 1;
            const delayMs = Math.min(1200 * this.reconnectAttempts, 5000);
            setTimeout(async () => {
                if (!this.pc || this.manualClose) return;
                try {
                    if (typeof this.pc.restartIce === 'function') {
                        this.pc.restartIce();
                    }
                    const offer = await this.pc.createOffer({ iceRestart: true });
                    await this.pc.setLocalDescription(offer);
                    this.send({ type: 'offer', offer: this.pc.localDescription });
                } catch (error) {
                    console.warn('[Video] ICE restart failed:', error);
                }
            }, delayMs);
        },
        async flushPendingIceCandidates() {
            if (!this.pc || !this.pc.remoteDescription) return;
            const buffered = [...this.pendingIceCandidates];
            this.pendingIceCandidates = [];
            for (const candidate of buffered) {
                try {
                    await this.pc.addIceCandidate(candidate);
                } catch (_) {
                    // Ignore invalid/outdated candidates after restart.
                }
            }
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
                await this.flushPendingIceCandidates();
                const answer = await this.pc.createAnswer();
                await this.pc.setLocalDescription(answer);
                this.send({ type: 'answer', answer: this.pc.localDescription });
                return;
            }

            if (msg.type === 'answer' && this.pc) {
                await this.pc.setRemoteDescription(new RTCSessionDescription(msg.answer));
                await this.flushPendingIceCandidates();
                this.status = 'Connected';
                return;
            }

            if (msg.type === 'ice-candidate' && this.pc && msg.candidate) {
                const candidate = new RTCIceCandidate(msg.candidate);
                if (this.pc.remoteDescription) {
                    try {
                        await this.pc.addIceCandidate(candidate);
                    } catch (_) {}
                } else {
                    this.pendingIceCandidates.push(candidate);
                }
                return;
            }

            if (msg.type === 'peer-left' || msg.type === 'hangup') {
                this.handlePeerDisconnected();
                return;
            }
        },
        handlePeerDisconnected() {
            if (this.peerEnded) return;
            this.peerEnded = true;
            this.manualClose = true;
            this.status = 'Peer disconnected. Returning to users list...';
            this.stopStatsMonitor();
            this.resetPeerConnection();
            setTimeout(() => {
                if (this.$route?.path?.startsWith('/room/')) {
                    this.$router.push('/');
                }
            }, 1200);
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
            if (!this.peerEnded && this.socket?.readyState === WebSocket.OPEN) {
                this.socket.send(JSON.stringify(payload));
            }
        },
        async applyQualityProfile(profileName) {
            if (!QUALITY_PROFILES[profileName]) return;
            this.qualityProfile = profileName;
            this.qualityLabel = `Quality: ${profileName}`;

            if (!this.pc) return;
            const sender = this.pc.getSenders().find((s) => s.track && s.track.kind === 'video');
            if (!sender || typeof sender.getParameters !== 'function') return;

            try {
                const params = sender.getParameters() || {};
                if (!params.encodings || !params.encodings.length) {
                    params.encodings = [{}];
                }
                const profile = QUALITY_PROFILES[profileName];
                params.encodings[0].maxBitrate = profile.maxBitrate;
                params.encodings[0].maxFramerate = profile.maxFramerate;
                params.encodings[0].scaleResolutionDownBy = profile.scaleResolutionDownBy;
                await sender.setParameters(params);
            } catch (error) {
                console.warn('[Video] Unable to apply quality profile:', error);
            }
        },
        startStatsMonitor() {
            this.stopStatsMonitor();
            this.statsTimer = setInterval(async () => {
                if (!this.pc || this.pc.connectionState === 'closed') return;
                try {
                    const stats = await this.pc.getStats();
                    let rtt = null;
                    let outgoingBitrate = null;

                    stats.forEach((report) => {
                        if (report.type === 'candidate-pair' && report.state === 'succeeded' && report.nominated) {
                            if (typeof report.currentRoundTripTime === 'number') {
                                rtt = report.currentRoundTripTime;
                            }
                            if (typeof report.availableOutgoingBitrate === 'number') {
                                outgoingBitrate = report.availableOutgoingBitrate;
                            }
                        }
                    });

                    const poor = (rtt !== null && rtt > 0.45) || (outgoingBitrate !== null && outgoingBitrate < 260000);
                    const veryPoor = (rtt !== null && rtt > 0.9) || (outgoingBitrate !== null && outgoingBitrate < 140000);
                    const good = (rtt !== null && rtt < 0.2) && (outgoingBitrate !== null && outgoingBitrate > 700000);

                    if (veryPoor) {
                        this.poorNetworkTicks += 2;
                    } else if (poor) {
                        this.poorNetworkTicks += 1;
                    } else {
                        this.poorNetworkTicks = Math.max(0, this.poorNetworkTicks - 1);
                    }

                    if (good) {
                        this.goodNetworkTicks += 1;
                    } else {
                        this.goodNetworkTicks = 0;
                    }

                    if (this.poorNetworkTicks >= 2 && this.qualityProfile !== 'low') {
                        this.status = 'Poor network detected. Lowering video quality...';
                        await this.applyQualityProfile('low');
                    } else if (this.goodNetworkTicks >= 4 && this.qualityProfile === 'low') {
                        this.status = 'Network recovered. Improving quality...';
                        await this.applyQualityProfile('balanced');
                        this.poorNetworkTicks = 0;
                    }
                } catch (error) {
                    console.warn('[Video] Stats monitor error:', error);
                }
            }, 5000);
        },
        stopStatsMonitor() {
            if (this.statsTimer) {
                clearInterval(this.statsTimer);
                this.statsTimer = null;
            }
        },
        resetPeerConnection() {
            this.pendingIceCandidates = [];
            if (this.pc) {
                try {
                    this.pc.ontrack = null;
                    this.pc.onicecandidate = null;
                    this.pc.oniceconnectionstatechange = null;
                    this.pc.onconnectionstatechange = null;
                    this.pc.close();
                } catch (_) {}
                this.pc = null;
            }
            if (this.remoteStream) {
                this.remoteStream.getTracks().forEach((t) => t.stop());
            }
            this.remoteStream = null;
            this.reconnectAttempts = 0;
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
                        await this.applyQualityProfile(this.qualityProfile);
                    }
                }

                oldStream?.getTracks().forEach((t) => t.stop());
            } catch (error) {
                this.status = 'Unable to switch camera.';
                console.error('[Video] Switch camera failed:', error);
            }
        },
        leaveCall() {
            this.manualClose = true;
            this.cleanup();
            this.$router.push('/');
        },
        cleanup() {
            try {
                if (!this.peerEnded && this.socket?.readyState === WebSocket.OPEN) {
                    this.send({ type: 'hangup' });
                }
            } catch (_) {}
            clearTimeout(this.socketReconnectTimer);
            this.stopStatsMonitor();
            this.socket?.close();
            this.resetPeerConnection();
            this.localStream?.getTracks().forEach((t) => t.stop());
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


