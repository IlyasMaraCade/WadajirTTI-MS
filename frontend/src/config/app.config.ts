export const APP_CONFIG = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  appName: 'Wadajir Institute',
  appFullName: 'Wadajir Technical and Training Institute',
  logoPath: '/Logo.jpeg',
  version: '1.0.0',
} as const;

export type AppConfig = typeof APP_CONFIG;