const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    if (typeof window !== 'undefined') return `http://${window.location.hostname}:8000`;
    return 'http://127.0.0.1:8000';
};

const getWsUrl = (apiUrl) => {
    if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
    try {
        const url = new URL(apiUrl);
        const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
        // Add /ws endpoint suffix if not already present? Actually the backend route is /ws/{role}/{user_id}
        // So the base URL should just be the host.
        return `${protocol}//${url.host}`;
    } catch (e) {
        if (typeof window !== 'undefined') return `ws://${window.location.hostname}:8000`;
        return 'ws://127.0.0.1:8000';
    }
};

const API_BASE_URL = getApiUrl();
const WS_BASE_URL = getWsUrl(API_BASE_URL);

export { API_BASE_URL, WS_BASE_URL };
