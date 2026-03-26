import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, logout as logoutRequest, type AuthUser } from '../services/api/auth';

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  signIn: (email: string, password: string, rememberPassword?: boolean) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  updateUser: (nextUser: Partial<AuthUser>) => Promise<void>;
};

const AUTH_USER_KEY = 'auth_user';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(AUTH_USER_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser) as AuthUser);
        }
      } catch (error) {
        console.warn('Failed to restore auth user', error);
      } finally {
        setIsInitializing(false);
      }
    };

    loadStoredUser();
  }, []);

  const signIn = async (email: string, password: string, rememberPassword = true) => {
    const authUser = await login(email, password, rememberPassword);

    if (authUser) {
      setUser(authUser);
      await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
    }

    return authUser;
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
      await AsyncStorage.removeItem(AUTH_USER_KEY);
    }
  };

  const updateUser = async (nextUser: Partial<AuthUser>) => {
    setUser((current) => {
      const merged = current ? { ...current, ...nextUser } : ({ fullName: '', email: '', ...nextUser } as AuthUser);
      void AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isInitializing,
        signIn,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
