"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cog6ToothIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSettingsStore } from "@/lib/store/settings";

export function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    autoDownload,
    defaultQuality,
    showFileSize,
    compressionLevel,
    setAutoDownload,
    setDefaultQuality,
    setShowFileSize,
    setCompressionLevel,
    resetSettings,
  } = useSettingsStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-40 right-8 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl dark:bg-zinc-700"
        title="Settings (⌘,)"
      >
        <Cog6ToothIcon className="h-6 w-6" />
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
                  <Cog6ToothIcon className="h-5 w-5 text-purple-500" />
                  <h2 className="text-lg font-bold">Settings</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="h-[calc(100%-73px)] overflow-y-auto p-4">
                <div className="space-y-6">
                  {/* Auto Download */}
                  <div>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex-1">
                        <p className="font-semibold">Auto Download</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          Automatically download processed files
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAutoDownload(!autoDownload)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                          autoDownload ? "bg-purple-600" : "bg-zinc-300 dark:bg-zinc-700"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            autoDownload ? "translate-x-5" : "translate-x-0"
                          }`}
                          style={{ marginTop: '2px', marginLeft: '2px' }}
                        />
                      </button>
                    </label>
                  </div>

                  {/* Show File Size */}
                  <div>
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex-1">
                        <p className="font-semibold">Show File Size</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          Display file sizes in cards
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowFileSize(!showFileSize)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                          showFileSize ? "bg-purple-600" : "bg-zinc-300 dark:bg-zinc-700"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            showFileSize ? "translate-x-5" : "translate-x-0"
                          }`}
                          style={{ marginTop: '2px', marginLeft: '2px' }}
                        />
                      </button>
                    </label>
                  </div>

                  {/* Default Quality */}
                  <div>
                    <p className="mb-2 font-semibold">Default Quality</p>
                    <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
                      Quality preset for image/video processing
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {(["low", "medium", "high"] as const).map((quality) => (
                        <button
                          key={quality}
                          onClick={() => setDefaultQuality(quality)}
                          className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                            defaultQuality === quality
                              ? "border-purple-600 bg-purple-50 text-purple-600 dark:bg-purple-950/30"
                              : "border-zinc-300 hover:border-purple-400 dark:border-zinc-700"
                          }`}
                        >
                          {quality.charAt(0).toUpperCase() + quality.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Compression Level */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-semibold">Compression Level</p>
                      <span className="text-sm font-bold text-purple-600">{compressionLevel}</span>
                    </div>
                    <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
                      Higher = smaller files, slower processing
                    </p>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={compressionLevel}
                      onChange={(e) => setCompressionLevel(Number(e.target.value))}
                      className="w-full accent-purple-600"
                    />
                    <div className="mt-1 flex justify-between text-xs text-zinc-500">
                      <span>Fast</span>
                      <span>Balanced</span>
                      <span>Max</span>
                    </div>
                  </div>

                  {/* Reset Button */}
                  <button
                    onClick={() => {
                      resetSettings();
                      setIsOpen(false);
                    }}
                    className="w-full rounded-lg border-2 border-red-300 px-4 py-3 font-semibold text-red-600 transition-all hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    Reset to Defaults
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
