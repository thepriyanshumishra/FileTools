"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DocumentTextIcon, MagnifyingGlassIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { SearchModal } from "@/components/ui/search-modal";

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setShortcutsOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/80 backdrop-blur-lg dark:border-zinc-800/50 dark:bg-zinc-900/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-2">
            <DocumentTextIcon className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            FileTools
          </span>
        </Link>
        
        <nav className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            title="Search tools (⌘K)"
          >
            <MagnifyingGlassIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded bg-zinc-200 px-1.5 py-0.5 text-xs font-semibold dark:bg-zinc-700 md:inline">
              ⌘K
            </kbd>
          </button>
          
          <button
            onClick={() => setShortcutsOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 text-sm transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
            title="Keyboard shortcuts (Press ?)"
          >
            <QuestionMarkCircleIcon className="h-5 w-5" />
          </button>
          
          <div className="hidden md:flex items-center gap-6">
            <Link href="/#tools" className="text-sm font-medium transition-colors hover:text-purple-600">
              Tools
            </Link>
            <Link href="/#features" className="text-sm font-medium transition-colors hover:text-purple-600">
              Features
            </Link>
            <Link href="/admin" className="text-sm font-medium transition-colors hover:text-purple-600">
              Admin
            </Link>
          </div>
        </nav>
      </div>
    </header>
    
    <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    
    {/* Shortcuts Modal */}
    {shortcutsOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          onClick={() => setShortcutsOpen(false)}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />
        <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
            <button
              onClick={() => setShortcutsOpen(false)}
              className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3">
            {[
              { key: "⌘/Ctrl + K", description: "Open search" },
              { key: "Shift + Space", description: "Toggle theme" },
              { key: "⌘/Ctrl + H", description: "Toggle history" },
              { key: "⌘/Ctrl + ,", description: "Open settings" },
              { key: "⌘/Ctrl + U", description: "Upload files" },
              { key: "⌘/Ctrl + Enter", description: "Process files" },
              { key: "Esc", description: "Close modals / Go back" },
              { key: "?", description: "Show shortcuts" },
              { key: "↑ ↓", description: "Navigate search results" },
              { key: "Enter", description: "Select search result" },
            ].map((shortcut) => (
              <div
                key={shortcut.key}
                className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {shortcut.description}
                </span>
                <kbd className="rounded-lg border border-zinc-300 bg-zinc-100 px-3 py-1.5 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Press <kbd className="kbd">?</kbd> anytime to see shortcuts
          </div>
        </div>
      </div>
    )}
    </>
  );
}
