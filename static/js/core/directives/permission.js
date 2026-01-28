/**
 * v-permission directive
 * Usage: <button v-permission="'invoice.delete'">Delete</button>
 */
export const permissionDirective = {
    mounted(el, binding, vnode) {
        const { value } = binding;

        // Get the permission service from the global context
        // We use the app context stored in the vnode or global properties
        const $fx = vnode.appContext.config.globalProperties.$fx;

        if (!$fx || !$fx.p) {
            console.error('[Framework] Permission service not found for v-permission');
            return;
        }

        if (!value) return;

        const hasPermission = $fx.p.can(value);

        if (!hasPermission) {
            // Option 1: Remove the element
            el.parentNode && el.parentNode.removeChild(el);

            // Option 2: Alternatively, could just disable it
            // el.disabled = true;
            // el.style.opacity = 0.5;
            // el.style.pointerEvents = 'none';
        }
    }
};
