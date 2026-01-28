import { computed } from 'vue';
import { useAuth } from './useAuth.js';

/**
 * usePermission Composable
 * Handles permission and role-based access control.
 */
export function usePermission(container) {
    const authStore = useAuth;

    // Check if user has a specific permission
    const can = (permission) => {
        if (!authStore.user) return false;

        // Superadmin bypass (if your user model has is_superuser)
        if (authStore.user.is_superuser) return true;

        // Check permissions array (assuming user.permissions exists)
        const userPerms = authStore.user.permissions || [];
        return userPerms.includes(permission);
    };

    // Check if user belongs to a group/role
    const hasRole = (role) => {
        if (!authStore.user) return false;
        const userRoles = authStore.user.groups || []; // Assuming Django groups
        return userRoles.includes(role);
    };

    return {
        can,
        hasRole
    };
}
