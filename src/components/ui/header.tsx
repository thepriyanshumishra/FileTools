"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon, QuestionMarkCircleIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { SearchModal } from "@/components/ui/search-modal";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LogoIcon } from "@/components/ui/logo-icon";

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 bg-white/90 backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-900/90 shadow-sm">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 font-bold text-lg sm:text-xl group">
          <div className="rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-2 sm:p-2.5 shadow-lg group-hover:shadow-purple-500/50 group-hover:scale-110 transition-all duration-300">
            <LogoIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-blue-500 transition-all duration-300">
            FileTools
          </span>
        </Link>
        
        <nav className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
          <div className="hidden md:flex items-center gap-1 mr-2">
            <Link href="/#tools" className="px-3 py-2 text-sm font-medium rounded-lg transition-all hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-950/30">
              Tools
            </Link>
            <Link href="/#features" className="px-3 py-2 text-sm font-medium rounded-lg transition-all hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-950/30">
              Features
            </Link>
            <Link href="/admin" className="px-3 py-2 text-sm font-medium rounded-lg transition-all hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-950/30">
              Admin
            </Link>
          </div>
          
          <div className="h-8 w-px bg-zinc-300 dark:bg-zinc-700 hidden md:block" />
          
          <ThemeToggle className="hidden md:block" />
          
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 md:w-auto md:gap-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 md:px-3 md:py-2 text-sm transition-all shadow-sm hover:shadow"
            title="Search tools (⌘K)"
          >
            <MagnifyingGlassIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden rounded bg-white dark:bg-zinc-900 px-1.5 py-0.5 text-xs font-semibold border border-zinc-300 dark:border-zinc-600 md:inline">
              ⌘K
            </kbd>
          </button>
          
          <button
            onClick={() => setShortcutsOpen(true)}
            className="hidden md:flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-all shadow-sm hover:shadow"
            title="Keyboard shortcuts (Press ?)"
          >
            <QuestionMarkCircleIcon className="h-5 w-5" />
          </button>
          
          <ThemeToggle className="md:hidden" />
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-all shadow-sm hover:shadow"
          >
            {mobileMenuOpen ? <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" /> : <Bars3Icon className="h-4 w-4 sm:h-5 sm:w-5" />}
          </button>
        </nav>
      </div>
    </header>
    
    {/* Mobile Menu */}
    {mobileMenuOpen && (
      <div className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
        <div className="absolute top-16 left-0 right-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-lg" onClick={(e) => e.stopPropagation()}>
          <div className="container mx-auto px-4 py-4 space-y-2">
            <Link href="/#tools" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium rounded-lg transition-all hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-950/30">
              Tools
            </Link>
            <Link href="/#features" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium rounded-lg transition-all hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-950/30">
              Features
            </Link>
            <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium rounded-lg transition-all hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-950/30">
              Admin
            </Link>
            <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />
            <button
              onClick={() => { setShortcutsOpen(true); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-950/30"
            >
              <QuestionMarkCircleIcon className="h-4 w-4" />
              Keyboard Shortcuts
            </button>
          </div>
        </div>
      </div>
    )}
    
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
