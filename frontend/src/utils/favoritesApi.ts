/**
 * Favorites API Client
 * Handles all favorite-related API calls
 */

import { BASE_URL_GLOBAL } from './api';
import { fetchWithAuth } from './apiInterceptor';

const BASE_URL = `${BASE_URL_GLOBAL}/users`;

export interface FavoritePaper {
  id: number;
  paper: {
    id: number;
    title: string;
    category_name: string;
    category_slug: string;
    pdf_url: string | null;
    thumbnail_url: string | null;
    file_size_mb: number;
    page_count: number | null;
    is_free: boolean;
    is_premium: boolean;
    is_featured: boolean;
    views_count: number;
    downloads_count: number;
    filters: Array<{
      id: number;
      name: string;
      code: string;
      slug: string;
      filter_type_name: string;
      filter_type_slug: string;
    }>;
    created_at: string;
  };
  created_at: string;
}

export interface FavoritesResponse {
  success: boolean;
  data: FavoritePaper[];
  count: number;
}

export interface ToggleFavoriteResponse {
  success: boolean;
  message: string;
  is_favorited: boolean;
}

export interface CheckFavoriteResponse {
  success: boolean;
  is_favorited: boolean;
}

// Remove getAuthToken as it's no longer needed
// fetchWithAuth handles authentication automatically

/**
 * Get all favorited papers for the authenticated user
 */
export const getUserFavorites = async (): Promise<FavoritesResponse> => {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/favorites/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    throw error;
  }
};

/**
 * Toggle favorite status for a paper (add or remove)
 */
export const toggleFavorite = async (paperId: number): Promise<ToggleFavoriteResponse> => {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/favorites/toggle/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paper_id: paperId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }

    return await response.json();
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};

/**
 * Check if a paper is favorited by the authenticated user
 */
export const checkIsFavorite = async (paperId: number): Promise<CheckFavoriteResponse> => {
  try {
    const response = await fetchWithAuth(`${BASE_URL}/favorites/check/${paperId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking favorite status:', error);
    throw error;
  }
};

/**
 * Batch check if multiple papers are favorited
 */
export const checkMultipleFavorites = async (paperIds: number[]): Promise<Map<number, boolean>> => {
  const favoriteMap = new Map<number, boolean>();
  
  try {
    // Execute all checks in parallel
    const results = await Promise.all(
      paperIds.map(id => checkIsFavorite(id))
    );
    
    paperIds.forEach((id, index) => {
      favoriteMap.set(id, results[index].is_favorited);
    });
    
    return favoriteMap;
  } catch (error) {
    console.error('Error batch checking favorites:', error);
    // Return empty map on error
    return favoriteMap;
  }
};
