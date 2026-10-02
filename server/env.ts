import { z } from 'zod';

// Server-only config. Secrets never carry the VITE_ prefix, so Vite never
// bundles them. Integrations are optional so the server still starts with
// one of them unconfigured; their routes report that instead.
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8787),
  DATA_DIR: z.string().min(1).default('./data'),
  CLIO_CLIENT_ID: z.string().min(1).optional(),
  CLIO_CLIENT_SECRET: z.string().min(1).optional(),
  CLIO_REDIRECT_URI: z.url().default('http://127.0.0.1:5173/api/clio/callback'),
  CLIO_BASE_URL: z.url().default('https://app.clio.com'),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_MODEL: z.string().min(1).default('gpt-5.4-mini'),
  // Same project URL the browser uses; only the key differs.
  VITE_SUPABASE_URL: z.url().optional(),
  // Bypasses RLS. Server only: never prefix it with VITE_.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
});

// Treat blank lines copied from .env.example as unset.
const definedEnv = Object.fromEntries(
  Object.entries(process.env).filter(([, value]) => value !== ''),
);

export const env = envSchema.parse(definedEnv);
