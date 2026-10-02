import { useContext } from 'react';
import { AuthContext } from '@/components/AuthProvider/AuthContext';

export function useSession() {
  const session = useContext(AuthContext);
  return {
    session: session ?? null,
    user: session?.user ?? null,
    isLoading: session === undefined,
  };
}
