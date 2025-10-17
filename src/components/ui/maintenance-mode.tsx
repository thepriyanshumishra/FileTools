"use client";

import { useAdminSettings } from "@/lib/store/admin-settings";
import { useEffect, useState } from "react";

export function MaintenanceMode() {
  const { maintenanceMode, maintenanceMessage } = useAdminSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !maintenanceMode) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-zinc-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-800 rounded-2xl p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">🔧</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Under Maintenance</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            {maintenanceMessage}
          </p>
        </div>
        <p className="text-sm text-zinc-500">
          We'll be back soon. Thank you for your patience.
        </p>
      </div>
    </div>
  );
}
