// API service with axios
import axios from 'axios';
import { API_CONFIG } from '../config/app';
import { useLoading } from '../composable/useLoading.js';

// Get CSRF token from cookie
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export const api = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: API_CONFIG.HEADERS,
    withCredentials: true,
    xsrfCookieName: 'csrftoken',
    xsrfHeaderName: 'X-CSRFToken'
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const { start } = useLoading();
        start();

        // Add CSRF token for non-GET requests
        if (config.method !== 'get') {
            const csrfToken = getCookie('csrftoken');
            if (csrfToken) {
                config.headers['X-CSRFToken'] = csrfToken;
            }
        }

        // Add auth token if exists
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        const { finish } = useLoading();
        finish();
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        const { finish } = useLoading();
        finish();
        return response;
    },
    (error) => {
        const { finish } = useLoading();
        finish();

        if (error.response?.status === 401) {
            // Handle unauthorized
            window.location.href = '/accounts/login/';
        }
        return Promise.reject(error);
    }
);
