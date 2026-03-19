import { PageRole } from '@/types/user.type';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

type LayoutStore = {
  sidebarList: PageRole[];
  setSidebarList: (sidebarList: PageRole[]) => void;
};

export const layoutStore = createStore<LayoutStore>()((set) => ({
  sidebarList: [],
  setSidebarList: (sidebarList: PageRole[]) => set({ sidebarList })
}));

export const useLayoutStore = () => useStore(layoutStore);
