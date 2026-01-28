import { ref } from 'vue';

/**
 * useEventBus Composable
 * A lightweight global event bus for decoupled communication.
 */
const events = new Map();

export function useEventBus(container) {
    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    const on = (event, callback) => {
        if (!events.has(event)) {
            events.set(event, []);
        }
        events.get(event).push(callback);
    };

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function to remove
     */
    const off = (event, callback) => {
        if (!events.has(event)) return;
        const callbacks = events.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    };

    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {any} data - Data to pass to callbacks
     */
    const emit = (event, data) => {
        if (!events.has(event)) return;
        events.get(event).forEach(callback => callback(data));
    };

    return {
        on,
        off,
        emit
    };
}
