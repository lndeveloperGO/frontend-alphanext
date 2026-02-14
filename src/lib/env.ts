/**
 * Environment Variables Configuration
 * Utility untuk mengakses semua environment variables yang tersedia
 * Pastikan semua variabel dimulai dengan prefix VITE_
 */

// Extend Window interface for TypeScript
declare global {
  interface Window {
    __env__?: {
      VITE_APP_NAME?: string;
      VITE_API_BASE_URL?: string;
      VITE_APP_TAGLINE?: string;
      VITE_THEME_PRIMARY?: string;
      VITE_THEME_SECONDARY?: string;
      VITE_THEME_ACCENT?: string;
      VITE_THEME_DARK_BG?: string;
      VITE_THEME_LIGHT_BG?: string;
    };
  }
}

// Interface untuk type-safety
interface EnvVariables {
  APP_NAME: string;
  APP_TAGLINE: string;
  API_BASE_URL: string;
  THEME_PRIMARY: string;
  THEME_SECONDARY: string;
  THEME_ACCENT: string;
  THEME_DARK_BG: string;
  THEME_LIGHT_BG: string;
}

// Helper untuk get runtime env (from window.__env__ set by generate-env.sh)
const getRuntimeEnv = (key: string, defaultValue: string): string => {
  // Priority: window.__env__ (runtime) > import.meta.env (build time) > default
  if (typeof window !== 'undefined' && window.__env__ && window.__env__[key as keyof typeof window.__env__]) {
    return window.__env__[key as keyof typeof window.__env__] || defaultValue;
  }
  return (import.meta.env[key] as string) || defaultValue;
};

// Function untuk mengakses env variables dengan type-safety
const getEnv = (): EnvVariables => {
  return {
    APP_NAME: getRuntimeEnv('VITE_APP_NAME', 'AlphaNext'),
    API_BASE_URL: getRuntimeEnv('VITE_API_BASE_URL', ''),
    APP_TAGLINE: getRuntimeEnv('VITE_APP_TAGLINE', 'AlphaNext Learning Platform'),
    THEME_PRIMARY: getRuntimeEnv('VITE_THEME_PRIMARY', '#6366F1'),
    THEME_SECONDARY: getRuntimeEnv('VITE_THEME_SECONDARY', '#EC4899'),
    THEME_ACCENT: getRuntimeEnv('VITE_THEME_ACCENT', '#10B981'),
    THEME_DARK_BG: getRuntimeEnv('VITE_THEME_DARK_BG', '#0F172A'),
    THEME_LIGHT_BG: getRuntimeEnv('VITE_THEME_LIGHT_BG', '#F8FAFC'),
  };
};

// Export single instance untuk digunakan di aplikasi
export const env = getEnv();

// Export type untuk digunakan di tempat lain jika diperlukan
export type { EnvVariables };

// Export individual getter functions untuk flexibility
export const getAppName = (): string => env.APP_NAME;
export const getAppTagline = (): string => env.APP_TAGLINE;
export const getThemePrimary = (): string => env.THEME_PRIMARY;
export const getThemeSecondary = (): string => env.THEME_SECONDARY;
export const getThemeAccent = (): string => env.THEME_ACCENT;
export const getThemeDarkBg = (): string => env.THEME_DARK_BG;
export const getThemeLightBg = (): string => env.THEME_LIGHT_BG;
export const getApiBaseUrl = (): string => env.API_BASE_URL;
