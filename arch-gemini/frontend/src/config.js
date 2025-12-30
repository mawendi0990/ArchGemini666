// Configuration for API endpoints

// Determine the API base URL based on the environment
const getApiBaseUrl = () => {
    // 1. If explicitly set via environment variable, use it
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }

    // 2. Use relative path (Proxy Mode)
    // Vite server (port 5173) will proxy requests starting with /api to backend (port 8000)
    // This avoids CORS issues and simplifies LAN access configuration.
    return '';
};

export const API_BASE_URL = getApiBaseUrl();
