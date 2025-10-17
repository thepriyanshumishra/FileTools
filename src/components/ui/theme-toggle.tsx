"use client";

import { useEffect } from "react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.code === 'Space') {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setTheme(theme === "dark" ? "light" : "dark");
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [theme, setTheme]);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`glass glass-hover glass-active flex h-12 w-24 items-center justify-center rounded-full ${className}`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode (Shift+Space)`}
    >
      <div className="relative h-8 w-16">
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={{ opacity: theme === "dark" ? 0 : 1 }}
        >
          <SunIcon className="h-6 w-6 text-amber-500" />
        </motion.div>
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={{ opacity: theme === "dark" ? 1 : 0 }}
        >
          <MoonIcon className="h-6 w-6 text-blue-500" />
        </motion.div>
      </div>
    </motion.button>
  );
}
