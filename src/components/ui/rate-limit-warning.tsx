"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";

export function RateLimitWarning() {
  const [show, setShow] = useState(false);
  const [resetTime, setResetTime] = useState<number>(0);

  useEffect(() => {
    const handleRateLimit = (event: CustomEvent) => {
      setResetTime(event.detail.resetTime);
      setShow(true);
    };

    window.addEventListener("ratelimit" as any, handleRateLimit);
    return () => window.removeEventListener("ratelimit" as any, handleRateLimit);
  }, []);

  const timeRemaining = resetTime ? Math.ceil((resetTime - Date.now()) / 1000 / 60) : 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-20 left-4 right-4 z-50 mx-auto max-w-md"
        >
          <div className="glass rounded-2xl border-2 border-yellow-500/50 bg-yellow-50/90 p-4 shadow-2xl dark:bg-yellow-900/20">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900/30">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                  Rate Limit Reached
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Too many requests. Please try again in {timeRemaining} minute{timeRemaining !== 1 ? 's' : ''}.
                </p>
              </div>
              <button
                onClick={() => setShow(false)}
                className="flex-shrink-0 rounded-lg p-1 hover:bg-yellow-100 dark:hover:bg-yellow-900/50"
              >
                <XMarkIcon className="h-5 w-5 text-yellow-900 dark:text-yellow-100" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
