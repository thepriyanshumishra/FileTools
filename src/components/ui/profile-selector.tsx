"use client";

import { useState } from 'react';
import { useProcessingProfiles } from '@/hooks/use-processing-profiles';
import { BookmarkIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface ProfileSelectorProps {
  onSelect: (settings: Record<string, any>) => void;
  currentSettings: Record<string, any>;
}

export function ProfileSelector({ onSelect, currentSettings }: ProfileSelectorProps) {
  const { profiles, saveProfile, deleteProfile } = useProcessingProfiles();
  const [showSave, setShowSave] = useState(false);
  const [profileName, setProfileName] = useState('');

  const handleSave = () => {
    if (profileName.trim()) {
      saveProfile(profileName, currentSettings);
      setProfileName('');
      setShowSave(false);
    }
  };

  return (
    <div className="glass rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <BookmarkIcon className="w-5 h-5" />
          Profiles
        </h3>
        <button
          onClick={() => setShowSave(!showSave)}
          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>

      {showSave && (
        <div className="mb-3 flex gap-2">
          <input
            type="text"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            placeholder="Profile name"
            className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
          />
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Save
          </button>
        </div>
      )}

      <div className="space-y-2">
        {profiles.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-4">No saved profiles</p>
        ) : (
          profiles.map((profile) => (
            <div
              key={profile.id}
              className="flex items-center justify-between p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
            >
              <button
                onClick={() => onSelect(profile.settings)}
                className="flex-1 text-left text-sm"
              >
                {profile.name}
              </button>
              <button
                onClick={() => deleteProfile(profile.id)}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
