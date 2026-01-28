import { computed, watch } from 'vue';
import { useVirtualizer } from '@tanstack/vue-virtual';

/**
 * useTableVirtualizer
 * Handles virtual scrolling logic for data tables.
 * 
 * @param {Ref<HTMLElement>} scrollElementRef - Ref to the scroll container
 * @param {Ref<Array>} itemsRef - Ref to the data items
 * @param {Object} options - Configuration options
 * @returns {Object} Virtualization state and computed styles
 */
export function useTableVirtualizer(scrollElementRef, itemsRef, options = {}) {
    const {
        enabled = false,
        rowHeight = 48,
        overscan = 5,
        debug = false
    } = options;

    // Configuration for TanStack Virtual
    const virtualizerOptions = computed(() => ({
        count: itemsRef.value.length,
        getScrollElement: () => scrollElementRef.value,
        estimateSize: () => rowHeight,
        overscan: overscan,
        enabled: enabled
    }));

    // Initialize Virtualizer
    const rowVirtualizer = useVirtualizer(virtualizerOptions);

    // Computed: Virtual Rows to Render
    const virtualRows = computed(() => {
        if (!enabled) {
            // If disabled, return all items with static metadata
            return itemsRef.value.map((item, index) => ({
                index,
                item,
                start: 0,
                size: rowHeight,
                isVirtual: false
            }));
        }

        // Map virtual items to actual data items
        return rowVirtualizer.value.getVirtualItems().map(virtualRow => ({
            index: virtualRow.index,
            item: itemsRef.value[virtualRow.index],
            start: virtualRow.start,
            size: virtualRow.size,
            isVirtual: true
        }));
    });

    // Computed: Total Scrollable Size
    const totalSize = computed(() => enabled ? rowVirtualizer.value.getTotalSize() : 0);

    // Computed: Spacer Heights
    const paddingTop = computed(() => {
        if (!enabled || virtualRows.value.length === 0) return 0;
        return virtualRows.value[0].start;
    });

    const paddingBottom = computed(() => {
        if (!enabled || virtualRows.value.length === 0) return 0;
        const last = virtualRows.value[virtualRows.value.length - 1];
        return totalSize.value - (last.start + last.size);
    });

    // Debugging Watcher
    if (debug) {
        watch(() => virtualRows.value, (rows) => {
            if (enabled && window.erp_debug) {
                console.log(`[useTableVirtualizer] Rows: ${rows.length}, Total Height: ${totalSize.value}px`);
                console.log(`[useTableVirtualizer] Spacers - Top: ${paddingTop.value}px, Bottom: ${paddingBottom.value}px`);
            }
        });
    }

    // Helper: Scroll to Top
    const scrollToTop = () => {
        if (scrollElementRef.value) {
            scrollElementRef.value.scrollTop = 0;
        }
    };

    return {
        virtualRows,
        totalSize,
        paddingTop,
        paddingBottom,
        scrollToTop,
        instance: rowVirtualizer
    };
}
