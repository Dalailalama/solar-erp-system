// Enhanced API composable with response codes, callbacks, and flexible toast control
import { ref } from 'vue';
import { api } from '../services/api';
import { useToast } from './useToast';
import { handleResponseCode, RESPONSE_CODES } from '../utils/responseCodes';
import { cacheManager } from '../../utils/cacheManager.js';

export function useApi(options = {}) {
    const {
        showSuccessToast = false,
        showErrorToast = true,
        successMessage = 'Operation successful',
        useResponseCodes = true
    } = options;

    const loading = ref(false);
    const error = ref(null);
    const data = ref(null);
    const toast = useToast;

    let abortController = null;

    const getFormData = (formOrId) => {
        const form = typeof formOrId === 'string'
            ? document.getElementById(formOrId)
            : formOrId;

        if (!form) throw new Error(`Form not found: ${formOrId}`);

        const formData = new FormData(form);
        const data = {};

        for (let [key, value] of formData.entries()) {
            if (data[key]) {
                data[key] = Array.isArray(data[key]) ? [...data[key], value] : [data[key], value];
            } else {
                data[key] = value;
            }
        }
        return data;
    };

    const getFormDataObject = (formOrId) => {
        const form = typeof formOrId === 'string' ? document.getElementById(formOrId) : formOrId;
        if (!form) throw new Error(`Form not found: ${formOrId}`);
        return new FormData(form);
    };

    const mergeFormData = (formOrData, additionalData = {}) => {
        let formData = {};
        if (typeof formOrData === 'string') {
            formData = getFormData(formOrData);
        } else if (formOrData instanceof Object) {
            formData = formOrData;
        }
        return { ...formData, ...additionalData };
    };

    const handleResponse = (response, requestOptions = {}) => {
        const { showToast = showSuccessToast || showErrorToast, onSuccess = null, onError = null } = requestOptions;
        console.log('useApi.handleResponse: Processing response', { response, requestOptions });

        // Handle multiple messages
        if (response.messages && Array.isArray(response.messages)) {
            response.messages.forEach(msg => {
                if (showToast && msg.show !== false) {
                    const msgCode = msg.code || RESPONSE_CODES.SUCCESS;
                    const msgText = msg.msg || msg.message || '';
                    handleResponseCode({ code: msgCode, message: msgText }, toast, true);
                }
            });
        }
        // Handle single message with code
        else if (useResponseCodes && response.code !== undefined) {
            console.log('useApi.handleResponse: Using response code path');
            const shouldShowToast = showToast && response.show !== false;
            const isSuccess = handleResponseCode(response, toast, shouldShowToast);

            if (!isSuccess) {
                error.value = response.message || 'An error occurred';
                if (onError) onError(response);
                console.log('useApi.handleResponse: Error code found, throwing error.');
                throw new Error(error.value);
            } else {
                if (onSuccess) onSuccess(response);
            }
        }
        // Fallback
        else if (showToast && showSuccessToast) {
            // Safety check: Don't show success toast if response is HTML string or empty
            if (response && typeof response === 'object') {
                toast.success(successMessage);
                if (onSuccess) onSuccess(response);
            }
        }

        return response;
    };

    const makeRequest = async (requestFn, args, requestOptions = {}) => {
        loading.value = true;
        error.value = null;
        abortController = new AbortController();

        try {
            const lastArg = args[args.length - 1];
            if (typeof lastArg === 'object' && lastArg !== null && !lastArg.signal) {
                lastArg.signal = abortController.signal;
            } else if (typeof lastArg !== 'object') {
                args.push({ signal: abortController.signal });
            }

            const response = await requestFn(...args);
            data.value = response.data;
            handleResponse(response.data, requestOptions);
            return response.data;
        } catch (err) {
            console.error('useApi.makeRequest: Caught a network/request error.', err);
            if (err.name === 'CanceledError') return null;

            error.value = err.response?.data?.message || err.message;
            if (requestOptions.onError) requestOptions.onError(err);
            if (requestOptions.showToast !== false && showErrorToast && !useResponseCodes) {
                toast.error(error.value);
            }
            throw err;
        } finally {
            loading.value = false;
            abortController = null;
        }
    };

    const get = async (url, config = {}, options = {}) => {
        const { cacheTTL, cacheKey, forceRefresh = false } = options;

        // Generate cache key
        const key = cacheKey || cacheManager.generateKey(url, config.params);

        // Check cache if TTL is specified and not forcing refresh
        if (cacheTTL && !forceRefresh) {
            const cached = cacheManager.get(key);
            if (cached) {
                if (window.erp_debug) {
                    console.log(`%c[Cache] %cHIT: ${url}`, 'color: #27ae60; font-weight: bold;', 'color: inherit;');
                }
                return cached;
            }
        }

        // Fetch from API
        const result = await makeRequest(api.get, [url, config], options);

        // Store in cache if TTL is specified
        if (cacheTTL && result) {
            cacheManager.set(key, result, cacheTTL);
            if (window.erp_debug) {
                console.log(`%c[Cache] %cSTORE: ${url} (TTL: ${cacheTTL}ms)`, 'color: #3498db; font-weight: bold;', 'color: inherit;');
            }
        }

        return result;
    };

    const post = async (url, dataOrFormId, additionalData = {}, config = {}, options = {}) => {
        let finalData = dataOrFormId;
        let finalConfig = config;
        let finalOptions = options;

        if (additionalData.showToast !== undefined || additionalData.onSuccess || additionalData.onError) {
            finalOptions = additionalData;
            additionalData = {};
            finalConfig = {};
        } else if (config.showToast !== undefined || config.showToast || config.onError) {
            finalOptions = config;
            finalConfig = {};
        }

        if (typeof dataOrFormId === 'string' || (typeof dataOrFormId === 'object' && Object.keys(additionalData).length > 0)) {
            finalData = mergeFormData(dataOrFormId, additionalData);
        }

        const result = await makeRequest(api.post, [url, finalData, finalConfig], finalOptions);

        // Invalidate related cache entries on mutation
        if (options.invalidateCache) {
            const pattern = typeof options.invalidateCache === 'string' ? options.invalidateCache : url;
            cacheManager.invalidatePattern(pattern);
        }

        return result;
    };

    const postWithFiles = async (url, formOrData, additionalData = {}, config = {}, options = {}) => {
        let formData;
        let finalOptions = options;

        if (additionalData.showToast !== undefined || additionalData.onSuccess || additionalData.onError) {
            finalOptions = additionalData;
            additionalData = {};
        }

        if (typeof formOrData === 'string') {
            formData = getFormDataObject(formOrData);
            Object.keys(additionalData).forEach(key => formData.append(key, additionalData[key]));
        } else {
            formData = formOrData;
        }

        return makeRequest(api.post, [url, formData, {
            ...config,
            headers: { 'Content-Type': 'multipart/form-data', ...config.headers }
        }], finalOptions);
    };

    const put = async (url, dataOrFormId, additionalData = {}, config = {}, options = {}) => {
        let finalOptions = options;
        if (additionalData.showToast !== undefined || additionalData.onSuccess || additionalData.onError) {
            finalOptions = additionalData;
            additionalData = {};
        }
        const finalData = mergeFormData(dataOrFormId, additionalData);
        const result = await makeRequest(api.put, [url, finalData, config], finalOptions);

        // Invalidate cache on mutation
        if (options.invalidateCache) {
            const pattern = typeof options.invalidateCache === 'string' ? options.invalidateCache : url;
            cacheManager.invalidatePattern(pattern);
        }

        return result;
    };

    const patch = async (url, dataOrFormId, additionalData = {}, config = {}, options = {}) => {
        let finalOptions = options;
        if (additionalData.showToast !== undefined || additionalData.onSuccess || additionalData.onError) {
            finalOptions = additionalData;
            additionalData = {};
        }
        const finalData = mergeFormData(dataOrFormId, additionalData);
        const result = await makeRequest(api.patch, [url, finalData, config], finalOptions);

        // Invalidate cache on mutation
        if (options.invalidateCache) {
            const pattern = typeof options.invalidateCache === 'string' ? options.invalidateCache : url;
            cacheManager.invalidatePattern(pattern);
        }

        return result;
    };

    const del = async (url, config = {}, options = {}) => {
        const result = await makeRequest(api.delete, [url, config], options);

        // Invalidate cache on deletion
        if (options.invalidateCache) {
            const pattern = typeof options.invalidateCache === 'string' ? options.invalidateCache : url;
            cacheManager.invalidatePattern(pattern);
        }

        return result;
    };

    const cancel = () => {
        if (abortController) abortController.abort();
    };

    const submitForm = async (formId, url, additionalData = {}, method = 'post', options = {}) => {
        const form = document.getElementById(formId);
        if (!form) throw new Error(`Form not found: ${formId}`);

        const hasFiles = form.querySelector('input[type="file"]') !== null;

        if (hasFiles) {
            return postWithFiles(url, formId, additionalData, {}, options);
        } else {
            return method === 'post'
                ? post(url, formId, additionalData, {}, options)
                : method === 'put'
                    ? put(url, formId, additionalData, {}, options)
                    : patch(url, formId, additionalData, {}, options);
        }
    };

    return {
        loading, error, data,
        get, post, put, patch, del,
        postWithFiles, submitForm, mergeFormData,
        getFormData, getFormDataObject, cancel,
        RESPONSE_CODES,
        // Cache utilities
        cache: cacheManager
    };
}
