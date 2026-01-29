/**
 * Vue 3 Plugins
 * Register global plugins here
 */

import type { App } from 'vue';

// Global properties plugin
export function globalPropertiesPlugin(app: App) {
    // Add global $fx if available
    if (typeof window !== 'undefined' && (window as any).$fx) {
        app.config.globalProperties.$fx = (window as any).$fx;
    }

    // Add global utilities
    app.config.globalProperties.$utils = {
        formatCurrency(value: number): string {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(value);
        },

        formatNumber(value: number): string {
            return new Intl.NumberFormat('en-US').format(value);
        },

        formatDate(date: Date | string): string {
            const d = typeof date === 'string' ? new Date(date) : date;
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }).format(d);
        },
    };
}

// Register all plugins
export function registerPlugins(app: App) {
    app.use(globalPropertiesPlugin);
}
