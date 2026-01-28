import { getApiBaseUrl } from "@/lib/env";
import { useAuthStore } from "@/stores/authStore";

const getApiUrl = () => getApiBaseUrl();

export type UserRole = "admin" | "user";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  avatar?: string;
}

export interface UserListResponse {
  success: boolean;
  data: {
    current_page: number;
    data: User[];
    total: number;
  };
  summary: {
    total_users: number;
    total_active: number;
    total_inactive: number;
    total_admin: number;
  };
}

export interface UserDetailResponse {
  success: boolean;
  data: User;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  is_active: boolean;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: UserRole;
  is_active?: boolean;
}

export interface GetUsersParams {
  search?: string;
  role?: UserRole;
  is_active?: boolean;
  page?: number;
}

const getAuthHeader = () => {
  const token = useAuthStore.getState().token;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const userService = {
  /**
   * List Users (Paginated + Filter)
   * GET /api/admin/users
   * Query params: search, role (user|admin), is_active (true|false), page
   */
  async getUsers(params?: GetUsersParams): Promise<UserListResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append("search", params.search);
    if (params?.role) queryParams.append("role", params.role);
    if (params?.is_active !== undefined) queryParams.append("is_active", String(params.is_active));
    if (params?.page) queryParams.append("page", String(params.page));

    const url = `${getApiUrl()}/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch users");
    }

    return await response.json();
  },

  /**
   * Get User Detail
   * GET /api/admin/users/{id}
   */
  async getUserDetail(id: number): Promise<UserDetailResponse> {
    const response = await fetch(`${getApiUrl()}/admin/users/${id}`, {
      method: "GET",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to fetch user ${id}`);
    }

    return await response.json();
  },

  /**
   * Create User
   * POST /api/admin/users
   */
  async createUser(input: CreateUserInput): Promise<UserDetailResponse> {
    const response = await fetch(`${getApiUrl()}/admin/users`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create user");
    }

    return await response.json();
  },

  /**
   * Update User
   * PATCH /api/admin/users/{id}
   * Safety rules: Admin cannot deactivate or demote their own account
   */
  async updateUser(id: number, input: UpdateUserInput): Promise<UserDetailResponse> {
    // Safety check: prevent admin from deactivating or demoting themselves
    const currentUser = useAuthStore.getState().user;
    if (currentUser && Number(currentUser.id) === id) {
      if (input.is_active === false) {
        throw new Error("You cannot deactivate your own account");
      }
      if (input.role === "user" && currentUser.role === "admin") {
        throw new Error("You cannot demote your own account");
      }
    }

    const response = await fetch(`${getApiUrl()}/admin/users/${id}`, {
      method: "PATCH",
      headers: getAuthHeader(),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update user");
    }

    return await response.json();
  },

  /**
   * Delete User
   * DELETE /api/admin/users/{id}
   * Safety rules: Admin cannot delete their own account
   */
  async deleteUser(id: number): Promise<{ success: boolean; message: string }> {
    // Safety check: prevent admin from deleting themselves
    const currentUser = useAuthStore.getState().user;
    if (currentUser && Number(currentUser.id) === id) {
      throw new Error("You cannot delete your own account");
    }

    const response = await fetch(`${getApiUrl()}/admin/users/${id}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete user");
    }

    return await response.json();
  },
};
