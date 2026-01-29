/**
 * Solar Store - Custom ERP Store
 * Centralized state for the entire solar application
 */

import { createStore } from '../../core/store/createStore.js';
import { api } from '../website_base';

export const useSolarStore = createStore('solar', {
    state: () => ({
        isMobileMenuOpen: false,
        activeSection: 'home',
        scrollPosition: 0,
        isLoading: false,
        newsletterEmail: '',
        isNewsletterSubscribed: false,
        stats: {
            installations: 0,
            customers: 0,
            capacity: 0,
            co2Reduced: 0,
        },
        statsTargets: {
            installations: 5000,
            customers: 4500,
            capacity: 50,
            co2Reduced: 25000,
        }
    }),

    getters: {
        isScrolled: (state) => state.scrollPosition > 100,
        showBackToTop: (state) => state.scrollPosition > 300,
    },

    actions: {
        toggleMobileMenu() {
            this.isMobileMenuOpen = !this.isMobileMenuOpen;
        },

        closeMobileMenu() {
            this.isMobileMenuOpen = false;
        },

        updateScrollPosition(position) {
            this.scrollPosition = position;
        },

        setActiveSection(section) {
            this.activeSection = section;
        },

        animateStats() {
            const duration = 2000;
            const startTime = Date.now();
            const targets = this.statsTargets;

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                this.stats = {
                    installations: Math.floor(targets.installations * progress),
                    customers: Math.floor(targets.customers * progress),
                    capacity: Math.floor(targets.capacity * progress),
                    co2Reduced: Math.floor(targets.co2Reduced * progress),
                };

                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };

            animate();
        },

        async subscribeNewsletter(email) {
            this.isLoading = true;

            try {
                // Use Core API (axios)
                const response = await api.post('/api/newsletter/subscribe', { email });

                // Axios returns data directly in response.data
                this.isNewsletterSubscribed = true;
                this.newsletterEmail = '';
                return { success: true, message: 'Successfully subscribed!' };
            } catch (error) {
                console.error('Newsletter error:', error);
                const message = error.response?.data?.message || 'Subscription failed';
                return { success: false, message: message };
            } finally {
                this.isLoading = false;
            }
        }
    },

    // Persist specific keys if needed
    // persist: ['newsletterEmail'] 
});

// Utility function
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === name + '=') {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
