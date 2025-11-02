// Base URL for API - exported for use in other API files
import { BASE_URL_GLOBAL as BASE_URL } from './api.ts';

// Authentication API Endpoints
const AUTH_URL = `${BASE_URL}/auth`;

// Types for Authentication
export interface RegisterData {
  email: string;
  username: string;
  password: string;
  password_confirm: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    username: string;
  };
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordResetConfirmData {
  token: string;
  new_password: string;
}

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('access_token');
};

// Helper function to get headers with auth token
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Register new user
export const register = async (data: RegisterData): Promise<any> => {
  const response = await fetch(`${AUTH_URL}/register/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  console.log('Register API response:', result);

  if (!response.ok) {
    throw new Error(JSON.stringify(result.errors || result));
  }

  return result;
};

// Login user
export const login = async (data: LoginData): Promise<LoginResponse> => {
  const response = await fetch(`${AUTH_URL}/login/`, {
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

  const result = await response.json();
  console.log('Login API response:', result);
  
  // Backend returns data in nested structure
  const tokens = result.data?.tokens || result.tokens || {};
  const user = result.data?.user || result.user || {};
  
  // Store tokens in localStorage
  localStorage.setItem('access_token', tokens.access);
  localStorage.setItem('refresh_token', tokens.refresh);
  
  return {
    access: tokens.access,
    refresh: tokens.refresh,
    user: user
  };
};

// Logout user
export const logout = async (): Promise<void> => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  try {
    await fetch(`${AUTH_URL}/logout/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ refresh: refreshToken }),
    });
  } finally {
    // Clear tokens regardless of response
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

// Refresh access token
export const refreshToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${AUTH_URL}/token/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    // If refresh fails, clear tokens and redirect to login
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    throw new Error('Token refresh failed');
  }

  const result = await response.json();
  localStorage.setItem('access_token', result.access);
  
  return result.access;
};

// Verify token
export const verifyToken = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${AUTH_URL}/token/verify/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    return response.ok;
  } catch (error) {
    return false;
  }
};

// Change password (requires authentication)
export const changePassword = async (data: ChangePasswordData): Promise<any> => {
  const response = await fetch(`${AUTH_URL}/password/change/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(JSON.stringify(error));
  }

  return await response.json();
};

// Request password reset
export const requestPasswordReset = async (data: PasswordResetData): Promise<any> => {
  const response = await fetch(`${AUTH_URL}/password/reset/`, {
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

  return await response.json();
};

// Confirm password reset
export const confirmPasswordReset = async (data: PasswordResetConfirmData): Promise<any> => {
  const response = await fetch(`${AUTH_URL}/password/reset/confirm/`, {
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

  return await response.json();
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};
