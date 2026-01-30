import { getApiBaseUrl } from "@/lib/env";
import { useAuthStore } from "@/stores/authStore";

const getApiUrl = () => getApiBaseUrl();

export interface PromoCode {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  max_uses: number;
  used_count: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  status: "active" | "upcoming" | "expired" | "disabled" | "quota_exhausted";
  created_at?: string;
  updated_at?: string;
}

export interface CreatePromoCodeInput {
  code: string;
  type: "percent" | "fixed";
  value: number;
  max_uses: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
}

export interface UpdatePromoCodeInput {
  code?: string;
  type?: "percent" | "fixed";
  value?: number;
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
};
