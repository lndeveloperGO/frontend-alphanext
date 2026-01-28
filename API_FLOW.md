# API Flow Diagram

## Practice Session Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    UserPractice Page                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 1. Load packages from GET /api/packages                      │ │
│  │ 2. Display packages grid                                     │ │
│  │ 3. On click → startAttempt(packageId)                        │ │
│  └─────────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────────┘
                         │ POST /api/packages/{id}/attempts
                         ▼
        ┌────────────────────────────────────────┐
        │ Response: attempt_id, remaining_seconds │
        │ Navigate to /practice?attemptId={id}   │
        └────────────────┬───────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PracticeSession Page                           │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ On Mount:                                                    │ │
│  │ 1. GET /api/attempts/{attemptId}                             │ │
│  │    → Get: status, remaining_seconds, nav[], progress        │ │
│  │                                                              │ │
│  │ 2. If status != "in_progress" → Show Results                │ │
│  │                                                              │ │
│  │ 3. GET /api/attempts/{attemptId}/questions/1                │ │
│  │    → Get: question, options[], selected_option_id, etc      │ │
│  └─────────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────┐
        │   Display Question & Options            │
        │                                         │
        │ • Selected option disabled if           │
        │   status != "in_progress"              │
        │ • Navigation sidebar shows:             │
        │   - done (answered)                    │
        │   - marked (flagged)                   │
        │   - current question highlight         │
        └────────────────┬───────────────────────┘
                         │
                  ┌──────┴────────┬────────────────┐
                  │               │                │
                  ▼               ▼                ▼
          ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
          │ Click Option │  │ Click Mark   │  │ Navigate Q#  │
          │              │  │              │  │              │
          └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
                 │                 │                  │
                 ▼                 ▼                  ▼
       POST /answers          POST /mark        GET /questions/{no}
       {                      {                 (fetch new question)
         question_id,         question_id
         option_id                              Re-render with new Q
       }                      }
       │                      │                  │
       └─────────────────────┴──────────────────┘
                              │
                     Update local state
                     Refresh attempt summary
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │ Check Navigation & Time                  │
        │ • Update timer from remaining_seconds   │
        │ • Update progress indicators            │
        │ • Check if time expired                 │
        └──────────────────┬──────────────────────┘
                           │
                  ┌────────┴────────┐
                  │                 │
                  ▼                 ▼
           More Questions?    Last Question?
                  │                 │
                  └────────┬────────┘
                           │
                      No ──┤── Yes
                           │
                           ▼ (Yes)
              POST /api/attempts/{id}/submit
                           │
                           ▼
        ┌─────────────────────────────────────┐
        │ Response: {status, total_score}     │
        │ Show Results Page                    │
        │ - Total Score                       │
        │ - Questions Answered / Total        │
        │ - Progress Percentage               │
        │ - Back to Practice Button           │
        └─────────────────────────────────────┘
```

## Timer Behavior

```
┌─────────────────────────────────────────────────┐
│ Timer = Backend Truth (remaining_seconds)       │
├─────────────────────────────────────────────────┤
│ Initial time:   GET /api/attempts/{id}         │
│                 → remaining_seconds             │
│                                                 │
│ Update each Q:  GET /api/attempts/{id}/q/{no}  │
│                 → remaining_seconds             │
│                                                 │
│ Every second:   setInterval(() => {            │
│                   setTimeLeft(prev - 1)        │
│                 })                              │
│                                                 │
│ If time ≤ 0:    Call handleFinish()            │
│                 → Auto-submit attempt          │
│                                                 │
│ NEVER:          Calculate time client-side!    │
└─────────────────────────────────────────────────┘
```

## Question Navigation State

```
From API response nav[]:
[
  { question_id: 1, done: true, marked: false },
  { question_id: 2, done: false, marked: true },
  { question_id: 3, done: false, marked: false }
]

Sidebar Button Color:
• Current Q        → Primary (blue highlight + ring)
• Done (answered)  → Green (success/20 background)
• Marked (flagged) → Amber (warning/20 background)
• Unanswered       → Gray (muted)
```

## Status Handling

```
Attempt Status Check:
├─ "in_progress"  → Show question, enable answers
├─ "submitted"    → Show results page, disable navigation
└─ "expired"      → Show results page, disable navigation

Question Status Check:
├─ "in_progress"  → Enable option clicks
└─ (other)        → Disable options (opacity-50, cursor-not-allowed)

Redirect Rule:
If status !== "in_progress" after any fetch:
  → setShowResults(true)
  → Display results with final score
```

## Authorization Header

```
Every Request Includes:
headers: {
  "Content-Type": "application/json",
  "Authorization": "Bearer {token from useAuthStore()}"
}

Token source: useAuthStore.getState().token
Retrieved at request time (not at component mount)
```

---

**Last Updated:** January 27, 2026
