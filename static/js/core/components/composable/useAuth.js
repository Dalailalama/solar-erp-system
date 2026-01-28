import { createStore } from '../../store/createStore.js';
import { useApi } from './useApi.js';

/**
 * useAuth Store
 * Manages user session, authentication status, and user profile data.
 */
export const useAuth = createStore('auth', {
    state: () => ({
        user: null,
        loading: false,
        error: null
    }),

    getters: {
        isAuthenticated: (state) => !!state.user
    },

    actions: {
        async login(credentials) {
            const { post } = useApi();
            this.loading = true;
            this.error = null;

            try {
                const response = await post('accounts/login/', credentials, {}, { useResponseCodes: true });

                if (response && response.code === 1) {
                    await this.fetchUser();
                    return true;
                }
                return false;
            } catch (error) {
                console.error('useAuth: Login failed:', error);
                this.user = null;
                this.error = error.message;
                return false;
            } finally {
                this.loading = false;
            }
        },

        async logout() {
            const { post } = useApi();
            this.loading = true;
            try {
                await post('accounts/logout/');
            } finally {
                this.user = null;
                this.loading = false;
                // Redirect to login page
                if (window.location.pathname !== '/accounts/login/') {
                    window.location.href = '/accounts/login/';
                }
            }
        },

        async fetchUser() {
            const { get } = useApi();
            this.loading = true;
            try {
                const data = await get('accounts/user/');
                this.user = data;
            } catch (error) {
                console.error('useAuth: Failed to fetch user:', error);
                this.user = null;
            } finally {
                this.loading = false;
            }
        }
    }
});
