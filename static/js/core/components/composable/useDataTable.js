/**
 * useDataTable Headless Composable
 * Decouples table logic from UI rendering.
 */
import { ref, computed, watch, onMounted } from 'vue';
import { useVirtualizer } from '@tanstack/vue-virtual';
import { useApi } from './useApi.js';

export function useDataTable(options = {}) {
    const {
        apiUrl,
        columns: initialColumns = [], // [NEW] Receive initial column definitions
        persistId = null, // [NEW] Key for saving preferences
        pageSize: initialPageSize = 10,
        virtualScroll = false,
        rowHeight = 48,
        overscan = 5,
        onDataLoaded = null
    } = options;

    const api = useApi();

    // --- State ---
    const items = ref([]);
    const currentPage = ref(1);
    const pageSize = ref(initialPageSize);
    const totalItems = ref(0);
    const searchQuery = ref('');
    const sortKey = ref('');
    const sortOrder = ref('asc');
    const selectedRows = ref([]);
    const activeFilters = ref({});
    const tableBodyRef = ref(null);

    // [NEW] Column State
    // We store ONLY keys for persistence efficiency
    const allColumnKeys = initialColumns.map(c => c.key);
    const columnOrder = ref([...allColumnKeys]);
    const hiddenColumns = ref(new Set());

    // --- Persistence Logic ---
    const loadPreferences = () => {
        if (!persistId) return;
        try {
            const saved = localStorage.getItem(`dt_prefs_${persistId}`);
            if (saved) {
                const prefs = JSON.parse(saved);
                if (prefs.pageSize) pageSize.value = prefs.pageSize;
                if (prefs.hiddenColumns) hiddenColumns.value = new Set(prefs.hiddenColumns);
                // Only apply order if keys align (handles added/removed columns gracefully)
                if (prefs.columnOrder && Array.isArray(prefs.columnOrder)) {
                    // Filter out keys that allow exist in current version
                    const validKeys = prefs.columnOrder.filter(k => allColumnKeys.includes(k));
                    // Add any new keys that weren't in saved order
                    const missingKeys = allColumnKeys.filter(k => !validKeys.includes(k));
                    columnOrder.value = [...validKeys, ...missingKeys];
                }
            }
        } catch (e) {
            console.error('Failed to load table preferences', e);
        }
    };

    const savePreferences = () => {
        if (!persistId) return;
        try {
            const prefs = {
                pageSize: pageSize.value,
                hiddenColumns: Array.from(hiddenColumns.value),
                columnOrder: columnOrder.value
            };
            localStorage.setItem(`dt_prefs_${persistId}`, JSON.stringify(prefs));
        } catch (e) {
            console.error('Failed to save table preferences', e);
        }
    };

    // Initialize state
    loadPreferences();

    // Watchers for auto-save
    if (persistId) {
        watch([pageSize, hiddenColumns, columnOrder], savePreferences, { deep: true });
    }

    // --- Computed ---
    const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value));
    const hasActiveFilters = computed(() => Object.keys(activeFilters.value).length > 0);

    // [NEW] Processed Columns for Render
    const processedColumns = computed(() => {
        // 1. Map keys to defs
        const colMap = new Map(initialColumns.map(c => [c.key, c]));

        // 2. Map order to defs, filtering out hidden
        return columnOrder.value
            .filter(key => !hiddenColumns.value.has(key))
            .map(key => colMap.get(key))
            .filter(Boolean); // Safety
    });

    // [NEW] All Columns with Visibility Status (For UI Menu)
    const allColumnsWithStatus = computed(() => {
        const colMap = new Map(initialColumns.map(c => [c.key, c]));
        return columnOrder.value.map(key => {
            const def = colMap.get(key);
            if (!def) return null;
            return {
                ...def,
                visible: !hiddenColumns.value.has(key)
            };
        }).filter(Boolean);
    });

    const startIndex = computed(() => {
        if (totalItems.value === 0) return 0;
        return (currentPage.value - 1) * pageSize.value + 1;
    });

    const endIndex = computed(() => {
        const end = currentPage.value * pageSize.value;
        return end > totalItems.value ? totalItems.value : end;
    });

    const visiblePages = computed(() => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages.value, start + maxVisible - 1);
        if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    });

    // --- Virtual Scrolling Removed from Composable ---
    // Moved to UI component to ensure correct ref binding


    // --- Actions ---
    const fetchData = async () => {
        // Client-side mode
        if (options.data && Array.isArray(options.data)) {
            let result = [...options.data];

            // 1. Filtering
            if (activeFilters.value && Object.keys(activeFilters.value).length) {
                result = result.filter(item => {
                    return Object.entries(activeFilters.value).every(([key, val]) => {
                        if (val === '' || val === null || val === undefined) return true;
                        return String(item[key]).toLowerCase() === String(val).toLowerCase();
                    });
                });
            }

            // 2. Searching
            if (searchQuery.value) {
                const q = searchQuery.value.toLowerCase();
                result = result.filter(item =>
                    Object.values(item).some(val => String(val).toLowerCase().includes(q))
                );
            }

            // 3. Sorting
            if (sortKey.value) {
                result.sort((a, b) => {
                    let va = a[sortKey.value];
                    let vb = b[sortKey.value];
                    if (typeof va === 'string') va = va.toLowerCase();
                    if (typeof vb === 'string') vb = vb.toLowerCase();

                    if (va < vb) return sortOrder.value === 'asc' ? -1 : 1;
                    if (va > vb) return sortOrder.value === 'asc' ? 1 : -1;
                    return 0;
                });
            }

            // 4. Pagination
            totalItems.value = result.length;
            const start = (currentPage.value - 1) * pageSize.value;
            items.value = result.slice(start, start + pageSize.value);
            return;
        }

        // Server-side mode
        if (!apiUrl) return;

        try {
            const params = {
                page: currentPage.value,
                page_size: pageSize.value,
                ...activeFilters.value
            };

            if (searchQuery.value) params.search = searchQuery.value;
            if (sortKey.value) {
                params.sort_by = sortKey.value;
                params.sort_order = sortOrder.value;
            }

            const response = await api.get(apiUrl, { params });
            items.value = response.items || response.results || response.data || [];
            totalItems.value = response.total || response.count || items.value.length;

            if (onDataLoaded) onDataLoaded(response);
        } catch (error) {
            console.error('[useDataTable] Fetch failed:', error);
            // Error handling can be enhanced later
        } finally {
            api.loading.value = false;
        }
    };

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages.value) {
            currentPage.value = page;
            fetchData();
        }
    };

    const setPageSize = (size) => {
        pageSize.value = size;
        currentPage.value = 1;
        fetchData();
    };

    const handleSearch = (query) => {
        searchQuery.value = query;
        currentPage.value = 1;
        fetchData();
    };

    const handleSort = (key) => {
        if (sortKey.value === key) {
            sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
        } else {
            sortKey.value = key;
            sortOrder.value = 'asc';
        }
        fetchData();
    };

    const applyFilter = (key, value) => {
        if (!value && value !== 0) delete activeFilters.value[key];
        else activeFilters.value[key] = value;
        currentPage.value = 1;
        fetchData();
    };

    const clearFilters = () => {
        activeFilters.value = {};
        currentPage.value = 1;
        fetchData();
    };

    const toggleRowSelection = (id) => {
        const index = selectedRows.value.indexOf(id);
        if (index > -1) selectedRows.value.splice(index, 1);
        else selectedRows.value.push(id);
    };

    const toggleSelectAll = (allIds) => {
        if (selectedRows.value.length === items.value.length) selectedRows.value = [];
        else selectedRows.value = [...allIds];
    };

    // [NEW] Column Actions
    const toggleColumnVisibility = (key) => {
        if (hiddenColumns.value.has(key)) {
            hiddenColumns.value.delete(key);
        } else {
            // Prevent hiding all columns
            if (columnOrder.value.length - hiddenColumns.value.size <= 1) return;
            hiddenColumns.value.add(key);
        }
        // Helper trigger for deep watch to notice Set change
        hiddenColumns.value = new Set(hiddenColumns.value);
    };

    const moveColumn = (fromIndex, toIndex) => {
        if (toIndex < 0 || toIndex >= columnOrder.value.length) return;
        const newOrder = [...columnOrder.value];
        const [moved] = newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, moved);
        columnOrder.value = newOrder;
    };

    const setColumnIndex = (key, newIndex) => {
        const currentIndex = columnOrder.value.indexOf(key);
        if (currentIndex === -1) return;

        let targetIndex = Math.max(0, Math.min(newIndex, columnOrder.value.length - 1));
        if (currentIndex === targetIndex) return;

        const newOrder = [...columnOrder.value];
        const [moved] = newOrder.splice(currentIndex, 1);
        newOrder.splice(targetIndex, 0, moved);
        columnOrder.value = newOrder;
    };

    const resetColumns = () => {
        columnOrder.value = [...allColumnKeys];
        hiddenColumns.value = new Set();
    };

    // --- Lifecycle ---
    onMounted(fetchData);

    return {
        // State
        items,
        currentPage,
        pageSize,
        totalItems,
        totalPages,
        searchQuery,
        sortKey,
        sortOrder,
        selectedRows,
        activeFilters,
        loading: api.loading,

        // Computed
        hasActiveFilters,
        startIndex,
        endIndex,
        visiblePages,
        processedColumns, // [NEW] Use this for table rendering
        allColumnsWithStatus, // [NEW] Use this for config menu

        // Virtual scroll properties
        tableBodyRef,
        // virtualRows and totalSize removed (handled in UI component)

        // Actions
        fetchData,
        goToPage,
        setPageSize,
        handleSearch,
        handleSort,
        applyFilter,
        clearFilters,
        toggleRowSelection,
        toggleSelectAll,

        // [NEW] Actions
        toggleColumnVisibility,
        moveColumn,
        setColumnIndex,
        resetColumns
    };
}
