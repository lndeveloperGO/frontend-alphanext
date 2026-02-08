# Orders & Checkout - Quick Start Guide

## 🚀 Quick Overview

Users can now purchase products (single/bundle packages) through a checkout flow. Orders start in "pending" status, and admins can mark them as "paid" to automatically grant package access to users.

## 📋 User Flow

### Step 1: Browse Packages
User navigates to **Packages** page at `/packages` or `/dashboard/packages`

### Step 2: Select & Checkout
- User clicks "Checkout" on a product
- Taken to `/dashboard/checkout` 
- Can optionally apply promo code
- Sees discount calculation in real-time

### Step 3: Create Order
- Clicks "Bayar Sekarang" 
- Order created via `POST /api/orders`
- Status set to **"pending"**
- Redirected to `/dashboard/user/orders`

### Step 4: View Order Status
Users visit `/dashboard/user/orders` to:
- See all their orders
- Check status (pending/paid/cancelled)
- View order details & breakdown
- See granted packages (if paid)

## 🔐 Admin Flow

### Access Admin Orders
Navigate to `/admin/orders` to see all orders

### View Order Detail
1. Click "Detail" on any order
2. See:
   - Order amount & discount
   - Promo code applied
   - Order items (packages)
   - User packages granted (if paid)

### Mark Order as Paid
1. Click "Detail" on a **pending** order
2. Click "Tandai Terbayar & Beri Akses" button
3. System automatically:
   - Updates order status → **"paid"**
   - Creates `user_packages` for all packages
   - Calculates expiry (now + duration_seconds)
   - User immediately gets access

### Filter Orders
Use filters to find:
- **Status** - Pending/Paid/Cancelled
- **Search** - By order ID or user info
- **Pagination** - Navigate through results

## 💻 Developer Usage

### Create an Order (Frontend)
```typescript
import { orderService } from "@/lib/orderService";

// Simple purchase
const response = await orderService.createOrder({
  product_id: 123,
});

// With promo code
const response = await orderService.createOrder({
  product_id: 123,
  promo_code: "SUMMER20",
});

// Response
{
  success: true,
  data: {
    id: 456,
    product_id: 123,
    status: "pending",
    amount: 85000,
    discount: 15000,
    promo_code: "SUMMER20",
    created_at: "2026-02-06T...",
  }
}
```

### Get User Orders
```typescript
// Get user's orders
const response = await orderService.getUserOrders(1, 10); // page, limit

// Response
{
  success: true,
  data: {
    data: [
      {
        id: 456,
        status: "pending",
        amount: 85000,
        // ...
      },
      {
        id: 457,
        status: "paid",
        amount: 150000,
        // ...
      }
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 25,
      pages: 3
    }
  }
}
```

### Get Order Detail
```typescript
const response = await orderService.getOrderDetail(456);

if (response.success) {
  const order = response.data;
  console.log(`Order #${order.id} - ${order.status}`);
  console.log(`Amount: ${order.amount}, Discount: ${order.discount}`);
  console.log(`Items: ${order.order_items?.length}`);
  if (order.user_packages) {
    console.log(`Packages Granted: ${order.user_packages.length}`);
  }
}
```

### Admin: Mark Order as Paid
```typescript
const response = await orderService.markOrderAsPaid(456);

if (response.success) {
  // Order is now paid and user_packages are created
  const updatedOrder = response.data;
  console.log(`Order marked as paid!`);
  console.log(`User packages granted: ${updatedOrder.user_packages?.length}`);
}
```

### Admin: Get All Orders
```typescript
const response = await orderService.getAdminOrders({
  status: "pending",  // Filter by status
  page: 1,
  limit: 20,
  search: "order_id"  // Optional search
});

const allOrders = response.data.data;
```

## 📦 File Locations

| Feature | File |
|---------|------|
| API Service | `src/lib/orderService.ts` |
| User Checkout | `src/pages/user/UserCheckout.tsx` |
| User Orders | `src/pages/user/UserOrders.tsx` |
| Admin Orders | `src/pages/admin/AdminOrders.tsx` |
| Documentation | `ORDER_IMPLEMENTATION.md` |

## 🔗 Routes

| Route | Role | Purpose |
|-------|------|---------|
| `/dashboard/checkout` | User | Checkout page |
| `/dashboard/user/orders` | User | View own orders |
| `/admin/orders` | Admin | Manage all orders |

## 📊 Data States

### Order Statuses
```
"pending"   → Waiting for admin to mark as paid
"paid"      → Order confirmed, packages are active
"cancelled" → Order was cancelled
```

### Access Rules for Packages
For **paid** orders:
```
Package is accessible if:
  starts_at <= now AND (ends_at is null OR ends_at > now)

Free packages bypass this check
```

## 🎯 Key Features

✅ **Promo Code Integration** - Seamless discount calculation
✅ **Order Creation** - Create orders via API
✅ **Status Tracking** - Real-time order status
✅ **Auto Entitlement** - Package access granted automatically
✅ **Admin Control** - Manage all orders from admin panel
✅ **User History** - Users can view their order history
✅ **Error Handling** - Complete error messages and validation

## 🧪 Testing Checklist

- [ ] Create order without promo
- [ ] Create order with valid promo
- [ ] Create order with invalid promo (should fail)
- [ ] View user orders page
- [ ] View order details as user
- [ ] View all orders as admin
- [ ] Mark order as paid (as admin)
- [ ] Verify packages are granted after mark-paid
- [ ] Filter orders by status
- [ ] Search orders
- [ ] Pagination works correctly

## ⚠️ Common Issues

### Issue: Order creation fails
**Solution:** Verify `product_id` is a valid number (not string)

### Issue: Promo code not applying
**Solution:** Check `promoService.validatePromoCode()` is working correctly

### Issue: User packages not showing
**Solution:** Verify order status is "paid" and user_packages array exists

### Issue: Admin can't mark as paid
**Solution:** Verify user has "admin" role and order status is "pending"

## 📝 Notes

- Product IDs are converted from string to number for API
- Promo codes are optional
- All dates are in ISO 8601 format
- Discount calculation happens on backend
- User packages expiry is: `starts_at + duration_seconds`
- Free packages don't require entitlement

## 🔮 Future Enhancements

- [ ] Order notifications via email
- [ ] Payment gateway integration
- [ ] Order refunds
- [ ] Subscription support
- [ ] Invoice generation/PDF
- [ ] Order retry mechanism
