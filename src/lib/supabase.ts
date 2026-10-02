import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { env } from './env';

// Imported by src/api/ only. Components and hooks go through src/api/.
export const supabase = createClient<Database>(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_PUBLISHABLE_KEY,
);
