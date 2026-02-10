# Orders API Contract

## Base URL
```
/api
```

---

## 1. CREATE ORDER

### Endpoint
```
POST /api/orders
```

### Authentication
**Required** - Bearer token (user login required)

### Request Body
```json
{
  "product_id": 1,
  "promo_code": "SUMMER20"  // Optional
}
```

### Response (201 Created)
```json
{
  "success": true,
  "data": {
    "id": 456,
    "user_id": 2,
    "product_id": 1,
    "status": "pending",
    "amount": 85000,
    "discount": 15000,
    "promo_code": "SUMMER20",
    "created_at": "2026-02-06T10:30:00Z",
    "updated_at": "2026-02-06T10:30:00Z"
  }
}
```

### Error Responses
```json
// Invalid product
{
  "success": false,
  "message": "Product not found",
  "code": "PRODUCT_NOT_FOUND"
}

// Invalid promo code
{
  "success": false,
  "message": "Promo code not valid or expired",
  "code": "INVALID_PROMO"
}

// Promo code doesn't apply to product
{
  "success": false,
  "message": "Promo code not applicable for this product",
  "code": "PROMO_NOT_APPLICABLE"
}
```

### Business Logic
- Create order with status = "pending"
- Calculate discount based on promo_code (if valid)
- `amount = product_price - discount`
- Set `user_id` from authenticated user
- Link to `product_id` (single or bundle)

---

## 2. LIST USER ORDERS

### Endpoint
```
GET /api/orders
```

### Authentication
**Required** - Bearer token

### Query Parameters
```
?page=1&limit=10
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 456,
        "user_id": 2,
        "product_id": 1,
        "status": "pending",
        "amount": 85000,
        "discount": 15000,
        "promo_code": "SUMMER20",
        "order_items": [
          {
            "id": 123,
            "order_id": 456,
            "package_id": 5,
            "package": {
              "id": 5,
              "name": "Math Package",
              "duration_seconds": 86400
            }
          }
        ],
        "created_at": "2026-02-06T10:30:00Z",
        "updated_at": "2026-02-06T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### Business Logic
- Return only orders for authenticated user
- Order by `created_at` descending
- Include order_items with package details

---

## 3. GET ORDER DETAIL

### Endpoint
```
GET /api/orders/{order_id}
```

### Authentication
**Required** - Bearer token (user can only see own orders)

### URL Parameters
```
order_id - Order ID (number)
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 456,
    "user_id": 2,
    "product_id": 1,
    "status": "paid",
    "amount": 85000,
    "discount": 15000,
    "promo_code": "SUMMER20",
    "order_items": [
      {
        "id": 123,
        "order_id": 456,
        "package_id": 5,
        "package": {
          "id": 5,
          "name": "Math Package",
          "duration_seconds": 86400
        }
      }
    ],
    "user_packages": [
      {
        "id": 789,
        "user_id": 2,
        "package_id": 5,
        "starts_at": "2026-02-06T10:30:00Z",
        "ends_at": "2026-02-07T10:30:00Z",
        "created_at": "2026-02-06T10:30:00Z"
      }
    ],
    "created_at": "2026-02-06T10:30:00Z",
    "updated_at": "2026-02-06T10:30:00Z"
  }
}
```

### Error Responses
```json
// Order not found
{
  "success": false,
  "message": "Order not found",
  "code": "ORDER_NOT_FOUND"
}

// User trying to access other user's order
{
  "success": false,
  "message": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

### Business Logic
- Return full order with items and granted packages
- Only allow user to see own orders
- Include user_packages only if status is "paid"

---

## 4. LIST ALL ORDERS (ADMIN)

### Endpoint
```
GET /api/admin/orders
```

### Authentication
**Required** - Bearer token with admin role

### Query Parameters
```
?status=pending&page=1&limit=20&search=query

status: "pending" | "paid" | "cancelled" (optional)
page: number (optional, default 1)
limit: number (optional, default 20)
search: string (optional, search by order_id or user info)
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 456,
        "user_id": 2,
        "product_id": 1,
        "status": "pending",
        "amount": 85000,
        "discount": 15000,
        "promo_code": "SUMMER20",
        "order_items": [
          {
            "id": 123,
            "order_id": 456,
            "package_id": 5,
            "package": {
              "id": 5,
              "name": "Math Package"
            }
          }
        ],
        "created_at": "2026-02-06T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

### Error Responses
```json
// Not authenticated
{
  "success": false,
  "message": "Unauthorized",
  "code": "UNAUTHORIZED"
}

// Not an admin
{
  "success": false,
  "message": "Forbidden - Admin only",
  "code": "FORBIDDEN"
}
```

### Business Logic
- Admin can see all orders
- Filter by status if provided
- Search across orders and user info
- Support pagination
- Order by created_at descending

---

## 5. MARK ORDER AS PAID (ADMIN)

### Endpoint
```
POST /api/admin/orders/{order_id}/mark-paid
```

### Authentication
**Required** - Bearer token with admin role

### URL Parameters
```
order_id - Order ID (number)
```

### Request Body
```json
{}
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 456,
    "user_id": 2,
    "product_id": 1,
    "status": "paid",
    "amount": 85000,
    "discount": 15000,
    "promo_code": "SUMMER20",
    "order_items": [
      {
        "id": 123,
        "order_id": 456,
        "package_id": 5,
        "package": {
          "id": 5,
          "name": "Math Package",
          "duration_seconds": 86400
        }
      }
    ],
    "user_packages": [
      {
        "id": 789,
        "user_id": 2,
        "package_id": 5,
        "starts_at": "2026-02-06T10:30:00Z",
        "ends_at": "2026-02-07T10:30:00Z"
      }
    ],
    "updated_at": "2026-02-06T11:00:00Z"
  },
  "message": "Order marked as paid and user packages have been granted"
}
```

### Error Responses
```json
// Order not found
{
  "success": false,
  "message": "Order not found",
  "code": "ORDER_NOT_FOUND"
}

// Order already paid
{
  "success": false,
  "message": "Order is already marked as paid",
  "code": "ORDER_ALREADY_PAID"
}

// Not an admin
{
  "success": false,
  "message": "Forbidden - Admin only",
  "code": "FORBIDDEN"
}
```

### Business Logic
⚠️ **CRITICAL PROCESS:**

1. **Validate**
   - Order exists
   - Current status is "pending"
   - User is admin

2. **Update Order**
   - Set `status = "paid"`
   - Set `updated_at = now`

3. **Grant Packages** (AUTOMATICALLY)
   - For each `order_item` in the order:
     - Find associated `package`
     - Create `user_packages` entry with:
       - `user_id` = order.user_id
       - `package_id` = order_item.package_id
       - `starts_at` = now (ISO datetime)
       - `ends_at` = now + package.duration_seconds (if duration_seconds exists, else null)

4. **Response**
   - Return updated order
   - Include created user_packages

### Example Calculation
```
If package.duration_seconds = 86400 (1 day):
  starts_at = 2026-02-06T10:30:00Z
  ends_at = 2026-02-07T10:30:00Z

If package.duration_seconds = null (lifetime):
  starts_at = 2026-02-06T10:30:00Z
  ends_at = null
```

---

## 6. CANCEL ORDER (OPTIONAL)

### Endpoint
```
POST /api/orders/{order_id}/cancel
```

### Authentication
**Required** - Bearer token (user can only cancel own orders)

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": 456,
    "status": "cancelled",
    "updated_at": "2026-02-06T11:00:00Z"
  }
}
```

### Business Logic
- Only allow if status is "pending"
- User can only cancel own orders
- Set status to "cancelled"
- Do not refund (for now)

---

## Data Models

### Order
```typescript
{
  id: number;
  user_id: number;
  product_id: number;
  status: "pending" | "paid" | "cancelled";
  amount: number;              // Final after discount
  discount: number;            // Discount amount
  promo_code?: string;         // Applied promo code
  created_at: ISO8601datetime;
  updated_at: ISO8601datetime;
}
```

### OrderItem
```typescript
{
  id: number;
  order_id: number;
  package_id: number;
  package?: {                  // Optional relation
    id: number;
    name: string;
    duration_seconds?: number;
  };
}
```

### UserPackage (Entitlement)
```typescript
{
  id: number;
  user_id: number;
  package_id: number;
  starts_at: ISO8601datetime;
  ends_at?: ISO8601datetime;   // null if lifetime
  created_at: ISO8601datetime;
  updated_at: ISO8601datetime;
}
```

### AccessRule for UserPackage
```typescript
const hasAccess = (userPackage: UserPackage, now: Date) => {
  const startTime = new Date(userPackage.starts_at);
  const endTime = userPackage.ends_at ? new Date(userPackage.ends_at) : null;
  
  return startTime <= now && (!endTime || endTime > now);
};
```

---

## Important Notes

⚠️ **Order Amount Calculation**
- Frontend sends only `product_id` and optional `promo_code`
- Backend calculates discount based on promo_code
- Backend calculates final amount
- Frontend displays what backend sends back

⚠️ **Automatic Package Granting**
- Only happens when admin calls `/mark-paid`
- Creates `user_packages` for ALL items in order
- Sets expiry based on package's duration_seconds
- User can immediately access packages

⚠️ **Promo Code Validation**
- Must check if promo is still valid (not expired)
- Must check if promo applies to this product/type
- Calculate discount on backend (not frontend)
- Return discount in response

⚠️ **Transaction Safety**
- Mark as paid and grant packages MUST be atomic
- If package grant fails, rollback order status change
- Return clear error messages
