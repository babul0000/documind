'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User } from '../types';
import { useSession, authClient } from '../lib/auth-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication state provider adapted to Better Auth.
 * Automatically handles page redirection guards.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const user: User | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image || undefined,
      }
    : null;

  const loading = isPending;

  // Synchronize Better Auth token to localStorage for dynamic cross-origin API authorization fallback
  useEffect(() => {
    if (session && (session as any).session?.token) {
      localStorage.setItem("better-auth.session_token", (session as any).session.token);
    } else if (!isPending && !session) {
      localStorage.removeItem("better-auth.session_token");
    }
  }, [session, isPending]);

  // Protect client side routes
  useEffect(() => {
    if (loading) return;

    const publicRoutes = ['/', '/login', '/register', '/about', '/blog', '/contact', '/privacy'];
    const isPublicRoute = 
      publicRoutes.includes(pathname) || 
      (pathname.startsWith('/documents/') && pathname !== '/documents/add' && pathname !== '/documents/manage');

    if (!user && !isPublicRoute) {
      router.push('/login');
    } else if (user && (pathname === '/login' || pathname === '/register')) {
      router.push('/dashboard');
    }
  }, [user, loading, pathname, router]);

  const login = (token: string, userData: User) => {
    // Better Auth handles sign-in internally; this triggers a redirect
    router.push('/dashboard');
  };

  const logout = async () => {
    try {
      await authClient.signOut();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const checkAuth = async () => {
    // Handled by Better Auth useSession hook
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
export default AuthProvider;
