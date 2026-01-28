import Uppy from '@uppy/core';
import Dashboard from '@uppy/dashboard';
import '@uppy/core/css/style.css';
import '@uppy/dashboard/css/style.css';

/**
 * useFiles Composable
 * Handles file uploads, document management, and Uppy integration.
 */
export function useFiles(container) {
    /**
     * Create a new Uppy instance with Dashboard
     * @param {string} trigger - Selector for the upload button
     * @param {Object} options - Uppy options
     */
    const createUploader = (options = {}) => {
        const uppy = new Uppy({
            autoProceed: false,
            restrictions: {
                maxFileSize: 10000000, // 10MB
                maxNumberOfFiles: 10,
                ...options.restrictions
            },
            ...options
        });

        return uppy;
    };

    /**
     * Open Uppy Dashboard modal
     */
    const openDashboard = (uppy, options = {}) => {
        uppy.use(Dashboard, {
            trigger: options.trigger,
            inline: false,
            target: 'body',
            showProgressDetails: true,
            note: 'Images and video only, 2–3 files, up to 1 MB',
            proudlyDisplayPoweredByUppy: false,
            ...options
        });
    };

    return {
        createUploader,
        openDashboard
    };
}
