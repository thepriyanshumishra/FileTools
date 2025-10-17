"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      className={`glass fixed bottom-24 right-8 z-50 flex items-center gap-3 rounded-xl p-4 shadow-lg ${
        type === "success"
          ? "border-l-4 border-green-500"
          : "border-l-4 border-red-500"
      }`}
    >
      {type === "success" ? (
        <CheckCircleIcon className="h-6 w-6 text-green-500" />
      ) : (
        <XCircleIcon className="h-6 w-6 text-red-500" />
      )}
      <p className="max-w-xs text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 rounded-full p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700"
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: "success" | "error" }>;
  removeToast: (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <AnimatePresence>
      {toasts.map((toast, index) => (
        <div key={toast.id} style={{ bottom: `${6 + index * 5}rem` }} className="fixed right-8">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </AnimatePresence>
  );
}
