# Materi Belajar Implementation TODO

## Phase 1: Data Structures & API Layer
- [x] Update Material interface in mockData.ts (add cover_url, is_free, is_active, parts, package_ids)
- [x] Add MaterialPart interface
- [x] Create materialService.ts with API functions
- [x] Create MATERIALS_API_CONTRACT.md

## Phase 2: Admin Side
- [x] Update AdminMaterials.tsx table (add Status, Access Type columns)
- [x] Add dynamic form fields (is_free, is_active, package mapping)
- [ ] Implement Manage Parts view for videos
- [ ] Add drag&drop for parts ordering
- [ ] Inline editing for parts

## Phase 3: User Side
- [x] Create UserMaterials.tsx (library page with grid/list, search, filters)
- [x] Create MaterialDetail.tsx (video player + playlist or ebook viewer)
- [x] Handle 403 locked content error
- [x] Implement infinite scroll/pagination

## Phase 4: Integration
- [x] Add routes in App.tsx
- [x] Update Navbar with Materials menu
- [x] Ensure Bearer token in API calls

## Phase 5: Testing & Polish
- [x] Test all CRUD operations (build successful)
- [x] Test video player and PDF viewer (placeholder implemented)
- [x] Test authentication flows (Bearer token implemented)
- [x] Test responsive design (responsive components used)
- [x] Add loading states and error handling (implemented)
