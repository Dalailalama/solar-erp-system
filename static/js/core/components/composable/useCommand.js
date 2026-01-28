import { ref, reactive, onMounted, onUnmounted } from 'vue';
import Fuse from 'fuse.js';
import Mousetrap from 'mousetrap';

/**
 * useCommand Composable
 * Manages global keyboard shortcuts and the command palette registry.
 */
const state = reactive({
    isOpen: false,
    commands: [], // Static commands
    searchProviders: [], // Registered search providers
    searchQuery: '',
    results: [], // Commands results
    providerResults: {}, // Category -> results map
    isLoading: false,
    selectedIndex: 0
});

let searchDebounce = null;
let currentSearchQuery = '';
const fuseInstance = ref(null);

export function useCommand(container) {

    const initFuse = () => {
        if (state.commands.length === 0) {
            fuseInstance.value = null;
            return;
        }
        fuseInstance.value = new Fuse(state.commands, {
            keys: ['title', 'id', 'shortcut'],
            threshold: 0.3,
            location: 0,
            distance: 100
        });
    };

    /**
     * Register a new command
     */
    const register = (cmd) => {
        // Avoid duplicates
        if (state.commands.find(c => c.id === cmd.id)) return;

        state.commands.push(cmd);
        if (cmd.shortcut) {
            Mousetrap.bind(cmd.shortcut, (e) => {
                e.preventDefault();
                cmd.action();
            });
        }
        initFuse();
    };

    /**
     * Register a new search provider
     */
    const registerSearchProvider = (provider) => {
        // Deduplicate by name
        const existingIdx = state.searchProviders.findIndex(p => p.name === provider.name);
        if (existingIdx !== -1) {
            state.searchProviders[existingIdx] = provider;
        } else {
            state.searchProviders.push(provider);
        }
    };

    const open = () => {
        state.isOpen = true;
        state.searchQuery = '';
        state.results = state.commands;
        state.providerResults = {};
        state.isLoading = false;
    };

    const close = () => {
        state.isOpen = false;
    };

    const toggle = () => {
        state.isOpen ? close() : open();
    };

    const search = (query) => {
        state.searchQuery = query;
        currentSearchQuery = query;
        state.selectedIndex = 0;

        if (!query) {
            state.results = state.commands;
            state.providerResults = {};
            state.isLoading = false;
            return;
        }

        // 1. Static Command Fuzzy Search
        if (fuseInstance.value) {
            state.results = fuseInstance.value.search(query).map(r => r.item);
        } else if (state.commands.length > 0) {
            initFuse();
            if (fuseInstance.value) {
                state.results = fuseInstance.value.search(query).map(r => r.item);
            }
        } else {
            state.results = [];
        }

        // 2. Async Provider Search (Debounced)
        if (searchDebounce) clearTimeout(searchDebounce);

        if (state.searchProviders.length > 0) {
            state.isLoading = true;
            searchDebounce = setTimeout(async () => {
                const queryToRun = query;

                const searchTasks = state.searchProviders.map(async (provider) => {
                    try {
                        const results = await provider.search(queryToRun);
                        return { name: provider.name, results: results || [] };
                    } catch (err) {
                        console.error(`[Command] Provider "${provider.name}" failed:`, err);
                        return { name: provider.name, results: [] };
                    }
                });

                const allResults = await Promise.all(searchTasks);

                // Only update if this is still the current search query
                if (queryToRun === currentSearchQuery) {
                    const resultsMap = {};
                    allResults.forEach(res => {
                        if (res.results.length > 0) {
                            resultsMap[res.name] = res.results;
                        }
                    });

                    state.providerResults = resultsMap;
                    state.isLoading = false;
                }
            }, 300);
        } else {
            state.isLoading = false;
            state.providerResults = {};
        }
    };

    const initGlobalShortcuts = () => {
        Mousetrap.bind(['command+k', 'ctrl+k'], (e) => {
            e.preventDefault();
            toggle();
        });
    };

    return {
        state,
        register,
        registerSearchProvider,
        open,
        close,
        toggle,
        search,
        initGlobalShortcuts
    };
}
