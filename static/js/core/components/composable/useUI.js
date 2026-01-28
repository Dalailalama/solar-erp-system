import Sortable from 'sortablejs';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

/**
 * useUI Composable
 * Provides advanced UI interaction tools like Drag & Drop and Rich Text Editing.
 */
export function useUI(container) {
    /**
     * Initialize sortable on an element
     * @param {HTMLElement} el 
     * @param {Object} options 
     */
    const sortable = (el, options = {}) => {
        return new Sortable(el, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            ...options
        });
    };

    /**
     * Initialize Quill editor
     * @param {string|HTMLElement} el 
     * @param {Object} options 
     */
    const editor = (el, options = {}) => {
        const container = typeof el === 'string' ? document.querySelector(el) : el;
        if (!container) return null;

        return new Quill(container, {
            theme: 'snow',
            ...options
        });
    };

    return {
        sortable,
        editor
    };
}
