import { createStore } from '../../store/createStore.js';

/**
 * useNotification Store
 * Manages global application notifications and alerts.
 */
export const useNotification = createStore('notification', {
    state: () => ({
        notifications: []
    }),

    actions: {
        show(message, type = 'info', duration = 3000) {
            const id = Date.now();
            this.notifications.push({ id, message, type });

            if (window.erp_debug) {
                console.log(`%c[${type.toUpperCase()}] %c${message}`, 'font-weight: bold;', 'color: inherit;');
            }

            if (duration > 0) {
                setTimeout(() => {
                    this.remove(id);
                }, duration);
            }

            return id;
        },

        remove(id) {
            const index = this.notifications.findIndex(n => n.id === id);
            if (index > -1) {
                this.notifications.splice(index, 1);
            }
        },

        success(message, duration) { return this.show(message, 'success', duration); },
        error(message, duration) { return this.show(message, 'error', duration); },
        warning(message, duration) { return this.show(message, 'warning', duration); },
        info(message, duration) { return this.show(message, 'info', duration); }
    }
});
