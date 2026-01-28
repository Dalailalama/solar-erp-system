/**
 * Route Guards
 * Authentication and permission-based access control for routes
 */

import { useAuth } from '../components/composable/useAuth.js';
import { useToast } from '../components/composable/useToast.js';

/**
 * Authentication Guard
 * Checks if user is logged in before allowing access to protected routes
 */
export async function authGuard(to, from, next) {
    const authStore = useAuth;
    const requiresAuth = to.meta.requiresAuth;

    if (!requiresAuth) {
        return next();
    }

    // Check if user is already loaded
    if (authStore.user) {
        return next();
    }

    // Try to fetch user if not loaded
    try {
        await authStore.fetchUser();

        if (authStore.user) {
            return next();
        }
    } catch (error) {
        console.error('[Router] Auth check failed:', error);
    }

    // No user found, redirect to login
    const toast = useToast;
    toast.warning('Please login to access this page');

    return next({
        path: '/accounts/login/',
        query: { redirect: to.fullPath }
    });
}

/**
 * Permission Guard
 * Checks if user has required permissions
 */
export function permissionGuard(to, from, next) {
    const authStore = useAuth;
    const requiredPermissions = to.meta.permissions;

    if (!requiredPermissions || requiredPermissions.length === 0) {
        return next();
    }

    // Superuser bypass - skip all permission checks
    if (authStore.user?.is_superuser) {
        return next();
    }

    // Check if user has all required permissions
    const userPermissions = authStore.user?.permissions || [];
    const hasAllPermissions = requiredPermissions.every(permission =>
        userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
        const toast = useToast;
        toast.error('You do not have permission to access this page');

        return next({
            name: 'Dashboard',
            replace: true
        });
    }

    return next();
}

/**
 * Role Guard
 * Checks if user has required role
 */
export function roleGuard(to, from, next) {
    const authStore = useAuth;
    const requiredRoles = to.meta.roles;

    if (!requiredRoles || requiredRoles.length === 0) {
        return next();
    }

    // Superuser bypass - skip all role checks
    if (authStore.user?.is_superuser) {
        return next();
    }

    // Check if user has any of the required roles
    const userRoles = authStore.user?.groups || [];
    const hasRequiredRole = requiredRoles.some(role =>
        userRoles.includes(role)
    );

    if (!hasRequiredRole) {
        const toast = useToast;
        toast.error('You do not have the required role to access this page');

        return next({
            name: 'Dashboard',
            replace: true
        });
    }

    return next();
}

/**
 * Combined Guard
 * Runs all guards in sequence
 */
export async function setupGuards(router) {
    router.beforeEach(async (to, from, next) => {
        const requiresAuth = to.meta.requiresAuth;

        // Skip guards for public routes
        if (!requiresAuth) {
            return next();
        }

        const authStore = useAuth;

        // Check if user is loaded
        if (!authStore.user) {
            try {
                await authStore.fetchUser();
            } catch (error) {
                console.error('[Router] Failed to fetch user:', error);
            }
        }

        // If still no user, redirect to login
        if (!authStore.user) {
            const toast = useToast;
            toast.warning('Please login to access this page');
            return next({
                path: '/accounts/login/',
                query: { redirect: to.fullPath }
            });
        }

        // DEBUG: Log user data
        console.log('[Router Guard] User:', authStore.user);
        console.log('[Router Guard] Is Superuser:', authStore.user.is_superuser);
        console.log('[Router Guard] Required Permissions:', to.meta.permissions);

        // User is authenticated, check permissions
        const requiredPermissions = to.meta.permissions;
        if (requiredPermissions && requiredPermissions.length > 0) {
            // Superuser bypass
            if (!authStore.user.is_superuser) {
                const userPermissions = authStore.user.permissions || [];
                const hasAllPermissions = requiredPermissions.every(p => userPermissions.includes(p));

                if (!hasAllPermissions) {
                    const toast = useToast;
                    toast.error('You do not have permission to access this page');
                    return next({ name: 'Dashboard', replace: true });
                }
            }
        }

        // Check roles
        const requiredRoles = to.meta.roles;
        if (requiredRoles && requiredRoles.length > 0) {
            // Superuser bypass
            if (!authStore.user.is_superuser) {
                const userRoles = authStore.user.groups || [];
                const hasRequiredRole = requiredRoles.some(r => userRoles.includes(r));

                if (!hasRequiredRole) {
                    const toast = useToast;
                    toast.error('You do not have the required role to access this page');
                    return next({ name: 'Dashboard', replace: true });
                }
            }
        }

        // All checks passed
        next();
    });

    // After each route change
    router.afterEach((to, from) => {
        // Update page title
        document.title = to.meta.title || 'ERP System';

        // Scroll to top
        window.scrollTo(0, 0);
    });
}
