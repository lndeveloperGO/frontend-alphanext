import { getApiBaseUrl } from "@/lib/env";
import { useAuthStore } from "@/stores/authStore";

const getApiUrl = () => getApiBaseUrl();

export interface MaterialPart {
  id: number;
  material_id: number;
  title: string;
  video_url: string;
  duration_seconds: number;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Material {
  id: number;
  title: string;
  description: string | null;
  type: 'ebook' | 'video';
  cover_url: string | null;
  ebook_url: string | null;
  is_active: boolean;
  is_free: boolean; // 0 = premium, 1 = free
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Additional fields for frontend use
  category?: string;
  package_ids?: string[];
  parts?: MaterialPart[];
  duration?: number;
  pages?: number;
}

export interface CreateMaterialInput {
  title: string;
  description: string;
  type: 'ebook' | 'video';
  cover_url: string;
  ebook_url?: string;
  is_free: boolean;
  is_active: boolean;
  duration?: number;
  pages?: number;
  package_ids?: string[];
}

export interface UpdateMaterialInput {
  title?: string;
  description?: string;
  type?: 'ebook' | 'video';
  cover_url?: string;
  ebook_url?: string;
  is_free?: boolean;
  is_active?: boolean;
  duration?: number;
  pages?: number;
  package_ids?: string[];
}

export interface CreateMaterialPartInput {
  title: string;
  video_url: string;
  duration_seconds: number;
  sort_order: number;
  is_active?: boolean;
}

export interface UpdateMaterialPartInput {
  title?: string;
  video_url?: string;
  duration_seconds?: number;
  sort_order?: number;
  is_active?: boolean;
}

const getAuthHeader = () => {
  const token = useAuthStore.getState().token;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const materialService = {
  // User APIs
  async getMaterials(params?: {
    search?: string;
    type?: 'ebook' | 'video';
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Material[]; pagination?: any }> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${getApiUrl()}/materials?${queryParams}`, {
      method: "GET",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch materials");
    }

    const data = await response.json();
    return data.data || data;
  },

  async getMaterial(id: string): Promise<Material> {
    const response = await fetch(`${getApiUrl()}/materials/${id}`, {
      method: "GET",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("Access denied - material is locked");
      }
      throw new Error(`Failed to fetch material ${id}`);
    }

    const data = await response.json();
    return data.data || data;
  },

  // Admin APIs
  async getAdminMaterials(params?: {
    search?: string;
    type?: 'ebook' | 'video';
    is_active?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: Material[]; pagination?: any }> {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(`${getApiUrl()}/admin/materials?${queryParams}`, {
      method: "GET",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch admin materials");
    }

    const data = await response.json();
    return data.data || data;
  },

  async getAdminMaterial(id: string): Promise<Material> {
    const response = await fetch(`${getApiUrl()}/admin/materials/${id}`, {
      method: "GET",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch admin material ${id}`);
    }

    const data = await response.json();
    return data.data || data;
  },

  async createMaterial(input: CreateMaterialInput): Promise<Material> {
    const response = await fetch(`${getApiUrl()}/admin/materials`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create material");
    }

    const data = await response.json();
    return data.data || data;
  },

  async updateMaterial(id: string, input: UpdateMaterialInput): Promise<Material> {
    const response = await fetch(`${getApiUrl()}/admin/materials/${id}`, {
      method: "PUT",
      headers: getAuthHeader(),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update material");
    }

    const data = await response.json();
    return data.data || data;
  },

  async deleteMaterial(id: string): Promise<void> {
    const response = await fetch(`${getApiUrl()}/admin/materials/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete material");
    }
  },

  // Material Parts APIs
  async getMaterialParts(materialId: string): Promise<MaterialPart[]> {
    const response = await fetch(`${getApiUrl()}/admin/materials/${materialId}/parts`, {
      method: "GET",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch parts for material ${materialId}`);
    }

    const data = await response.json();
    return data.data.data || data.data || data;
  },

  async createMaterialPart(materialId: string, input: CreateMaterialPartInput): Promise<MaterialPart> {
    const response = await fetch(`${getApiUrl()}/admin/materials/${materialId}/parts`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create material part");
    }

    const data = await response.json();
    return data.data || data;
  },

  async updateMaterialPart(materialId: string, partId: string, input: UpdateMaterialPartInput): Promise<MaterialPart> {
    const response = await fetch(`${getApiUrl()}/admin/materials/${materialId}/parts/${partId}`, {
      method: "PATCH",
      headers: getAuthHeader(),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update material part");
    }

    const data = await response.json();
    return data.data || data;
  },

  async deleteMaterialPart(materialId: string, partId: string): Promise<void> {
    const response = await fetch(`${getApiUrl()}/admin/materials/${materialId}/parts/${partId}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete material part");
    }
  },

  async reorderMaterialParts(materialId: string, parts: { id: string; sort_order: number }[]): Promise<void> {
    const response = await fetch(`${getApiUrl()}/admin/materials/${materialId}/parts/reorder`, {
      method: "PUT",
      headers: getAuthHeader(),
      body: JSON.stringify({ parts }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to reorder material parts");
    }
  },
};
