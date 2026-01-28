class ServiceContainer {
    constructor() {
        this.services = new Map(); // name -> instance
        this.factories = new Map(); // name -> factoryFn
        this.resolving = new Set(); // To detect circular deps
        this.aliases = {}; // name -> resolvedName
        this.isInitialized = false;
        this.initializationOrder = [];
    }

    /**
     * Register a service instance
     */
    register(name, instance) {
        if (this.services.has(name) || this.factories.has(name)) {
            console.warn(`[Framework] Service "${name}" already registered. Overwriting.`);
        }
        this.services.set(name, instance);
        this.factories.delete(name);
        console.log(`[Framework] Registered instance: ${name}`);
    }

    /**
     * Register a service factory (Lazy Loading)
     * @param {string} name 
     * @param {function} factory - (container) => instance
     */
    registerFactory(name, factory) {
        if (typeof factory !== 'function') {
            throw new Error(`[Framework] Factory for "${name}" must be a function.`);
        }
        this.factories.set(name, factory);
        this.services.delete(name);
        console.log(`[Framework] Registered factory: ${name}`);
    }

    /**
     * Get a service (resolves factors lazily)
     */
    get(name) {
        // Resolve alias if it exists
        const resolvedName = this.aliases[name] || name;

        // 1. Return existing instance if available
        if (this.services.has(resolvedName)) {
            return this.services.get(resolvedName);
        }

        // 2. Resolve factory if available
        if (this.factories.has(resolvedName)) {
            // Check for circular dependency
            if (this.resolving.has(resolvedName)) {
                const cycle = Array.from(this.resolving).join(' -> ');
                throw new Error(`[ServiceContainer] Circular dependency detected: ${cycle} -> ${resolvedName}. This usually happens when a service tries to access itself during initialization.`);
            }

            console.log(`[Framework] Resolving lazy service: ${resolvedName}`);
            const factory = this.factories.get(resolvedName);
            this.resolving.add(resolvedName); // Mark as resolving
            try {
                const instance = factory(this);
                this.services.set(resolvedName, instance);

                // Track initialization order for logging/debugging
                this.initializationOrder.push(resolvedName);

                // Initialize if container is already initialized
                if (this.isInitialized && typeof instance.onInit === 'function') {
                    instance.onInit(this);
                }

                return instance;
            } catch (err) {
                console.error(`[Framework] Failed to resolve service "${resolvedName}":`, err);
                throw err;
            } finally {
                this.resolving.delete(resolvedName); // Unmark after resolution attempt
            }
        }

        throw new Error(`[Framework] Service "${resolvedName}" not found in container.`);
    }

    /**
     * Initialize all registered services (those already instantiated)
     */
    init() {
        if (this.isInitialized) return;

        console.group('[Framework] Initializing Services');

        // We only initialize what is already an instance.
        // Lazy services will initialize upon their first get() call.
        for (const [name, service] of this.services) {
            if (service && typeof service.onInit === 'function') {
                try {
                    service.onInit(this);
                    console.log(` - Service "${name}" initialized`);
                } catch (err) {
                    console.error(` - Service "${name}" initialization failed:`, err);
                }
            }
        }

        this.isInitialized = true;
        console.groupEnd();
    }

    /**
     * Reset all registered stores/services
     */
    reset() {
        console.log('[Framework] Resetting all services...');
        for (const [name, service] of this.services) {
            if (service && typeof service.$reset === 'function') {
                service.$reset();
            }
            if (service && typeof service.onReset === 'function') {
                service.onReset();
            }
        }
    }
}

export const container = new ServiceContainer();
export const $fx = {
    get: (name) => container.get(name)
};
