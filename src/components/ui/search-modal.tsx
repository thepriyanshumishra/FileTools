"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import { fileCategories } from "@/lib/utils/file-types";
import { useFavoritesStore } from "@/lib/store/favorites";
import { useRouter } from "next/navigation";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { isFavorite } = useFavoritesStore();

  // Get all tools
  const allTools = useMemo(() => {
    return fileCategories.flatMap(category =>
      category.types.flatMap(type =>
        type.tools.map(tool => ({
          extension: type.extension,
          fileTypeName: type.name,
          toolName: tool.name,
          description: tool.description,
          color: type.color,
          status: tool.status,
          isFavorite: isFavorite(type.extension, tool.name),
        }))
      )
    );
  }, [isFavorite]);

  // Filter tools based on query
  const filteredTools = useMemo(() => {
    if (!query) {
      // Show favorites first when no query
      return allTools
        .sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0))
        .slice(0, 8);
    }
    
    const lowerQuery = query.toLowerCase();
    return allTools
      .filter(tool =>
        tool.toolName.toLowerCase().includes(lowerQuery) ||
        tool.fileTypeName.toLowerCase().includes(lowerQuery) ||
        tool.description.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 8);
  }, [query, allTools]);

  const handleSelect = useCallback((tool: typeof filteredTools[0]) => {
    router.push(`/tools/${tool.extension}`);
    onClose();
  }, [router, onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredTools.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredTools.length) % filteredTools.length);
      } else if (e.key === "Enter" && filteredTools[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredTools[selectedIndex]);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredTools, selectedIndex, handleSelect, onClose]);

  // Reset on open/close
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 border-b border-zinc-200 p-4 dark:border-zinc-700">
            <MagnifyingGlassIcon className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools... (type to filter)"
              autoFocus
              className="flex-1 bg-transparent text-lg text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
            />
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto p-2">
            {filteredTools.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 dark:text-zinc-400">
                No tools found
              </div>
            ) : (
              <div className="space-y-1">
                {filteredTools.map((tool, index) => (
                  <button
                    key={`${tool.extension}-${tool.toolName}`}
                    onClick={() => handleSelect(tool)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                      index === selectedIndex
                        ? "bg-purple-100 dark:bg-purple-900/30 shadow-sm"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-lg bg-zinc-900 dark:bg-zinc-700 flex items-center justify-center font-bold text-white shadow-sm">
                      {tool.extension.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-zinc-900 truncate dark:text-zinc-100">{tool.toolName}</p>
                        {tool.isFavorite && (
                          <StarIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 truncate">
                        {tool.fileTypeName} • {tool.description}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      tool.status === 'working'
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}>
                      {tool.status === 'working' ? 'Ready' : 'Soon'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
            <div className="flex gap-4">
              <span><kbd className="kbd">↑↓</kbd> Navigate</span>
              <span><kbd className="kbd">Enter</kbd> Select</span>
              <span><kbd className="kbd">Esc</kbd> Close</span>
            </div>
            {!query && <span className="text-zinc-500 dark:text-zinc-500">Showing favorites first</span>}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
