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
  category?: Category;
  duration_seconds: number;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePackageInput {
  name: string;
  type: PackageType;
  category_id: number;
  duration_seconds: number;
  is_active?: boolean;
}

export interface UpdatePackageInput {
  name?: string;
  type?: PackageType;
  category_id?: number;
  duration_seconds?: number;
  is_active?: boolean;
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
};
