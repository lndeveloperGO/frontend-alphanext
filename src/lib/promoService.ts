import { getApiBaseUrl } from "@/lib/env";
import { useAuthStore } from "@/stores/authStore";

const getApiUrl = () => getApiBaseUrl();

// Promo Product Assignment
export interface PromoProduct {
  id: number;
  promo_id: string;
  product_id: number;
  product?: {
    id: number;
    name: string;
    type: "single" | "bundle";
    price: number;
  };
}

// Promo Package Assignment
export interface PromoPackage {
  id: number;
  promo_id: string;
  package_id: number;
  package?: {
    id: number;
    name: string;
    type: string;
  };
}

// Promo Code Assignment Response Interfaces
export interface PromoCodeAssignmentProduct {
  id: number;
  name: string;
  type: "single" | "bundle";
  price: number;
  is_active?: boolean;
}

export interface PromoCodeAssignmentPackage {
  id: number;
  name: string;
  type: string;
  category_id?: number;
}

export interface PromoCodeAssignmentData {
  promo_code_id: number;
  code: string;
  products: PromoCodeAssignmentProduct[];
  packages: PromoCodeAssignmentPackage[];
}

export interface PromoCodeAssignmentResponse {
  success: boolean;
  data: PromoCodeAssignmentData;
}

export interface PromoCode {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_purchase: number;
  max_uses: number;
  used_count: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  status: "active" | "upcoming" | "expired" | "disabled" | "quota_exhausted";
  created_at?: string;
  updated_at?: string;
  // Assignment relations
  promo_products?: PromoProduct[];
  promo_packages?: PromoPackage[];
}

export interface CreatePromoCodeInput {
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_purchase?: number;
  max_uses: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
}

export interface UpdatePromoCodeInput {
  code?: string;
  type?: "percent" | "fixed";
  value?: number;
  min_purchase?: number;
  max_uses?: number;
  starts_at?: string;
  ends_at?: string;
  is_active?: boolean;
}

export interface PromoCodeListResponse {
  success: boolean;
  data: PromoCode[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PromoCodeResponse {
  success: boolean;
  data: PromoCode;
}

export interface ValidatePromoCodeInput {
  code: string;
  amount: number;
  product_id?: number;
}

export interface ValidatePromoCodeResponse {
  success: boolean;
  data: {
    discount: number;
    final_amount: number;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
}

const getAuthHeader = (admin: boolean = false) => {
  const token = useAuthStore.getState().token;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const promoService = {
  // Admin: List promo codes
  async getPromoCodes(params?: {
    search?: string;
    is_active?: boolean;
    page?: number;
  }): Promise<PromoCodeListResponse> {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.is_active !== undefined) query.append("is_active", params.is_active.toString());
    if (params?.page) query.append("page", params.page.toString());

    const response = await fetch(`${getApiUrl()}/admin/promo-codes?${query}`, {
      method: "GET",
      headers: getAuthHeader(true),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch promo codes");
    }

    return response.json();
  },

  // Admin: Get single promo code
  async getPromoCode(id: string): Promise<PromoCodeResponse> {
    const response = await fetch(`${getApiUrl()}/admin/promo-codes/${id}`, {
      method: "GET",
      headers: getAuthHeader(true),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch promo code ${id}`);
    }

    return response.json();
  },

  // Admin: Create promo code
  async createPromoCode(input: CreatePromoCodeInput): Promise<PromoCodeResponse> {
    const response = await fetch(`${getApiUrl()}/admin/promo-codes`, {
      method: "POST",
      headers: getAuthHeader(true),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || "Failed to create promo code");
    }

    return response.json();
  },

  // Admin: Update promo code
  async updatePromoCode(
    id: string,
    input: UpdatePromoCodeInput
  ): Promise<PromoCodeResponse> {
    const response = await fetch(`${getApiUrl()}/admin/promo-codes/${id}`, {
      method: "PATCH",
      headers: getAuthHeader(true),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || "Failed to update promo code");
    }

    return response.json();
  },

  // Admin: Delete promo code
  async deletePromoCode(id: string): Promise<void> {
    const response = await fetch(`${getApiUrl()}/admin/promo-codes/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(true),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || "Failed to delete promo code");
    }
  },

  // User: Validate promo code
  async validatePromoCode(input: ValidatePromoCodeInput): Promise<ValidatePromoCodeResponse> {
    const response = await fetch(`${getApiUrl()}/promo/validate`, {
      method: "POST",
      headers: getAuthHeader(false),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || "Invalid promo code");
    }

    return response.json();
  },

  // Admin: Assign products to promo code
  async assignProducts(
    promoId: string,
    products: { product_id: number }[]
  ): Promise<{ success: boolean; data: PromoProduct[]; message?: string }> {
    const response = await fetch(`${getApiUrl()}/admin/promo-codes/${promoId}/products`, {
      method: "PUT",
      headers: getAuthHeader(true),
      body: JSON.stringify({ products }),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || "Failed to assign products");
    }

    return response.json();
  },

  // Admin: Assign packages to promo code
  async assignPackages(
    promoId: string,
    packages: { package_id: number }[]
  ): Promise<{ success: boolean; data: PromoPackage[]; message?: string }> {
    const response = await fetch(`${getApiUrl()}/admin/promo-codes/${promoId}/packages`, {
      method: "PUT",
      headers: getAuthHeader(true),
      body: JSON.stringify({ packages }),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || "Failed to assign packages");
    }

    return response.json();
  },

  // Admin: Get promo code with assignments
  async getPromoCodeAssignments(
    promoId: string
  ): Promise<PromoCodeAssignmentResponse> {
    const response = await fetch(`${getApiUrl()}/admin/promo-codes/${promoId}/assignments`, {
      method: "GET",
      headers: getAuthHeader(true),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch promo code assignments for ${promoId}`);
    }

    return response.json();
  },

  // Admin: Unassign/delete a product from promo code
  async unassignProduct(
    promoId: string,
    productId: number
  ): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${getApiUrl()}/admin/promo-codes/${promoId}/products/${productId}`, {
      method: "DELETE",
      headers: getAuthHeader(true),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || "Failed to unassign product");
    }

    return response.json();
  },

  // Admin: Unassign/delete a package from promo code
  async unassignPackage(
    promoId: string,
    packageId: number
  ): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${getApiUrl()}/admin/promo-codes/${promoId}/packages/${packageId}`, {
      method: "DELETE",
      headers: getAuthHeader(true),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.message || "Failed to unassign package");
    }

    return response.json();
  },
};
