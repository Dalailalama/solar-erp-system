# Developer Guide: Adding New Features

This guide walks you through adding a new page (e.g., "Products") to the ERP system.

## Step 1: Backend API (Django)
Create the API endpoint to serve data.

1.  Open `erp_system_app/api.py` (or create a new `api.py` in your app).
2.  Define a Schema and Endpoint.
    ```python
    from ninja import Router, Schema

    router = Router()

    class ProductSchema(Schema):
        id: int
        name: str
        price: float

    @router.get("/products/", response=list[ProductSchema])
    def list_products(request):
        return Product.objects.all()
    ```
3.  Register the router in the main `api.py`.

## Step 2: Frontend Component (Vue)
Create the UI page.

1.  Create `static/js/inventory/Products.js`.
2.  Scaffold the component.
    ```javascript
    import { ref, onMounted } from 'vue';
    import { DataTable } from '../core/components/ui/DataTable.js';

    export const Products = {
        template: `
            <div class="panel">
                <div class="panel-header">
                    <h3>Product List</h3>
                </div>
                <div class="panel-body">
                    <data-table 
                        :columns="columns" 
                        api-endpoint="/inventory/products/" 
                    />
                </div>
            </div>
        `,
        components: { DataTable },
        setup() {
            const columns = [
                { key: 'name', label: 'Product Name' },
                { key: 'price', label: 'Price' }
            ];
            return { columns };
        }
    };
    ```

## Step 3: Register Route & Component
Tell the application how to load this page.

1.  Open `static/js/core/components/layout/MainLayout.js`.
2.  **Import** the component (Async recommended).
    ```javascript
    const Products = defineAsyncComponent(() => import('../../inventory/Products.js').then(m => m.Products));
    ```
3.  **Register** in `components: {}`.
4.  **Add Logic** to `activeComponent` computed property.
    ```javascript
    const activeComponent = computed(() => {
        if (currentRoute.value === '/products') return 'Products';
        // ...
    });
    ```

## Step 4: Add to Sidebar
Make it accessible.

1.  Open `static/js/core/components/composable/useMenu.js`.
2.  Add to login logic or static list.
    ```javascript
    // Or if fetching from API, ensure backend Menu API includes it.
    {
        id: 'products',
        label: 'Products',
        icon: 'fas fa-box',
        route: '/products'
    }
    ```

## Step 5: Verify
1.  Refresh page.
2.  Click "Products" in Sidebar.
3.  Ensure URL updates to `/app/products`.
4.  Ensure table loads data.
