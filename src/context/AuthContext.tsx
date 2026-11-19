import React, { useState, useEffect } from 'react';
import { AuthContext, type User } from '../types/auth';

const isValidUser = (val: unknown): val is User => {
  if (typeof val !== 'object' || val === null) return false;
  const candidate = val as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    candidate.id.trim().length > 0 &&
    typeof candidate.email === 'string' &&
    candidate.email.trim().length > 0 &&
    typeof candidate.name === 'string' &&
    candidate.name.trim().length > 0
  );
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('resonator_token');
    const storedUser = localStorage.getItem('resonator_user');

    if (storedToken && storedUser) {
      try {
        const parsedUser: unknown = JSON.parse(storedUser);
        if (isValidUser(parsedUser)) {
          setToken(storedToken);
          setUser(parsedUser);
        } else {
          localStorage.removeItem('resonator_token');
          localStorage.removeItem('resonator_user');
        }
      } catch {
        localStorage.removeItem('resonator_token');
        localStorage.removeItem('resonator_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUser: User): void => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('resonator_token', newToken);
    localStorage.setItem('resonator_user', JSON.stringify(newUser));
  };

  const logout = (): void => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('resonator_token');
    localStorage.removeItem('resonator_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: Boolean(token && user),
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
