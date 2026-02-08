import { getApiBaseUrl } from "@/lib/env";
import { useAuthStore } from "@/stores/authStore";

const getApiUrl = () => getApiBaseUrl();

export type ProductType = "single" | "bundle";

export interface ProductPackage {
  package_id: number;
  qty: number;
  sort_order: number;
}

export interface Product {
  id: number;
  type: ProductType;
  name: string;
  price: number;
  is_active: boolean;
  package_id?: number; // For single products
  packages?: ProductPackage[]; // For bundle products
  created_at?: string;
  updated_at?: string;
}

export interface CreateSingleProductInput {
  type: "single";
  name: string;
  package_id: number;
  price: number;
  is_active?: boolean;
}

export interface CreateBundleProductInput {
  type: "bundle";
  name: string;
  price: number;
  is_active?: boolean;
  packages: ProductPackage[];
}

export type CreateProductInput = CreateSingleProductInput | CreateBundleProductInput;

export interface UpdateSingleProductInput {
  type?: "single";
  name?: string;
  package_id?: number;
  price?: number;
  is_active?: boolean;
}

export interface UpdateBundleProductInput {
  type?: "bundle";
  name?: string;
  price?: number;
  is_active?: boolean;
  packages?: ProductPackage[];
}

export type UpdateProductInput = UpdateSingleProductInput | UpdateBundleProductInput;

const getAuthHeader = () => {
  const token = useAuthStore.getState().token;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const productService = {
  // List all products
  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${getApiUrl()}/admin/products`, {
      method: "GET",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const data = await response.json();
    return data.data.data || data.data || [];
  },

  // Get single product
  async getProduct(id: number): Promise<Product> {
    const response = await fetch(`${getApiUrl()}/admin/products/${id}`, {
      method: "GET",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product ${id}`);
    }

    const data = await response.json();
    return data.data.data || data.data || data;
  },

  // Create product (single or bundle)
  async createProduct(input: CreateProductInput): Promise<Product> {
    const response = await fetch(`${getApiUrl()}/admin/products`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create product");
    }

    const data = await response.json();
    return data.data.data || data.data || data;
  },

  // Update product (single or bundle)
  async updateProduct(id: number, input: UpdateProductInput): Promise<Product> {
    const response = await fetch(`${getApiUrl()}/admin/products/${id}`, {
      method: "PUT",
      headers: getAuthHeader(),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update product");
    }

    const data = await response.json();
    return data.data.data || data.data || data;
  },

  // Delete product
  async deleteProduct(id: number): Promise<void> {
    const response = await fetch(`${getApiUrl()}/admin/products/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete product");
    }
  },
};
