import type { Session } from '@supabase/supabase-js';
import { createContext } from 'react';

// undefined = still resolving, null = signed out
export const AuthContext = createContext<Session | null | undefined>(undefined);
