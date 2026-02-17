import { getApiBaseUrl } from "@/lib/env";
import { useAuthStore } from "@/stores/authStore";

const getApiUrl = () => getApiBaseUrl();

// Order Status Types
export type OrderStatus = "pending" | "paid" | "cancelled" | "expired";

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

// Payment Callback Data (Midtrans/DuitKu)
export interface PaymentCallbackData {
  currency?: string;
  order_id?: string;
  va_numbers?: Array<{
    bank: string;
    va_number: string;
  }>;
  expiry_time?: string;
  merchant_id?: string;
  status_code?: string;
  fraud_status?: string;
  gross_amount?: string;
  payment_type?: string;
  signature_key?: string;
  status_message?: string;
  transaction_id?: string;
  transaction_time?: string;
  transaction_status?: string;
  settlement_time?: string;
  customer_details?: {
    email: string;
    full_name: string;
  };
  [key: string]: any; // Allow other fields
}

// Order Model
export interface Order {
  id: number;
  user_id: number;
  product_id: number;
  merchant_order_id: string;
  amount: number; // Final amount after discount
  status: OrderStatus;
  payment_url: string | null;
  midtrans_token?: string | null;
  duitku_reference?: string | null;
  payment_method: string | null;
  promo_code: string | null;
  promo_code_id: number | null;
  discount: number;
  paid_at: string | null;
  expires_at: string | null;
  raw_callback: PaymentCallbackData | string | null;
  created_at: string;
  updated_at: string;
  // Admin only - populated via eager loading or separate fetch
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

// Pay Order Response
export interface PayOrderResponse {
  success: boolean;
  data: {
    id: number;
    status: string;
    amount: number;
    payment_method: string;
    payment_url: string;
    midtrans_token?: string;
  };
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

  /**
   * Initiate payment for an order
   * POST /api/orders/{order_id}/pay
   * Auth required
   */
  async payOrder(orderId: number): Promise<PayOrderResponse> {
    const response = await fetch(`${getApiUrl()}/orders/${orderId}/pay`, {
      method: "POST",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to initiate payment");
    }

    const data = await response.json();
    return data;
  },
};
