/**
 * Hydration Manager
 * Handles bulk state persistence and rehydration for ErpStores.
 */

const STORAGE_KEY = 'erp_global_state';
const stores = new Map();
let saveTimeout = null;

export const hydrationManager = {
    /**
     * Register a store for hydration
     * @param {Object} store - The store instance
     */
    register(store) {
        if (!store || !store.$id) return;
        stores.set(store.$id, store);
    },

    /**
     * Save all registered stores to localStorage (Debounced)
     */
    save() {
        if (saveTimeout) clearTimeout(saveTimeout);

        saveTimeout = setTimeout(() => {
            try {
                const globalState = {};
                stores.forEach((store, id) => {
                    // Use store's logic to determine what to save
                    // If $getPersistState is implemented, use it.
                    // Otherwise, we skip saving for this store (safe default to avoid bloating)
                    if (typeof store.$getPersistState === 'function') {
                        const persistData = store.$getPersistState();
                        if (persistData) {
                            globalState[id] = persistData;
                        }
                    } else {
                        // Fallback: If no method, previous behavior was to save nothing or everything.
                        // Given optimization goal, we only save if explicitly defined in createStore's persist.
                        // If store was created manually without createStore, it might lack this method.
                    }
                });

                localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));

                if (window.erp_debug) {
                    console.log(`[Hydration] Saved ${stores.size} stores.`);
                }
            } catch (err) {
                console.error('[Hydration] Save failed:', err);
            }
        }, 1000); // 1-second debounce
    },

    /**
     * Load state from localStorage and hydrate all stores
     */
    load() {
        try {
            const json = localStorage.getItem(STORAGE_KEY);
            if (!json) return;

            const globalState = JSON.parse(json);

            Object.keys(globalState).forEach(storeId => {
                const store = stores.get(storeId);
                if (store && typeof store.$hydrate === 'function') {
                    store.$hydrate(globalState[storeId]);
                }
            });

            if (window.erp_debug) {
                console.log('[Hydration] Hydration complete.');
            }
        } catch (err) {
            console.error('[Hydration] Load failed:', err);
        }
    },

    /**
     * Clear all persisted state
     */
    clear() {
        localStorage.removeItem(STORAGE_KEY);
        stores.forEach(store => {
            if (store.$reset) store.$reset();
        });
    }
};
