import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getApiBaseUrl } from '@/lib/env';

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

// Mock users for demo (fallback jika API tidak tersedia)
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@edulearn.com',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'John Student',
    email: 'user@edulearn.com',
    password: 'user123',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    createdAt: '2024-01-15T00:00:00Z',
  },  
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        try {
          const apiBaseUrl = getApiBaseUrl();
          const response = await fetch(`${apiBaseUrl}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            return { success: false, error: error.message || 'Login failed' };
          }

          const data = await response.json();
          set({ user: data.data.user, token: data.data.token, isAuthenticated: true });
          return { success: true };
        } catch (error) {
          // Fallback to mock data jika API tidak tersedia
          const user = mockUsers.find(u => u.email === email && u.password === password);
          if (user) {
            const { password: _, ...userWithoutPassword } = user;
            set({ user: userWithoutPassword, isAuthenticated: true });
            return { success: true };
          }
          return { success: false, error: error instanceof Error ? error.message : 'Invalid email or password' };
        }
      },
      
      register: async (name: string, email: string, password: string) => {
        try {
          const apiBaseUrl = getApiBaseUrl();
          const response = await fetch(`${apiBaseUrl}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
          });

          if (!response.ok) {
            const error = await response.json();
            return { success: false, error: error.message || 'Registration failed' };
          }

          const data = await response.json();
          set({ user: data.user, isAuthenticated: true });
          return { success: true };
        } catch (error) {
          // Fallback to mock data jika API tidak tersedia
          if (mockUsers.find(u => u.email === email)) {
            return { success: false, error: 'Email already registered' };
          }
          
          const newUser: User = {
            id: String(mockUsers.length + 1),
            name,
            email,
            role: 'user',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
            createdAt: new Date().toISOString(),
          };
          
          mockUsers.push({ ...newUser, password });
          set({ user: newUser, isAuthenticated: true });
          return { success: true };
        }
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
