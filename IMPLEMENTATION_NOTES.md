# Implementation Summary: API Integration for Practice & Tryout Sessions

## Overview
Updated the practice and tryout pages to use API endpoints instead of mock data, with proper authentication and real-time state management based on server responses.

## Files Created

### 1. [src/lib/attemptService.ts](src/lib/attemptService.ts)
New API service module for handling all attempt-related operations:

**Exports:**
- `StartAttemptResponse` - Response type for starting an attempt
- `AttemptSummary` - Summary data including progress, time, and navigation
- `QuestionData` - Single question details
- `AnswerResponse`, `MarkResponse`, `SubmitResponse` - Response types

**API Functions:**
- `startAttempt(packageId)` - POST `/api/packages/{package_id}/attempts`
- `getAttemptSummary(attemptId)` - GET `/api/attempts/{attempt_id}`
- `getQuestion(attemptId, questionNo)` - GET `/api/attempts/{attempt_id}/questions/{no}`
- `submitAnswer(attemptId, questionId, optionId)` - POST `/api/attempts/{attempt_id}/answers`
- `markQuestion(attemptId, questionId)` - POST `/api/attempts/{attempt_id}/mark`
- `submitAttempt(attemptId)` - POST `/api/attempts/{attempt_id}/submit`
- `getUserAttempts()` - GET `/api/user/attempts`

**Features:**
- Automatic Bearer token injection from auth store
- Type-safe API responses
- Error handling with descriptive messages

## Files Modified

### 2. [src/pages/user/UserPractice.tsx](src/pages/user/UserPractice.tsx)
**Changes:**
- Replaced mock data with real API calls to `/api/packages`
- Added `useState` and `useEffect` hooks for data fetching
- Integrated `attemptService.startAttempt()` to initiate practice sessions
- Added loading states with spinner indicator
- Added error handling with toast notifications
- Changed navigation to pass `attemptId` instead of `category`

**New Features:**
- Real-time package data from backend
- Loading skeleton while fetching packages
- Empty state when no packages available
- "Starting..." button state during attempt initialization

### 3. [src/pages/PracticeSession.tsx](src/pages/PracticeSession.tsx)
**Major Changes:**
- Changed from route parameter `/practice?category=x` to `/practice?attemptId=x`
- Implemented full API-based question flow:
  1. Fetches attempt summary on load
  2. Checks attempt status (redirects if expired/submitted)
  3. Fetches questions one at a time from backend
  4. Updates UI based on `remaining_seconds` from server (not client timer)

**Key Implementations:**
- `fetchAttemptSummary()` - Gets progress and remaining time
- `fetchQuestion(questionNo)` - Loads specific question
- `handleAnswer()` - Submits answer and updates local state
- `handleMark()` - Marks/unmarks questions for review
- `handleFinish()` - Submits attempt to backend

**Important Rules Applied:**
- ✅ Timer uses `remaining_seconds` from backend (not calculated client-side)
- ✅ Disables answer options if `status !== "in_progress"`
- ✅ Redirects to results if attempt is expired/submitted
- ✅ Only sends answers when status is "in_progress"
- ✅ All endpoints use Bearer token authorization
- ✅ Question options don't show scores
- ✅ Navigation sidebar updates based on API response (`done`, `marked` flags)
- ✅ Progress percentage calculated from backend progress data

**UI Changes:**
- Removed difficulty badge (not in API response)
- Added "Mark" button for flagging questions
- Progress indicators now use `done` and `marked` flags from backend
- Real-time time synchronization with server

## API Integration Details

### Authentication
All API calls automatically include:
```
Authorization: Bearer {token}
```
Token retrieved from `useAuthStore()` at request time.

### Error Handling
- Network errors show toast notification
- Invalid attempt IDs redirect to practice page
- Failed API calls display user-friendly error messages
- Attempt status checked after each fetch

### State Management
- `attemptSummary` - Overall progress and status
- `currentQuestion` - Currently displayed question with user's answer
- `questions` - Navigation array from attempt summary
- `timeLeft` - Updates from server `remaining_seconds`
- `showResults` - Conditionally displays results page

### Navigation Flow
1. User selects package on UserPractice page
2. `startAttempt()` creates attempt on backend
3. Redirects to `/practice?attemptId={id}`
4. `getQuestion()` fetches questions one at a time
5. User navigates with Previous/Next buttons
6. `submitAnswer()` persists each answer
7. `markQuestion()` flags questions for review
8. `submitAttempt()` finalizes and shows results

## Type Safety
All API responses are typed with TypeScript interfaces for:
- Complete autocomplete in IDE
- Runtime error prevention
- Self-documenting API contracts

## Backward Compatibility
- Mock data still available in `mockData.ts` for other features
- No breaking changes to existing components
- Routes remain the same (only query params changed)

## Environment Variables Required
```
VITE_API_BASE_URL=https://api.example.com
```
Used by `getApiBaseUrl()` in `attemptService.ts`

---
**Implementation Date:** January 27, 2026
**Status:** ✅ Complete
