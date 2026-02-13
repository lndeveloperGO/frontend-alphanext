import { getApiBaseUrl } from "@/lib/env";
import { useAuthStore } from "@/stores/authStore";
import { Category } from "./categoryService";

const getApiUrl = () => getApiBaseUrl();
export type PackageType = "latihan" | "tryout" | "akbar";

export interface Package {
  id: number;
  name: string;
  type: PackageType;
  category_id: number;
  category?: {
    id: number;
    name: string;
  };
  duration_seconds: number;
  is_active: boolean;
  is_free: boolean;
  questions_count: number;
  material_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePackageInput {
  name: string;
  type: PackageType;
  category_id: number;
  duration_seconds: number;
  is_active?: boolean;
  is_free?: boolean;
}

export interface UpdatePackageInput {
  name?: string;
  type?: PackageType;
  category_id?: number;
  duration_seconds?: number;
  is_active?: boolean;
  is_free?: boolean;
}

export interface PackageQuestion {
  question_id: number;
  order_no: number;
}

export interface PackageQuestionDetail {
  question_id: number;
  order_no: number;
  question: string;
}

export interface PackageMaterial {
  id: string;
  title: string;
  description: string | null;
  type: 'ebook' | 'video';
  cover_url: string | null;
  is_free: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PackageMaterialInput {
  material_id: number;
  sort_order: number;
}

const getAuthHeader = () => {
  const token = useAuthStore.getState().token;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const packageService = {
  // List all packages
  async getPackages(): Promise<Package[]> {
    const response = await fetch(`${getApiUrl()}/admin/packages`, {
      method: "GET",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch packages");
    }

    const data = await response.json();
    return data.data.data || data;
  },

  // Get single package
  async getPackage(id: number): Promise<Package> {
    const response = await fetch(`${getApiUrl()}/admin/packages/${id}`, {
      method: "GET",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch package ${id}`);
    }

    const data = await response.json();
    return data.data.data || data;
  },

  // Create package
  async createPackage(input: CreatePackageInput): Promise<Package> {
    const response = await fetch(`${getApiUrl()}/admin/packages`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create package");
    }

    const data = await response.json();
    return data.data.data || data;
  },

  // Update package
  async updatePackage(
    id: number,
    input: UpdatePackageInput
  ): Promise<Package> {
    const response = await fetch(`${getApiUrl()}/admin/packages/${id}`, {
      method: "PUT",
      headers: getAuthHeader(),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update package");
    }

    const data = await response.json();
    return data.data.data || data;
  },

  // Delete package
  async deletePackage(id: number): Promise<void> {
    const response = await fetch(`${getApiUrl()}/admin/packages/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete package");
    }
  },

  // Get questions in a package
  async getPackageQuestions(packageId: number): Promise<PackageQuestionDetail[]> {
    const response = await fetch(
      `${getApiUrl()}/admin/packages/${packageId}/questions`,
      {
        method: "GET",
        headers: getAuthHeader(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch package questions`);
    }

    const data = await response.json();
    // API returns { success: true, data: [...] }
    return Array.isArray(data) ? data : (data.data || []);
  },

  // Sync questions order in a package
  async syncPackageQuestions(
    packageId: number,
    items: PackageQuestion[]
  ): Promise<void> {
    const response = await fetch(
      `${getApiUrl()}/admin/packages/${packageId}/questions`,
      {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify({ items }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to sync package questions");
    }
  },

  // Get materials in a package
  async getPackageMaterials(packageId: number): Promise<PackageMaterial[]> {
    const response = await fetch(
      `${getApiUrl()}/admin/packages/${packageId}/materials`,
      {
        method: "GET",
        headers: getAuthHeader(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch package materials`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.data || []);
  },

  // Attach materials to a package
  async attachMaterialsToPackage(
    packageId: number,
    materials: PackageMaterialInput[]
  ): Promise<PackageMaterial[]> {
    const response = await fetch(
      `${getApiUrl()}/admin/packages/${packageId}/materials`,
      {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify({ materials }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to attach materials to package");
    }

    const data = await response.json();
    return Array.isArray(data) ? data : (data.data || []);
  },

  // Get public products for landing page
  async getPublicProducts(): Promise<{
    success: boolean;
    data: {
      bundles: Array<{
        id: number;
        type: string;
        name: string;
        price: number;
        is_active: boolean;
        packages: Array<{
          id: number;
          name: string;
          type: string;
          category_id: number;
          pivot: { qty: number; sort_order: number };
        }>;
      }>;
      regular: Array<{
        id: number;
        type: string;
        name: string;
        price: number;
        is_active: boolean;
        package: {
          id: number;
          name: string;
          type: string;
          category_id: number;
        };
      }>;
    };
  }> {
    const response = await fetch(`${getApiUrl()}/public/products`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch public products");
    }

    return await response.json();
  },
};
