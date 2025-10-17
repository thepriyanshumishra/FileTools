"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClockIcon, XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useHistoryStore } from "@/lib/store/history";
import Link from "next/link";

export function HistoryPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { history, clearHistory, removeFromHistory } = useHistoryStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'h') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <>
      {/* History Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-8 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl dark:bg-zinc-700"
        title="History (⌘H)"
      >
        <ClockIcon className="h-6 w-6" />
        {history.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
            {history.length > 9 ? "9+" : history.length}
          </span>
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl dark:bg-zinc-900"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-purple-500" />
                  <h2 className="text-lg font-bold">Processing History</h2>
                </div>
                <div className="flex items-center gap-2">
                  {history.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      title="Clear all"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="h-[calc(100%-73px)] overflow-y-auto p-4">
                {history.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <ClockIcon className="mb-4 h-16 w-16 text-zinc-300 dark:text-zinc-700" />
                    <p className="text-lg font-semibold text-zinc-600 dark:text-zinc-400">
                      No history yet
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-500">
                      Process some files to see them here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative rounded-xl border border-zinc-200 p-4 transition-all hover:border-purple-300 hover:shadow-md dark:border-zinc-800 dark:hover:border-purple-700"
                      >
                        <button
                          onClick={() => removeFromHistory(item.id)}
                          className="absolute right-2 top-2 rounded-lg p-1 opacity-0 transition-opacity hover:bg-red-50 group-hover:opacity-100 dark:hover:bg-red-950/30"
                        >
                          <XMarkIcon className="h-4 w-4 text-red-500" />
                        </button>

                        <Link href={`/tools/${item.fileType}`}>
                          <div className="mb-2 flex items-start justify-between pr-6">
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                              {item.fileName}
                            </p>
                          </div>
                          <div className="mb-2 flex items-center gap-2">
                            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                              {item.toolName}
                            </span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              .{item.fileType}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                            <span>{formatSize(item.fileSize)}</span>
                            <span>{formatTime(item.timestamp)}</span>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
