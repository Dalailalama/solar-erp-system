import { ref, onMounted } from 'vue';
import { useCollaboration } from '../core/components/composable/useCollaboration.js';
import { useToast } from '../core/components/composable/useToast.js';

export const CollaborationExample = {
    name: 'CollaborationExample',
    setup() {
        // Join a room called 'demo-room'
        const room = useCollaboration('demo-room');
        const toast = useToast;
        const messages = ref([]);
        const newMessage = ref('');

        // Listen for custom 'chat' messages
        room.on('chat', (data) => {
            messages.value.push({
                user: data.sender_name,
                text: data.message,
                time: new Date().toLocaleTimeString()
            });
            // Show toast if window is not active or just as feedback
            toast.info(`New message from ${data.sender_name}`);
        });

        const sendMessage = () => {
            if (!newMessage.value.trim()) return;

            const payload = {
                message: newMessage.value.trim()
            };

            // Broadcast to other users in the same room
            room.broadcast('chat', payload);

            // Add to own list
            messages.value.push({
                user: 'You',
                text: newMessage.value.trim(),
                time: new Date().toLocaleTimeString()
            });

            newMessage.value = '';
        };

        return {
            room,
            messages,
            newMessage,
            sendMessage
        };
    },
    template: `
        <div class="container-fluid mt-4">
            <div class="row">
                <div class="col-md-8">
                    <div class="card shadow-sm">
                        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">
                                <i class="fas fa-comments me-2"></i>
                                Real-Time Chat & Presence
                            </h5>
                            <!-- Integrated Collaboration Indicator -->
                            <collaboration-indicator 
                                room-name="demo-room" 
                                :show-names="true"
                            ></collaboration-indicator>
                        </div>
                        <div class="card-body">
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-2"></i>
                                <strong>How to test:</strong> Open this page in two different browser tabs/windows (or browsers). You will see yourself appearing in the collaboration indicator and can chat in real-time.
                            </div>

                            <div class="chat-window border rounded p-3 mb-3" style="height: 400px; overflow-y: auto;">
                                <div v-if="messages.length === 0" class="text-center text-muted mt-5">
                                    <i class="fas fa-ghost fa-3x mb-3"></i>
                                    <p>No messages yet. Say hi!</p>
                                </div>
                                <div v-for="(msg, index) in messages" :key="index" class="mb-2">
                                    <strong>{{ msg.user }}:</strong> {{ msg.text }}
                                    <small class="text-muted ms-2">{{ msg.time }}</small>
                                </div>
                            </div>

                            <div class="input-group">
                                <input 
                                    v-model="newMessage" 
                                    @keyup.enter="sendMessage"
                                    type="text" 
                                    class="form-control" 
                                    placeholder="Type a message..."
                                >
                                <button @click="sendMessage" class="btn btn-primary">
                                    <i class="fas fa-paper-plane me-1"></i>
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-4">
                    <div class="card shadow-sm h-100">
                        <div class="card-header bg-dark text-white">
                            <h5 class="mb-0">Collaboration Stats</h5>
                        </div>
                        <div class="card-body">
                            <h6>Connection Status:</h6>
                            <div class="mb-3">
                                <span v-if="room.isConnected" class="badge bg-success">
                                    <i class="fas fa-check-circle me-1"></i> Connected
                                </span>
                                <span v-else class="badge bg-warning text-dark">
                                    <i class="fas fa-spinner fa-spin me-1"></i> Connecting...
                                </span>
                            </div>

                            <h6>Active Room:</h6>
                            <p class="text-muted"><code>demo-room</code></p>

                            <h6>Active Users ({{ room.activeUsers.length }}):</h6>
                            <ul class="list-group">
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <span>{{ room.user.username }} (You)</span>
                                    <span class="badge bg-primary rounded-pill">Me</span>
                                </li>
                                <li v-for="user in room.otherUsers" :key="user.id" class="list-group-item">
                                    {{ user.username }}
                                </li>
                            </ul>

                            <hr>
                            
                            <h6>Feature Technical Details:</h6>
                            <ul class="small text-muted">
                                <li>WebSocket-based (Django Channels)</li>
                                <li>Automatic Reconnect on failure</li>
                                <li>Real-time Presence joining/leaving</li>
                                <li>Broadcast messaging system</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Developer Docs -->
            <div class="row mt-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h5 class="mb-0">Developer Guide</h5>
                        </div>
                        <div class="card-body">
                            <h6>1. Joining a Collaboration Room:</h6>
                            <pre class="bg-light p-3 rounded"><code>const room = useCollaboration('resource-123');</code></pre>

                            <h6 class="mt-3">2. Displaying Active Users:</h6>
                            <pre class="bg-light p-3 rounded"><code>&lt;collaboration-indicator room-name="resource-123"&gt;&lt;/collaboration-indicator&gt;</code></pre>

                            <h6 class="mt-3">3. Broadcasting Events:</h6>
                            <pre class="bg-light p-3 rounded"><code>room.broadcast('update', { field: 'name', value: 'New Name' });</code></pre>

                            <h6 class="mt-3">4. Listening for Events:</h6>
                            <pre class="bg-light p-3 rounded"><code>room.on('update', (data) => {
    console.log('Update received:', data);
});</code></pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};
