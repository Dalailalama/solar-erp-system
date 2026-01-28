/**
 * useSocket Composable
 * Manages WebSocket connections and real-time event synchronization.
 */
import { ref, onUnmounted } from 'vue';

/**
 * useSocket Composable
 * Manages WebSocket connections with auto-reconnect and state tracking.
 */
export function useSocket(container) {
    const socket = ref(null);
    const isConnected = ref(false);
    const subscribers = new Map(); // Use Map for event-specific subscribers
    let reconnectTimeout = null;
    let currentUrl = null;

    const connect = (url) => {
        if (socket.value && isConnected.value) return;

        currentUrl = url;
        socket.value = new WebSocket(url);

        socket.value.onopen = () => {
            console.log('[Socket] Connected to:', url);
            isConnected.value = true;
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
                reconnectTimeout = null;
            }
            // Trigger connection event
            trigger('connection_change', { status: 'connected' });
        };

        socket.value.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const type = data.type || 'message';
                trigger(type, data);
            } catch (err) {
                console.error('[Socket] Failed to parse message:', err);
            }
        };

        socket.value.onerror = (error) => {
            console.error('[Socket] Error:', error);
            isConnected.value = false;
        };

        socket.value.onclose = () => {
            console.log('[Socket] Disconnected');
            isConnected.value = false;
            trigger('connection_change', { status: 'disconnected' });

            // Auto-reconnect
            if (currentUrl) {
                reconnectTimeout = setTimeout(() => {
                    console.log('[Socket] Attempting to reconnect...');
                    connect(currentUrl);
                }, 3000);
            }
        };
    };

    const trigger = (type, data) => {
        const callbacks = subscribers.get(type) || [];
        const genericCallbacks = subscribers.get('*') || [];

        [...callbacks, ...genericCallbacks].forEach(cb => cb(data));
    };

    const send = (data) => {
        if (socket.value && socket.value.readyState === WebSocket.OPEN) {
            socket.value.send(JSON.stringify(data));
        } else {
            console.warn('[Socket] Not connected. Cannot send data.');
        }
    };

    const subscribe = (event, callback) => {
        // If only one argument, treat as generic subscriber
        if (typeof event === 'function') {
            callback = event;
            event = '*';
        }

        if (!subscribers.has(event)) {
            subscribers.set(event, []);
        }
        subscribers.get(event).push(callback);

        return () => {
            const list = subscribers.get(event);
            const index = list.indexOf(callback);
            if (index > -1) list.splice(index, 1);
        };
    };

    const close = () => {
        currentUrl = null; // Prevent reconnect
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        if (socket.value) socket.value.close();
    };

    return {
        isConnected,
        connect,
        send,
        subscribe,
        close
    };
}
