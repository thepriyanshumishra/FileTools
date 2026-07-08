import { create } from "zustand";
import { persist } from "zustand/middleware";
import { deleteDraftData, clearAllDrafts } from "@/lib/utils/db";

export interface HistoryItem {
  id: string;
  fileName: string;
  fileType: string;
  toolName: string;
  timestamp: number;
  fileSize: number;
  status: "draft" | "exported";
}

interface HistoryStore {
  history: HistoryItem[];
  addToHistory: (item: Omit<HistoryItem, "id" | "timestamp" | "status"> & { id?: string; status?: "draft" | "exported" }) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      history: [],
      addToHistory: (item) => {
        const timestamp = Date.now();
        const itemId = item.id || timestamp.toString();
        const itemStatus = item.status || "exported";

        set((state) => {
          const exists = state.history.some((h) => h.id === itemId);
          let nextHistory = [];

          if (exists) {
            const updatedItem: HistoryItem = {
              ...item,
              id: itemId,
              status: itemStatus,
              timestamp
            };
            nextHistory = [updatedItem, ...state.history.filter((h) => h.id !== itemId)];
          } else {
            const newItem: HistoryItem = {
              ...item,
              id: itemId,
              status: itemStatus,
              timestamp
            };
            nextHistory = [newItem, ...state.history];
          }

          return { history: nextHistory.slice(0, 50) };
        });
      },
      clearHistory: () => {
        clearAllDrafts().catch(console.error);
        set({ history: [] });
      },
      removeFromHistory: (id) => {
        deleteDraftData(id).catch(console.error);
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        }));
      },
    }),
    {
      name: "history-store",
    }
  )
);
