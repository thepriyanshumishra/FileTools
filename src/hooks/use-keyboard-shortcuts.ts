import { useEffect } from "react";

interface ShortcutHandlers {
  onUpload?: () => void;
  onProcess?: () => void;
  onBack?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      // Ctrl/Cmd + U - Upload
      if ((e.metaKey || e.ctrlKey) && e.key === "u" && handlers.onUpload) {
        e.preventDefault();
        handlers.onUpload();
      }

      // Ctrl/Cmd + Enter - Process
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && handlers.onProcess) {
        e.preventDefault();
        handlers.onProcess();
      }

      // Escape - Back
      if (e.key === "Escape" && handlers.onBack && !isInput) {
        e.preventDefault();
        handlers.onBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlers]);
}
