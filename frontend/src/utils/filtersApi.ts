/**
 * API functions for Dynamic Filters
 */

import { BASE_URL_GLOBAL } from './api.ts';
import { fetchWithAuth } from './apiInterceptor';

const BASE_URL = `${BASE_URL_GLOBAL}/filters`;

export interface FilterOption {
  id: number;
  name: string;
  code: string;
  slug: string;
  description: string;
  parent: number | null;
  display_order: number;
  icon: string;
  color: string;
  is_active: boolean;
  is_featured: boolean;
  full_path: string;
  has_children: boolean;
}

export interface FilterType {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_required: boolean;
  is_hierarchical: boolean;
  allow_multiple: boolean;
  display_order: number;
  is_active: boolean;
  show_in_frontend: boolean;
  option_count: number;
  options: FilterOption[];
}

export interface FilterTypeResponse {
  success: boolean;
  data: FilterType | FilterType[];
  count?: number;
  message?: string;
}

/**
 * Get all active filter types with their options
 * This is the main endpoint for the frontend filters
 */
export const getAllFilterTypes = async (): Promise<FilterType[]> => {
  const response = await fetchWithAuth(`${BASE_URL}/types/`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch filter types');
  }

  const result: FilterTypeResponse = await response.json();
  return result.data as FilterType[];
};

/**
 * Get a single filter type by ID with its options
 */
export const getFilterTypeById = async (typeId: number): Promise<FilterType> => {
  const response = await fetchWithAuth(`${BASE_URL}/types/${typeId}/`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch filter type');
  }

  const result: FilterTypeResponse = await response.json();
  return result.data as FilterType;
};

/**
 * Get options for a specific filter type by slug
 */
export const getFilterOptionsBySlug = async (slug: string): Promise<FilterOption[]> => {
  const response = await fetchWithAuth(`${BASE_URL}/types/${slug}/options/`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch filter options');
  }

  const result: FilterTypeResponse = await response.json();
  return (result.data as FilterType).options;
};

/**
 * Search filter options across all types
 */
export const searchFilterOptions = async (query: string): Promise<FilterOption[]> => {
  const response = await fetchWithAuth(`${BASE_URL}/options/search/?q=${encodeURIComponent(query)}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error('Failed to search filter options');
  }

  const result = await response.json();
  return result.data as FilterOption[];
};

/**
 * Map backend filter types to frontend filter configs
 * Converts FilterType[] to the format expected by FilterBar component
 */
export const mapFiltersForFrontend = (filterTypes: FilterType[]) => {
  return filterTypes
    .filter(type => type.show_in_frontend && type.is_active)
    .sort((a, b) => a.display_order - b.display_order)
    .map(type => ({
      key: type.slug,
      label: type.name,
      placeholder: `Select ${type.name}`,
      options: type.options
        .filter(opt => opt.is_active)
        .sort((a, b) => a.display_order - b.display_order)
        .map(opt => ({
          value: opt.id.toString(), // Use ID for filter value
          label: opt.name,
          code: opt.code,
        })),
      isRequired: type.is_required,
      allowMultiple: type.allow_multiple,
    }));
};
