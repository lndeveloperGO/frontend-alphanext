import { getApiBaseUrl } from "@/lib/env";
import { useAuthStore } from "@/stores/authStore";

const getAuthHeader = () => {
  const token = useAuthStore.getState().token;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const authService = {
  /**
   * Fetch current user details from /me endpoint
   */
  async getMe() {
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/me`, {
        method: "GET",
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const data = await response.json();
      return { success: true, data: data.data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch user",
      };
    }
  },

  /**
   * Logout user with POST /logout endpoint
   */
  async logout() {
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/logout`, {
        method: "POST",
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error("Failed to logout");
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to logout",
      };
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(data: { name: string; email: string }) {
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/me/profile`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to update profile"
        );
      }

      const responseData = await response.json();
      return { success: true, data: responseData.data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update profile",
      };
    }
  },

  /**
   * Change password (authenticated)
   */
  async changePassword(data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) {
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/me/password`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to change password"
        );
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to change password",
      };
    }
  },
  /**
   * Send forgot password link
   */
  async forgotPassword(email: string) {
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengirim link reset password");
      }

      return { success: true, message: data.message };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Terjadi kesalahan",
      };
    }
  },

  /**
   * Reset password with token
   */
  async resetPassword(data: {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) {
    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Gagal memperbarui password");
      }

      return { success: true, message: responseData.message };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Terjadi kesalahan",
      };
    }
  },
};
