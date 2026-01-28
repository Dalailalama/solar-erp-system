import { createStore } from '../../store/createStore.js';
import { api } from '../services/api.js';

/**
 * useMenu Store
 * Manages application menu structure and state.
 */
export const useMenu = createStore('menu', {
    state: () => ({
        items: [],
        loading: false,
        error: null
    }),

    persist: ['items'], // Cache menu structure

    actions: {
        async loadMenu() {
            if (this.items.length > 0 && !this.error) {
                // Return cached if available (Hydration will populate this)
                return;
            }

            this.loading = true;
            this.error = null;
            try {
                const response = await api.get('/core/menu');
                this.items = response.data || response;
            } catch (err) {
                this.error = err.message || 'Failed to load menu';
                console.error('[useMenu] Error loading menu:', err);
            } finally {
                this.loading = false;
            }
        },

        async getChildren(menuId) {
            try {
                const response = await api.get(`/core/menu/${menuId}/children`);
                return response.data || response;
            } catch (err) {
                console.error('[useMenu] Error loading children:', err);
                return [];
            }
        }
    }
});