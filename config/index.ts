// config/index.ts

const isServer = typeof window === 'undefined';

function validateEnv(key: string, value: string | undefined, required = true): string {
  if (!value && required && isServer) {
    const errorMsg = `Configuration Error: Missing environment variable '${key}'. Please verify your .env.local configuration.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  return value || '';
}

export const CONFIG = {
  APP_URL: validateEnv('NEXT_PUBLIC_APP_URL', process.env.NEXT_PUBLIC_APP_URL, false) || 'http://localhost:3000',
  SUPABASE: {
    URL: validateEnv('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL, true),
    ANON_KEY: validateEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, true),
    // Service role key is server-only, so we only validate it on the server
    SERVICE_ROLE_KEY: validateEnv('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY, true),
  },
  UDDOKTAPAY: {
    BASE_URL: validateEnv('UDDOKTAPAY_BASE_URL', process.env.UDDOKTAPAY_BASE_URL, true),
    API_KEY: validateEnv('UDDOKTAPAY_API_KEY', process.env.UDDOKTAPAY_API_KEY, true),
  },
} as const;

