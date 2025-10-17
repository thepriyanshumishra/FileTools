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

// Fetch settings from API on load
if (typeof window !== 'undefined') {
  fetch('/api/admin/settings')
    .then(res => res.json())
    .then(data => {
      useAdminSettings.setState(data);
    })
    .catch(() => {});
}

export const useAdminSettings = create<AdminSettings>()(
  persist(
    (set) => ({
      ...defaultSettings,
      
      setMaintenanceMode: (enabled) => {
        set({ maintenanceMode: enabled });
        fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ maintenanceMode: enabled }),
        });
      },
      setMaintenanceMessage: (message) => set({ maintenanceMessage: message }),
      setMaxFileSize: (size) => {
        set({ maxFileSize: size });
        fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ maxFileSize: size }),
        });
      },
      toggleTool: (toolId) => {
        const newTools = { ...useAdminSettings.getState().enabledTools, [toolId]: !useAdminSettings.getState().enabledTools[toolId] };
        set({ enabledTools: newTools });
        fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabledTools: newTools }),
        });
      },
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
