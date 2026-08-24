// Centralized, Resilient, Production-Ready API Client
// Handles timeouts, AbortController, error normalization, and token headers

const DEFAULT_API_URL = 'https://exptn-backend.onrender.com/api';

export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return DEFAULT_API_URL;
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Execute resilient HTTP requests with built-in timeout and safe error extraction
 */
export async function request(endpoint, options = {}) {
  const {
    timeout = 10000,
    headers = {},
    params = null,
    signal: userSignal = null,
    ...customConfig
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // If consumer supplied their own signal, listen to it
  if (userSignal) {
    userSignal.addEventListener('abort', () => controller.abort());
  }

  // Construct absolute URL
  let url = endpoint;
  if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    url = `${API_BASE_URL}${cleanEndpoint}`;
  }

  // Append query params if provided
  if (params && typeof params === 'object') {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  // Prepare standard headers
  const defaultHeaders = {
    'Accept': 'application/json'
  };

  let token = localStorage.getItem('token') || '';
  if (!token) {
    try {
      const savedUser = localStorage.getItem('ETN_USER');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u?.token) token = u.token;
      }
    } catch (e) {}
  }

  if (token && token.length > 10) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  if (customConfig.body && !(customConfig.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const config = {
    method: options.method || 'GET',
    headers: {
      ...defaultHeaders,
      ...headers
    },
    signal: controller.signal,
    ...customConfig
  };

  try {
    const response = await fetch(url, config);
    clearTimeout(timeoutId);

    // Try parsing JSON safely
    let data = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (parseErr) {
        data = null;
      }
    } else {
      try {
        data = await response.text();
      } catch (e) {
        data = null;
      }
    }

    if (!response.ok) {
      const errorMessage = (data && (data.message || data.error)) 
        || (typeof data === 'string' && data.length < 200 ? data : null)
        || `Request failed with status ${response.status} (${response.statusText})`;
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      const timeoutError = new Error(`Request timed out after ${timeout / 1000} seconds. Please check your connection.`);
      timeoutError.isTimeout = true;
      timeoutError.status = 408;
      throw timeoutError;
    }
    throw error;
  }
}

export const apiClient = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PATCH', body: body instanceof FormData ? body : JSON.stringify(body) }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' })
};

export default apiClient;
