# Implementation Checklist ✅

## API Endpoints Implemented

### Start Attempt
- [x] POST `/api/packages/{package_id}/attempts`
- [x] Returns: `attempt_id`, `status`, `remaining_seconds`, `started_at`, `ends_at`
- [x] Used in: UserPractice.tsx → `startAttempt()`

### Get Attempt Summary
- [x] GET `/api/attempts/{attempt_id}`
- [x] Returns: `status`, `remaining_seconds`, `total_score`, `progress{}`, `nav[]`
- [x] Used in: PracticeSession.tsx → `fetchAttemptSummary()`

### Get Question
- [x] GET `/api/attempts/{attempt_id}/questions/{no}`
- [x] Returns: `question`, `options[]`, `selected_option_id`, `is_marked`, `remaining_seconds`, `status`
- [x] Used in: PracticeSession.tsx → `fetchQuestion()`

### Submit Answer
- [x] POST `/api/attempts/{attempt_id}/answers`
- [x] Request body: `{ question_id, option_id }`
- [x] Returns: `question_id`, `selected_option_id`
- [x] Used in: PracticeSession.tsx → `handleAnswer()`

### Mark Question
- [x] POST `/api/attempts/{attempt_id}/mark`
- [x] Request body: `{ question_id }`
- [x] Returns: `question_id`, `is_marked` (boolean)
- [x] Used in: PracticeSession.tsx → `handleMark()`

### Submit Attempt
- [x] POST `/api/attempts/{attempt_id}/submit`
- [x] Returns: `status: "submitted"`, `total_score`
- [x] Used in: PracticeSession.tsx → `handleFinish()`

### Get Attempt History
- [x] GET `/api/user/attempts`
- [x] Returns: array of attempts with `id`, `status`, `total_score`
- [x] Exported from: attemptService.ts (available for future use)

---

## Frontend Rules Implementation

### Timer Management
- [x] **FE does NOT calculate time** - uses `remaining_seconds` from API
- [x] Timer syncs on: attempt summary fetch, question fetch, every second
- [x] Auto-submits if time reaches 0
- [x] Displays in red when < 60 seconds remaining

### Status Checking
- [x] **Redirect if status !== "in_progress"**
  - [x] After `fetchAttemptSummary()` → check status
  - [x] After `fetchQuestion()` → check status
  - [x] Shows results page if expired/submitted

### Answer Submission
- [x] **Only send if status === "in_progress"**
  - [x] Button disabled for non-active attempts
  - [x] Options opacity-50 + cursor-not-allowed if status != "in_progress"
  - [x] API call wrapped in status check

### Score Display
- [x] **Don't show score per option**
  - [x] Option data structure only has: `id`, `label`, `text`
  - [x] No `score` property visible to user
  - [x] Only final score shown on results page

### Authorization
- [x] **All endpoints include Bearer token**
  - [x] Helper function: `getHeaders()` in attemptService.ts
  - [x] Token from: `useAuthStore.getState().token`
  - [x] Header format: `Authorization: Bearer {token}`

---

## UI/UX Features

### Navigation Sidebar
- [x] Shows question numbers in grid
- [x] Indicates answered questions (green/success)
- [x] Indicates marked questions (amber/warning)
- [x] Current question highlighted (primary + ring)
- [x] Click to jump to any question
- [x] Counter: "Q (answered/total)"

### Question Display
- [x] Question text displayed prominently
- [x] Options shown with letter labels (A, B, C, D)
- [x] Selected option highlighted (primary border + bg)
- [x] Options disabled during non-active attempts

### Controls
- [x] Previous button (disabled at Q1)
- [x] Next button (disabled at last question)
- [x] Mark/Unmark button (toggles is_marked)
- [x] Finish button (only on last question)
- [x] Exit button (returns to practice page)

### Header
- [x] Shows remaining time (in HH:MM format)
- [x] Time turns red when < 60 seconds
- [x] Progress bar shows position in test
- [x] Exit button with confirmation

### Results Page
- [x] Shows total score (from API)
- [x] Shows questions answered / total
- [x] Shows progress percentage
- [x] Success icon if score >= 70, error icon otherwise
- [x] Back to Practice button

### Loading States
- [x] Spinner while fetching initial attempt
- [x] "Starting..." state on package selection
- [x] Loading indicator during data fetch
- [x] Submitting state on finish button

### Error Handling
- [x] Toast notification on fetch errors
- [x] Redirect to practice page on invalid attempt
- [x] Graceful handling of API failures
- [x] User-friendly error messages

---

## Data Flow Verification

### Package Selection
```
UserPractice.tsx
├─ useEffect: fetchPackages() → GET /api/packages
├─ setPackages(data.data)
├─ onClick: startPractice(packageId)
└─ attemptService.startAttempt(packageId) → POST
   └─ Response: attempt_id
      └─ navigate("/practice?attemptId={id}")
```

### Attempt Session
```
PracticeSession.tsx
├─ useEffect: fetchAttemptSummary() → GET /api/attempts/{id}
│  └─ Check status, set time, set nav
├─ fetchQuestion(no) → GET /api/attempts/{id}/questions/{no}
│  └─ Check status, display question
├─ handleAnswer(optionId) → POST /api/attempts/{id}/answers
│  └─ Refresh summary
├─ handleMark() → POST /api/attempts/{id}/mark
│  └─ Refresh summary
├─ Timer: every 1s update timeLeft
│  └─ If 0: handleFinish()
└─ handleFinish() → POST /api/attempts/{id}/submit
   └─ Show results page
```

---

## Type Safety

- [x] `StartAttemptResponse` interface defined
- [x] `AttemptSummary` interface defined
- [x] `QuestionData` interface defined
- [x] `AnswerResponse` interface defined
- [x] `MarkResponse` interface defined
- [x] `SubmitResponse` interface defined
- [x] `AttemptHistoryResponse` interface defined
- [x] `Package` interface in UserPractice
- [x] `NavigationItem` interface in PracticeSession

---

## Files Modified/Created

- [x] Created: `src/lib/attemptService.ts` (291 lines)
  - API service with all endpoints
  - Type definitions
  - Auth header management
  
- [x] Modified: `src/pages/user/UserPractice.tsx` (211 lines)
  - API integration for packages
  - Start attempt flow
  - Loading states
  
- [x] Modified: `src/pages/PracticeSession.tsx` (464 lines)
  - Complete API-based implementation
  - Question fetching
  - Answer/Mark submission
  - Results display
  - Time management

---

## Environment Requirements

- [x] `VITE_API_BASE_URL` must be set in .env
- [x] `VITE_API_BASE_URL` used via `getApiBaseUrl()` from `env.ts`
- [x] Auth token available from `useAuthStore()`

---

## Testing Considerations

### Manual Testing Steps
1. [ ] Login to application
2. [ ] Navigate to Dashboard → Practice
3. [ ] Verify packages load from API
4. [ ] Click on package → verify attempt created
5. [ ] Verify question loads with correct data
6. [ ] Click option → verify answer submitted
7. [ ] Click Mark → verify question marked
8. [ ] Navigate questions → verify correct Q loads
9. [ ] Wait for timer to expire → verify auto-submit
10. [ ] Click Finish → verify attempt submitted
11. [ ] Verify results page shows score
12. [ ] Check browser console for API calls (Network tab)

### API Response Expectations
- [x] All successful responses have `success: true`
- [x] All responses contain `data` object
- [x] Authorization header required on all requests
- [x] 401 Unauthorized if token invalid/missing
- [x] 404 if attempt/question not found
- [x] 400 if request body invalid

---

## Documentation

- [x] IMPLEMENTATION_NOTES.md created
- [x] API_FLOW.md created (with diagrams)
- [x] This checklist created

---

**Status:** ✅ COMPLETE
**Date:** January 27, 2026
**All requirements from API documentation implemented.**
