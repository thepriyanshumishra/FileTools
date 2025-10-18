import { useState, useCallback } from 'react';

export interface ProcessingProfile {
  id: string;
  name: string;
  settings: Record<string, any>;
  createdAt: Date;
}

const STORAGE_KEY = 'processing_profiles';

export function useProcessingProfiles() {
  const [profiles, setProfiles] = useState<ProcessingProfile[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const saveProfile = useCallback((name: string, settings: Record<string, any>) => {
    const profile: ProcessingProfile = {
      id: Date.now().toString(),
      name,
      settings,
      createdAt: new Date(),
    };

    const updated = [...profiles, profile];
    setProfiles(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    return profile;
  }, [profiles]);

  const loadProfile = useCallback((id: string): ProcessingProfile | undefined => {
    return profiles.find(p => p.id === id);
  }, [profiles]);

  const deleteProfile = useCallback((id: string) => {
    const updated = profiles.filter(p => p.id !== id);
    setProfiles(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [profiles]);

  const updateProfile = useCallback((id: string, updates: Partial<ProcessingProfile>) => {
    const updated = profiles.map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    setProfiles(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, [profiles]);

  return {
    profiles,
    saveProfile,
    loadProfile,
    deleteProfile,
    updateProfile,
  };
}
