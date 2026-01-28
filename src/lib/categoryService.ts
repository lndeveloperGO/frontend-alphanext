import { getApiBaseUrl } from "@/lib/env";
import { useAuthStore } from "@/stores/authStore";

const getApiUrl = () => getApiBaseUrl();

export interface Category {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryInput {
  name: string;
}

export interface UpdateCategoryInput {
  name: string;
}

const getAuthHeader = () => {
  const token = useAuthStore.getState().token;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const categoryService = {
  // List all categories
  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${getApiUrl()}/admin/categories`, {
      method: "GET",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    const data = await response.json();
    return data.data.data || data;
  },

  // Get single category
  async getCategory(id: number): Promise<Category> {
    const response = await fetch(`${getApiUrl()}/admin/categories/${id}`, {
      method: "GET",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch category ${id}`);
    }

    const data = await response.json();
    return data.data.data || data;
  },

  // Create category
  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const response = await fetch(`${getApiUrl()}/admin/categories`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create category");
    }

    const data = await response.json();
    return data.data.data || data;
  },

  // Update category
  async updateCategory(
    id: number,
    input: UpdateCategoryInput
  ): Promise<Category> {
    const response = await fetch(`${getApiUrl()}/admin/categories/${id}`, {
      method: "PUT",
      headers: getAuthHeader(),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update category");
    }

    const data = await response.json();
    return data.data.data || data;
  },

  // Delete category
  async deleteCategory(id: number): Promise<void> {
    const response = await fetch(`${getApiUrl()}/admin/categories/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete category");
    }
  },
};
