// DataTable Component (Enterprise Edition)
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useDataTable } from '../composable/useDataTable.js';
import { useTableVirtualizer } from '../composable/useTableVirtualizer.js';
import { useConfig } from '../composable/useConfig.js';
import Sortable from 'sortablejs';
import '../../../../css/core/datatable.css';

export const DataTable = {
    name: 'DataTable',
    props: {
        apiUrl: { type: String, default: '' },
        data: { type: Array, default: null }, // Client-side data
        columns: { type: Array, required: true },
        persistId: { type: String, default: null }, // [NEW] Helper for persistence
        // Config Options
        pageSizeOptions: { type: Array, default: () => [10, 25, 50, 100] },
        defaultPageSize: { type: Number, default: 10 },
        density: { type: String, default: 'comfortable' }, // 'comfortable', 'dense', 'compact'
        // Feature Flags
        searchable: { type: Boolean, default: true },
        selectable: { type: Boolean, default: false },
        virtualScroll: { type: Boolean, default: false },
        // Styling
        rowHeight: { type: Number, default: 48 },
        maxHeight: { type: String, default: '600px' },
        // Actions
        rowActions: { type: Array, default: () => [] },
        filterSchema: { type: Object, default: () => ({}) }
    },
    emits: ['row-click', 'selection-change'],
    template: `
        <div class="datatable-wrapper" :class="currentDensity">
            <!-- 1. Enterprise Toolbar -->
            <div class="table-controls">
                <!-- Search -->
                <div v-if="searchable" class="search-box-wrapper">
                    <i class="fas fa-search search-icon"></i>
                    <input 
                        type="text" 
                        class="search-input" 
                        placeholder="Search records..."
                        :value="searchQuery"
                        @input="e => handleSearch(e.target.value)"
                    >
                </div>

                <!-- Right Actions -->
                <div class="dt-toolbar-actions">
                    <!-- Settings Button (Triggers Modal) -->
                    <button class="btn-toolbar" @click="openSettingsModal" title="Table Settings">
                        <i class="fas fa-cog"></i> Settings
                    </button>

                    <!-- Density Toggle (Kept as quick action) -->
                    <div class="dropdown" style="position: relative;">
                        <button 
                            class="btn-toolbar dropdown-toggle" 
                            type="button" 
                            @click="toggleDensityMenu($event)"
                        >
                            <i class="fas fa-text-height"></i> Density
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 show" 
                            v-if="showDensityMenu"
                            style="position: absolute; right: 0; top: 100%; z-index: 1000; display: block;"
                        >
                            <li><a class="dropdown-item" href="#" @click="setDensity($event, 'comfortable')"><i class="fas fa-expand-alt me-2" :class="{'text-primary': currentDensity==='comfortable'}"></i>Comfortable</a></li>
                            <li><a class="dropdown-item" href="#" @click="setDensity($event, 'dense')"><i class="fas fa-compress-alt me-2" :class="{'text-primary': currentDensity==='dense'}"></i>Dense</a></li>
                            <li><a class="dropdown-item" href="#" @click="setDensity($event, 'compact')"><i class="fas fa-align-justify me-2" :class="{'text-primary': currentDensity==='compact'}"></i>Compact</a></li>
                        </ul>
                        <!-- Backdrop -->
                        <div v-if="showDensityMenu" @click="showDensityMenu = false" style="position: fixed; inset: 0; z-index: 999; cursor: default;"></div>
                    </div>

                    <!-- Filter Toggle -->
                    <button 
                        v-if="Object.keys(filterSchema).length"
                        class="btn-toolbar"
                        :class="{ 'active': showFilters }"
                        @click="toggleFilters"
                    >
                        <i class="fas fa-filter"></i> Filters
                        <span v-if="hasActiveFilters" class="badge bg-primary ms-1 rounded-pill">{{ Object.keys(activeFilters).length }}</span>
                    </button>

                    <!-- Refresh -->
                    <button class="btn-toolbar" @click="fetchData" title="Refresh Data">
                        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                    </button>
                    
                    <!-- Table Actions Slot -->
                    <slot name="table-actions"></slot>
                </div>
            </div>

            <!-- 2. Active Filters Display (Chips) -->
            <div v-if="hasActiveFilters" class="active-filters-chips">
                <span v-for="(val, key) in activeFilters" :key="key" class="filter-chip">
                    {{ key }}: {{ val }}
                    <i class="fas fa-times" @click="applyFilter(key, null)"></i>
                </span>
                <span class="text-muted small ms-2 cursor-pointer" @click="clearFilters" style="cursor: pointer; text-decoration: underline;">Clear All</span>
            </div>

            <!-- 3. Filter Bar (Expandable) -->
            <div v-if="showFilters" class="filter-bar p-3 bg-light border-bottom">
                <div class="row g-3">
                    <div v-for="(config, key) in filterSchema" :key="key" class="col-md-3">
                        <label class="form-label small fw-bold text-muted">{{ config.label }}</label>
                        <select 
                            v-if="config.type === 'select'" 
                            class="form-select form-select-sm"
                            :value="activeFilters[key]"
                            @change="e => applyFilter(key, e.target.value)"
                        >
                            <option value="">All</option>
                            <option v-for="opt in config.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                        </select>
                        <input 
                            v-else
                            :type="config.type || 'text'"
                            class="form-control form-control-sm"
                            :value="activeFilters[key]"
                            @input="e => applyFilter(key, e.target.value)"
                        >
                    </div>
                </div>
            </div>

            <!-- 4. Data Table -->
            <div class="table-container" :style="{ maxHeight: maxHeight, overflowY: 'auto' }" ref="tableBodyRef">
                <table class="erp-table">
                    <!-- Header -->
                    <thead>
                        <tr>
                            <th v-if="selectable" style="width: 40px" class="text-center">
                                <input class="form-check-input" type="checkbox" :checked="allSelected" @change="e => toggleSelectAll(items.map(i=>i.id))">
                            </th>
                            <th 
                                v-for="col in processedColumns" 
                                :key="col.key"
                                :style="{ width: col.width, cursor: col.sortable ? 'pointer' : 'default' }"
                                @click="col.sortable && handleSort(col.key)"
                            >
                                <div class="d-flex align-items-center justify-content-between">
                                    {{ col.label }}
                                    <i v-if="col.sortable" 
                                       class="small ms-2" 
                                       :class="sortKey === col.key 
                                            ? (sortOrder === 'asc' ? 'fas fa-sort-up text-primary' : 'fas fa-sort-down text-primary') 
                                            : 'fas fa-sort text-muted opacity-25'"
                                    ></i>
                                </div>
                            </th>
                            <th v-if="rowActions.length > 0" class="text-end" style="width: 100px;">Actions</th>
                        </tr>
                    </thead>

                    <!-- Body: Loading Skeleton -->
                    <tbody v-if="loading && !items.length">
                        <tr v-for="n in 5" :key="n" class="skeleton-row">
                            <td v-if="selectable"><div class="skeleton-box" style="width: 20px;"></div></td>
                            <td v-for="col in processedColumns" :key="col.key">
                                <div class="skeleton-box" :style="{ width: Math.floor(Math.random() * 40 + 60) + '%' }"></div>
                            </td>
                            <td v-if="rowActions.length > 0"><div class="skeleton-box"></div></td>
                        </tr>
                    </tbody>

                    <!-- Body: Data -->
                    <tbody v-else>
                        <!-- Top Spacer -->
                        <tr v-if="paddingTop > 0" :style="{ height: paddingTop + 'px' }">
                            <td :colspan="totalColumns" style="padding: 0; border: none;"></td>
                        </tr>

                        <!-- Virtual Rows -->
                        <tr 
                            v-for="row in virtualRows" 
                            :key="row.item.id || row.index" 
                            class="data-row"
                            :class="{ 'selected': selectedRows.includes(row.item.id) }"
                            @click="handleRowClick(row.item)"
                        >
                            <td v-if="selectable" class="text-center">
                                <input class="form-check-input" type="checkbox" :checked="selectedRows.includes(row.item.id)" @change="e => toggleRowSelection(e, row.item.id)" @click="e => e.stopPropagation()">
                            </td>
                            
                            <td v-for="col in processedColumns" :key="col.key">
                                <!-- Slot Support -->
                                <slot 
                                    v-if="$slots['cell-' + col.key]" 
                                    :name="'cell-' + col.key" 
                                    :item="row.item" 
                                    :value="row.item[col.key]"
                                ></slot>
                                <!-- Formatted HTML Support (v-html) -->
                                <span v-else-if="col.formatter" v-html="col.formatter(row.item[col.key], row.item)"></span>
                                <!-- Default Text -->
                                <span v-else>{{ row.item[col.key] }}</span>
                            </td>

                            <td v-if="rowActions.length > 0" class="text-end">
                                <div class="dt-action-group" @click="e => e.stopPropagation()">
                                    <button 
                                        v-for="action in rowActions" 
                                        :key="action.label"
                                        class="btn btn-sm btn-link text-decoration-none text-muted p-1"
                                        @click="action.handler(row.item)" 
                                        :title="action.label"
                                    >
                                        <i :class="'fas fa-' + (action.icon || 'circle')"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>

                        <!-- Bottom Spacer -->
                        <tr v-if="paddingBottom > 0" :style="{ height: paddingBottom + 'px' }">
                            <td :colspan="totalColumns" style="padding: 0; border: none;"></td>
                        </tr>

                        <!-- Empty State -->
                        <tr v-if="!loading && items.length === 0">
                            <td :colspan="totalColumns" class="text-center py-5">
                                <div class="text-muted">
                                    <i class="fas fa-inbox fa-3x mb-3 opacity-25"></i>
                                    <p class="mb-0">No records found</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <!-- 5. Footer -->
            <div class="table-footer">
                <div class="dt-pagination-info">
                    <span class="me-2">Rows per page:</span>
                    <select class="form-select form-select-sm border-0 bg-transparent fw-bold" style="width: auto;" :value="pageSize" @change="e => setPageSize(parseInt(e.target.value))">
                        <option v-for="s in pageSizeOptions" :key="s" :value="s">{{ s }}</option>
                    </select>
                    <div class="vr mx-3"></div>
                    <span>{{ startIndex }}-{{ endIndex }} of {{ totalItems }}</span>
                </div>

                <div class="dt-pagination-controls">
                    <button class="page-btn" :disabled="currentPage === 1" @click="goToPage(currentPage - 1)">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button 
                        v-for="page in visiblePages" 
                        v-memo="[page, currentPage]"
                        :key="page" 
                        class="page-btn"
                        :class="{ 'active': currentPage === page }"
                        @click="goToPage(page)"
                    >
                        {{ page }}
                    </button>
                    <button class="page-btn" :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>

            <!-- 6. Customize Columns Modal (Self-Contained) -->
            <Teleport to="body">
                <div v-if="showSettingsModal" class="dt-modal-backdrop" @click.self="showSettingsModal = false">
                     <div class="dt-modal-dialog">
                        <!-- Header -->
                        <div class="dt-modal-header">
                            <h5 class="dt-modal-title"><i class="fas fa-table me-2"></i>Table Settings</h5>
                            <button type="button" class="dt-btn-close" @click="showSettingsModal = false">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <!-- Body -->
                        <div class="dt-modal-body">
                            <!-- Search -->
                            <div class="p-3 border-bottom bg-white">
                                <input 
                                    type="text" 
                                    class="search-input" 
                                    style="width: 100%; border-radius: 6px;"
                                    placeholder="Find a column..." 
                                    v-model="columnsSearch"
                                >
                            </div>
                            
                            <!-- Columns List (Sortable) -->
                            <div ref="sortableList" style="min-height: 200px;">
                                <div 
                                    v-for="(col, index) in filteredColumnsList" 
                                    :key="col.key" 
                                    class="dt-list-item column-item-draggable"
                                    :data-id="col.key"
                                >
                                    <!-- Drag Handle -->
                                    <div class="me-3 text-muted cursor-move sortable-handle" style="cursor: grab; min-width: 20px; text-align: center;">
                                        <i class="fas fa-grip-vertical"></i>
                                    </div>

                                    <!-- Visibility Checkbox -->
                                    <div class="me-3 mb-0">
                                        <input 
                                            class="form-check-input" 
                                            type="checkbox" 
                                            :checked="col.visible"
                                            @change="toggleColumnVisibility(col.key)"
                                            style="cursor: pointer;"
                                        >
                                    </div>

                                    <!-- Label -->
                                    <div class="flex-grow-1 fw-medium text-dark">
                                        {{ col.label }}
                                    </div>

                                    <!-- Index Input -->
                                    <input 
                                        type="number" 
                                        class="form-control text-center fw-bold" 
                                        style="width: 60px; padding: 4px; font-size: 13px; height: auto;"
                                        :value="index + 1"
                                        min="1"
                                        :max="allColumnsWithStatus.length"
                                        @change="e => handleManualIndexChange(col.key, e)"
                                    >
                                </div>
                                
                                <div v-if="filteredColumnsList.length === 0" class="text-center py-4 text-muted">
                                    No columns match your search.
                                </div>
                            </div>
                        </div>

                        <!-- Footer -->
                        <div class="dt-modal-footer">
                            <button type="button" class="btn-toolbar text-danger" style="border-color: #fee2e2; background: #fef2f2;" @click="resetColumns">
                                <i class="fas fa-undo me-1"></i> Reset Default
                            </button>
                            <button type="button" class="btn-toolbar-primary" @click="showSettingsModal = false">
                                Done
                            </button>
                        </div>
                     </div>
                </div>
            </Teleport>
        </div>
    `,
    setup(props, { emit }) {
        const config = useConfig;
        const effectivePageSize = config.defaultPageSize || props.defaultPageSize || 10;

        // --- 1. Data Logic ---
        const {
            items, currentPage, pageSize, totalItems, totalPages, searchQuery, sortKey, sortOrder, selectedRows, activeFilters,
            loading, hasActiveFilters, startIndex, endIndex, visiblePages, tableBodyRef,
            // Column State
            processedColumns, allColumnsWithStatus,
            // Actions
            goToPage, setPageSize, handleSearch, handleSort, applyFilter, clearFilters, toggleRowSelection, toggleSelectAll, fetchData,
            // New Actions
            toggleColumnVisibility, moveColumn, setColumnIndex, resetColumns
        } = useDataTable({
            apiUrl: props.apiUrl,
            data: props.data,
            columns: props.columns,
            persistId: props.persistId,
            pageSize: effectivePageSize,
            virtualScroll: props.virtualScroll,
            rowHeight: props.rowHeight
        });

        // --- 2. Virtual Scroll ---
        const { virtualRows, totalSize, paddingTop, paddingBottom, scrollToTop } = useTableVirtualizer(
            tableBodyRef,
            items,
            { enabled: props.virtualScroll, rowHeight: props.rowHeight, overscan: 5, debug: window.erp_debug }
        );

        // --- 3. UI State ---
        const currentDensity = ref(props.density);
        const showFilters = ref(false);
        const showDensityMenu = ref(false);
        const showSettingsModal = ref(false);
        const sortableList = ref(null);
        let sortableInstance = null;

        const columnsSearch = ref('');

        // --- 4. SortableJS Logic ---
        watch(showSettingsModal, async (isOpen) => {
            if (isOpen) {
                await nextTick();
                if (sortableList.value && !sortableInstance) {
                    sortableInstance = Sortable.create(sortableList.value, {
                        handle: '.sortable-handle',
                        animation: 150,
                        ghostClass: 'bg-light',
                        onEnd: (evt) => {
                            // Map DOM index back to data index
                            // NOTE: This works simply because list rendering order matches array order.
                            // If filtering is active, indexes might mismatch. 
                            // Robust solution: use data-id to find key, then move.
                            // However, Sortable modifies DOM. Vue virtual DOM might conflict if we don't sync state immediately.
                            // Better to rely on data-id.

                            const itemEl = evt.item;
                            const key = itemEl.getAttribute('data-id');
                            const oldIndex = evt.oldIndex;
                            const newIndex = evt.newIndex;

                            // If filtering is on, basic index mapping won't work on the full array.
                            // We should disable D&D while filtering, or handle mapped indexes?
                            // For simplicity: disabled D&D if searching.
                            if (columnsSearch.value) return;

                            moveColumn(oldIndex, newIndex);
                        }
                    });
                }
            }
        });

        // Computed for Modal List
        const filteredColumnsList = computed(() => {
            if (!columnsSearch.value) return allColumnsWithStatus.value;
            const q = columnsSearch.value.toLowerCase();
            return allColumnsWithStatus.value.filter(c => c.label.toLowerCase().includes(q));
        });

        const handleManualIndexChange = (key, event) => {
            const val = parseInt(event.target.value);
            if (isNaN(val) || val < 1) return;
            setColumnIndex(key, val - 1); // 0-based
        };

        const openSettingsModal = () => {
            showSettingsModal.value = true;
            showDensityMenu.value = false;
        };

        const setDensity = (event, val) => {
            if (event) event.preventDefault();
            currentDensity.value = val;
            showDensityMenu.value = false;
        };
        const toggleFilters = () => showFilters.value = !showFilters.value;
        const toggleDensityMenu = (event) => {
            if (event) event.stopPropagation();
            showDensityMenu.value = !showDensityMenu.value;
        };
        const toggleRowSelectionWrapper = (event, id) => {
            if (event) event.stopPropagation();
            toggleRowSelection(id);
        }

        const handleRowClick = (item) => {
            emit('row-click', item);
        };

        const totalColumns = computed(() => {
            let count = processedColumns.value.length;
            if (props.selectable) count++;
            if (props.rowActions.length > 0) count++;
            return count;
        });

        const allSelected = computed(() => {
            return items.value.length > 0 && items.value.every(i => selectedRows.value.includes(i.id));
        });

        watch(currentPage, () => scrollToTop());

        return {
            items, currentPage, pageSize, totalItems, totalPages, searchQuery, sortKey, sortOrder, selectedRows, activeFilters,
            loading, hasActiveFilters, startIndex, endIndex, visiblePages, tableBodyRef,
            processedColumns, allColumnsWithStatus, toggleColumnVisibility, moveColumn, setColumnIndex, resetColumns,
            virtualRows, totalSize, paddingTop, paddingBottom,
            goToPage, setPageSize, handleSearch, handleSort, applyFilter, clearFilters, toggleRowSelection: toggleRowSelectionWrapper, toggleSelectAll, fetchData,
            handleRowClick,
            currentDensity, setDensity, showFilters, toggleFilters, showDensityMenu, toggleDensityMenu,
            totalColumns, allSelected,
            // Modal
            showSettingsModal, openSettingsModal, sortableList, columnsSearch, filteredColumnsList, handleManualIndexChange
        };
    }
};
