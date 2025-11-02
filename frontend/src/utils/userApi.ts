/**
 * API functions for User Profile Management
 */

import { BASE_URL_GLOBAL } from './api';
import { fetchWithAuth } from './apiInterceptor';

const BASE_URL = `${BASE_URL_GLOBAL}/users`;

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  bio: string;
  avatar: string | null;
  phone_number: string;
  curriculum: string;
  grade_level: string;
  school: string;
  subjects: string[];
  is_verified: boolean;
  is_premium: boolean;
  is_premium_active: boolean;
  premium_expires_at: string | null;
  date_joined: string;
  last_login: string | null;
  favorite_count: number;
}

export interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  bio?: string;
  phone_number?: string;
  curriculum?: string;
  grade_level?: string;
  school?: string;
  subjects?: string[];
  avatar?: File | null;
}

export interface UserProfileResponse {
  success: boolean;
  data: UserProfile;
  message?: string;
}

/**
 * Get current user profile
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/profile/`, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch profile');
    }

    const result: UserProfileResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Update current user profile
 */
export const updateUserProfile = async (profileData: UpdateProfileData): Promise<UserProfile> => {
  try {
    // Use FormData if avatar is included, otherwise JSON
    let body: FormData | string;
    let headers: Record<string, string> = {};

    if (profileData.avatar instanceof File) {
      // Use FormData for file upload
      const formData = new FormData();
      Object.entries(profileData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'subjects' && Array.isArray(value)) {
            // Append subjects as JSON string for FormData
            formData.append(key, JSON.stringify(value));
          } else if (key === 'avatar' && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, value as string);
          }
        }
      });
      body = formData;
      // Don't set Content-Type for FormData - browser will set it with boundary
    } else {
      // Use JSON for non-file updates
      const jsonData: Record<string, any> = {};
      Object.entries(profileData).forEach(([key, value]) => {
        if (value !== undefined && key !== 'avatar') {
          jsonData[key] = value;
        }
      });
      body = JSON.stringify(jsonData);
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetchWithAuth(`${BASE_URL}/profile/`, {
      method: 'PUT',
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      body,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    const result: UserProfileResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Deactivate current user account
 */
export const deactivateAccount = async (): Promise<void> => {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/profile/deactivate/`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to deactivate account');
    }
  } catch (error) {
    console.error('Error deactivating account:', error);
    throw error;
  }
};

/**
 * Get user by ID (for viewing other user profiles)
 */
export const getUserById = async (userId: number): Promise<UserProfile> => {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/${userId}/`, {
      method: 'GET',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch user');
    }

    const result: UserProfileResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};
