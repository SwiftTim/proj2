/**
 * Centralized API configuration for connecting to the Python backend.
 * In development, this defaults to localhost:8000.
 * In production, this should be set to your Render URL.
 */

export const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://127.0.0.1:8000";

export const getApiUrl = (path: string) => {
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${BACKEND_API_URL}/${cleanPath}`;
};
