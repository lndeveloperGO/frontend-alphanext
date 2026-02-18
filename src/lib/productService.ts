import { getApiBaseUrl } from "@/lib/env";
import { useAuthStore } from "@/stores/authStore";

const getApiUrl = () => getApiBaseUrl();

export type ProductType = "single" | "bundle";

export interface ProductPackage {
  package_id: number;
  qty: number;
  sort_order: number;
}

export interface ProductPackageWithPivot {
  id: number;
  name: string;
  type: string;
  category_id: number;
  pivot: {
    product_id: number;
    package_id: number;
    qty: number;
    sort_order: number;
    created_at: string;
    updated_at: string;
  };
}

export interface ProductPackageSingle {
  id: number;
  name: string;
  type: string;
  category_id: number;
}

export interface Product {
  id: number;
  type: ProductType;
  name: string;
  price: number;
  access_days?: number; // Masa aktif akses (hari), default 30
  is_active: boolean;
  package_id?: number; // For single products
  package?: ProductPackageSingle; // For single products
  packages?: ProductPackageWithPivot[]; // For bundle products
  material_ids?: string[]; // Attached materials for premium access
  grants_answer_key: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSingleProductInput {
  type: "single";
  name: string;
  package_id: number;
  price: number;
  access_days?: number; // default 30 jika tidak dikirim
  is_active?: boolean;
  material_ids?: string[]; // Attached materials for premium access
  grants_answer_key?: boolean;
}

export interface CreateBundleProductInput {
  type: "bundle";
  name: string;
  price: number;
  access_days?: number; // default 30 jika tidak dikirim
  is_active?: boolean;
  packages: ProductPackage[];
  material_ids?: string[]; // Attached materials for premium access
  grants_answer_key?: boolean;
}

export type CreateProductInput = CreateSingleProductInput | CreateBundleProductInput;

export interface UpdateSingleProductInput {
  type?: "single";
  name?: string;
  package_id?: number;
  price?: number;
  access_days?: number;
  is_active?: boolean;
  grants_answer_key?: boolean;
}

export interface UpdateBundleProductInput {
  type?: "bundle";
  name?: string;
  price?: number;
  access_days?: number;
  is_active?: boolean;
  packages?: ProductPackage[];
  grants_answer_key?: boolean;
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

  // Update access_days only (PATCH)
  async updateProductAccessDays(id: number, access_days: number): Promise<Product> {
    const response = await fetch(`${getApiUrl()}/admin/products/${id}`, {
      method: "PATCH",
      headers: getAuthHeader(),
      body: JSON.stringify({ access_days }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update access days");
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
