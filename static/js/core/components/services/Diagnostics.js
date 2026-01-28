/**
 * Diagnostics Service
 * Centralized error tracking, performance monitoring, and system health.
 */

class DiagnosticsService {
    constructor() {
        this.errors = [];
        this.logs = [];
        this.isInitialized = false;
        this.maxLogs = 100;
    }

    onInit(container) {
        if (this.isInitialized) return;
        this.container = container;
        this.setupGlobalHandlers();
        this.isInitialized = true;
        console.log('[Framework] Diagnostics service ready.');
    }

    setupGlobalHandlers() {
        // 1. Capture Global JS Errors
        window.addEventListener('error', (event) => {
            this.logError('Global Error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error?.stack || event.error
            });
        });

        // 2. Capture Unhandled Promise Rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('Promise Rejection', {
                reason: event.reason?.message || event.reason,
                stack: event.reason?.stack
            });
        });
    }

    logError(type, data) {
        const errorEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            type,
            data,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        this.errors.unshift(errorEntry);

        // Limit error storage
        if (this.errors.length > this.maxLogs) {
            this.errors.pop();
        }

        // Output to console in dev mode
        if (window.erp_debug) {
            console.error(`[Diagnostics] ${type}:`, data);
        }

        // In a real framework, you'd send this to Sentry/LogRocket here
    }

    /**
     * Track performance of a task
     */
    async track(name, taskFn) {
        const start = performance.now();
        try {
            return await taskFn();
        } finally {
            const end = performance.now();
            const duration = (end - start).toFixed(2);
            this.logs.push({ name, duration, timestamp: Date.now() });

            if (window.erp_debug) {
                console.log(`[Perf] ${name}: ${duration}ms`);
            }
        }
    }

    /**
     * Get a full diagnostic package for reporting
     */
    getSnapshot() {
        return {
            system: {
                url: window.location.href,
                userAgent: navigator.userAgent,
                screen: `${window.innerWidth}x${window.innerHeight}`,
                timestamp: new Date().toISOString()
            },
            errors: this.errors,
            perf: this.logs.slice(-20), // Last 20 perf logs
            state: {
                // In a top-tier app, you might want to serialize stores here
                // but we'll keep it simple for now
            }
        };
    }

    clear() {
        this.errors = [];
        this.logs = [];
    }
}

export const diagnostics = new DiagnosticsService();
