// Updated: 2026-05-05T09:22:15Z
const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
            return `http://${hostname}:8000`;
        }
    }
    // Default production backend URL
    return 'https://foodrush-backend.onrender.com';
};

const getWsUrl = (apiUrl) => {
    if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
    try {
        const url = new URL(apiUrl);
        const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${protocol}//${url.host}`;
    } catch (e) {
        return 'ws://127.0.0.1:8000';
    }
};

const API_BASE_URL = getApiUrl();
const WS_BASE_URL = getWsUrl(API_BASE_URL);

export { API_BASE_URL, WS_BASE_URL };
