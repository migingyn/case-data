import type { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, type FC, type ReactNode } from 'react';
import { getSession, onAuthChange } from '@/api/auth';
import { AuthContext } from './AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const queryClient = useQueryClient();

  useEffect(() => {
    getSession()
      .then(setSession)
      .catch(() => setSession(null));
    return onAuthChange((next) => {
      setSession((prev) => {
        // Drop the previous user's cache so the next user never sees it.
        if (prev?.user.id !== next?.user.id) queryClient.clear();
        return next;
      });
    });
  }, [queryClient]);

  return <AuthContext.Provider value={session}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
