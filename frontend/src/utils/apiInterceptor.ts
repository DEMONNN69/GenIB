/**
 * API Interceptor with Automatic Token Refresh
 * Handles 401 errors and automatically refreshes access tokens
 */

import { refreshToken } from './authApi';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });

  failedQueue = [];
};

/**
 * Enhanced fetch wrapper with automatic token refresh
 * Intercepts 401 errors and refreshes the access token
 */
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem('access_token');

  // Add authorization header if token exists
  const headers = {
    ...options.headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  // Make the initial request
  let response = await fetch(url, { ...options, headers });

  // If not 401, return response as-is
  if (response.status !== 401) {
    return response;
  }

  // Handle 401 error - token might be expired
  console.log('Token expired, attempting to refresh...');

  // If already refreshing, queue this request
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    })
      .then((newToken) => {
        // Retry with new token
        const newHeaders = {
          ...options.headers,
          Authorization: `Bearer ${newToken}`,
        };
        return fetch(url, { ...options, headers: newHeaders });
      })
      .catch((err) => {
        return Promise.reject(err);
      });
  }

  // Start token refresh process
  isRefreshing = true;

  try {
    // Attempt to refresh the token
    const newAccessToken = await refreshToken();
    console.log('Token refreshed successfully');

    // Process queued requests with new token
    processQueue(null, newAccessToken);

    // Retry the original request with new token
    const newHeaders = {
      ...options.headers,
      Authorization: `Bearer ${newAccessToken}`,
    };
    response = await fetch(url, { ...options, headers: newHeaders });

    return response;
  } catch (error) {
    console.error('Token refresh failed:', error);
    
    // Process queue with error
    processQueue(error, null);

    // Clear tokens and redirect to login
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');

    // Redirect to login page
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }

    throw error;
  } finally {
    isRefreshing = false;
  }
};

/**
 * Helper function to make authenticated GET requests
 */
export const fetchAuthGet = async (url: string): Promise<any> => {
  const response = await fetchWithAuth(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(JSON.stringify(error));
  }

  return response.json();
};

/**
 * Helper function to make authenticated POST requests
 */
export const fetchAuthPost = async (url: string, data: any): Promise<any> => {
  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(JSON.stringify(error));
  }

  return response.json();
};

/**
 * Helper function to make authenticated PUT requests
 */
export const fetchAuthPut = async (url: string, data: any): Promise<any> => {
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(JSON.stringify(error));
  }

  return response.json();
};

/**
 * Helper function to make authenticated DELETE requests
 */
export const fetchAuthDelete = async (url: string): Promise<any> => {
  const response = await fetchWithAuth(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(JSON.stringify(error));
  }

  return response.json();
};
