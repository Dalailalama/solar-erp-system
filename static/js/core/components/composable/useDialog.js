import { createStore } from '../../store/createStore.js';

/**
 * useDialog Store
 * Manages global dialog/modal state.
 */
export const useDialog = createStore('dialog', {
    state: () => ({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'confirm', // 'confirm', 'alert'
        variant: 'primary', // 'primary', 'danger', 'warning', 'info'
        resolve: null // Promise resolver
    }),

    // No persistence for transient UI state

    actions: {
        confirm(message, title = 'Confirm Action', options = {}) {
            return new Promise((resolve) => {
                this.message = message;
                this.title = title;
                this.confirmText = options.confirmText || 'Confirm';
                this.cancelText = options.cancelText || 'Cancel';
                this.variant = options.variant || 'primary';
                this.type = 'confirm';
                this.isOpen = true;
                this.resolve = resolve;
            });
        },

        alert(message, title = 'Alert') {
            return new Promise((resolve) => {
                this.message = message;
                this.title = title;
                this.confirmText = 'OK';
                this.type = 'alert';
                this.isOpen = true;
                this.resolve = resolve;
            });
        },

        close(result) {
            this.isOpen = false;
            if (this.resolve) {
                this.resolve(result);
                this.resolve = null;
            }
        },

        // Legacy compatibility alias
        // Some components might access state directly
        // Store exposes state as properties, so accessors like store.isOpen work automatically
    }
});
