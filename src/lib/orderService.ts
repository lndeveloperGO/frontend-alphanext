import { getApiBaseUrl } from "@/lib/env";
import { useAuthStore } from "@/stores/authStore";

const getApiUrl = () => getApiBaseUrl();

// Order Status Types
export type OrderStatus = "pending" | "paid" | "cancelled";

// Product Info in Order
export interface OrderProduct {
  id: number;
  name: string;
  type: "single" | "bundle";
  price: number;
}

// Order Item
export interface OrderItem {
  id: number;
  order_id: number;
  package_id: number;
  qty: number;
  created_at: string;
  updated_at: string;
}

// User Info in Order
export interface OrderUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

// Order Model
export interface Order {
  id: number;
  user_id: number;
  product_id: number;
  merchant_order_id: string;
  amount: number; // Final amount after discount
  status: OrderStatus;
  duitku_reference: string | null;
  payment_url: string | null;
  payment_method: string | null;
  promo_code: string | null;
  discount: number;
  paid_at: string | null;
  raw_callback: string | null;
  created_at: string;
  updated_at: string;
  // Admin only:
  product?: OrderProduct;
  items?: OrderItem[];
  user?: OrderUser;
}

// Create Order Input
export interface CreateOrderInput {
  product_id: number;
  promo_code?: string;
}

// Pagination Meta
export interface PaginationMeta {
  current_page: number;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

// List Orders Response (Paginated)
export interface ListOrdersResponse {
  success: boolean;
  data: PaginationMeta & {
    data: Order[];
  };
}

// Single Order Response
export interface OrderResponse {
  success: boolean;
  data: Order;
}

// Mark Paid Response
export interface MarkPaidResponse {
  success: boolean;
  data: Order;
  message?: string;
}

// Auth Headers
const getAuthHeader = () => {
  const token = useAuthStore.getState().token;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const orderService = {
  /**
   * Create a new order from product (single/bundle)
   * POST /api/orders
   * Auth required
   */
  async createOrder(input: CreateOrderInput): Promise<OrderResponse> {
    const response = await fetch(`${getApiUrl()}/orders`, {
      method: "POST",
      headers: getAuthHeader(),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create order");
    }

    const data = await response.json();
    return data;
  },

  /**
   * Get list of user's orders
   * GET /api/orders
   * Auth required
   */
  async getUserOrders(page?: number, limit?: number): Promise<ListOrdersResponse> {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit) params.append("limit", limit.toString());

    const url = params.toString()
      ? `${getApiUrl()}/orders?${params.toString()}`
      : `${getApiUrl()}/orders`;

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user orders");
    }

    const data = await response.json();
    return data;
  },

  /**
   * Get order detail
   * GET /api/orders/{order_id}
   * Auth required
   */
  async getOrderDetail(orderId: number): Promise<OrderResponse> {
    const response = await fetch(`${getApiUrl()}/orders/${orderId}`, {
      method: "GET",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch order");
    }

    const data = await response.json();
    return data;
  },

  /**
   * List all orders (admin only)
   * GET /api/admin/orders
   * Admin required
   * Query params: status (filter by status), page, limit
   */
  async getAdminOrders(
    params?: {
      status?: OrderStatus;
      page?: number;
      limit?: number;
      search?: string;
    }
  ): Promise<ListOrdersResponse> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);

    const url = queryParams.toString()
      ? `${getApiUrl()}/admin/orders?${queryParams.toString()}`
      : `${getApiUrl()}/admin/orders`;

    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch admin orders");
    }

    const data = await response.json();
    return data;
  },

  /**
   * Mark order as paid and grant user_packages (admin only)
   * POST /api/admin/orders/{order_id}/mark-paid
   * Admin required
   * Response: Updated order with user_packages created
   */
  async markOrderAsPaid(orderId: number): Promise<MarkPaidResponse> {
    const response = await fetch(`${getApiUrl()}/admin/orders/${orderId}/mark-paid`, {
      method: "POST",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to mark order as paid");
    }

    const data = await response.json();
    return data;
  },

  /**
   * Cancel an order (optional - depends on backend implementation)
   * POST /api/orders/{order_id}/cancel
   * Auth required
   */
  async cancelOrder(orderId: number): Promise<OrderResponse> {
    const response = await fetch(`${getApiUrl()}/orders/${orderId}/cancel`, {
      method: "POST",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to cancel order");
    }

    const data = await response.json();
    return data;
  },
};
