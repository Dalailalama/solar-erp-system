import { createRouter, createWebHistory } from 'vue-router';
import { setupGuards } from './router/guards.js';

// Route Definitions
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
    // Example Routes
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

// Create Router instance
export const router = createRouter({
    history: createWebHistory('/app/'), // Base URL is /app/ for the SPA
    routes
});

// Setup guards
setupGuards(router);
