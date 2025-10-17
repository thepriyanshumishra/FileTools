"use client";

import { useEffect, useState } from "react";
import { getBrowserWarning, isBrowserSupported } from "@/lib/utils/browser-detection";
import { XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export function BrowserWarning() {
  const [warning, setWarning] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const warningMessage = getBrowserWarning();
    setWarning(warningMessage);
    
    // Check if user previously dismissed
    const isDismissed = localStorage.getItem('browser-warning-dismissed');
    if (isDismissed) setDismissed(true);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('browser-warning-dismissed', 'true');
  };

  if (!warning || dismissed) return null;

  const isUnsupported = !isBrowserSupported();

  return (
    <div className={`fixed top-16 left-0 right-0 z-40 ${isUnsupported ? 'bg-red-500' : 'bg-yellow-500'} text-white`}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">{warning}</p>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-white/20 rounded transition-colors"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
