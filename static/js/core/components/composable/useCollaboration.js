import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useSocket } from './useSocket.js';
import { useAuth } from './useAuth.js';

/**
 * useCollaboration Composable
 * High-level API for multi-user collaboration and presence.
 */
export function useCollaboration(roomName, container) {
    const socket = useSocket();
    const authStore = useAuth;
    const activeUsers = ref([]);
    const isConnected = computed(() => socket.isConnected.value);

    // Filter out duplicates and self
    const otherUsers = computed(() => {
        const users = activeUsers.value.filter(u => u.id !== authStore.user?.id);
        // De-duplicate by ID
        return Array.from(new Map(users.map(u => [u.id, u])).values());
    });

    const connectToRoom = () => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const url = `${protocol}//${host}/ws/collaboration/${roomName}/`;
        socket.connect(url);
    };

    const handlePresence = (data) => {
        if (data.event === 'joined') {
            // Add user if not already present
            if (!activeUsers.value.find(u => u.id === data.user_id)) {
                activeUsers.value.push({
                    id: data.user_id,
                    username: data.username,
                    lastSeen: new Date()
                });
            }
        } else if (data.event === 'left') {
            // Remove user
            activeUsers.value = activeUsers.value.filter(u => u.id !== data.user_id);
        }
    };

    onMounted(() => {
        if (roomName) {
            connectToRoom();

            // Subscribe to presence updates
            socket.subscribe('presence', handlePresence);
        }
    });

    onUnmounted(() => {
        socket.close();
    });

    const broadcast = (type, payload) => {
        socket.send({ type, ...payload });
    };

    const on = (type, callback) => {
        return socket.subscribe(type, callback);
    };

    return {
        isConnected,
        activeUsers,
        otherUsers,
        broadcast,
        on,
        user: authStore.user
    };
}
