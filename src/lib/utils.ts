import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Video utility functions
export function isYouTube(url: string): boolean {
  return /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/.test(url);
}

export function isMP4(url: string): boolean {
  return url.toLowerCase().endsWith('.mp4');
}

export function getYouTubeVideoId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  return match ? match[1] : null;
}
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function formatGoogleDriveEmbedUrl(url: string | null): string {
  if (!url) return "";
  if (url.includes("drive.google.com/file/d/")) {
    // Convert /view to /preview
    return url.replace(/\/view(\?.*)?$/, "/preview");
  }
  return url;
}

export function getFileIdFromDriveUrl(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/\/file\/d\/([^\/\?]+)/);
  return match ? match[1] : null;
}

export function formatGoogleDriveDownloadUrl(url: string | null): string {
  const fileId = getFileIdFromDriveUrl(url);
  if (!fileId) return url || "";
  
  const downloadUrl = `/uc?export=download&id=${fileId}`;
  
  // Use our internal Vite proxy (defined in vite.config.ts) to bypass CORS during development
  // This will proxy /google-drive/... to https://docs.google.com/...
  return `/google-drive${downloadUrl}`;
}
