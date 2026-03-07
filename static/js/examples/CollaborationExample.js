
export const CollaborationExample = {
    name: 'CollaborationExample',
    setup() {
        const { isConnected, otherUsers, broadcast, on } = useCollaboration('demo-room');
        const authStore = useAuth;
        const toast = useToast;

        const messages = ref([]);
        const newMessage = ref('');

        const safeOtherUsers = computed(() =>
            (otherUsers.value || []).filter(user => user && (user.id !== null || user.username))
        );

        const currentUsername = computed(() => authStore.user?.username || 'You');

        on('chat', (data) => {
            const senderName = data?.sender_name || data?.username || 'User';
            const text = data?.message || '';
            if (!text) return;

            messages.value.push({
                user: senderName,
                text,
                time: new Date().toLocaleTimeString()
            });

            toast.info(`New message from ${senderName}`);
        });

        const sendMessage = () => {
            const text = newMessage.value.trim();
            if (!text) return;

            broadcast('chat', { message: text });

            messages.value.push({
                user: 'You',
                text,
                time: new Date().toLocaleTimeString()
            });

            newMessage.value = '';
        };

        return {
            isConnected,
            safeOtherUsers,
            currentUsername,
            messages,
            newMessage,
            sendMessage
        };
    },
    template: `
        <div class="collab-page">
            <div class="collab-grid">
                <section class="panel panel-chat">
                    <header class="panel-header panel-header-primary">
                        <h3>Real-Time Chat & Presence</h3>
                        <collaboration-indicator room-name="demo-room" :show-names="true"></collaboration-indicator>
                    </header>

                    <div class="panel-body">
                        <div class="info-box">
                            Open this page in two tabs/browsers to test real-time chat and presence.
                        </div>

                        <div class="chat-window">
                            <div v-if="messages.length === 0" class="empty-state">
                                No messages yet. Say hi.
                            </div>

                            <div v-for="(msg, index) in messages" :key="index" class="chat-line">
                                <span class="chat-user">{{ msg.user }}:</span>
                                <span class="chat-text">{{ msg.text }}</span>
                                <span class="chat-time">{{ msg.time }}</span>
                            </div>
                        </div>

                        <div class="composer">
                            <input
                                v-model="newMessage"
                                @keyup.enter="sendMessage"
                                type="text"
                                class="composer-input"
                                placeholder="Type a message..."
                            >
                            <button @click="sendMessage" class="composer-btn">Send</button>
                        </div>
                    </div>
                </section>

                <aside class="panel panel-side">
                    <header class="panel-header panel-header-dark">
                        <h3>Collaboration Stats</h3>
                    </header>
                    <div class="panel-body">
                        <div class="meta-row">
                            <span>Status</span>
                            <span :class="['status-pill', isConnected ? 'ok' : 'warn']">
                                {{ isConnected ? 'Connected' : 'Connecting' }}
                            </span>
                        </div>

                        <div class="meta-row">
                            <span>Room</span>
                            <code>demo-room</code>
                        </div>

                        <h4 class="subhead">Active Users ({{ safeOtherUsers.length + 1 }})</h4>
                        <ul class="user-list">
                            <li class="user-row me-row">
                                <span>{{ currentUsername }} (You)</span>
                                <span class="me-pill">Me</span>
                            </li>
                            <li v-for="user in safeOtherUsers" :key="user.id || user.username" class="user-row">
                                {{ user.username }}
                            </li>
                        </ul>
                    </div>
                </aside>
            </div>

            <style scoped>
                .collab-page { padding: 16px; }
                .collab-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
                .panel { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 10px; overflow: hidden; }
                .panel-header { padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; }
                .panel-header h3 { margin: 0; font-size: 18px; }
                .panel-header-primary { background: var(--color-primary); color: white; }
                .panel-header-dark { background: #1f2937; color: white; }
                .panel-body { padding: 14px; }
                .info-box { background: rgba(52,152,219,0.12); border: 1px solid rgba(52,152,219,0.3); color: var(--text-primary); padding: 10px 12px; border-radius: 8px; margin-bottom: 12px; }
                .chat-window { height: 380px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; background: var(--bg-body); }
                .empty-state { color: var(--text-secondary); text-align: center; margin-top: 130px; }
                .chat-line { display: flex; gap: 8px; align-items: baseline; margin-bottom: 8px; }
                .chat-user { font-weight: 700; min-width: 48px; }
                .chat-text { flex: 1; word-break: break-word; }
                .chat-time { color: var(--text-secondary); font-size: 12px; }
                .composer { margin-top: 10px; display: flex; gap: 8px; }
                .composer-input { flex: 1; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 12px; background: var(--bg-card); color: var(--text-primary); }
                .composer-btn { border: none; background: var(--color-primary); color: white; padding: 10px 14px; border-radius: 8px; cursor: pointer; font-weight: 600; }
                .composer-btn:hover { filter: brightness(0.95); }
                .meta-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
                .status-pill { padding: 4px 8px; border-radius: 999px; font-size: 12px; font-weight: 700; }
                .status-pill.ok { background: rgba(46,204,113,0.2); color: #27ae60; }
                .status-pill.warn { background: rgba(241,196,15,0.2); color: #b58900; }
                .subhead { margin: 14px 0 8px; font-size: 14px; }
                .user-list { list-style: none; margin: 0; padding: 0; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; }
                .user-row { padding: 10px 12px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
                .user-row:last-child { border-bottom: none; }
                .me-row { background: rgba(52,152,219,0.08); }
                .me-pill { background: var(--color-primary); color: white; border-radius: 999px; padding: 2px 8px; font-size: 11px; }
                @media (max-width: 1024px) { .collab-grid { grid-template-columns: 1fr; } }
            </style>
        </div>
    `
};




