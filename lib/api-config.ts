/**
 * Centralized API configuration for connecting to the Python backend.
 */
export const BACKEND_API_URL = process.env.NODE_ENV === "production"
    ? "https://proj2-khot.onrender.com"
    : "http://127.0.0.1:8000";

export const getApiUrl = (path: string) => {
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${BACKEND_API_URL}/${cleanPath}`;
};
