/**
 * Module Registry
 * Handles registration and initialization of framework modules.
 */

class ModuleRegistry {
    constructor(container) {
        this.container = container;
        this.modules = new Map();
        this.isInitialized = false;
    }

    /**
     * Register a module
     * @param {Object} moduleDefinition 
     */
    register(moduleDefinition) {
        const { name, setup } = moduleDefinition;
        if (!name || typeof setup !== 'function') {
            throw new Error(`[Framework] Invalid module definition for "${name}". "name" and "setup" are required.`);
        }

        if (this.modules.has(name)) {
            console.warn(`[Framework] Module "${name}" is already registered.`);
            return;
        }

        this.modules.set(name, moduleDefinition);
        console.log(`[Framework] Module registered: ${name}`);

        // If framework already booted, initialize immediately
        if (this.isInitialized) {
            this.initModule(moduleDefinition);
        }
    }

    /**
     * Initialize all registered modules
     */
    init() {
        if (this.isInitialized) return;

        console.group('[Framework] Initializing Modules');
        for (const module of this.modules.values()) {
            this.initModule(module);
        }
        this.isInitialized = true;
        console.groupEnd();
    }

    /**
     * Internal module initialization
     */
    initModule(module) {
        try {
            module.setup(this.container);
            console.log(` - Module "${module.name}" initialization successful`);
        } catch (err) {
            console.error(` - Module "${module.name}" initialization failed:`, err);
        }
    }
}

let registryInstance = null;

export function useModules(container) {
    if (!registryInstance) {
        registryInstance = new ModuleRegistry(container);
    }
    return registryInstance;
}
