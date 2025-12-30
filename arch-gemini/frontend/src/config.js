// Configuration for API endpoints

// Determine the API base URL based on the environment
const getApiBaseUrl = () => {
    // 1. If explicitly set via environment variable (e.g. at build time), use it
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }

    // 2. If running on standard Vite dev port (5173), assume backend is on 8000
    // This covers both localhost and LAN access (e.g. 192.168.1.x:5173)
    if (window.location.port === '5173') {
        return `http://${window.location.hostname}:8000`;
    }

    // 3. For production/deployment (e.g. Nginx serving frontend), use relative path
    // This assumes Nginx proxies /api to the backend
    return '';
};

export const API_BASE_URL = getApiBaseUrl();
