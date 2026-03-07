import { createRouter, createWebHistory } from 'vue-router';
import { setupGuards } from './router/guards.js';

const routes = [
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: { template: '<div><!-- Dashboard Slot Placeholder --></div>' },
        meta: {
            requiresAuth: true,
            title: 'Dashboard - ERP System'
        }
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('../accounts/Profile.js').then(m => m.Profile),
        meta: {
            requiresAuth: true,
            title: 'My Profile - ERP System'
        }
    },
    {
        path: '/accounts/settings',
        name: 'Settings',
        alias: '/settings',
        component: () => import('../accounts/Settings.js').then(m => m.Settings),
        meta: {
            requiresAuth: true,
            title: 'Settings - ERP System'
        }
    },
    {
        path: '/accounts/users',
        name: 'UserList',
        component: () => import('../accounts/UserList.js').then(m => m.UserList),
        meta: {
            requiresAuth: true,
            permissions: ['view_user'],
            title: 'User Management - ERP System'
        }
    },
    {
        path: '/examples/validation',
        name: 'ValidationExample',
        component: () => import('../examples/ValidationExample.js').then(m => m.ValidationExample),
        meta: {
            requiresAuth: true,
            title: 'Validation Example - ERP System'
        }
    },
    {
        path: '/examples/virtual-scroll',
        name: 'VirtualScrollExample',
        component: () => import('../examples/VirtualScrollExample.js').then(m => m.VirtualScrollExample),
        meta: {
            requiresAuth: true,
            title: 'Virtual Scroll Example - ERP System'
        }
    },
    {
        path: '/examples/collaboration',
        name: 'CollaborationExample',
        component: () => import('../examples/CollaborationExample.js').then(m => m.CollaborationExample),
        meta: {
            requiresAuth: true,
            title: 'Collaboration Example - ERP System'
        }
    },
    {
        path: '/examples/search-filter',
        name: 'SearchFilterExample',
        component: () => import('../examples/SearchFilterExample.js').then(m => m.SearchFilterExample),
        meta: {
            requiresAuth: true,
            title: 'Search Filter Example - ERP System'
        }
    }
];

export const router = createRouter({
    history: createWebHistory('/app/'),
    routes
});

const DYNAMIC_IMPORT_ERROR = /Failed to fetch dynamically imported module|Importing a module script failed/i;
const RELOAD_KEY = 'erp_dynamic_import_reload_once';

// Global recovery for lazy-route chunk failures.
router.onError((error, to) => {
    const message = error?.message || '';
    if (!DYNAMIC_IMPORT_ERROR.test(message)) {
        return;
    }

    const attempted = sessionStorage.getItem(RELOAD_KEY);
    if (attempted === '1') {
        console.error('[Router] Dynamic import failed after retry:', error);
        return;
    }

    sessionStorage.setItem(RELOAD_KEY, '1');
    const target = to?.fullPath || window.location.pathname;
    window.location.assign(target);
});

router.afterEach(() => {
    sessionStorage.removeItem(RELOAD_KEY);
});

setupGuards(router);
