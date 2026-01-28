// Menu service
import { api } from './api.js';

export const menuService = {
    /**
     * Get all menu items
     * @returns {Promise<Array>}
     */
    async getMenu() {
        const response = await api.get('/core/menu');
        return response.data;
    },

    /**
     * Get children of a menu item
     * @param {number} menuId
     * @returns {Promise<Array>}
     */
    async getChildren(menuId) {
        const response = await api.get(`/core/menu/${menuId}/children`);
        return response.data;
    }
};
