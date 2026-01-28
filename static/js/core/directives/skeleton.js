/**
 * v-skeleton directive
 * Usage: <div v-skeleton="loading">Content</div>
 */
export const skeletonDirective = {
    updated(el, binding) {
        if (binding.value) {
            el.classList.add('skeleton-loading');
            el.style.pointerEvents = 'none';
        } else {
            el.classList.remove('skeleton-loading');
            el.style.pointerEvents = 'auto';
        }
    }
};
