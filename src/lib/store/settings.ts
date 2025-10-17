import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  autoDownload: boolean;
  defaultQuality: "low" | "medium" | "high";
  showFileSize: boolean;
  compressionLevel: number; // 1-10
  setAutoDownload: (value: boolean) => void;
  setDefaultQuality: (value: "low" | "medium" | "high") => void;
  setShowFileSize: (value: boolean) => void;
  setCompressionLevel: (value: number) => void;
  resetSettings: () => void;
}

const defaultSettings = {
  autoDownload: true,
  defaultQuality: "high" as const,
  showFileSize: true,
  compressionLevel: 7,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setAutoDownload: (value) => set({ autoDownload: value }),
      setDefaultQuality: (value) => set({ defaultQuality: value }),
      setShowFileSize: (value) => set({ showFileSize: value }),
      setCompressionLevel: (value) => set({ compressionLevel: value }),
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: "settings-store",
    }
  )
);
