# History Tab Implementation - UserPractice Page

## Summary
Successfully added a "Riwayat Pengerjaan" (Attempt History) tab to the UserPractice page that displays user's attempt history using the GET `/user/attempts` endpoint.

## Changes Made

### 1. Updated `src/lib/attemptService.ts`
- Enhanced `AttemptHistory` interface with complete fields:
  - `attempt_id`: number
  - `package_id`: number
  - `package_name`: string
  - `package_type`: "latihan" | "tryout" | "akbar"
  - `status`: "in_progress" | "submitted" | "expired"
  - `total_score`: number
  - `started_at`: string
  - `submitted_at`: string | null
  - `expired_at`: string | null
  - `ends_at`: string
  - `remaining_seconds`: number

### 2. Updated `src/pages/user/UserPractice.tsx`

#### New Features:
- **Tabs Component**: Added two tabs using shadcn/ui Tabs component
  - Tab 1: "Paket Aktif" (existing functionality)
  - Tab 2: "Riwayat Pengerjaan" (new)

#### New State Variables:
- `attempts`: Array of attempt history
- `loadingHistory`: Loading state for history fetch
- `historyError`: Error state for history fetch
- `statusFilter`: Filter for attempt status
- `activeTab`: Current active tab

#### New Functions:
- `fetchAttemptHistory()`: Fetches attempt history from API
- `continueAttempt(attemptId)`: Navigates to continue an in-progress attempt
- `getStatusBadge(status)`: Returns appropriate badge for attempt status
- `getFilteredAttempts()`: Filters attempts based on status filter
- `formatDateTime(dateString)`: Formats date and time for display

#### History Tab Features:
1. **Status Filters**: 
   - Semua (All)
   - Sedang Dikerjakan (In Progress)
   - Selesai (Submitted)
   - Kadaluarsa (Expired)

2. **Table Display** showing:
   - Package name
   - Package type (Latihan/Tryout)
   - Status badge with icon
   - Score (for submitted attempts)
   - Start date/time
   - End date/time (submitted or expired)
   - Action button (Continue for in-progress attempts)

3. **Status Badges**:
   - In Progress: Blue badge with Clock icon
   - Submitted: Green badge with CheckCircle icon
   - Expired: Red badge with XCircle icon

4. **Empty States**:
   - No history: Shows message to start practicing
   - No filtered results: Shows message to try other filters

5. **Error Handling**:
   - Displays error message if fetch fails
   - Retry button to refetch data

## API Integration
- Endpoint: `GET /user/attempts`
- Service: `attemptService.getUserAttempts()`
- Response structure: 
  ```typescript
  {
    success: boolean;
    data: {
      data: AttemptHistory[];
    };
  }
  ```

## UI/UX Improvements
- Consistent design with existing pages
- Responsive table layout
- Loading states with spinner
- Error states with retry option
- Filter buttons for easy navigation
- Action buttons for in-progress attempts
- Clear status indicators with icons and colors

## Testing Recommendations
1. Test with empty history (no attempts)
2. Test with various attempt statuses
3. Test status filters
4. Test "Continue" button for in-progress attempts
5. Test error handling when API fails
6. Test responsive design on mobile devices
7. Verify date/time formatting
8. Test tab switching behavior

## Next Steps
- Verify API response matches the expected structure
- Test with real data from backend
- Consider adding pagination if history grows large
- Consider adding search/sort functionality
- Consider adding detailed view dialog for completed attempts
