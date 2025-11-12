import { fetchWithAuth } from './apiInterceptor';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface BundleListItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: number;
  category_name: string;
  cover_image: string | null;
  paper_count: number;
  is_paid: boolean;
  price: string | null;
  is_featured: boolean;
  views_count: number;
  downloads_count: number;
  filters: Array<{
    id: number;
    filter_type_name: string;
    value: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface Paper {
  id: number;
  title: string;
  slug: string;
  year: number;
  month: string | null;
  category: number;
  category_name: string;
  pdf_file: string;
  cover_image: string | null;
  file_size: number;
  page_count: number | null;
  is_featured: boolean;
  views_count: number;
  downloads_count: number;
  filters: Array<{
    id: number;
    filter_type_name: string;
    value: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface BundleDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: number;
  category_name: string;
  papers: Paper[];
  bundle_pdf: string | null;
  bundle_pdf_url: string | null;
  cover_image: string | null;
  is_paid: boolean;
  price: string | null;
  is_featured: boolean;
  views_count: number;
  downloads_count: number;
  filters: Array<{
    id: number;
    filter_type_name: string;
    value: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface BundleFilters {
  category?: number;
  is_paid?: boolean;
  is_featured?: boolean;
  search?: string;
  ordering?: string;
}

/**
 * Get all bundles with optional filters
 */
export const getAllBundles = async (filters?: BundleFilters): Promise<BundleListItem[]> => {
  try {
    const params = new URLSearchParams();
    
    if (filters?.category) {
      params.append('category', filters.category.toString());
    }
    if (filters?.is_paid !== undefined) {
      params.append('is_paid', filters.is_paid.toString());
    }
    if (filters?.is_featured !== undefined) {
      params.append('is_featured', filters.is_featured.toString());
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.ordering) {
      params.append('ordering', filters.ordering);
    }

    const queryString = params.toString();
    const url = `${API_BASE_URL}/papers/bundles/${queryString ? `?${queryString}` : ''}`;

    const response = await fetchWithAuth(url);

    if (!response.ok) {
      throw new Error('Failed to fetch bundles');
    }

    const result = await response.json();
    
    // Handle wrapped response from backend
    return result.data || result;
  } catch (error) {
    console.error('Error fetching bundles:', error);
    throw error;
  }
};

/**
 * Get a specific bundle by ID
 */
export const getBundleById = async (bundleId: number): Promise<BundleDetail> => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/papers/bundles/${bundleId}/`);

    if (!response.ok) {
      throw new Error('Failed to fetch bundle');
    }

    const result = await response.json();
    
    // Handle wrapped response from backend
    return result.data || result;
  } catch (error) {
    console.error('Error fetching bundle:', error);
    throw error;
  }
};

/**
 * Get all papers in a specific bundle
 */
export const getBundlePapers = async (bundleId: number): Promise<Paper[]> => {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/papers/bundles/${bundleId}/papers/`);

    if (!response.ok) {
      throw new Error('Failed to fetch bundle papers');
    }

    const result = await response.json();
    
    // Handle wrapped response from backend
    return result.data || result;
  } catch (error) {
    console.error('Error fetching bundle papers:', error);
    throw error;
  }
};

/**
 * Download bundle PDF file
 * Opens the bundle PDF in a new window or triggers download
 */
export const downloadBundleFile = async (bundleId: number): Promise<void> => {
  try {
    const url = `${API_BASE_URL}/papers/bundles/${bundleId}/file/`;
    
    // For paid bundles, this will eventually check payment status
    // For now, it will return the file if available or 402 Payment Required
    const response = await fetchWithAuth(url);

    if (response.status === 402) {
      throw new Error('Payment required for this bundle');
    }

    if (!response.ok) {
      throw new Error('Failed to download bundle file');
    }

    // Get the blob from response
    const blob = await response.blob();
    
    // Create a temporary URL for the blob
    const blobUrl = window.URL.createObjectURL(blob);
    
    // Open in new window/tab
    window.open(blobUrl, '_blank');
    
    // Clean up after a delay
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 100);
  } catch (error) {
    console.error('Error downloading bundle file:', error);
    throw error;
  }
};

/**
 * Get bundle file URL (for iframe embedding)
 */
export const getBundleFileUrl = (bundleId: number): string => {
  return `${API_BASE_URL}/papers/bundles/${bundleId}/file/`;
};
