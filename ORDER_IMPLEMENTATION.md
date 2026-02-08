# Orders & Checkout Implementation

## Overview
Complete order management system for user checkout flow without payment gateway integration. Supports promo codes and admin order management.

## Files Created/Modified

### 1. **src/lib/orderService.ts** (New)
API service layer for orders with TypeScript interfaces:

**Endpoints:**
- `POST /api/orders` - Create order (user auth required)
- `GET /api/orders` - List user's orders (user auth required)
- `GET /api/orders/{id}` - Get order detail (user auth required)
- `GET /api/admin/orders` - List all orders (admin only, with status filter)
- `POST /api/admin/orders/{id}/mark-paid` - Mark order as paid and grant user_packages (admin only)
- `POST /api/orders/{id}/cancel` - Cancel order (optional)

**Key Types:**
- `Order` - Complete order with amount, discount, status, items
- `OrderItem` - Order line items with package info
- `UserPackage` - User's granted package entitlements

### 2. **src/pages/user/UserCheckout.tsx** (Updated)
Enhanced checkout flow:

**Features:**
- Promo code validation and discount calculation
- Order creation via API (replaced mock alert)
- Success/error alerts
- Navigation to user orders after successful checkout

**Flow:**
1. User selects product
2. User applies optional promo code
3. User clicks "Bayar Sekarang"
4. Order created via API with `product_id` and optional `promo_code`
5. Redirects to `/dashboard/user/orders` with success notification

### 3. **src/pages/user/UserOrders.tsx** (New)
User orders dashboard:

**Features:**
- View all user's orders with status
- Filter and search orders
- Order detail dialog with breakdown
- View active packages if order is paid
- Shows status messages (pending, paid, cancelled)
- Summary cards (total, pending, active)

**Status Indicators:**
- ⏳ **Menunggu Bayar (Pending)** - Waiting for admin confirmation
- ✅ **Terbayar (Paid)** - Package is active and accessible
- ❌ **Dibatalkan (Cancelled)** - Order cancelled

### 4. **src/pages/admin/AdminOrders.tsx** (New)
Admin orders management:

**Features:**
- List all orders with filtering by status
- Mark orders as paid (grants user_packages automatically)
- View order details with discount information
- See user packages granted to each user
- Summary stats (total, pending, paid, cancelled)
- Search and pagination support

**Admin Actions:**
- Click "Detail" to view full order information
- Click "Tandai Terbayar & Beri Akses" to:
  - Set order status to "paid"
  - Create `user_packages` entries for all packages in order
  - Calculate expiry: `ends_at = starts_at + duration_seconds`

### 5. **src/App.tsx** (Updated)
Added new routes:
```typescript
// Admin route
<Route path="/admin/orders" element={<ProtectedRoute allowedRoles={["admin"]}><AdminOrders /></ProtectedRoute>} />

// User route
<Route path="/dashboard/user/orders" element={<ProtectedRoute allowedRoles={["user"]}><UserOrders /></ProtectedRoute>} />
```

### 6. **src/stores/checkoutStore.ts** (Unchanged)
Existing store continues to work as-is for product selection.

## Data Flow

### Purchase Flow
```
User selects product → UserCheckout page
                   ↓
            Apply promo code (optional)
                   ↓
         Click "Bayar Sekarang"
                   ↓
        POST /api/orders {product_id, promo_code?}
                   ↓
        Order created with status: "pending"
                   ↓
  User redirected to /dashboard/user/orders (pending status)
```

### Admin Payment Confirmation Flow
```
Admin views orders at /admin/orders
                   ↓
           Clicks order detail
                   ↓
      Clicks "Tandai Terbayar"
                   ↓
   POST /api/admin/orders/{id}/mark-paid
                   ↓
Order status → "paid"
+ user_packages created for all order_items
+ expiry calculated (starts_at + duration_seconds)
                   ↓
User can now access packages
```

## Data Contracts

### Order Object
```typescript
{
  id: number;
  user_id?: number;
  product_id: number;
  status: "pending" | "paid" | "cancelled";
  amount: number;           // Final amount after discount
  discount: number;         // Discount applied
  promo_code?: string;      // Applied promo code
  order_items?: OrderItem[];
  user_packages?: UserPackage[];
  created_at?: string;
  updated_at?: string;
}
```

### Create Order Request
```typescript
{
  product_id: number;
  promo_code?: string;  // Optional
}
```

### User Package Entitlement
```typescript
{
  id?: number;
  user_id?: number;
  package_id: number;
  starts_at: string;      // ISO datetime
  ends_at?: string;       // ISO datetime (null if no expiry)
  created_at?: string;
  updated_at?: string;
}
```

**Access Rule:**
```
Paid package is accessible if:
starts_at <= now AND (ends_at is null OR ends_at > now)

Free packages bypass entitlement check
```

## Key Features

### 1. ✅ Promo Code Support
- Integrated with existing `promoService`
- Displays discount amount
- Calculates final amount
- Error handling for invalid codes

### 2. ✅ Order Status Tracking
- **Pending** - Waiting for admin payment confirmation
- **Paid** - Admin has marked as paid, packages are active
- **Cancelled** - Order was cancelled

### 3. ✅ Automatic Entitlement Granting
- When admin marks order as paid:
  - System creates `user_packages` entries
  - Sets `starts_at` to current time
  - Calculates `ends_at` if package has `duration_seconds`
  - Free packages bypass entitlement

### 4. ✅ Admin Order Management
- View all orders across users
- Filter by status
- Mark orders as paid with one click
- See granted packages per order
- Search functionality

### 5. ✅ User Order History
- View own orders
- See status and payment details
- Check active packages
- Track discounts applied

## Testing Scenarios

### Scenario 1: Simple Purchase
1. User goes to packages page
2. Selects a product
3. Goes to checkout
4. Clicks "Bayar Sekarang" without promo
5. Order created with `status: "pending"`
6. Order appears in /dashboard/user/orders
7. Admin marks as paid
8. User can now access package

### Scenario 2: Purchase with Promo
1. User selects product
2. Enters valid promo code
3. Discount calculated and displayed
4. Clicks "Bayar Sekarang"
5. Order created with discounted amount
6. Admin can see discount in order details

### Scenario 3: Bundle Purchase
1. User selects a bundle product
2. Bundle contains multiple packages
3. Order created with all packages
4. Admin marks as paid
5. `user_packages` created for ALL packages in bundle
6. User can access all packages

## API Integration Notes

The implementation assumes backend provides:

1. **Order Creation Response:**
   - Returns created order with ID
   - Calculates discount automatically based on promo code
   - Sets `status: "pending"`

2. **Mark Paid Endpoint:**
   - Updates order status to "paid"
   - **Automatically creates** user_packages entries
   - Calculates expiry using package's `duration_seconds`
   - Returns updated order with granted packages

3. **User Packages Entitlement:**
   - All packages checked via `user_packages` table
   - `starts_at <= now` AND `(ends_at is null OR ends_at > now)`
   - Free packages (`is_free: true`) bypass checks

## Future Enhancements

1. **Order Cancellation** - User can cancel pending orders
2. **Refunds** - Track refunded orders
3. **Order Retry** - User can retry payment for failed orders
4. **Invoice Generation** - PDF invoices for orders
5. **Email Notifications** - Send to user when order status changes
6. **Payment Integration** - Add gateway integration when needed
7. **Recurring Orders** - Support subscription-based packages

## Files Summary

| File | Type | Purpose |
|------|------|---------|
| `orderService.ts` | Service | API calls for orders |
| `UserCheckout.tsx` | Page | User checkout flow |
| `UserOrders.tsx` | Page | User order history |
| `AdminOrders.tsx` | Page | Admin order management |
| `App.tsx` | Config | Added routes |
