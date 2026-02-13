# Video Playback Implementation Plan

## Information Gathered
- UserMaterials.tsx: Displays grid/list of materials with cover images, badges for video/ebook type, premium indicators.
- MaterialDetail.tsx: Shows material details, has placeholder for video playback with play button but no actual player.
- MaterialPart interface: Has video_url field which can be YouTube URL or MP4 URL.
- utils.ts: Currently only has cn function for class merging.
- TODO.md: Specifies tasks for video implementation.

## Plan
1. Add video utility functions to src/lib/utils.ts (isYouTube, isMP4, getYouTubeVideoId)
2. Update UserMaterials.tsx to add play button overlay on video covers
3. Update MaterialDetail.tsx to implement actual video players (YouTube embed for YouTube URLs, HTML5 video for MP4)
4. Add video type indicators in MaterialDetail UI
5. Ensure responsive design

## Dependent Files to be edited
- src/lib/utils.ts
- src/pages/user/UserMaterials.tsx
- src/pages/user/MaterialDetail.tsx

## Followup steps
- Test video playback with sample YouTube and MP4 URLs
- Verify responsive design on different screen sizes
- Update TODO.md to mark tasks as completed
