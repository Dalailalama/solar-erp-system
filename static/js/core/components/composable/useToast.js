import { createStore } from '../../store/createStore.js';

/**
 * useToast Store
 * Manages global toast notifications.
 */
const DEFAULT_OPTIONS = {
    duration: 3,
    position: 'top-right',
    showIcon: true,
    closable: true,
    pauseOnHover: true,
    type: 'info'
};

let toastIdCounter = 0;

export const useToast = createStore('toast', {
    state: () => ({
        toasts: []
    }),

    actions: {
        addToast(options) {
            const id = ++toastIdCounter;
            const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
            const durationInMs = mergedOptions.duration * 1000;

            const toast = {
                id,
                ...mergedOptions,
                duration: durationInMs
            };

            this.toasts.push(toast);
            return id;
        },

        remove(id) {
            const index = this.toasts.findIndex(t => t.id === id);
            if (index > -1) {
                this.toasts.splice(index, 1);
            }
        },

        clear() {
            this.toasts = [];
        },

        success(message, options = {}) {
            return this.addToast({ message, type: 'success', ...options });
        },

        error(message, options = {}) {
            return this.addToast({ message, type: 'error', duration: 5, ...options });
        },

        warning(message, options = {}) {
            return this.addToast({ message, type: 'warning', duration: 4, ...options });
        },

        info(message, options = {}) {
            return this.addToast({ message, type: 'info', ...options });
        },

        show(options) {
            return this.addToast(options);
        }
    }
});
