import { ref } from 'vue';
import { useApi } from './useApi.js';
import { z } from 'zod';

/**
 * useMetadata Composable
 * Fetches and manages UI metadata (schemas for tables, forms, etc.)
 */
const metadataCache = ref({});

export function useMetadata(container) {
    const { get } = useApi();
    const loading = ref(false);

    /**
     * Get metadata for a specific component/view
     * @param {string} key - e.g., 'invoice-form', 'user-table'
     * @param {Object} schema - Optional Zod schema for validation
     */
    const getMeta = async (key, validationSchema = null) => {
        if (metadataCache.value[key]) {
            return metadataCache.value[key];
        }

        loading.value = true;
        try {
            // In a real app, this would be an endpoint like /api/v1/metadata/?key=...
            const data = await get(`core/metadata/${key}/`);

            // Validate if schema is provided
            if (validationSchema) {
                const result = validationSchema.safeParse(data);
                if (!result.success) {
                    console.error(`[Metadata] Validation failed for ${key}:`, result.error);
                }
            }

            metadataCache.value[key] = data;
            return data;
        } catch (error) {
            console.error(`[Metadata] Failed to fetch key ${key}:`, error);
            return null;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Clear specific or all cache
     */
    const clearCache = (key = null) => {
        if (key) delete metadataCache.value[key];
        else metadataCache.value = {};
    };

    return {
        loading,
        getMeta,
        clearCache,
        z // Expose zod for external validation
    };
}
