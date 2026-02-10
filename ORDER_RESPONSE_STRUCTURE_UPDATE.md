# Order Implementation - Response Structure Update

## Summary
Updated the order service and components to match the actual API response structure with proper pagination and fields.

---

## Changes Made

### 1. **src/lib/orderService.ts** - Updated Type Definitions

**New Order Model:**
```typescript
export interface Order {
  id: number;
  user_id: number;
  product_id: number;
  merchant_order_id: string;      // NEW: Unique order reference
  amount: number;                  // Final amount after discount
  status: "pending" | "paid" | "cancelled";
  duitku_reference: string | null; // NEW: Payment gateway reference
  payment_url: string | null;      // NEW: Payment link
  payment_method: string | null;   // NEW: Payment method used
  promo_code: string | null;
  discount: number;
  paid_at: string | null;          // NEW: Timestamp when paid
  raw_callback: string | null;     // NEW: Raw payment callback
  created_at: string;
  updated_at: string;
  // Admin only:
  product?: OrderProduct;          // NEW: Product details (admin only)
  items?: OrderItem[];             // NEW: Order items (admin only)
}
```

**New Order Item Model:**
```typescript
export interface OrderItem {
  id: number;
  order_id: number;
  package_id: number;
  qty: number;
  created_at: string;
  updated_at: string;
}
```

**New Order Product Model:**
```typescript
export interface OrderProduct {
  id: number;
  name: string;
  type: "single" | "bundle";
  price: number;
}
```

**New Pagination Structure:**
```typescript
export interface ListOrdersResponse {
  success: boolean;
  data: PaginationMeta & {
    data: Order[];
  };
}

// Where PaginationMeta includes:
// - current_page, from, to, total, per_page
// - first_page_url, last_page_url, next_page_url, prev_page_url
// - links array with pagination links
```

---

### 2. **src/pages/admin/AdminOrders.tsx** - Updated Response Handling

**Pagination Updates:**
- Changed from: `response.data.pagination?.total`
- Changed to: `response.data.total`
- Changed from: `response.data.pagination?.pages`
- Changed to: `response.data.last_page`

**Order Items Display:**
- Changed from: `order.order_items`
- Changed to: `order.items`
- Updated item display to show `package_id` and `qty`

**Product Info Section:**
- Added new section showing product name, type, price, and ID
- Only displayed if `order.product` exists

**Payment Info Section:**
- Added section showing:
  - `merchant_order_id`
  - `duitku_reference` (if available)
  - `payment_method`
  - `paid_at` timestamp

**Removed Sections:**
- Removed `user_packages` display (not in response)

---

### 3. **src/pages/user/UserOrders.tsx** - Simplified Response Handling

**Response Structure:**
- User response doesn't include `product` or `items` fields
- Simplified to show only order metadata

**Table Updates:**
- Removed "Items" column (not available in user response)
- Table now shows: Order ID, Total/Discount, Status, Promo, Date, Actions

**Detail Dialog Updates:**
- Added "Informasi Pembayaran" section showing:
  - `merchant_order_id`
  - `payment_method`
  - `paid_at` timestamp
- Removed sections for items and packages (not in user response)

**Status Messages:**
- Simplified messages since user can't manage packages from this page
- Messages focus on payment status and next steps

---

## API Response Examples

### Admin Orders Response
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 3,
        "user_id": 4,
        "product_id": 6,
        "merchant_order_id": "ORD-20260205171822-HWHFDC",
        "amount": 79000,
        "status": "paid",
        "duitku_reference": null,
        "payment_url": null,
        "payment_method": null,
        "promo_code": "POTONG20K",
        "discount": 20000,
        "paid_at": "2026-02-05T17:19:52.000000Z",
        "created_at": "2026-02-05T17:18:22.000000Z",
        "updated_at": "2026-02-05T17:19:52.000000Z",
        "product": {
          "id": 6,
          "name": "Bundle UTBK Hemat",
          "type": "bundle",
          "price": 99000
        },
        "items": [
          {
            "id": 5,
            "order_id": 3,
            "package_id": 1,
            "qty": 1,
            "created_at": "2026-02-05T17:18:22.000000Z",
            "updated_at": "2026-02-05T17:18:22.000000Z"
          }
        ]
      }
    ],
    "total": 3,
    "last_page": 1,
    "per_page": 20,
    "from": 1,
    "to": 3,
    "current_page": 1,
    "first_page_url": "http://localhost:8000/api/admin/orders?page=1",
    "last_page_url": "http://localhost:8000/api/admin/orders?page=1",
    "next_page_url": null,
    "prev_page_url": null,
    "path": "http://localhost:8000/api/admin/orders",
    "links": [...]
  }
}
```

### User Orders Response
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 3,
        "user_id": 4,
        "product_id": 6,
        "merchant_order_id": "ORD-20260205171822-HWHFDC",
        "amount": 79000,
        "status": "paid",
        "duitku_reference": null,
        "payment_url": null,
        "payment_method": null,
        "promo_code": "POTONG20K",
        "discount": 20000,
        "paid_at": "2026-02-05T17:19:52.000000Z",
        "raw_callback": null,
        "created_at": "2026-02-05T17:18:22.000000Z",
        "updated_at": "2026-02-05T17:19:52.000000Z"
      }
    ],
    "total": 3,
    "last_page": 1,
    "per_page": 20,
    "from": 1,
    "to": 3,
    "current_page": 1,
    "first_page_url": "http://localhost:8000/api/orders?page=1",
    "last_page_url": "http://localhost:8000/api/orders?page=1",
    "next_page_url": null,
    "prev_page_url": null,
    "path": "http://localhost:8000/api/orders",
    "links": [...]
  }
}
```

---

## Key Differences

### Admin vs User Response

| Field | Admin | User |
|-------|-------|------|
| Order ID, Status, Amount | ✅ | ✅ |
| Discount, Promo Code | ✅ | ✅ |
| Created/Updated Date | ✅ | ✅ |
| Paid At | ✅ | ✅ |
| **product** (details) | ✅ | ❌ |
| **items** (packages) | ✅ | ❌ |
| Payment Method | ✅ | ✅ |
| Merchant Order ID | ✅ | ✅ |

---

## Pagination Info Available

Both endpoints return Laravel-style pagination:
- `current_page` - Current page number
- `from` / `to` - Record range on current page
- `total` - Total number of records
- `per_page` - Records per page (default 20)
- `last_page` - Last page number
- `links` - Array of pagination links
- `first_page_url` / `last_page_url` / `next_page_url` / `prev_page_url`

---

## Files Updated

| File | Changes |
|------|---------|
| `src/lib/orderService.ts` | Updated types to match API response |
| `src/pages/admin/AdminOrders.tsx` | Pagination handling, items display, product info, payment info |
| `src/pages/user/UserOrders.tsx` | Removed items column, simplified detail dialog |

---

## Verification

✅ All TypeScript errors resolved
✅ Components match actual API response structure
✅ Admin gets full order details with products and items
✅ Users get order summary without sensitive details
✅ Pagination properly handled
✅ New payment fields displayed correctly

---

## Next Steps

1. Backend endpoints are now properly documented
2. Frontend is ready to consume the actual API responses
3. All data transformations happen automatically
4. No changes needed in userCheckout.tsx (works with existing structure)

Ready for production testing! 🚀
