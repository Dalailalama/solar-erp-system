/**
 * ERP Framework Type Definitions
 * provides IDE autocomplete and type safety
 */

import { Ref, ComputedRef } from 'vue';

// --- API Layer ---

export interface ApiResponse<T = any> {
    code: number;
    message: string;
    data?: T;
    results?: T[];
    items?: T[];
    total?: number;
    count?: number;
    show?: boolean;
}

export interface ApiOptions {
    cacheTTL?: number;
    cacheKey?: string;
    forceRefresh?: boolean;
    showToast?: boolean;
}

export interface ApiService {
    get<T = any>(url: string, config?: object, options?: ApiOptions): Promise<T>;
    post<T = any>(url: string, data?: object, options?: ApiOptions): Promise<T>;
    put<T = any>(url: string, data?: object, options?: ApiOptions): Promise<T>;
    delete<T = any>(url: string, config?: object, options?: ApiOptions): Promise<T>;
    loading: Ref<boolean>;
}

// --- Auth Layer ---

export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_superuser: boolean;
    is_staff: boolean;
    permissions: string[];
    groups: string[];
}

export interface AuthStore {
    user: User | null;
    loading: boolean;
    error: string | null;
    login(credentials: object): Promise<boolean>;
    logout(): Promise<void>;
    fetchUser(): Promise<User>;
    hasPermission(permission: string): boolean;
}

// --- Toast Layer ---

export interface ToastOptions {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    closable?: boolean;
}

export interface ToastService {
    success(message: string, options?: object): void;
    error(message: string, options?: object): void;
    warning(message: string, options?: object): void;
    info(message: string, options?: object): void;
}

// --- Validation System ---

export interface ValidationRule {
    (value: any, formData?: any): boolean | string | Promise<boolean | string>;
}

export interface ValidationSchema {
    [fieldName: string]: ValidationRule[];
}

export interface useValidationReturn {
    errors: object;
    touched: object;
    isValidating: Ref<boolean>;
    isValid: ComputedRef<boolean>;
    rules: {
        required: (msg?: string) => ValidationRule;
        email: (msg?: string) => ValidationRule;
        minLength: (min: number, msg?: string) => ValidationRule;
        maxLength: (max: number, msg?: string) => ValidationRule;
        min: (val: number, msg?: string) => ValidationRule;
        max: (val: number, msg?: string) => ValidationRule;
        pattern: (regex: RegExp, msg?: string) => ValidationRule;
        password: (opts?: object) => ValidationRule;
        match: (field: string, msg?: string) => ValidationRule;
        [key: string]: any;
    };
    validateField: (name: string, val: any, data?: any) => Promise<boolean>;
    validateAll: (data: any) => Promise<boolean>;
}

// --- Global $fx Container ---

export interface ErpFramework {
    api: ApiService;
    auth: AuthStore;
    toast: ToastService;
    p: (perm: string) => boolean; // Permission check helper
    dialog: any;
    loading: any;
    utils: {
        u: any;
        date: (val: any) => any;
        debounce: (fn: Function, delay?: number) => Function;
        throttle: (fn: Function, delay?: number) => Function;
        clone: (obj: any) => any;
        isEmpty: (val: any) => boolean;
        navigate: (path: string) => void;
    };
    u: ErpFramework['utils'];
    f: any; // Formatter
    config: any;
    bus: any;
    ui: any;
    meta: any;
    cmd: any;
    tasks: any;
    files: any;
    validation: any;
    diagnostics: any;
}

// --- Vue Augmentation ---

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $fx: ErpFramework;
        $api: ApiService;
    }
}

declare global {
    interface Window {
        $fx: ErpFramework;
        erp_debug: boolean;
    }
}
