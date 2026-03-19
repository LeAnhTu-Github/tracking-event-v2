'use client';

import { arrayToTree } from '@/lib/utils';
import userService from '@/services/user.service';
import { useAuthStore } from '@/store/useAuth';
import { useLayoutStore } from '@/store/useLayout';
import Cookies from 'js-cookie';
import { useEffect } from 'react';

export default function AuthProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const {
    setUser,
    setIsLoading,
    setIsAuthenticated,
    isAuthenticated,
    setPageRoles
  } = useAuthStore();
  const { setSidebarList } = useLayoutStore();

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const response = await userService.getMe();

        const allPageRoles = response.pageRoles;

        setUser(response.user);
        setIsAuthenticated(true);
        setSidebarList(arrayToTree(allPageRoles));
        setPageRoles(allPageRoles);
      } catch (error) {
        console.log(error);
        setIsAuthenticated(false);
        Cookies.remove('token');
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch user info when authenticated (token check ensures we only run when token exists)
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated]);
  return <>{children}</>;
}
