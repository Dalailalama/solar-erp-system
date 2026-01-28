import _ from 'lodash';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Extend dayjs with plugins
dayjs.extend(relativeTime);

/**
 * useUtils Composable
 * A wrapper for Lodash and Dayjs to provide standardized utilities.
 */
export function useUtils(container) {
    // Lodash utilities
    const u = _;

    /**
     * Date manipulation using Dayjs
     */
    const date = (val) => dayjs(val);

    /**
     * debounced function
     */
    const debounce = (fn, delay = 300) => u.debounce(fn, delay);

    /**
     * throttled function
     */
    const throttle = (fn, delay = 300) => u.throttle(fn, delay);

    /**
     * Deep clone an object
     */
    const clone = (obj) => u.cloneDeep(obj);

    /**
     * Check if empty
     */
    const isEmpty = (val) => u.isEmpty(val);

    /**
     * Framework Navigation Helper
     * Ensures consistent routing across different contexts (History Mode)
     */
    const navigate = (path) => {
        if (!path) return;

        // Handle absolute URLs
        if (path.startsWith('http')) {
            window.location.href = path;
            return;
        }

        // Try to use router for SPA navigation
        try {
            const router = container?.get('router');
            if (router && typeof router.push === 'function') {
                // Strip hash if present for clean history-mode navigation
                const targetPath = path.startsWith('#') ? path.substring(1) : path;
                router.push(targetPath);
                return;
            }
        } catch (e) {
            console.warn('[Utils] Router not found, falling back to location.hash', e);
        }

        // Fallback for non-SPA or if router is unavailable
        window.location.hash = path.startsWith('#') ? path : `#${path}`;
    };

    return {
        u,
        date,
        debounce,
        throttle,
        clone,
        isEmpty,
        navigate
    };
}
