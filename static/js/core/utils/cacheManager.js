/**
 * Cache Manager
 * LRU (Least Recently Used) cache with TTL (Time To Live) support
 * Provides intelligent caching for HTTP requests
 */

class CacheManager {
    constructor(maxSize = 100, defaultTTL = 300000) { // 5 minutes default
        this.cache = new Map();
        this.maxSize = maxSize;
        this.defaultTTL = defaultTTL;
    }

    /**
     * Generate cache key from URL and params
     */
    generateKey(url, params = {}) {
        const paramString = Object.keys(params).length > 0
            ? JSON.stringify(params)
            : '';
        return `${url}::${paramString}`;
    }

    /**
     * Get cached data
     */
    get(key) {
        const entry = this.cache.get(key);

        if (!entry) return null;

        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        // Move to end (most recently used)
        this.cache.delete(key);
        this.cache.set(key, entry);

        return entry.data;
    }

    /**
     * Set cache data
     */
    set(key, data, ttl = null) {
        // Remove oldest if at capacity
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        const expiresAt = Date.now() + (ttl || this.defaultTTL);

        this.cache.set(key, {
            data,
            expiresAt,
            createdAt: Date.now()
        });
    }

    /**
     * Check if key exists and is valid
     */
    has(key) {
        return this.get(key) !== null;
    }

    /**
     * Invalidate specific cache entry
     */
    invalidate(key) {
        this.cache.delete(key);
    }

    /**
     * Invalidate by pattern (regex)
     */
    invalidatePattern(pattern) {
        const regex = new RegExp(pattern);
        const keysToDelete = [];

        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach(key => this.cache.delete(key));

        return keysToDelete.length;
    }

    /**
     * Clear all cache
     */
    clear() {
        this.cache.clear();
    }

    /**
     * Get cache statistics
     */
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
                key,
                age: Date.now() - entry.createdAt,
                ttl: entry.expiresAt - Date.now()
            }))
        };
    }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Export class for testing
export { CacheManager };
