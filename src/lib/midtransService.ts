import { getApiBaseUrl } from "@/lib/env";
import { useAuthStore } from "@/stores/authStore";

const getApiUrl = () => getApiBaseUrl();

export interface MidtransSettings {
  server_key: string;
  client_key: string;
  is_production: boolean;
  merchant_name: string;
  expiry_duration: number;
  expiry_unit: "minutes" | "hours" | "days";
}

export interface MidtransSettingsResponse {
  success: boolean;
  data: MidtransSettings;
  message?: string;
}

const getAuthHeader = () => {
  const token = useAuthStore.getState().token;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const midtransService = {
  /**
   * Get Midtrans settings (admin only)
   * GET /api/admin/midtrans-settings
   */
  async getSettings(): Promise<MidtransSettingsResponse> {
    const response = await fetch(`${getApiUrl()}/admin/midtrans-settings`, {
      method: "GET",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Gagal mengambil pengaturan Midtrans");
    }

    return await response.json();
  },

  /**
   * Update Midtrans settings (admin only)
   * POST /api/admin/midtrans-settings
   */
  async updateSettings(settings: MidtransSettings): Promise<MidtransSettingsResponse> {
    const response = await fetch(`${getApiUrl()}/admin/midtrans-settings`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Gagal memperbarui pengaturan Midtrans");
    }

    return await response.json();
  },

  /**
   * Get public Midtrans settings (for users)
   * GET /api/public/midtrans/config
   * Returns: { client_key, is_production }
   */
  async getPublicSettings(): Promise<{ status: string; data: { client_key: string; is_production: boolean } }> {
    const response = await fetch(`${getApiUrl()}/public/midtrans/config`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || "Gagal mengambil konfigurasi pembayaran");
    }

    return await response.json();
  },
};
