# Admin Panel - Implementasi Lengkap

Dokumentasi lengkap untuk sistem admin panel baru yang telah diimplementasikan.

## 📁 File-file yang Dibuat/Dimodifikasi

### Services (API Layer)
1. **`src/lib/categoryService.ts`** - Service untuk CRUD kategori
2. **`src/lib/packageService.ts`** - Service untuk CRUD paket
3. **`src/lib/questionService.ts`** - Service untuk CRUD soal dan opsi

### Pages (Admin)
1. **`src/pages/admin/AdminCategories.tsx`** - Halaman manajemen kategori
2. **`src/pages/admin/AdminQuestions.tsx`** - Halaman manajemen soal dengan nested options (diupdate)
3. **`src/pages/admin/AdminPackages.tsx`** - Halaman manajemen paket (diupdate)
4. **`src/pages/admin/PackageQuestions.tsx`** - Halaman manajemen soal dalam paket dengan drag & drop

### Configuration
1. **`src/App.tsx`** - Tambahan routing untuk kategori dan paket soal
2. **`src/components/layout/DashboardLayout.tsx`** - Tambahan menu item untuk kategori

---

## 1️⃣ HALAMAN KATEGORI (/admin/categories)

### Fitur
- ✅ List semua kategori dengan ID dan nama
- ✅ Tambah kategori baru
- ✅ Edit kategori
- ✅ Hapus kategori dengan konfirmasi
- ✅ Loading state dan error handling

### API Endpoints
```
GET    /admin/categories              (List)
POST   /admin/categories              (Create)
GET    /admin/categories/{id}         (Detail)
PUT    /admin/categories/{id}         (Update)
DELETE /admin/categories/{id}         (Delete)
```

### Struktur Tabel
| Kolom | Keterangan |
|-------|-----------|
| ID | ID kategori |
| Name | Nama kategori |
| Actions | Edit & Delete buttons |

### Form Fields
- **name** (text, required) - Nama Kategori

---

## 2️⃣ HALAMAN PAKET (/admin/packages)

### Fitur
- ✅ List paket dengan informasi lengkap
- ✅ Tampilkan tipe paket dengan badge (latihan/tryout/akbar)
- ✅ Tampilkan kategori dari relasi
- ✅ Format durasi otomatis (detik → menit/jam)
- ✅ Toggle status aktif/nonaktif
- ✅ Tombol "Kelola Soal" untuk navigasi ke manage questions
- ✅ Tambah, edit, hapus paket
- ✅ Validasi form lengkap

### API Endpoints
```
GET    /admin/packages                (List)
POST   /admin/packages                (Create)
GET    /admin/packages/{id}           (Detail)
PUT    /admin/packages/{id}           (Update)
DELETE /admin/packages/{id}           (Delete)
```

### Struktur Tabel
| Kolom | Keterangan |
|-------|-----------|
| ID | ID paket |
| Name | Nama paket |
| Type | Badge: latihan/tryout/akbar |
| Category | Nama kategori (relasi) |
| Duration | Format: 30 min, 1h 15m |
| Status | Badge: Active/Inactive |
| Actions | Manage, Edit, Delete |

### Form Fields
- **name** (text, required) - Nama Paket
- **type** (select, required) - Tipe Paket
  - Latihan
  - Tryout
  - Tryout Akbar
- **category_id** (select, required) - Kategori (fetched dari API)
- **duration_seconds** (number, required) - Durasi dalam detik
- **is_active** (switch) - Status Aktif

---

## 3️⃣ HALAMAN SOAL (/admin/questions)

### Fitur
- ✅ List semua soal dengan preview dan jumlah opsi
- ✅ Truncate text soal (max 100 karakter)
- ✅ Tampilkan jumlah opsi dalam badge
- ✅ Dialog detail untuk melihat soal lengkap
- ✅ Tab untuk Details dan Options management
- ✅ Tambah, edit, hapus soal
- ✅ Manage opsi jawaban dengan highlight score tertinggi
- ✅ Generate label opsi otomatis (A, B, C, D, E)

### API Endpoints
```
GET    /admin/questions                         (List)
POST   /admin/questions                         (Create)
GET    /admin/questions/{id}                    (Detail)
PUT    /admin/questions/{id}                    (Update)
DELETE /admin/questions/{id}                    (Delete)

POST   /admin/questions/{question_id}/options   (Create Option)
PATCH  /admin/options/{option_id}               (Update Option)
DELETE /admin/options/{option_id}               (Delete Option)
```

### Struktur Tabel Soal
| Kolom | Keterangan |
|-------|-----------|
| ID | ID soal |
| Question | Preview soal (truncated 100 char) |
| Options | Jumlah opsi dalam badge |
| Actions | Detail, Edit, Delete |

### Struktur List Opsi (dalam Dialog Detail)
| Kolom | Keterangan |
|-------|-----------|
| Label | A, B, C, D, E (auto-generated) |
| Teks | Teks opsi jawaban |
| Score | Nilai/skor opsi |
| Highlight | Highlight jika score tertinggi |
| Actions | Edit, Delete |

### Form Fields
- **question_text** (textarea, required) - Isi Soal
- **explanation** (textarea, optional) - Pembahasan

### Option Form Fields
- **option_text** (text, required) - Teks Opsi
- **score_value** (number, required) - Nilai/Skor

---

## 4️⃣ HALAMAN KELOLA SOAL DALAM PAKET (/admin/packages/{id}/questions)

### Fitur
- ✅ Header dengan info paket (nama, tipe, durasi, status)
- ✅ List soal dalam paket dengan nomor urut
- ✅ Drag & drop untuk reordering soal
- ✅ Preview soal yang ditruncate
- ✅ Hapus soal dari paket
- ✅ Tombol "Save Order" untuk sync ke API
- ✅ Back button untuk kembali ke halaman packages
- ✅ Loading dan error handling

### API Endpoints
```
GET /admin/packages/{package_id}/questions    (List)
PUT /admin/packages/{package_id}/questions    (Sync/Update Order)
```

### Request Body untuk Sync
```json
{
  "items": [
    { "question_id": 1, "order_no": 1 },
    { "question_id": 3, "order_no": 2 },
    { "question_id": 2, "order_no": 3 }
  ]
}
```

### Struktur List
| Kolom | Keterangan |
|-------|-----------|
| No. | Nomor urut (1, 2, 3...) |
| Question ID | ID soal |
| Preview | Preview soal (truncated 80 char) |
| Actions | Remove button |

---

## 🔐 Autentikasi

Semua request ke API menggunakan:
- **Header:** `Authorization: Bearer <token>`
- **Content-Type:** `application/json`

Token diambil dari `useAuthStore.getState().token` di setiap service call.

---

## 📝 Response Format

### Success
```json
{
  "success": true,
  "data": { /* actual data */ }
}
```

### Error
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## 🎨 UI Components Digunakan

- **Dialog** - Untuk form create/edit
- **AlertDialog** - Untuk konfirmasi delete
- **Table** - Untuk list data
- **Badge** - Untuk status dan type
- **Switch** - Untuk toggle aktif/nonaktif
- **Select** - Untuk dropdown kategori
- **Card** - Untuk container utama
- **Button** - Untuk aksi
- **Input** - Untuk text input
- **Textarea** - Untuk deskripsi panjang
- **Tabs** - Untuk tab details dan options
- **Loader** - Loading spinner

---

## 🔄 Data Flow

### Create Flow
1. User klik "Add" button
2. Dialog terbuka dengan form kosong
3. User isi form
4. Klik "Save" → Submit ke API
5. If success → Close dialog, reload data, show toast
6. If error → Show error toast, stay di dialog

### Edit Flow
1. User klik "Edit" button pada item
2. Dialog terbuka dengan data item
3. User edit form
4. Klik "Save" → Submit ke API dengan ID
5. Same as create flow

### Delete Flow
1. User klik "Delete" button
2. AlertDialog untuk konfirmasi
3. User klik "Delete" di dialog
4. Submit delete request ke API
5. If success → Close dialog, reload data, show toast
6. If error → Show error toast

---

## 🛠️ Cara Menggunakan

### Akses Routes
```
- Kategori     : /admin/categories
- Paket        : /admin/packages
- Soal         : /admin/questions
- Manage Soal  : /admin/packages/{packageId}/questions
```

### Navigation Menu
Semua halaman sudah terintegrasi dengan sidebar admin. Menu items:
- Dashboard
- Users
- Questions
- Packages
- **Categories** ← Baru
- Vouchers
- Materials
- Tryouts
- Rankings
- My Profile

---

## ✅ Testing Checklist

- [ ] Create kategori - verify di API
- [ ] Edit kategori - verify di API
- [ ] Delete kategori - verify di API
- [ ] Create paket dengan kategori - verify relasi
- [ ] Edit paket - verify semua field
- [ ] Delete paket - verify konfirmasi
- [ ] Create soal dengan opsi
- [ ] Edit soal dan opsi
- [ ] Delete soal dan opsi
- [ ] Drag & drop soal dalam paket
- [ ] Save order soal - verify di API
- [ ] Remove soal dari paket
- [ ] Check all validations
- [ ] Check error handling
- [ ] Check loading states
- [ ] Check responsive design

---

## 📌 Notes

1. Semua service menggunakan async/await dengan proper error handling
2. Loading state ditampilkan dengan spinner
3. Success dan error toasts untuk feedback user
4. Form validation sebelum submit
5. Proper typing dengan TypeScript interfaces
6. Responsive design dengan Tailwind CSS
7. Dark mode support built-in

