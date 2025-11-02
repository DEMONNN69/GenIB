/**
 * Papers API Client
 * Handles all paper-related API calls
 */

import { BASE_URL_GLOBAL } from './api';

const BASE_URL = `${BASE_URL_GLOBAL}/papers`;

export interface FilterOption {
  id: number;
  name: string;
  code: string;
  slug: string;
  filter_type_name: string;
  filter_type_slug: string;
}

export interface Paper {
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
  filters: FilterOption[];
  created_at: string;
}

export interface PaperDetail extends Paper {
  description: string;
  category: {
    id: number;
    name: string;
    slug: string;
    description: string;
    icon: string;
  };
  file_size: number;
  is_active: boolean;
  updated_at: string;
}

export interface PapersResponse {
  success: boolean;
  data: Paper[];
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PaperDetailResponse {
  success: boolean;
  data: PaperDetail;
}

export interface PaperFilters {
  category?: string;
  filter?: string[];
  search?: string;
  featured?: boolean;
  free?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
}

/**
 * Get all papers with optional filters
 */
export const getAllPapers = async (filters?: PaperFilters): Promise<PapersResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters?.category) params.append('category', filters.category);
    if (filters?.filter) {
      filters.filter.forEach(f => params.append('filter', f));
    }
    if (filters?.search) params.append('search', filters.search);
    if (filters?.featured !== undefined) params.append('featured', filters.featured.toString());
    if (filters?.free !== undefined) params.append('free', filters.free.toString());
    if (filters?.ordering) params.append('ordering', filters.ordering);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.page_size) params.append('page_size', filters.page_size.toString());
    
    const url = `${BASE_URL}/papers/${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching papers:', error);
    throw error;
  }
};

/**
 * Get a single paper by ID
 */
export const getPaperById = async (paperId: number): Promise<PaperDetailResponse> => {
  try {
    const response = await fetch(`${BASE_URL}/papers/${paperId}/`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching paper:', error);
    throw error;
  }
};

/**
 * Record a paper download and get the PDF URL
 */
export const downloadPaper = async (paperId: number): Promise<{ success: boolean; data: { pdf_url: string; downloads_count: number } }> => {
  try {
    const response = await fetch(`${BASE_URL}/papers/${paperId}/download/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // If we have a PDF URL, trigger download in browser
    if (data.success && data.data.pdf_url) {
      const link = document.createElement('a');
      link.href = data.data.pdf_url;
      link.download = '';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    return data;
  } catch (error) {
    console.error('Error downloading paper:', error);
    throw error;
  }
};

/**
 * Search papers by query
 */
export const searchPapers = async (query: string): Promise<{ success: boolean; data: Paper[]; count: number }> => {
  try {
    if (!query || query.length < 2) {
      return { success: false, data: [], count: 0 };
    }
    
    const response = await fetch(`${BASE_URL}/papers/search/?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching papers:', error);
    throw error;
  }
};

/**
 * Get papers by category slug
 */
export const getPapersByCategory = async (categorySlug: string, page = 1, pageSize = 20): Promise<PapersResponse> => {
  return getAllPapers({
    category: categorySlug,
    page,
    page_size: pageSize,
  });
};

/**
 * Get featured papers
 */
export const getFeaturedPapers = async (limit = 10): Promise<PapersResponse> => {
  return getAllPapers({
    featured: true,
    page_size: limit,
  });
};

/**
 * Helper function to get filter value by type slug
 */
export const getFilterValue = (paper: Paper, filterTypeSlug: string): FilterOption | undefined => {
  return paper.filters.find(f => f.filter_type_slug === filterTypeSlug);
};

/**
 * Helper function to get all filter values by type slug
 */
export const getFilterValues = (paper: Paper, filterTypeSlug: string): FilterOption[] => {
  return paper.filters.filter(f => f.filter_type_slug === filterTypeSlug);
};
