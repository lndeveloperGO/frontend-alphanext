# API Contracts - Admin Panel

Spesifikasi lengkap API yang diharapkan oleh frontend.

## 📋 Base URL

```
Base: {API_BASE_URL}/admin
Header: Authorization: Bearer {token}
Content-Type: application/json
```

---

## 1. CATEGORIES API

### GET /categories
**List semua kategori**

**Request:**
```
GET /categories
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Mathematics",
      "createdAt": "2024-01-20T10:00:00Z",
      "updatedAt": "2024-01-20T10:00:00Z"
    },
    {
      "id": 2,
      "name": "Biology",
      "createdAt": "2024-01-20T10:05:00Z",
      "updatedAt": "2024-01-20T10:05:00Z"
    }
  ]
}
```

---

### POST /categories
**Create kategori baru**

**Request:**
```json
{
  "name": "Chemistry"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "Chemistry",
    "createdAt": "2024-01-20T10:10:00Z",
    "updatedAt": "2024-01-20T10:10:00Z"
  }
}
```

---

### GET /categories/{id}
**Get detail kategori**

**Request:**
```
GET /categories/1
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Mathematics",
    "createdAt": "2024-01-20T10:00:00Z",
    "updatedAt": "2024-01-20T10:00:00Z"
  }
}
```

---

### PUT /categories/{id}
**Update kategori**

**Request:**
```json
{
  "name": "Advanced Mathematics"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Advanced Mathematics",
    "createdAt": "2024-01-20T10:00:00Z",
    "updatedAt": "2024-01-20T10:15:00Z"
  }
}
```

---

### DELETE /categories/{id}
**Delete kategori**

**Request:**
```
DELETE /categories/1
```

**Response (200):**
```json
{
  "success": true,
  "data": null
}
```

---

## 2. PACKAGES API

### GET /packages
**List semua paket**

**Request:**
```
GET /packages
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Math Practice Level 1",
      "type": "latihan",
      "category_id": 1,
      "category": {
        "id": 1,
        "name": "Mathematics"
      },
      "duration_seconds": 3600,
      "is_active": true,
      "createdAt": "2024-01-20T10:00:00Z",
      "updatedAt": "2024-01-20T10:00:00Z"
    }
  ]
}
```

---

### POST /packages
**Create paket baru**

**Request:**
```json
{
  "name": "Math Tryout 2024",
  "type": "tryout",
  "category_id": 1,
  "duration_seconds": 7200,
  "is_active": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Math Tryout 2024",
    "type": "tryout",
    "category_id": 1,
    "category": {
      "id": 1,
      "name": "Mathematics"
    },
    "duration_seconds": 7200,
    "is_active": true,
    "createdAt": "2024-01-20T10:30:00Z",
    "updatedAt": "2024-01-20T10:30:00Z"
  }
}
```

---

### GET /packages/{id}
**Get detail paket**

**Request:**
```
GET /packages/1
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Math Practice Level 1",
    "type": "latihan",
    "category_id": 1,
    "category": {
      "id": 1,
      "name": "Mathematics"
    },
    "duration_seconds": 3600,
    "is_active": true,
    "createdAt": "2024-01-20T10:00:00Z",
    "updatedAt": "2024-01-20T10:00:00Z"
  }
}
```

---

### PUT /packages/{id}
**Update paket**

**Request:**
```json
{
  "name": "Math Practice Level 1 (Updated)",
  "type": "latihan",
  "category_id": 1,
  "duration_seconds": 5400,
  "is_active": false
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Math Practice Level 1 (Updated)",
    "type": "latihan",
    "category_id": 1,
    "category": {
      "id": 1,
      "name": "Mathematics"
    },
    "duration_seconds": 5400,
    "is_active": false,
    "createdAt": "2024-01-20T10:00:00Z",
    "updatedAt": "2024-01-20T10:45:00Z"
  }
}
```

---

### DELETE /packages/{id}
**Delete paket**

**Request:**
```
DELETE /packages/1
```

**Response (200):**
```json
{
  "success": true,
  "data": null
}
```

---

## 3. QUESTIONS API

### GET /questions
**List semua soal**

**Request:**
```
GET /questions
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "question_text": "What is 2 + 2?",
      "explanation": "The answer is 4 because 2 + 2 = 4",
      "options": [
        {
          "id": 1,
          "option_text": "3",
          "score_value": 0
        },
        {
          "id": 2,
          "option_text": "4",
          "score_value": 100
        },
        {
          "id": 3,
          "option_text": "5",
          "score_value": 0
        }
      ],
      "createdAt": "2024-01-20T10:00:00Z",
      "updatedAt": "2024-01-20T10:00:00Z"
    }
  ]
}
```

---

### POST /questions
**Create soal baru**

**Request:**
```json
{
  "question_text": "What is the capital of France?",
  "explanation": "Paris is the capital city of France"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "question_text": "What is the capital of France?",
    "explanation": "Paris is the capital city of France",
    "options": [],
    "createdAt": "2024-01-20T10:30:00Z",
    "updatedAt": "2024-01-20T10:30:00Z"
  }
}
```

---

### GET /questions/{id}
**Get detail soal**

**Request:**
```
GET /questions/1
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "question_text": "What is 2 + 2?",
    "explanation": "The answer is 4 because 2 + 2 = 4",
    "options": [
      {
        "id": 1,
        "option_text": "3",
        "score_value": 0
      },
      {
        "id": 2,
        "option_text": "4",
        "score_value": 100
      }
    ],
    "createdAt": "2024-01-20T10:00:00Z",
    "updatedAt": "2024-01-20T10:00:00Z"
  }
}
```

---

### PUT /questions/{id}
**Update soal**

**Request:**
```json
{
  "question_text": "What is 2 + 2? (Updated)",
  "explanation": "2 + 2 always equals 4"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "question_text": "What is 2 + 2? (Updated)",
    "explanation": "2 + 2 always equals 4",
    "options": [
      {
        "id": 1,
        "option_text": "3",
        "score_value": 0
      },
      {
        "id": 2,
        "option_text": "4",
        "score_value": 100
      }
    ],
    "createdAt": "2024-01-20T10:00:00Z",
    "updatedAt": "2024-01-20T10:45:00Z"
  }
}
```

---

### DELETE /questions/{id}
**Delete soal**

**Request:**
```
DELETE /questions/1
```

**Response (200):**
```json
{
  "success": true,
  "data": null
}
```

---

## 4. OPTIONS API

### POST /questions/{question_id}/options
**Create opsi jawaban**

**Request:**
```json
{
  "option_text": "4",
  "score_value": 100
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "option_text": "4",
    "score_value": 100
  }
}
```

---

### PATCH /options/{option_id}
**Update opsi jawaban**

**Request:**
```json
{
  "option_text": "Four",
  "score_value": 100
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "option_text": "Four",
    "score_value": 100
  }
}
```

---

### DELETE /options/{option_id}
**Delete opsi jawaban**

**Request:**
```
DELETE /options/2
```

**Response (200):**
```json
{
  "success": true,
  "data": null
}
```

---

## 5. PACKAGE QUESTIONS API

### GET /packages/{package_id}/questions
**List soal dalam paket**

**Request:**
```
GET /packages/1/questions
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "question_id": 5,
      "order_no": 1,
      "question": {
        "id": 5,
        "question_text": "First question in package"
      }
    },
    {
      "id": 2,
      "question_id": 8,
      "order_no": 2,
      "question": {
        "id": 8,
        "question_text": "Second question in package"
      }
    }
  ]
}
```

---

### PUT /packages/{package_id}/questions
**Sync/update urutan soal dalam paket**

**Request:**
```json
{
  "items": [
    {
      "question_id": 8,
      "order_no": 1
    },
    {
      "question_id": 5,
      "order_no": 2
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": null
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid request body"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Token is invalid or expired"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Category not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Data Types & Constraints

### Category
- `id`: number (primary key)
- `name`: string (required, max 255)

### Package
- `id`: number (primary key)
- `name`: string (required, max 255)
- `type`: enum ["latihan", "tryout", "akbar"] (required)
- `category_id`: number (required, foreign key to categories)
- `duration_seconds`: number (required, > 0)
- `is_active`: boolean (default: true)

### Question
- `id`: number (primary key)
- `question_text`: string (required, max 2000)
- `explanation`: string (optional, max 2000)
- `options`: array of QuestionOption (managed separately)

### QuestionOption
- `id`: number (primary key)
- `question_id`: number (foreign key to questions)
- `option_text`: string (required, max 500)
- `score_value`: number (required, >= 0)

### PackageQuestion
- `id`: number (primary key)
- `package_id`: number (foreign key to packages)
- `question_id`: number (foreign key to questions)
- `order_no`: number (required, >= 1)

---

## Common Validations

- All string fields: trim whitespace
- Dates: ISO 8601 format
- Duration: milliseconds or seconds (specify)
- Score: should not be negative
- Order: should start from 1

---

## Pagination (Optional)

If implementing pagination, use query params:
```
GET /questions?page=1&limit=10&search=query
```

Response:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

