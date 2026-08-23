// Centralized Backend URL Configuration
const rawApiUrl = import.meta.env.VITE_API_URL || 'https://exptn-backend.onrender.com/api';
const cleanApiUrl = rawApiUrl.trim().replace(/\/+$/, '');
const cleanBaseUrl = cleanApiUrl.endsWith('/api') ? cleanApiUrl.slice(0, -4) : cleanApiUrl;

export const BACKEND_URL = cleanBaseUrl || 'https://exptn-backend.onrender.com';
export const BACKEND_API = cleanApiUrl || 'https://exptn-backend.onrender.com/api';
export const SOCKET_URL = BACKEND_URL;

