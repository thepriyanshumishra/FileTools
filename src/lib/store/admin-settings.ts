import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  maxFileSize: number;
  enabledTools: Record<string, boolean>;
  featuredTools: string[];
  siteTitle: string;
  siteDescription: string;
  enableAnalytics: boolean;
  enableNotifications: boolean;
  
  setMaintenanceMode: (enabled: boolean) => void;
  setMaintenanceMessage: (message: string) => void;
  setMaxFileSize: (size: number) => void;
  toggleTool: (toolId: string) => void;
  setFeaturedTools: (tools: string[]) => void;
  setSiteTitle: (title: string) => void;
  setSiteDescription: (description: string) => void;
  setEnableAnalytics: (enabled: boolean) => void;
  setEnableNotifications: (enabled: boolean) => void;
  resetSettings: () => void;
}

const defaultSettings = {
  maintenanceMode: false,
  maintenanceMessage: 'Site is under maintenance. Please check back later.',
  maxFileSize: 500,
  enabledTools: {},
  featuredTools: [],
  siteTitle: 'FileTools - Your Online File Utilities',
  siteDescription: 'Free online tools for converting, compressing, and managing your files',
  enableAnalytics: true,
  enableNotifications: true,
};

export const useAdminSettings = create<AdminSettings>()(
  persist(
    (set) => ({
      ...defaultSettings,
      
      setMaintenanceMode: (enabled) => set({ maintenanceMode: enabled }),
      setMaintenanceMessage: (message) => set({ maintenanceMessage: message }),
      setMaxFileSize: (size) => set({ maxFileSize: size }),
      toggleTool: (toolId) => set((state) => ({
        enabledTools: {
          ...state.enabledTools,
          [toolId]: !state.enabledTools[toolId],
        },
      })),
      setFeaturedTools: (tools) => set({ featuredTools: tools }),
      setSiteTitle: (title) => set({ siteTitle: title }),
      setSiteDescription: (description) => set({ siteDescription: description }),
      setEnableAnalytics: (enabled) => set({ enableAnalytics: enabled }),
      setEnableNotifications: (enabled) => set({ enableNotifications: enabled }),
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'admin-settings',
    }
  )
);
