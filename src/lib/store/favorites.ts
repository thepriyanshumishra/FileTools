import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesStore {
  favorites: string[]; // Array of "extension-toolName" strings
  toggleFavorite: (extension: string, toolName: string) => void;
  isFavorite: (extension: string, toolName: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (extension, toolName) => {
        const key = `${extension}-${toolName}`;
        set((state) => ({
          favorites: state.favorites.includes(key)
            ? state.favorites.filter((f) => f !== key)
            : [...state.favorites, key],
        }));
      },
      isFavorite: (extension, toolName) => {
        const key = `${extension}-${toolName}`;
        return get().favorites.includes(key);
      },
      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: "favorites-store",
    }
  )
);
