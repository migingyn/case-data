import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.url(),
  VITE_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

// Fail at startup with a readable message instead of a cryptic Supabase error later.
export const env = envSchema.parse(import.meta.env);
