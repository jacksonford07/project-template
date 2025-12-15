'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
}

interface UserContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  clearUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

function UserProviderInner({ children }: { children: React.ReactNode }): React.ReactElement {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { status } = useSession();

  const fetchUser = useCallback(async (): Promise<void> => {
    try {
      const res = await fetch('/api/me');
      if (res.ok) {
        const data = (await res.json()) as UserProfile;
        setUser(data);
        setError(null);
      } else {
        setUser(null);
        setError(null);
      }
    } catch (e) {
      setUser(null);
      if (e instanceof Error) {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clearUser = useCallback((): void => {
    setUser(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      void fetchUser();
    } else if (status === 'unauthenticated') {
      setUser(null);
      setLoading(false);
    }
  }, [status, fetchUser]);

  const value = {
    user,
    loading,
    error,
    refreshUser: fetchUser,
    clearUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function UserProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <SessionProvider>
      <UserProviderInner>{children}</UserProviderInner>
    </SessionProvider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
