# Materials API Contract

## Overview
API for managing learning materials (Ebooks and Videos) for both user access and admin management.

## Base URLs
- User APIs: `{API_BASE_URL}/materials`
- Admin APIs: `{API_BASE_URL}/admin/materials`
- Headers: `Authorization: Bearer {token}`, `Content-Type: application/json`

---

## 1. USER APIs

### GET /materials
**List materials for users**

**Query Parameters:**
- `search` (string, optional): Search in title/description
- `type` (enum: "ebook"|"video", optional): Filter by type
- `category` (string, optional): Filter by category
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "1",
        "title": "Mathematics Fundamentals",
        "description": "Complete guide to basic mathematics",
        "type": "ebook",
        "category": "Mathematics",
        "cover_url": "https://example.com/cover.jpg",
        "is_free": true,
        "is_active": true,
        "pages": 150,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

### GET /materials/{id}
**Get material detail**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "2",
    "title": "Physics Made Easy",
    "description": "Understanding physics concepts",
    "type": "video",
    "category": "Science",
    "cover_url": "https://example.com/cover.jpg",
    "is_free": false,
    "is_active": true,
    "parts": [
      {
        "id": "p1",
        "title": "Introduction to Physics",
        "url": "https://example.com/video1.mp4",
        "duration": 300,
        "sort_order": 1,
        "is_active": true
      }
    ],
    "duration": 120,
    "created_at": "2024-01-05T00:00:00Z"
  }
}
```

**Response (403 - Access Denied):**
```json
{
  "success": false,
  "message": "Access denied - material requires premium access"
}
```

---

## 2. ADMIN APIs

### GET /admin/materials
**List all materials for admin**

**Query Parameters:**
- `search` (string, optional): Search in title/description
- `type` (enum: "ebook"|"video", optional): Filter by type
- `is_active` (boolean, optional): Filter by status
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page

**Response (200):**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "1",
        "title": "Mathematics Fundamentals",
        "description": "Complete guide to basic mathematics",
        "type": "ebook",
        "category": "Mathematics",
        "cover_url": "https://example.com/cover.jpg",
        "ebook_url": "https://example.com/book.pdf",
        "is_free": true,
        "is_active": true,
        "package_ids": [],
        "pages": 150,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

### POST /admin/materials
**Create new material**

**Request Body:**
```json
{
  "title": "New Material",
  "description": "Description here",
  "type": "video",
  "category": "Science",
  "cover_url": "https://example.com/cover.jpg",
  "is_free": false,
  "is_active": true,
  "package_ids": ["1", "2"],
  "parts": [
    {
      "title": "Part 1",
      "url": "https://example.com/video.mp4",
      "duration": 300,
      "sort_order": 1,
      "is_active": true
    }
  ],
  "duration": 300
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "3",
    "title": "New Material",
    "created_at": "2024-01-20T10:00:00Z",
    "updated_at": "2024-01-20T10:00:00Z"
  }
}
```

### GET /admin/materials/{id}
**Get material detail for admin**

**Response (200):** Same as user detail but includes admin fields

### PUT /admin/materials/{id}
**Update material**

**Request Body:** Same as create, all fields optional

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "Updated Title",
    "updated_at": "2024-01-20T11:00:00Z"
  }
}
```

### DELETE /admin/materials/{id}
**Delete material**

**Response (200):**
```json
{
  "success": true,
  "data": null
}
```

---

## 3. MATERIAL PARTS APIs (Admin Only)

### GET /admin/materials/{material_id}/parts
**List parts of a video material**

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "p1",
      "title": "Introduction",
      "url": "https://example.com/video.mp4",
      "duration": 300,
      "sort_order": 1,
      "is_active": true
    }
  ]
}
```

### POST /admin/materials/{material_id}/parts
**Create new part**

**Request Body:**
```json
{
  "title": "New Part",
  "url": "https://example.com/video.mp4",
  "duration": 300,
  "sort_order": 2,
  "is_active": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "p2",
    "title": "New Part",
    "sort_order": 2
  }
}
```

### PUT /admin/materials/{material_id}/parts/{part_id}
**Update part**

**Request Body:** Same as create, all fields optional

### DELETE /admin/materials/{material_id}/parts/{part_id}
**Delete part**

### PUT /admin/materials/{material_id}/parts/reorder
**Reorder parts**

**Request Body:**
```json
{
  "parts": [
    { "id": "p1", "sort_order": 2 },
    { "id": "p2", "sort_order": 1 }
  ]
}
```

---

## Data Types

### Material
- `id`: string (UUID)
- `title`: string (required, max 255)
- `description`: string (required, max 1000)
- `type`: enum ["ebook", "video"] (required)
- `category`: string (required, max 100)
- `cover_url`: string (required, URL)
- `ebook_url`: string (optional, for ebooks)
- `is_free`: boolean (required)
- `is_active`: boolean (required)
- `package_ids`: array of strings (optional, for premium materials)
- `parts`: array of MaterialPart (optional, for videos)
- `duration`: number (optional, minutes for videos)
- `pages`: number (optional, for ebooks)
- `created_at`: datetime
- `updated_at`: datetime

### MaterialPart
- `id`: string (UUID)
- `title`: string (required, max 255)
- `url`: string (required, video URL)
- `duration`: number (required, seconds)
- `sort_order`: number (required)
- `is_active`: boolean (required)

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "title": ["Title is required"],
    "type": ["Type must be ebook or video"]
  }
}
```

### 403 Forbidden (User API)
```json
{
  "success": false,
  "message": "Access denied - material requires premium access"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Material not found"
}
```

---

## Notes
- Only video materials can have parts
- Package mapping is for premium access control
- Users can only access materials they have permission for
- Admin can manage all materials regardless of access
- Parts are ordered by sort_order for video playback sequence
