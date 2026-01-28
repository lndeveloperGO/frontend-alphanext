/**
 * Environment Variables Configuration
 * Utility untuk mengakses semua environment variables yang tersedia
 * Pastikan semua variabel dimulai dengan prefix VITE_
 */

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

// Function untuk mengakses env variables dengan type-safety
const getEnv = (): EnvVariables => {
  return {
    APP_NAME: import.meta.env.VITE_APP_NAME ,
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    APP_TAGLINE: import.meta.env.VITE_APP_TAGLINE ,
    THEME_PRIMARY: import.meta.env.VITE_THEME_PRIMARY || "#6366F1",
    THEME_SECONDARY: import.meta.env.VITE_THEME_SECONDARY || "#EC4899",
    THEME_ACCENT: import.meta.env.VITE_THEME_ACCENT || "#10B981",
    THEME_DARK_BG: import.meta.env.VITE_THEME_DARK_BG || "#0F172A",
    THEME_LIGHT_BG: import.meta.env.VITE_THEME_LIGHT_BG || "#F8FAFC",
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
