import React, { useMemo } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { AuthContext, AuthContextType } from './AuthContext';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * AuthProvider Component
 * 
 * Wraps the application and provides authentication state globally
 * Uses useAuth hook to manage auth state and prevents prop drilling
 * 
 * Benefits:
 * - Centralized auth state management
 * - Avoids prop drilling through components
 * - Easy to access auth state anywhere with useAuthContext hook
 * - Integrates with React Query for caching and refetching
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authState = useAuth();

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<AuthContextType>(
    () => ({
      isAuthenticated: authState.isAuthenticated,
      user: authState.user,
      userRole: authState.user?.role || null,
      loading: authState.loading,
      error: authState.error,
      logout: authState.logout,
      refresh: authState.refresh,
    }),
    [authState]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
