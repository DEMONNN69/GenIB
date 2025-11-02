/**
 * API functions for Paper Categories
 */
import { BASE_URL_GLOBAL} from './api.ts';
import { fetchWithAuth } from './apiInterceptor';

const BASE_URL = `${BASE_URL_GLOBAL}/papers`;

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  parent?: number | null;
  is_free: boolean;
  is_downloadable: boolean;
  is_online: boolean;
  is_printable: boolean;
  is_main: boolean;
  display_order: number;
  paper_count: number;
  subcategories_count: number;
  full_path?: string;
  is_subcategory?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryTree extends Category {
  subcategories: CategoryTree[];
}

export interface CategoryResponse {
  success: boolean;
  data: Category | Category[];
  count?: number;
  message?: string;
}

/**
 * Get all root categories (no parent)
 */
export const getAllCategories = async (): Promise<Category[]> => {
  const response = await fetchWithAuth(`${BASE_URL}/categories/`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  const result: CategoryResponse = await response.json();
  return result.data as Category[];
};

/**
 * Get category tree with nested subcategories
 */
export const getCategoryTree = async (): Promise<CategoryTree[]> => {
  const response = await fetchWithAuth(`${BASE_URL}/categories/tree/`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch category tree');
  }

  const result: CategoryResponse = await response.json();
  return result.data as CategoryTree[];
};

/**
 * Get a single category by ID
 */
export const getCategoryById = async (categoryId: number): Promise<Category> => {
  const response = await fetchWithAuth(`${BASE_URL}/categories/${categoryId}/`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch category');
  }

  const result: CategoryResponse = await response.json();
  return result.data as Category;
};

/**
 * Get all subcategories of a parent category
 */
export const getSubcategories = async (parentId: number): Promise<Category[]> => {
  const response = await fetchWithAuth(`${BASE_URL}/categories/${parentId}/subcategories/`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch subcategories');
  }

  const result: CategoryResponse = await response.json();
  return result.data as Category[];
};

/**
 * Search categories by name or description
 */
export const searchCategories = async (query: string): Promise<Category[]> => {
  const response = await fetchWithAuth(`${BASE_URL}/categories/search/?q=${encodeURIComponent(query)}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to search categories');
  }

  const result: CategoryResponse = await response.json();
  return result.data as Category[];
};

/**
 * Create a new category (admin only)
 */
export const createCategory = async (categoryData: Partial<Category>): Promise<Category> => {
  const response = await fetchWithAuth(`${BASE_URL}/categories/`, {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });

  if (!response.ok) {
    throw new Error('Failed to create category');
  }

  const result: CategoryResponse = await response.json();
  return result.data as Category;
};

/**
 * Update an existing category (admin only)
 */
export const updateCategory = async (
  categoryId: number,
  categoryData: Partial<Category>
): Promise<Category> => {
  const response = await fetchWithAuth(`${BASE_URL}/categories/${categoryId}/`, {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  });

  if (!response.ok) {
    throw new Error('Failed to update category');
  }

  const result: CategoryResponse = await response.json();
  return result.data as Category;
};

/**
 * Delete a category (admin only - soft delete)
 */
export const deleteCategory = async (categoryId: number): Promise<void> => {
  const response = await fetchWithAuth(`${BASE_URL}/categories/${categoryId}/`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete category');
  }
};

/**
 * Map backend category data to frontend format for Sidebar
 * Converts backend field names to frontend naming convention
 */
export const mapCategoryForSidebar = (category: Category) => ({
  id: category.id,
  name: category.name,
  href: category.name === 'GenIB Question Bank' ? '/questions' : 
        category.name === 'Build Exam or Worksheet' ? '/exam-builder' : 
        '/papers',
  icon: category.icon,
  description: category.description,
  count: category.paper_count,
  isMain: category.is_main,
});
