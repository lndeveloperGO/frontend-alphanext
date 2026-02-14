# Plan: Video Part Lock System dengan UX Improvement

## Information Gathered

### Current Implementation Analysis:
1. **File**: `src/pages/user/MaterialDetail.tsx`
2. **Current behavior**: All video parts are accessible - users can click any part regardless of whether previous videos are finished
3. **YouTube embed**: Currently has controls disabled, uses iframe directly without tracking state
4. **Playlist**: Shows all parts in a scrollable list with click to play

### Technical Requirements:
1. Track video watch progress for both YouTube and MP4 videos
2. Lock next part if current video is not finished
3. Unlock next part when video is completed (reaches end)
4. Improve UX with visual indicators

## Plan

### Step 1: Update Material Interface
- Add `completed_parts` tracking in component state (array of completed part IDs)

### Step 2: Implement YouTube Video Tracking
- Use YouTube IFrame API for tracking video state
- Listen for `onStateChange` event (state 0 = video ended)
- Add ref for YouTube iframe to track player instance

### Step 3: Implement MP4 Video Tracking  
- Add `onEnded` event handler to video element
- Track when MP4 video completes

### Step 4: Add Lock/Unlock Logic
- Part index `0` is always unlocked
- Part index `n` is locked unless part `n-1` is completed
- Check completed status before allowing part selection

### Step 5: UX Improvements
- Add lock icon for locked parts
- Add visual distinction (opacity, cursor) for locked parts
- Add "completed" checkmark for finished videos
- Add progress indicator showing completion status
- Show tooltip/message when clicking locked part
- Add "Mark as Complete" button as fallback option

### Step 6: Update Playlist UI
- Show lock icon next to locked parts
- Show checkmark for completed parts
- Show current playing indicator
- Disable click on locked parts with visual feedback

## Dependent Files to be Edited:
1. `src/pages/user/MaterialDetail.tsx` - Main implementation

## Implementation Steps:
1. Add YouTube API script loader
2. Add state for tracking completed parts
3. Create helper function to check if part is unlocked
4. Update video player to track completion
5. Update playlist UI with lock/unlock states
6. Add UX improvements (toast, visual feedback)

