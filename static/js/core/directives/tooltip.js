/**
 * v-tooltip directive
 * Usage: <button v-tooltip="'Click to save changes'">Save</button>
 */
export const tooltipDirective = {
    mounted(el, binding) {
        el.setAttribute('title', binding.value);
        // Specialized tooltips could be implemented with a library here, 
        // but native title works as a zero-dependency starting point.
    }
};
