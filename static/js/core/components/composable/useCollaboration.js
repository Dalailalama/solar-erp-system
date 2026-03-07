import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useSocket } from './useSocket.js';
import { useAuth } from './useAuth.js';
import { getWsOrigin } from '../../utils/runtimeUrls.js';

/**
 * useCollaboration Composable
 * High-level API for multi-user collaboration and presence.
 */
export function useCollaboration(roomName, container) {
    const socket = useSocket();
    const authStore = useAuth;
    const activeUsers = ref([]);
    const isConnected = computed(() => socket.isConnected.value);

    const normalizeUser = (user) => {
        if (!user || typeof user !== 'object') return null;
        const id = user.id ?? null;
        const username = user.username || null;
        if (id === null && !username) return null;
        return {
            id,
            username: username || `user-${id}`,
            lastSeen: user.lastSeen || new Date()
        };
    };

    const otherUsers = computed(() => {
        const currentUserId = authStore.user?.id ?? null;
        const users = Array.isArray(activeUsers.value) ? activeUsers.value : [];
        const filtered = users
            .map(normalizeUser)
            .filter(Boolean)
            .filter(u => u.id !== currentUserId);

        // De-duplicate by id (fallback: username)
        const deduped = new Map();
        filtered.forEach(u => {
            const key = u.id ?? `name:${u.username}`;
            deduped.set(key, u);
        });

        return Array.from(deduped.values());
    });

    const connectToRoom = () => {
        const url = `${getWsOrigin()}/ws/collaboration/${roomName}/`;
        socket.connect(url);
    };

    const handlePresence = (data) => {
        if (data.event === 'joined') {
            const incoming = normalizeUser({
                id: data.user_id,
                username: data.username,
                lastSeen: new Date()
            });
            if (!incoming) return;

            if (!activeUsers.value.find(u => (u?.id ?? null) === incoming.id && (u?.username ?? null) === incoming.username)) {
                activeUsers.value.push(incoming);
            }
        } else if (data.event === 'left') {
            const leavingId = data.user_id ?? null;
            const leavingName = data.username ?? null;
            activeUsers.value = activeUsers.value.filter(
                u => !(u && (u.id === leavingId || (leavingName && u.username === leavingName)))
            );
        }
    };

    onMounted(() => {
        if (roomName) {
            connectToRoom();
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


