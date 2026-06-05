// config/index.ts

function getEnv(key: string, required = true): string {
  const value = process.env[key];
  if (!value && required) {
    const errorMsg = `Configuration Error: Missing environment variable '${key}'. Please verify your .env.local configuration.`;
    console.error(errorMsg);
    if (typeof window === 'undefined') {
      // Server-side crash early for missing keys
      throw new Error(errorMsg);
    }
  }
  return value || '';
}

export const CONFIG = {
  APP_URL: getEnv('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000',
  SUPABASE: {
    URL: getEnv('NEXT_PUBLIC_SUPABASE_URL'),
    ANON_KEY: getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    SERVICE_ROLE_KEY: getEnv('SUPABASE_SERVICE_ROLE_KEY'),
  },
  UDDOKTAPAY: {
    BASE_URL: getEnv('UDDOKTAPAY_BASE_URL'),
    API_KEY: getEnv('UDDOKTAPAY_API_KEY'),
  },
} as const;
