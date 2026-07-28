import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id?: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  themeMode: 'system' | 'light' | 'dark';
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setThemeMode: (mode: 'system' | 'light' | 'dark') => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      themeMode: 'system',
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),
      setThemeMode: (themeMode) => set({ themeMode }),
    }),
    {
      name: 'crm-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
