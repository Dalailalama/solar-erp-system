export function getHttpOrigin() {
    const envOrigin = import.meta.env.VITE_BACKEND_ORIGIN;
    if (envOrigin && typeof envOrigin === 'string') {
        return envOrigin.replace(/\/+$/, '');
    }
    return `${window.location.protocol}//${window.location.host}`;
}

export function getWsOrigin() {
    const envWsOrigin = import.meta.env.VITE_WS_ORIGIN;
    if (envWsOrigin && typeof envWsOrigin === 'string') {
        return envWsOrigin.replace(/\/+$/, '');
    }

    const httpOrigin = getHttpOrigin();
    return httpOrigin.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
}
