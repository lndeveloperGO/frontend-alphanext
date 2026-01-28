# Development Guidelines - Admin Panel

Panduan untuk mengembangkan dan memelihara admin panel.

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   UI Components                      │
│  (Pages: AdminCategories, AdminQuestions, etc)       │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────┐
│              Services Layer                          │
│  (categoryService, questionService, packageService) │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────┐
│                   HTTP Client                        │
│              (fetch API with token)                  │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────┐
│                 Backend API                          │
│      (/admin/categories, /packages, etc)         │
└─────────────────────────────────────────────────────┘
```

---

## 🏗️ File Organization

```
src/
├── lib/
│   ├── categoryService.ts    ← API calls untuk kategori
│   ├── packageService.ts     ← API calls untuk paket
│   ├── questionService.ts    ← API calls untuk soal
│   └── utils.ts
│
├── pages/admin/
│   ├── AdminCategories.tsx   ← UI Kategori
│   ├── AdminQuestions.tsx    ← UI Soal (with nested options)
│   ├── AdminPackages.tsx     ← UI Paket
│   └── PackageQuestions.tsx  ← UI Manage Soal dalam Paket
│
└── components/
    └── layout/
        └── DashboardLayout.tsx ← Navigation sidebar
```

---

## 🔄 Service Pattern

Setiap service file mengikuti pola yang sama:

```typescript
// 1. Import dependencies
import { getEnv } from "@/lib/env";
import { useAuthStore } from "@/stores/authStore";

// 2. Define types/interfaces
export interface Category {
  id: number;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryInput {
  name: string;
}

// 3. Helper functions
const getApiUrl = () => getEnv().API_BASE_URL;

const getAuthHeader = () => {
  const token = useAuthStore.getState().token;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// 4. Service methods
export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const response = await fetch(`${getApiUrl()}/admin/categories`, {
      method: "GET",
      headers: getAuthHeader(),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    const data = await response.json();
    return data.data || data;
  },

  // ... more methods
};
```

---

## 📝 Component Pattern

Setiap halaman admin mengikuti pola yang sama:

```typescript
// 1. State management
const [items, setItems] = useState<Item[]>([]);
const [loading, setLoading] = useState(true);
const [submitting, setSubmitting] = useState(false);
const [dialogOpen, setDialogOpen] = useState(false);
const [selectedItem, setSelectedItem] = useState<Item | null>(null);
const [formData, setFormData] = useState<CreateItemInput>({ ... });

// 2. Effects
useEffect(() => {
  loadItems();
}, []);

// 3. Data loading
const loadItems = async () => {
  try {
    setLoading(true);
    const data = await itemService.getItems();
    setItems(data);
  } catch (error) {
    toast({ ... });
  } finally {
    setLoading(false);
  }
};

// 4. Dialog handlers
const handleOpenDialog = (mode: DialogMode, item?: Item) => { ... };
const handleCloseDialog = () => { ... };

// 5. Form submission
const handleSubmit = async () => {
  // Validation
  // API call
  // Update state
  // Show toast
};

// 6. Render
return (
  <DashboardLayout>
    {/* Header */}
    {/* Table/List */}
    {/* Dialog */}
  </DashboardLayout>
);
```

---

## ✅ Code Standards

### TypeScript Typing

Always use proper types:

```typescript
// ✅ Good
const [items, setItems] = useState<Item[]>([]);
const handleSubmit = async (data: CreateItemInput): Promise<void> => {
  // ...
};

// ❌ Avoid
const [items, setItems] = useState([]);
const handleSubmit = async (data: any) => {
  // ...
};
```

### Error Handling

```typescript
// ✅ Good
try {
  const data = await service.getData();
  setData(data);
} catch (error) {
  const message = error instanceof Error ? error.message : "Failed";
  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });
}

// ❌ Avoid
try {
  const data = await service.getData();
  setData(data);
} catch (error) {
  console.log("error"); // Silent failure
}
```

### Loading States

```typescript
// ✅ Good - Disable button while loading
<Button onClick={handleSubmit} disabled={submitting}>
  {submitting ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Saving...
    </>
  ) : (
    "Save"
  )}
</Button>

// ❌ Avoid
<Button onClick={handleSubmit}>Save</Button>
```

### Form Validation

```typescript
// ✅ Good - Validate before submit
const handleSubmit = async () => {
  if (!formData.name.trim()) {
    toast({
      title: "Error",
      description: "Name is required",
      variant: "destructive",
    });
    return;
  }
  // ... proceed with submit
};

// ❌ Avoid
const handleSubmit = async () => {
  // Submit without validation
  await service.create(formData);
};
```

---

## 🎨 UI Component Usage

### Dialog Patterns

```typescript
// Create/Edit Dialog
<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>
        {mode === "create" ? "Create" : "Edit"}
      </DialogTitle>
    </DialogHeader>

    {/* Form fields */}

    <DialogFooter>
      <Button variant="outline" onClick={handleClose}>
        Cancel
      </Button>
      <Button onClick={handleSubmit} disabled={submitting}>
        Save
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Alert Dialog for Delete

```typescript
<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
  <AlertDialogContent>
    <AlertDialogTitle>Delete Item</AlertDialogTitle>
    <AlertDialogDescription>
      Are you sure? This action cannot be undone.
    </AlertDialogDescription>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction
        onClick={handleDelete}
        className="bg-destructive hover:bg-destructive/90"
      >
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## 🧪 Testing Checklist

### Unit Test Scenarios

- [ ] Service methods handle success responses
- [ ] Service methods throw on error responses
- [ ] Form validation prevents invalid submissions
- [ ] Loading states are properly managed
- [ ] Error messages are displayed to user
- [ ] Success messages are displayed to user

### Integration Test Scenarios

- [ ] Create item successfully
- [ ] Edit item successfully
- [ ] Delete item with confirmation
- [ ] List items with loading state
- [ ] Handle API errors gracefully
- [ ] Navigate between pages

### UI/UX Test Scenarios

- [ ] Buttons are disabled while loading
- [ ] Form fields are required where needed
- [ ] Long text is truncated appropriately
- [ ] Responsive design on mobile
- [ ] Dark mode works properly
- [ ] Toast notifications appear

---

## 🚀 Adding New Admin Feature

Follow these steps:

### 1. Create Service
```typescript
// src/lib/newService.ts
export interface NewItem { ... }
export const newService = { ... };
```

### 2. Create Page Component
```typescript
// src/pages/admin/AdminNewFeature.tsx
export default function AdminNewFeature() {
  // Follow the pattern
}
```

### 3. Add Routes
```typescript
// src/App.tsx
import AdminNewFeature from "./pages/admin/AdminNewFeature";

<Route path="/admin/new-feature" 
  element={<ProtectedRoute><AdminNewFeature /></ProtectedRoute>} 
/>
```

### 4. Add Navigation
```typescript
// src/components/layout/DashboardLayout.tsx
const adminNavItems: NavItem[] = [
  // ... existing items
  { title: "New Feature", href: "/admin/new-feature", icon: Icon },
];
```

---

## 🐛 Common Issues & Solutions

### Issue: Token not found
**Solution:** Check if user is authenticated
```typescript
const token = useAuthStore.getState().token;
if (!token) {
  throw new Error("Not authenticated");
}
```

### Issue: API response format mismatch
**Solution:** Always check response structure
```typescript
const data = await response.json();
return data.data || data; // Handle both formats
```

### Issue: Stale data after update
**Solution:** Reload data after mutation
```typescript
await service.update(id, data);
await loadData(); // Refresh list
```

### Issue: Dialog doesn't close
**Solution:** Ensure form state is reset
```typescript
const handleClose = () => {
  setDialogOpen(false);
  setFormData({ /* reset */ });
  setSelectedItem(null);
};
```

---

## 📚 Best Practices

1. **Always validate input** before sending to API
2. **Always show loading states** during async operations
3. **Always handle errors** with user-friendly messages
4. **Always reset form state** after successful submission
5. **Always use TypeScript** for type safety
6. **Always use proper component composition**
7. **Always implement proper error boundaries**
8. **Always test API integration**

---

## 🔍 Debugging Tips

### Check Network Requests
1. Open DevTools → Network tab
2. Filter by Fetch/XHR
3. Check request headers and body
4. Check response status and body

### Check Console Errors
1. Open DevTools → Console tab
2. Look for red error messages
3. Check stack trace for error location

### Check Component State
1. React DevTools browser extension
2. Inspect component state and props
3. Check if state updates are working

---

## 📖 Documentation

Keep these files updated:
- `ADMIN_PANEL_IMPLEMENTATION.md` - Feature documentation
- `ADMIN_PANEL_QUICK_START.md` - Quick reference guide
- `API_CONTRACTS.md` - API specifications
- `DEVELOPMENT_GUIDELINES.md` - This file

---

## 🔄 CI/CD Considerations

- Run tests before deployment
- Ensure all error cases are handled
- Test with different network speeds
- Test with different authentication states
- Validate API responses match contracts

