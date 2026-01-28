import { createStore } from '../../store/createStore.js';

/**
 * useConfig Store
 * Manages global application settings and persistent state.
 */
export const useConfig = createStore('config', {
    state: () => ({
        theme: 'light',
        sidebarCollapsed: false,
        locale: 'en-IN',
        denseMode: false,
        defaultPageSize: 25 // Default as per user request
    }),

    persist: ['theme', 'sidebarCollapsed', 'defaultPageSize'],

    actions: {
        toggleTheme() {
            this.theme = this.theme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', this.theme);
        },

        toggleSidebar() {
            this.sidebarCollapsed = !this.sidebarCollapsed;
        },

        setDenseMode(val) {
            this.denseMode = val;
        },

        // Lifecycle hook called by ServiceContainer (managed via base.js)
        onInit() {
            // Apply theme on startup
            document.documentElement.setAttribute('data-theme', this.theme);
            console.log('[useConfig] Theme applied on init:', this.theme);
        }
    }
});
