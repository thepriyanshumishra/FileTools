"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
// Load standard Prism languages
import "prismjs/components/prism-json";
import "prismjs/components/prism-markup"; // HTML/XML
import "prismjs/components/prism-css";
import "prismjs/components/prism-markdown";

import {
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
  ChevronLeftIcon,
  DocumentTextIcon,
  TrashIcon,
  PlusIcon,
  ClipboardDocumentIcon,
  CheckIcon
} from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";
import { useHistoryStore } from "@/lib/store/history";
import { saveDraftData, getDraftData } from "@/lib/utils/db";
import { LogoIcon } from "@/components/ui/logo-icon";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useFileTransferStore } from "@/lib/store/file-transfer";
import { cn } from "@/lib/utils";

interface DocumentStudioState {
  fileName: string;
  fileType: string; // json, csv, html, css, xml, md
  sourceContent: string;
  csvGrid: string[][]; // For CSV files
  tabSize: number;
}

function DocumentStudioContent() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draftId');
  const { addToHistory } = useHistoryStore();
  const { pendingFiles, clearPendingFiles } = useFileTransferStore();

  const [activeDraftId, setActiveDraftId] = useState<string>("");
  const isRestoringDraft = useRef(false);

  // File State
  const [docFile, setDocFile] = useState<File | null>(null);
  const [fileExtension, setFileExtension] = useState<string>("json");
  const [loading, setLoading] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);

  // Editor Content
  const [sourceContent, setSourceContent] = useState<string>("");
  const [formattedContent, setFormattedContent] = useState<string>("");
  const [tabSize, setTabSize] = useState<number>(2);

  // CSV Interactive Grid state
  const [csvGrid, setCsvGrid] = useState<string[][]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: "success" | "error" }>>([]);

  const addToast = (message: string, type: "success" | "error") => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Convert raw CSV to grid array
  const parseCSV = (text: string): string[][] => {
    const lines = text.split("\n");
    return lines
      .map(line => {
        // Simple comma split, supporting quoted values
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (matches) {
          return matches.map(v => v.replace(/^"|"$/g, "").trim());
        }
        return line.split(",").map(v => v.trim());
      })
      .filter(row => row.length > 0 && row.some(cell => cell.length > 0));
  };

  // Convert grid array back to CSV string
  const compileCSV = (grid: string[][]): string => {
    return grid
      .map(row => 
        row.map(cell => {
          const escaped = cell.replace(/"/g, '""');
          return cell.includes(",") || cell.includes('"') || cell.includes("\n") 
            ? `"${escaped}"` 
            : cell;
        }).join(",")
      )
      .join("\n");
  };

  // Trigger Format Action
  const formatDocument = useCallback((content: string, type: string, spaces: number) => {
    if (!content.trim()) {
      setFormattedContent("");
      return;
    }

    try {
      if (type === "json") {
        const obj = JSON.parse(content);
        setFormattedContent(JSON.stringify(obj, null, spaces));
      } else if (type === "css") {
        // Simple CSS beautifier
        const clean = content
          .replace(/\s*([{\n;])\s*/g, "$1")
          .replace(/\s*([:}])\s*/g, "$1")
          .replace(/{/g, " {\n" + " ".repeat(spaces))
          .replace(/;/g, ";\n" + " ".repeat(spaces))
          .replace(/\n\s*}/g, "\n}")
          .replace(/}\s*/g, "}\n\n");
        setFormattedContent(clean.trim());
      } else if (type === "html" || type === "xml") {
        // Simple tags indenter
        let formatted = "";
        let indent = 0;
        const reg = /(<\/?[^>]+>)/g;
        const parts = content.split(reg);
        
        parts.forEach(part => {
          if (!part.trim()) return;
          if (part.startsWith("</")) {
            indent = Math.max(0, indent - 1);
            formatted += " ".repeat(indent * spaces) + part + "\n";
          } else if (part.startsWith("<") && !part.endsWith("/>") && !part.startsWith("<?") && !part.startsWith("<!")) {
            formatted += " ".repeat(indent * spaces) + part + "\n";
            if (!part.includes("</") && !part.startsWith("<link") && !part.startsWith("<meta") && !part.startsWith("<img") && !part.startsWith("<br") && !part.startsWith("<input")) {
              indent++;
            }
          } else {
            formatted += " ".repeat(indent * spaces) + part.trim() + "\n";
          }
        });
        setFormattedContent(formatted.trim());
      } else {
        // Markdown / Plain text passes through
        setFormattedContent(content);
      }
    } catch (err) {
      setFormattedContent(`// Formatting error: ${(err as Error).message}\n\n${content}`);
    }
  }, []);

  // Update syntax highlighting
  useEffect(() => {
    Prism.highlightAll();
  }, [formattedContent, fileExtension]);

  const loadDocument = async (file: File, savedState?: any) => {
    setLoading(true);
    setDocFile(file);
    
    const ext = file.name.split('.').pop()?.toLowerCase() || "json";
    setFileExtension(ext);

    try {
      const text = await file.text();
      setSourceContent(text);

      if (ext === "csv") {
        const grid = savedState ? savedState.csvGrid : parseCSV(text);
        // Ensure at least a 3x3 layout
        while (grid.length < 3) grid.push(["", "", ""]);
        grid.forEach((row: string[]) => {
          while (row.length < 3) row.push("");
        });
        setCsvGrid(grid);
      } else {
        const spaces = savedState ? savedState.tabSize : tabSize;
        setTabSize(spaces);
        formatDocument(text, ext, spaces);
      }
    } catch (err) {
      console.error("Failed to read document file:", err);
      addToast("Failed to read file contents.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Restore Draft
  useEffect(() => {
    if (!draftId) return;

    const restoreDraft = async () => {
      isRestoringDraft.current = true;
      try {
        const draft = await getDraftData(draftId);
        if (draft && draft.editorState) {
          const state: DocumentStudioState = draft.editorState;

          // Reconstruct file
          const blob = new Blob([state.sourceContent], { type: "text/plain" });
          const file = new File([blob], state.fileName, { type: "text/plain" });

          setSourceContent(state.sourceContent);
          setTabSize(state.tabSize || 2);
          if (state.fileType === "csv") {
            setCsvGrid(state.csvGrid || []);
          }

          await loadMedia(file, state);
          setActiveDraftId(draftId);
        }
      } catch (err) {
        console.error("Failed to restore Document Studio draft:", err);
      } finally {
        isRestoringDraft.current = false;
      }
    };

    const loadMedia = async (file: File, state: DocumentStudioState) => {
      setDocFile(file);
      setFileExtension(state.fileType);
      if (state.fileType === "csv") {
        setCsvGrid(state.csvGrid || []);
      } else {
        setSourceContent(state.sourceContent);
        formatDocument(state.sourceContent, state.fileType, state.tabSize);
      }
    };

    restoreDraft();
  }, [draftId, formatDocument]);

  // Create Draft
  useEffect(() => {
    if (!docFile || isRestoringDraft.current || activeDraftId) return;

    const saveInitialDraft = async () => {
      const newDraftId = `draft_document_${Date.now()}`;
      try {
        const editorState: DocumentStudioState = {
          fileName: docFile.name,
          fileType: fileExtension,
          sourceContent,
          csvGrid,
          tabSize
        };

        await saveDraftData(newDraftId, "data:text/plain;base64,", editorState);
        setActiveDraftId(newDraftId);

        addToHistory({
          id: newDraftId,
          fileName: docFile.name,
          fileType: "document",
          toolName: "CodeFormat Document Studio",
          fileSize: docFile.size,
          status: "draft"
        });
      } catch (err) {
        console.error("Initial draft save error:", err);
      }
    };

    if (sourceContent.length > 0 || csvGrid.length > 0) {
      saveInitialDraft();
    }
  }, [docFile, sourceContent, csvGrid, activeDraftId, fileExtension, tabSize]);

  // Sync settings
  useEffect(() => {
    if (!activeDraftId || !docFile || isRestoringDraft.current) return;

    const syncDraft = async () => {
      try {
        const draft = await getDraftData(activeDraftId);
        if (draft) {
          draft.editorState = {
            fileName: docFile.name,
            fileType: fileExtension,
            sourceContent,
            csvGrid,
            tabSize
          };
          await saveDraftData(activeDraftId, draft.base64Data, draft.editorState);
        }
      } catch (err) {
        console.error("Auto-sync draft settings error:", err);
      }
    };

    const timer = setTimeout(syncDraft, 1000);
    return () => clearTimeout(timer);
  }, [sourceContent, csvGrid, tabSize, activeDraftId, docFile, fileExtension]);

  // Handle transferred files
  useEffect(() => {
    if (pendingFiles.length > 0) {
      const file = pendingFiles[0];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext && ["json", "csv", "html", "css", "xml", "md", "txt", "js", "ts"].includes(ext)) {
        loadDocument(file);
        clearPendingFiles();
      }
    }
  }, [pendingFiles]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      loadDocument(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt", ".json", ".csv", ".html", ".css", ".xml", ".md", ".js", ".ts"]
    },
    multiple: false
  });

  // Format trigger on tab size change
  const handleTabSizeChange = (size: number) => {
    setTabSize(size);
    formatDocument(sourceContent, fileExtension, size);
  };

  const handleSourceChange = (val: string) => {
    setSourceContent(val);
    formatDocument(val, fileExtension, tabSize);
  };

  // CSV cell modification
  const handleCellChange = (rIdx: number, cIdx: number, val: string) => {
    const updated = csvGrid.map((row, ri) => 
      row.map((cell, ci) => (ri === rIdx && ci === cIdx ? val : cell))
    );
    setCsvGrid(updated);
  };

  // Row and Column builders
  const addRow = () => {
    const colsCount = csvGrid[0]?.length || 3;
    setCsvGrid(prev => [...prev, Array(colsCount).fill("")]);
    addToast("Row added to sheet.", "success");
  };

  const addColumn = () => {
    setCsvGrid(prev => prev.map(row => [...row, ""]));
    addToast("Column added to sheet.", "success");
  };

  const deleteRow = (rIdx: number) => {
    if (csvGrid.length <= 1) return;
    setCsvGrid(prev => prev.filter((_, idx) => idx !== rIdx));
  };

  const deleteColumn = (cIdx: number) => {
    if (csvGrid[0]?.length <= 1) return;
    setCsvGrid(prev => prev.map(row => row.filter((_, idx) => idx !== cIdx)));
  };

  // Copy formatted code
  const copyToClipboard = () => {
    const content = fileExtension === "csv" ? compileCSV(csvGrid) : formattedContent;
    navigator.clipboard.writeText(content);
    setCopied(true);
    addToast("Copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  // File download compiler
  const handleExport = () => {
    if (!docFile) return;

    setProcessing(true);
    try {
      const content = fileExtension === "csv" ? compileCSV(csvGrid) : formattedContent;
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = docFile.name.replace(/\.[^/.]+$/, "") + "_formatted." + fileExtension;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (activeDraftId) {
        addToHistory({
          id: activeDraftId,
          fileName: docFile.name,
          fileType: "document",
          toolName: "CodeFormat Document Studio",
          fileSize: docFile.size,
          status: "exported"
        });
      }

      addToast("Formatted file exported successfully!", "success");
    } catch (err) {
      console.error(err);
      addToast("Export failed.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const prismLangClass = fileExtension === "html" || fileExtension === "xml" 
    ? "language-markup" 
    : `language-${fileExtension}`;

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="h-16 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 z-20">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
            <LogoIcon className="h-8 w-8 text-purple-650" />
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">FileTools</span>
          </Link>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-extrabold text-purple-500 bg-purple-150 px-2 py-0.5 rounded">CodeFormat</span>
            <h1 className="text-sm font-bold truncate max-w-[200px]">{docFile ? docFile.name : "Document Studio"}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {docFile && (
            <button
              onClick={handleExport}
              disabled={processing}
              className={cn(
                "rounded-xl px-5 py-2.5 text-xs font-bold transition-all text-white flex items-center gap-2 hover:shadow-lg active:scale-98",
                processing
                  ? "bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed opacity-50"
                  : "bg-gradient-to-r from-purple-650 to-indigo-650 hover:shadow-purple-500/20"
              )}
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              {processing ? "Compiling..." : "Export File"}
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Frame */}
      {!docFile ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl text-center space-y-6"
          >
            <div className="mx-auto h-20 w-20 rounded-2xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-4xl shadow-md">
              ⚡
            </div>
            <div>
              <h2 className="text-2xl font-extrabold">Welcome to CodeFormat Document Studio</h2>
              <p className="text-sm text-zinc-500 mt-2">
                Beautify JSON, HTML, CSS, XML, and Markdown code or interactively edit CSV spreadsheets in an Excel grid completely offline.
              </p>
            </div>

            <div 
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-3xl p-12 transition-all cursor-pointer bg-white dark:bg-zinc-900 flex flex-col items-center justify-center gap-4 hover:border-purple-500",
                isDragActive ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20" : "border-zinc-300 dark:border-zinc-800"
              )}
            >
              <input {...getInputProps()} />
              <ArrowUpTrayIcon className="h-10 w-10 text-zinc-400 dark:text-zinc-600" />
              <div>
                <p className="font-bold text-sm">Drag and drop your document file here, or click to browse</p>
                <p className="text-xs text-zinc-400 mt-1">Supports JSON, CSV, HTML, CSS, XML, MD, TXT, JS, TS files</p>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Adjustments Panel */}
          <aside className="w-80 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col overflow-y-auto z-10 p-6 space-y-6">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400 mb-4">Formatter Settings</h3>
            </div>

            {fileExtension !== "csv" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase">Tab Spacing</label>
                  <div className="grid grid-cols-3 gap-1 bg-zinc-100 dark:bg-zinc-850 p-1 rounded-xl">
                    {[2, 4, 8].map((size) => (
                      <button
                        key={size}
                        onClick={() => handleTabSizeChange(size)}
                        className={cn(
                          "py-1.5 text-xs font-bold rounded-lg transition-all",
                          tabSize === size
                            ? "bg-white dark:bg-zinc-900 shadow text-purple-600"
                            : "text-zinc-500 hover:text-zinc-850"
                        )}
                      >
                        {size} Spaces
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-zinc-400">Language Detected</span>
                  <p className="text-xs font-bold text-purple-650 bg-purple-50 dark:bg-purple-950/40 px-2 py-1 rounded w-max uppercase">{fileExtension}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-zinc-500 uppercase">CSV Grid Controls</h4>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={addRow}
                    className="w-full rounded-xl bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 text-purple-600 border border-purple-200/50 py-2.5 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Insert New Row
                  </button>
                  <button
                    onClick={addColumn}
                    className="w-full rounded-xl bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 text-purple-600 border border-purple-200/50 py-2.5 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Insert New Column
                  </button>
                </div>
              </div>
            )}

            {/* Quick Export / Clipboard Card */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 space-y-3">
              <button
                onClick={copyToClipboard}
                className="w-full rounded-xl bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 py-3 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                {copied ? <CheckIcon className="h-4 w-4 text-green-600" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy to Clipboard"}
              </button>
            </div>
          </aside>

          {/* Central Workspace Canvas Editor */}
          <div className="flex-1 flex flex-col bg-zinc-100 dark:bg-zinc-950 overflow-hidden relative">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
                <p className="text-sm font-bold text-zinc-500">Reading document streams...</p>
              </div>
            ) : fileExtension === "csv" ? (
              // CSV Interactive Excel Grid Table View
              <div className="flex-1 overflow-auto p-8">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl overflow-hidden max-w-full">
                  <table className="w-full border-collapse text-xs text-left">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                        <th className="p-3 w-12 text-center text-zinc-450 font-bold border-r border-zinc-250 dark:border-zinc-800">#</th>
                        {csvGrid[0]?.map((_, colIdx) => (
                          <th key={colIdx} className="p-3 border-r border-zinc-250 dark:border-zinc-800 font-bold text-zinc-650 min-w-[120px]">
                            <div className="flex justify-between items-center">
                              <span>Col {colIdx + 1}</span>
                              <button 
                                onClick={() => deleteColumn(colIdx)} 
                                className="text-red-500 hover:scale-110 transition-transform opacity-60 hover:opacity-100"
                              >
                                ✕
                              </button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {csvGrid.map((row, rowIdx) => (
                        <tr key={rowIdx} className="border-b border-zinc-150 dark:border-zinc-850 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                          <td className="p-3 bg-zinc-50 dark:bg-zinc-950 text-center border-r border-zinc-200 dark:border-zinc-800 text-zinc-400 font-mono font-bold">
                            <div className="flex items-center justify-between gap-1">
                              <span>{rowIdx + 1}</span>
                              <button 
                                onClick={() => deleteRow(rowIdx)} 
                                className="text-red-500 hover:scale-110 transition-transform opacity-30 hover:opacity-100"
                              >
                                ✕
                              </button>
                            </div>
                          </td>
                          {row.map((cell, colIdx) => (
                            <td key={colIdx} className="p-2 border-r border-zinc-200 dark:border-zinc-800">
                              <input
                                type="text"
                                value={cell}
                                onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                                className="w-full bg-transparent px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500 rounded font-semibold text-zinc-850 dark:text-zinc-250"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              // Code Formatter Split Screen view
              <div className="flex-1 flex overflow-hidden">
                {/* Left Side: Text Input source code */}
                <div className="flex-1 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                  <div className="h-10 border-b border-zinc-200 dark:border-zinc-800 px-4 flex items-center bg-zinc-50 dark:bg-zinc-950/20">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Input Source Code</span>
                  </div>
                  <textarea
                    value={sourceContent}
                    onChange={(e) => handleSourceChange(e.target.value)}
                    className="flex-1 p-6 font-mono text-xs bg-transparent resize-none focus:outline-none leading-relaxed dark:text-zinc-200"
                    placeholder="// Paste your raw unformatted document here..."
                  />
                </div>

                {/* Right Side: Syntax Highlighted Formatted output */}
                <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden">
                  <div className="h-10 border-b border-zinc-900 px-4 flex items-center bg-zinc-950/40">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Formatted View</span>
                  </div>
                  <div className="flex-1 p-6 overflow-auto font-mono text-xs leading-relaxed text-zinc-300">
                    <pre className="m-0 bg-transparent p-0">
                      <code className={prismLangClass}>
                        {formattedContent || "// Ready to format..."}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-center gap-3 rounded-xl p-4 shadow-lg backdrop-blur-sm animate-slideInRight",
              toast.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800"
                : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800"
            )}
          >
            <p className="flex-1 text-xs font-bold leading-normal">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 rounded-lg p-1 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

export default function DocumentStudioPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 gap-4 font-sans">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
        <p className="text-xs font-bold text-zinc-500 animate-pulse">Loading Document Studio...</p>
      </div>
    }>
      <DocumentStudioContent />
    </Suspense>
  );
}
