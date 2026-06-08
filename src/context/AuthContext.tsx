'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { db, Profile } from '@/lib/db';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: Profile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, name: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkUserSession = async () => {
    try {
      setLoading(true);
      const { data } = await db.auth.getProfile();
      setUser(data);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserSession();
  }, [pathname]);

  const signInWithGoogle = async () => {
    setLoading(true);
    const { error } = await db.auth.signInWithGoogle();
    if (error) {
      setLoading(false);
      throw error;
    }
    if (db.isMock) {
      const { data } = await db.auth.getProfile();
      setUser(data);
      setLoading(false);
      router.push('/dashboard');
    }
  };

  const signUp = async (email: string, name: string) => {
    setLoading(true);
    const { data, error } = await db.auth.signUp(email, name);
    if (!error && db.isMock) {
      setUser(data.user);
      router.push('/dashboard');
    }
    setLoading(false);
    return { error };
  };

  const signOut = async () => {
    setLoading(true);
    await db.auth.signOut();
    setUser(null);
    setLoading(false);
    router.push('/login');
  };

  const refreshProfile = async () => {
    const { data } = await db.auth.getProfile();
    setUser(data);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
