import { useUser } from '@/contexts/UserContext';

export function useIsAdmin(): boolean {
  const { user } = useUser();

  if (!user) {
    return false;
  }

  return user.role === 'ADMIN' || user.role === 'admin';
}
