import { PageRole, User } from '@/types/user.type';
import Cookies from 'js-cookie';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';
import authService from '@/services/auth.service';
import { toast } from 'sonner';
import userService from '@/services/user.service';

type AuthStore = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  pageRoles: PageRole[];
  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setPageRoles: (pageRoles: PageRole[]) => void;
  logOut: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  fetchUser: () => Promise<void>;
};

export const authStore = createStore<AuthStore>()((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: !!Cookies.get('token'),
  pageRoles: [],
  setUser: (user: User | null) => set({ user }),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setIsAuthenticated: (isAuthenticated: boolean) => set({ isAuthenticated }),
  setPageRoles: (pageRoles: PageRole[]) => set({ pageRoles }),
  logOut: async () => {
    try {
      await authService.logout();
      set({ user: null, isAuthenticated: false });
      Cookies.remove('token');
      toast.success('Logged out successfully');
      if (typeof window === 'undefined') {
        return;
      }
      window.location.href = '/auth/sign-in';
    } catch (error) {
      console.error(error);
    }
  },
  updateUser: async (userData: Partial<User>) => {
    try {
      const user = await authService.updateMe(userData as User);
      set({ user });
    } catch (error) {
      throw error;
    }
  },
  changePassword: async (oldPassword: string, newPassword: string) => {
    try {
      await userService.changePassword({
        oldPassword,
        newPassword
      });
    } catch (error) {
      throw error;
    }
  },
  fetchUser: async () => {
    try {
      const res = await userService.getMe();
      set({ user: res.user, isAuthenticated: true });
    } catch (error) {
      throw error;
    }
  }
}));

export const useAuthStore = () => useStore(authStore);
