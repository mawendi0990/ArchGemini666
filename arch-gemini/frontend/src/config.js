// Configuration for API endpoints

// Determine the API base URL based on the environment
const getApiBaseUrl = () => {
    // 1. If explicitly set via environment variable (e.g. at build time), use it
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }

    // 2. If running on localhost, assume standard dev setup (Backend on 8000)
    // This allows running frontend (5173) and backend (8000) separately without Nginx
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:8000';
    }

    // 3. For production/deployment (e.g. Nginx serving frontend), use relative path
    // This assumes Nginx proxies /api to the backend
    return '';
};

export const API_BASE_URL = getApiBaseUrl();
