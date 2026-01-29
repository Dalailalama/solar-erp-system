/**
 * Website Base
 * Integration layer between ERP Core and Public Website
 */

// Core Services
import { api } from '../core/components/services/api.js';

// Core Composables
import {
    useToast,
    useNotification,
    useValidation,
    useFormatter
} from '../core/components/composable/index.js';

// Core Components (if needed specifically, though usually registered globally in core)
// For website, we might want to register them manually or rely on import
import { Toast } from '../core/components/ui/Toast.js';
import { ToastContainer } from '../core/components/ui/ToastContainer.js';

// Re-export for Website usage
export {
    api,
    useToast,
    useNotification,
    useValidation,
    useFormatter,
    Toast,
    ToastContainer
};
