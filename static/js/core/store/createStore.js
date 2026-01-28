import { reactive, computed, watch } from 'vue';
import { hydrationManager } from './hydrationManager.js';

/**
 * ErpStore Factory
 * Creates a standardized reactive store with built-in persistence and logging.
 * 
 * @param {string} id - Unique identifier for the store (used for persistence)
 * @param {object} options - Store definition { state, getters, actions, persist }
 */
export function createStore(id, options) {
    const {
        state: stateFn = () => ({}),
        getters: getterFns = {},
        actions: actionFns = {},
        persist = []
    } = options;

    // 1. Initialize State
    const initialState = stateFn();

    // Note: Initial state load is now handled by hydrationManager.load() 
    // which calls store.$hydrate() after all stores are registered and app starts.

    const state = reactive(initialState);

    // 2. Setup Public Store Object
    const store = {
        $id: id,
        $state: state,
        $reset() {
            const freshState = stateFn();
            Object.keys(freshState).forEach(key => {
                state[key] = freshState[key];
            });
        },
        $hydrate(data) {
            if (!data) return;
            Object.keys(data).forEach(key => {
                // Only hydrate if key exists in state (safety)
                if (state.hasOwnProperty(key)) {
                    state[key] = data[key];
                }
            });
        },
        /**
         * Returns only the state keys marked for persistence.
         * Used by hydrationManager to save bandwidth/storage.
         */
        $getPersistState() {
            if (persist.length === 0) return null;
            const toSave = {};
            persist.forEach(key => {
                toSave[key] = state[key];
            });
            return toSave;
        }
    };

    // 3. Define State Accessors on Store (Reactivity-safe)
    Object.keys(initialState).forEach(key => {
        Object.defineProperty(store, key, {
            get: () => state[key],
            set: (val) => state[key] = val,
            enumerable: true,
            configurable: true
        });
    });

    // 4. Setup Getters
    Object.keys(getterFns).forEach(key => {
        const c = computed(() => getterFns[key](state));
        Object.defineProperty(store, key, {
            get: () => c.value,
            enumerable: true
        });
    });

    // 5. Setup Actions
    Object.keys(actionFns).forEach(key => {
        const action = async (...args) => {
            const start = performance.now();
            try {
                // Actions are called with 'store' as context
                const result = await actionFns[key].apply(store, args);

                if (window.erp_debug) {
                    const duration = (performance.now() - start).toFixed(2);
                    console.log(
                        `%c[ErpStore:${id}] %cAction: ${key} %c(${duration}ms)`,
                        'color: #7289da; font-weight: bold;',
                        'color: #ffffff;',
                        'color: #999999;'
                    );
                }
                return result;
            } catch (error) {
                console.error(`[ErpStore:${id}] Error in action "${key}":`, error);
                throw error;
            }
        };
        store[key] = action;
    });

    // 6. Setup Persistence Watcher (Delegated to HydrationManager)
    if (persist.length > 0) {
        watch(
            () => state,
            () => {
                // Trigger global save (debounced by manager)
                hydrationManager.save();
            },
            { deep: true }
        );
    }

    // 7. Auto-register with Hydration Manager
    hydrationManager.register(store);

    // CRITICAL: Return the store directly, not a function
    return store;
}
