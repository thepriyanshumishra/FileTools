"use client";

import { useState, useEffect, useRef, useCallback, Suspense, use } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { PDFDocument, degrees, rgb } from 'pdf-lib';
import {
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  PlusIcon,
  MinusIcon,
  PencilIcon,
  LockClosedIcon,
  SparklesIcon,
  EyeIcon,
  CheckIcon,
  ArrowUturnLeftIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";
import { useHistoryStore } from "@/lib/store/history";
import { saveDraftData, getDraftData } from "@/lib/utils/db";
import { LogoIcon } from "@/components/ui/logo-icon";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useFileTransferStore } from "@/lib/store/file-transfer";
import { cn } from "@/lib/utils";

interface PDFPageItem {
  id: string; // page-[originalIndex]-[uuid]
  originalIndex: number;
  rotation: number;
  excluded: boolean;
  thumbnail: string;
}

interface SignatureStamp {
  id: string;
  x: number; // percentage
  y: number; // percentage
  width: number;
  height: number;
  pageId: string;
  base64Data: string;
}

interface PDFStudioState {
  fileName: string;
  pages: Omit<PDFPageItem, "thumbnail">[];
  signatures: SignatureStamp[];
  password: string;
  watermarkText: string;
  watermarkOpacity: number;
  watermarkColor: string;
  compressionLevel: "basic" | "high" | "low";
}

function DocFlowPDFContent() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draftId');
  const { addToHistory } = useHistoryStore();
  const { pendingFiles, clearPendingFiles } = useFileTransferStore();

  const [activeDraftId, setActiveDraftId] = useState<string>("");
  const isRestoringDraft = useRef(false);

  // PDF Document File State
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPages, setPdfPages] = useState<PDFPageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [outputFilename, setOutputFilename] = useState<string>("");

  // Editor Panels
  const [activeTool, setActiveTool] = useState<"organize" | "signature" | "secure" | "watermark" | "compress">("organize");
  const [activePageId, setActivePageId] = useState<string | null>(null); // For signature stamping view
  const [viewMode, setViewMode] = useState<"grid" | "edit">("grid"); // grid organizer vs page editor

  // Settings
  const [pdfPassword, setPdfPassword] = useState<string>("");
  const [pdfPasswordConfirm, setPdfPasswordConfirm] = useState<string>("");
  const [pdfWatermarkText, setPdfWatermarkText] = useState<string>("");
  const [pdfWatermarkOpacity, setPdfWatermarkOpacity] = useState<number>(40);
  const [pdfWatermarkColor, setPdfWatermarkColor] = useState<string>("#8b5cf6");
  const [pdfCompressionLevel, setPdfCompressionLevel] = useState<"basic" | "high" | "low">("basic");

  // Signatures
  const [signatures, setSignatures] = useState<SignatureStamp[]>([]);
  const [savedSignatures, setSavedSignatures] = useState<string[]>([]); // Base64 drawing pad shapes
  const [showSignaturePad, setShowSignaturePad] = useState<boolean>(false);
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Position Overlay For Dragging Stamped Signatures
  const [activeStampId, setActiveStampId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: "success" | "error" }>>([]);

  const addToast = (message: string, type: "success" | "error") => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Convert PDF pages to images
  const loadPdf = async (file: File, savedPagesState?: any[]) => {
    setLoading(true);
    setPdfFile(file);
    setOutputFilename(file.name.replace(/\.[^/.]+$/, "") + "_edited.pdf");
    
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const items: PDFPageItem[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const scale = 0.5;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (context) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas
          }).promise;

          const savedState = savedPagesState?.find(p => p.originalIndex === i - 1);
          items.push({
            id: `page-${i - 1}-${Math.random().toString(36).substr(2, 9)}`,
            originalIndex: i - 1,
            rotation: savedState ? savedState.rotation : 0,
            excluded: savedState ? savedState.excluded : false,
            thumbnail: canvas.toDataURL()
          });
        }
      }

      // If we are restoring order, apply the exact saved page order
      if (savedPagesState) {
        const orderedItems: PDFPageItem[] = [];
        savedPagesState.forEach((savedPage) => {
          const matched = items.find(item => item.originalIndex === savedPage.originalIndex);
          if (matched) {
            orderedItems.push({
              ...matched,
              rotation: savedPage.rotation,
              excluded: savedPage.excluded
            });
          }
        });
        setPdfPages(orderedItems);
      } else {
        setPdfPages(items);
      }

      if (items.length > 0) {
        setActivePageId(items[0].id);
      }
    } catch (err) {
      console.error("Failed to parse PDF:", err);
      addToast("Failed to parse PDF document structure.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Draft Caching & Auto-Saving
  useEffect(() => {
    if (!draftId) return;

    const restoreDraft = async () => {
      isRestoringDraft.current = true;
      try {
        const draft = await getDraftData(draftId);
        if (draft && draft.editorState) {
          const state: PDFStudioState = draft.editorState;

          // Reconstruct file
          const dataURLtoBlob = (dataurl: string) => {
            const arr = dataurl.split(',');
            const mimeMatch = arr[0].match(/:(.*?);/);
            const mime = mimeMatch ? mimeMatch[1] : '';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
          };
          
          const blob = dataURLtoBlob(draft.base64Data);
          const file = new File([blob], state.fileName, { type: "application/pdf" });

          setPdfPassword(state.password || "");
          setPdfWatermarkText(state.watermarkText || "");
          setPdfWatermarkOpacity(state.watermarkOpacity || 40);
          setPdfWatermarkColor(state.watermarkColor || "#8b5cf6");
          setPdfCompressionLevel(state.compressionLevel || "basic");
          setSignatures(state.signatures || []);

          await loadPdf(file, state.pages);
          setActiveDraftId(draftId);
        }
      } catch (err) {
        console.error("Failed to restore PDF Studio draft:", err);
      } finally {
        isRestoringDraft.current = false;
      }
    };

    restoreDraft();
  }, [draftId]);

  // Initial Upload Draft Creation
  useEffect(() => {
    if (!pdfFile || isRestoringDraft.current || activeDraftId) return;

    const saveInitialDraft = async () => {
      const newDraftId = `draft_pdf_${Date.now()}`;
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = reader.result as string;
          const editorState: PDFStudioState = {
            fileName: pdfFile.name,
            pages: pdfPages.map(p => ({
              id: p.id,
              originalIndex: p.originalIndex,
              rotation: p.rotation,
              excluded: p.excluded
            })),
            signatures,
            password: pdfPassword,
            watermarkText: pdfWatermarkText,
            watermarkOpacity: pdfWatermarkOpacity,
            watermarkColor: pdfWatermarkColor,
            compressionLevel: pdfCompressionLevel
          };

          await saveDraftData(newDraftId, base64Data, editorState);
          setActiveDraftId(newDraftId);

          addToHistory({
            id: newDraftId,
            fileName: pdfFile.name,
            fileType: "pdf",
            toolName: "DocFlow PDF Studio",
            fileSize: pdfFile.size,
            status: "draft"
          });
        };
        reader.readAsDataURL(pdfFile);
      } catch (err) {
        console.error("Initial draft save error:", err);
      }
    };

    if (pdfPages.length > 0) {
      saveInitialDraft();
    }
  }, [pdfFile, pdfPages, activeDraftId]);

  // Debounced Settings sync to DB
  useEffect(() => {
    if (!activeDraftId || !pdfFile || isRestoringDraft.current) return;

    const syncDraft = async () => {
      try {
        const draft = await getDraftData(activeDraftId);
        if (draft) {
          draft.editorState = {
            fileName: pdfFile.name,
            pages: pdfPages.map(p => ({
              id: p.id,
              originalIndex: p.originalIndex,
              rotation: p.rotation,
              excluded: p.excluded
            })),
            signatures,
            password: pdfPassword,
            watermarkText: pdfWatermarkText,
            watermarkOpacity: pdfWatermarkOpacity,
            watermarkColor: pdfWatermarkColor,
            compressionLevel: pdfCompressionLevel
          };
          await saveDraftData(activeDraftId, draft.base64Data, draft.editorState);
        }
      } catch (err) {
        console.error("Auto-sync draft settings error:", err);
      }
    };

    const timer = setTimeout(syncDraft, 1000);
    return () => clearTimeout(timer);
  }, [pdfPages, signatures, pdfPassword, pdfWatermarkText, pdfWatermarkOpacity, pdfWatermarkColor, pdfCompressionLevel, activeDraftId, pdfFile]);

  // Handle incoming transfer files
  useEffect(() => {
    if (pendingFiles.length > 0) {
      const file = pendingFiles[0];
      if (file.name.toLowerCase().endsWith(".pdf")) {
        loadPdf(file);
        clearPendingFiles();
      }
    }
  }, [pendingFiles]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      loadPdf(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false
  });

  // Reorder pages in organizer grid
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(pdfPages);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setPdfPages(items);
  };

  // Page level operators
  const rotatePage = (id: string, dir: "cw" | "ccw") => {
    setPdfPages(prev => prev.map(p => {
      if (p.id === id) {
        const change = dir === "cw" ? 90 : -90;
        let newRot = (p.rotation + change) % 360;
        if (newRot < 0) newRot += 360;
        return { ...p, rotation: newRot };
      }
      return p;
    }));
  };

  const toggleExcludePage = (id: string) => {
    setPdfPages(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, excluded: !p.excluded };
      }
      return p;
    }));
  };

  // Drawing Pad Canvas Functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Handle touch vs mouse coordinates
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    
    // Check if canvas is empty
    const blank = document.createElement('canvas');
    blank.width = canvas.width;
    blank.height = canvas.height;
    if (canvas.toDataURL() === blank.toDataURL()) {
      addToast("Drawing signature is empty.", "error");
      return;
    }

    const base64 = canvas.toDataURL();
    setSavedSignatures(prev => [...prev, base64]);
    setShowSignaturePad(false);
    addToast("Signature template saved.", "success");
  };

  // Stamp signature onto single page viewport
  const stampSignatureOnPage = (base64: string) => {
    if (!activePageId) return;
    const newStamp: SignatureStamp = {
      id: `stamp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      x: 35, // default horizontal center percentage
      y: 40, // default vertical center percentage
      width: 150,
      height: 70,
      pageId: activePageId,
      base64Data: base64
    };
    setSignatures(prev => [...prev, newStamp]);
    addToast("Signature placed on page. Drag or resize it.", "success");
  };

  const removeStamp = (id: string) => {
    setSignatures(prev => prev.filter(s => s.id !== id));
  };

  const [draggedStampId, setDraggedStampId] = useState<string | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const stampStartPos = useRef({ x: 0, y: 0 });

  const handleStampMouseDown = (stampId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setDraggedStampId(stampId);
    const stamp = signatures.find(s => s.id === stampId);
    if (stamp) {
      dragStartPos.current = { x: e.clientX, y: e.clientY };
      stampStartPos.current = { x: stamp.x, y: stamp.y };
    }
  };

  const handleStampTouchStart = (stampId: string, e: React.TouchEvent) => {
    setDraggedStampId(stampId);
    const stamp = signatures.find(s => s.id === stampId);
    if (stamp && e.touches.length > 0) {
      dragStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      stampStartPos.current = { x: stamp.x, y: stamp.y };
    }
  };

  const handleStampMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedStampId) return;
    const container = document.getElementById('stamp-canvas-boundaries');
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const deltaX = ((e.clientX - dragStartPos.current.x) / rect.width) * 100;
    const deltaY = ((e.clientY - dragStartPos.current.y) / rect.height) * 100;

    setSignatures(prev => prev.map(s => {
      if (s.id === draggedStampId) {
        return {
          ...s,
          x: Math.max(0, Math.min(100 - (s.width / rect.width) * 100, stampStartPos.current.x + deltaX)),
          y: Math.max(0, Math.min(100 - (s.height / rect.height) * 100, stampStartPos.current.y + deltaY))
        };
      }
      return s;
    }));
  }, [draggedStampId]);

  const handleStampTouchMove = useCallback((e: TouchEvent) => {
    if (!draggedStampId || e.touches.length === 0) return;
    const container = document.getElementById('stamp-canvas-boundaries');
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const deltaX = ((e.touches[0].clientX - dragStartPos.current.x) / rect.width) * 100;
    const deltaY = ((e.touches[0].clientY - dragStartPos.current.y) / rect.height) * 100;

    setSignatures(prev => prev.map(s => {
      if (s.id === draggedStampId) {
        return {
          ...s,
          x: Math.max(0, Math.min(100 - (s.width / rect.width) * 100, stampStartPos.current.x + deltaX)),
          y: Math.max(0, Math.min(100 - (s.height / rect.height) * 100, stampStartPos.current.y + deltaY))
        };
      }
      return s;
    }));
  }, [draggedStampId]);

  const handleStampMouseUp = useCallback(() => {
    setDraggedStampId(null);
  }, []);

  useEffect(() => {
    if (draggedStampId) {
      window.addEventListener('mousemove', handleStampMouseMove);
      window.addEventListener('mouseup', handleStampMouseUp);
      window.addEventListener('touchmove', handleStampTouchMove);
      window.addEventListener('touchend', handleStampMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleStampMouseMove);
      window.removeEventListener('mouseup', handleStampMouseUp);
      window.removeEventListener('touchmove', handleStampTouchMove);
      window.removeEventListener('touchend', handleStampMouseUp);
    };
  }, [draggedStampId, handleStampMouseMove, handleStampTouchMove, handleStampMouseUp]);

  // Final compile and PDF save pipeline
  const processAndDownload = async () => {
    if (!pdfFile) return;
    
    const activePages = pdfPages.filter(p => !p.excluded);
    if (activePages.length === 0) {
      addToast("Cannot export PDF with zero pages.", "error");
      return;
    }

    if (pdfPassword && pdfPassword !== pdfPasswordConfirm) {
      addToast("Encryption passwords do not match.", "error");
      return;
    }

    setProcessing(true);
    try {
      const srcArrayBuffer = await pdfFile.arrayBuffer();
      const srcDoc = await PDFDocument.load(srcArrayBuffer);
      const outputDoc = await PDFDocument.create();

      // Get page dimensions & map indexes
      for (const p of activePages) {
        const [copiedPage] = await outputDoc.copyPages(srcDoc, [p.originalIndex]);
        
        // Apply rotation angle
        if (p.rotation !== 0) {
          const currentRotation = copiedPage.getRotation().angle;
          copiedPage.setRotation(degrees(currentRotation + p.rotation));
        }

        // Draw Watermark if specified
        if (pdfWatermarkText.trim().length > 0) {
          const { width, height } = copiedPage.getSize();
          const hex = pdfWatermarkColor.replace('#', '');
          const r = parseInt(hex.substring(0,2), 16) / 255;
          const g = parseInt(hex.substring(2,4), 16) / 255;
          const b = parseInt(hex.substring(4,6), 16) / 255;

          copiedPage.drawText(pdfWatermarkText, {
            x: width / 2 - 100,
            y: height / 2,
            size: 40,
            opacity: pdfWatermarkOpacity / 100,
            color: rgb(r, g, b),
            rotate: degrees(45)
          });
        }

        // Draw Signatures mapped to this page index
        const pageStamps = signatures.filter(s => s.pageId === p.id);
        for (const stamp of pageStamps) {
          const { width, height } = copiedPage.getSize();
          
          // Decode base64 image data
          const imgBytes = await fetch(stamp.base64Data).then(res => res.arrayBuffer());
          const embeddedImage = await outputDoc.embedPng(imgBytes);

          // Map percentage coordinates back to standard points
          const px = (stamp.x / 100) * width;
          const py = (1 - (stamp.y / 100) - (stamp.height / height)) * height; // Invert Y baseline

          copiedPage.drawImage(embeddedImage, {
            x: px,
            y: py,
            width: stamp.width,
            height: stamp.height
          });
        }

        outputDoc.addPage(copiedPage);
      }

      // Save PDF output bytes
      let pdfBytes = await outputDoc.save({
        useObjectStreams: pdfCompressionLevel === "high"
      });

      // Apply Password Security Encryption if specified
      if (pdfPassword.trim().length > 0) {
        const { encryptPDF } = await import("@pdfsmaller/pdf-encrypt");
        pdfBytes = await encryptPDF(pdfBytes, pdfPassword);
      }

      // Download output
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = outputFilename || "document.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Track history & update draft
      if (activeDraftId) {
        addToHistory({
          id: activeDraftId,
          fileName: pdfFile.name,
          fileType: "pdf",
          toolName: "DocFlow PDF Studio",
          fileSize: pdfFile.size,
          status: "exported"
        });
      }

      addToast("PDF generated and downloaded successfully!", "success");
    } catch (err) {
      console.error("PDF generation compilation failed:", err);
      addToast("Failed to compile and secure PDF document.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const activePage = pdfPages.find(p => p.id === activePageId);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="h-16 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 z-20">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
            <LogoIcon className="h-8 w-8 text-purple-600" />
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">FileTools</span>
          </Link>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-extrabold text-purple-500 bg-purple-150 px-2 py-0.5 rounded">Studio</span>
            <h1 className="text-sm font-bold truncate max-w-[200px]">{pdfFile ? pdfFile.name : "DocFlow PDF"}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {pdfFile && (
            <button
              onClick={processAndDownload}
              disabled={processing}
              className={cn(
                "rounded-xl px-5 py-2.5 text-xs font-bold transition-all text-white flex items-center gap-2 hover:shadow-lg active:scale-98",
                processing 
                  ? "bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed opacity-50 text-zinc-500"
                  : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-purple-500/20"
              )}
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              {processing ? "Compiling..." : "Export PDF"}
            </button>
          )}
        </div>
      </header>

      {/* Main Studio Viewport */}
      {!pdfFile ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl text-center space-y-6"
          >
            <div className="mx-auto h-20 w-20 rounded-2xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-4xl shadow-md">
              📄
            </div>
            <div>
              <h2 className="text-2xl font-extrabold">Welcome to DocFlow PDF Studio</h2>
              <p className="text-sm text-zinc-500 mt-2">
                Reorder, rotate, protect, apply watermarks, compress, and digitally sign your PDF documents completely client-side.
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
                <p className="font-bold text-sm">Drag and drop your PDF here, or click to browse</p>
                <p className="text-xs text-zinc-400 mt-1">Accepts only .pdf files up to 25MB</p>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar Tools */}
          <aside className="w-80 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col overflow-y-auto z-10">
            {/* Tool Category Pills */}
            <div className="p-4 grid grid-cols-5 gap-1.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <button
                onClick={() => setActiveTool("organize")}
                className={cn("p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] font-bold transition-all", activeTool === "organize" ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" : "hover:bg-zinc-100 dark:hover:bg-zinc-800")}
                title="Page Organizer"
              >
                <DocumentTextIcon className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={() => setActiveTool("signature")}
                className={cn("p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] font-bold transition-all", activeTool === "signature" ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" : "hover:bg-zinc-100 dark:hover:bg-zinc-800")}
                title="Sign PDF"
              >
                <PencilIcon className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={() => setActiveTool("secure")}
                className={cn("p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] font-bold transition-all", activeTool === "secure" ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" : "hover:bg-zinc-100 dark:hover:bg-zinc-800")}
                title="Password Security"
              >
                <LockClosedIcon className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={() => setActiveTool("watermark")}
                className={cn("p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] font-bold transition-all", activeTool === "watermark" ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" : "hover:bg-zinc-100 dark:hover:bg-zinc-800")}
                title="Watermark text"
              >
                <SparklesIcon className="h-4.5 w-4.5" />
              </button>
              <button
                onClick={() => setActiveTool("compress")}
                className={cn("p-2 rounded-lg flex flex-col items-center gap-1 text-[10px] font-bold transition-all", activeTool === "compress" ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" : "hover:bg-zinc-100 dark:hover:bg-zinc-800")}
                title="Compress File"
              >
                <ArrowPathIcon className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Active Tool Config panel */}
            <div className="flex-1 p-6 space-y-6">
              {activeTool === "organize" && (
                <div className="space-y-4">
                  <h3 className="text-base font-extrabold">Page Organizer</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Excludes pages from final compilation or rotate page orientation visually. Toggle view mode below:
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-850 rounded-xl">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={cn("py-2 rounded-lg text-xs font-bold transition-all", viewMode === "grid" ? "bg-white dark:bg-zinc-900 shadow-sm text-purple-650" : "text-zinc-500")}
                    >
                      Organizer Grid
                    </button>
                    <button
                      onClick={() => setViewMode("edit")}
                      className={cn("py-2 rounded-lg text-xs font-bold transition-all", viewMode === "edit" ? "bg-white dark:bg-zinc-900 shadow-sm text-purple-650" : "text-zinc-500")}
                    >
                      Single Editor
                    </button>
                  </div>
                </div>
              )}

              {activeTool === "signature" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-extrabold">Digital Signatures</h3>
                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      Draw a signature and click it to stamp it onto the document canvas.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowSignaturePad(true)}
                    className="w-full rounded-xl bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600 border border-purple-200/50 py-3 font-bold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Draw New Signature
                  </button>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Your Signature Templates</h4>
                    {savedSignatures.length === 0 ? (
                      <div className="text-center py-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-xs text-zinc-400">
                        No saved signatures. Draw one to start stamping.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {savedSignatures.map((sig, i) => (
                          <div 
                            key={i} 
                            onClick={() => {
                              setViewMode("edit");
                              stampSignatureOnPage(sig);
                            }}
                            className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-2 bg-zinc-50 dark:bg-zinc-950 hover:border-purple-400 dark:hover:border-purple-600 transition-all cursor-pointer group flex items-center justify-center relative overflow-hidden"
                          >
                            <img src={sig} alt="Signature Template" className="max-h-12 w-auto object-contain dark:invert" />
                            <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                              <span className="text-[10px] font-bold text-purple-600 bg-white px-2 py-0.5 rounded-full shadow-sm">Stamp Page</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTool === "secure" && (
                <div className="space-y-4">
                  <h3 className="text-base font-extrabold font-bold">Secure Document</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Applies secure encryption to locking access to this document.
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase">Password</label>
                      <input
                        type="password"
                        value={pdfPassword}
                        onChange={(e) => setPdfPassword(e.target.value)}
                        placeholder="Enter PDF password"
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase">Confirm Password</label>
                      <input
                        type="password"
                        value={pdfPasswordConfirm}
                        onChange={(e) => setPdfPasswordConfirm(e.target.value)}
                        placeholder="Retype password"
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTool === "watermark" && (
                <div className="space-y-4">
                  <h3 className="text-base font-extrabold">Watermark text</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Stamps diagonal custom text overlays across all pages of the compiled file.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase">Watermark Text</label>
                      <input
                        type="text"
                        value={pdfWatermarkText}
                        onChange={(e) => setPdfWatermarkText(e.target.value)}
                        placeholder="e.g. DRAFT"
                        className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase">Opacity ({pdfWatermarkOpacity}%)</label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="10"
                        value={pdfWatermarkOpacity}
                        onChange={(e) => setPdfWatermarkOpacity(Number(e.target.value))}
                        className="w-full accent-purple-650"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase">Color Swatches</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={pdfWatermarkColor}
                          onChange={(e) => setPdfWatermarkColor(e.target.value)}
                          className="h-8 w-8 rounded-lg overflow-hidden border border-zinc-200 cursor-pointer"
                        />
                        <span className="text-xs font-mono">{pdfWatermarkColor.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTool === "compress" && (
                <div className="space-y-4">
                  <h3 className="text-base font-extrabold">Compression</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Optimize PDF data density to save sharing bandwidth.
                  </p>

                  <div className="space-y-2">
                    {[
                      { id: "basic", title: "Recommended Compression", desc: "Balance quality and size" },
                      { id: "high", title: "Extreme Compression", desc: "Max size reduction, lower resolution" },
                      { id: "low", title: "Low Compression", desc: "High image definition, large size" }
                    ].map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => setPdfCompressionLevel(opt.id as any)}
                        className={cn(
                          "border rounded-xl p-3 cursor-pointer transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/30",
                          pdfCompressionLevel === opt.id 
                            ? "border-purple-500 bg-purple-50/10" 
                            : "border-zinc-200 dark:border-zinc-800"
                        )}
                      >
                        <p className="text-xs font-bold">{opt.title}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{opt.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Custom Info and Quick Navigation Footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/20 flex flex-col gap-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Save As Output Filename</label>
              <input
                type="text"
                value={outputFilename}
                onChange={(e) => setOutputFilename(e.target.value)}
                placeholder="document.pdf"
                className="w-full px-3 py-2 rounded-lg border border-zinc-300 bg-white text-xs dark:border-zinc-850 dark:bg-zinc-900"
              />
            </div>
          </aside>

          {/* Central Workspace Area */}
          <div className="flex-1 flex flex-col bg-zinc-100 dark:bg-zinc-950 overflow-hidden relative">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
                <p className="text-sm font-bold text-zinc-500 animate-pulse">Rendering PDF pages previews...</p>
              </div>
            ) : viewMode === "grid" ? (
              // Organizer Grid View
              <div className="flex-1 overflow-y-auto p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Organizer Grid ({pdfPages.filter(p => !p.excluded).length} pages active)</h3>
                  <button
                    onClick={() => setViewMode("edit")}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-1.5 text-xs font-bold text-purple-600 flex items-center gap-1.5 hover:shadow-sm"
                  >
                    <EyeIcon className="h-4 w-4" />
                    Stamps & Editor View
                  </button>
                </div>

                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="pdf-pages-droppable" direction="horizontal">
                    {(provided) => (
                      <div 
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
                      >
                        {pdfPages.map((page, index) => (
                          <Draggable key={page.id} draggableId={page.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  "border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 p-3 shadow-sm hover:shadow-md transition-all relative flex flex-col group",
                                  page.excluded ? "opacity-40 select-none border-red-500/20" : "",
                                  snapshot.isDragging ? "ring-2 ring-purple-500 border-transparent shadow-xl" : ""
                                )}
                              >
                                {/* Excluded Overlay Stamp */}
                                {page.excluded && (
                                  <div className="absolute inset-0 bg-red-500/5 dark:bg-red-950/10 rounded-2xl z-10 flex items-center justify-center">
                                    <span className="bg-red-600 text-white font-extrabold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded shadow-sm">Excluded</span>
                                  </div>
                                )}

                                {/* Page Index Indicator Badge */}
                                <div className="absolute top-2 left-2 h-6 w-6 rounded-full bg-zinc-900/60 backdrop-blur-sm text-white text-[10px] font-extrabold flex items-center justify-center z-10">
                                  {index + 1}
                                </div>

                                {/* Action Buttons overlay */}
                                <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => rotatePage(page.id, "cw")}
                                    className="p-1 rounded bg-zinc-900/60 backdrop-blur-sm text-white hover:bg-zinc-900"
                                    title="Rotate 90deg"
                                  >
                                    <ArrowPathIcon className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => toggleExcludePage(page.id)}
                                    className={cn(
                                      "p-1 rounded backdrop-blur-sm text-white",
                                      page.excluded ? "bg-green-600 hover:bg-green-700" : "bg-red-600/70 hover:bg-red-600"
                                    )}
                                    title={page.excluded ? "Include page" : "Exclude page"}
                                  >
                                    {page.excluded ? <CheckIcon className="h-3 w-3" /> : <TrashIcon className="h-3 w-3" />}
                                  </button>
                                </div>

                                {/* Thumbnail wrapper */}
                                <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 rounded-xl overflow-hidden aspect-[3/4] flex items-center justify-center">
                                  <img 
                                    src={page.thumbnail} 
                                    alt={`Page ${index + 1}`} 
                                    style={{ transform: `rotate(${page.rotation}deg)` }}
                                    className="max-w-full max-h-full object-contain transition-transform" 
                                  />
                                </div>

                                {/* Page description footer */}
                                <div className="mt-2 text-center text-[10px] font-bold text-zinc-400">
                                  Page {page.originalIndex + 1} ({page.rotation}°)
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            ) : (
              // Single Page Editor View (Stamps, Draggables, and Signature Stamps placement)
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Horizontal Navigation Sub-header */}
                <div className="h-12 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setViewMode("grid")}
                      className="text-xs font-bold text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
                    >
                      <ArrowUturnLeftIcon className="h-3.5 w-3.5" />
                      Back to Grid
                    </button>
                    <div className="h-3 w-px bg-zinc-200 dark:bg-zinc-800" />
                    <span className="text-xs text-zinc-400">Page {pdfPages.findIndex(p => p.id === activePageId) + 1} of {pdfPages.length}</span>
                  </div>

                  <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-850 p-0.5 rounded-lg">
                    {pdfPages.map((p, idx) => (
                      <button
                        key={p.id}
                        onClick={() => setActivePageId(p.id)}
                        className={cn(
                          "h-6 w-6 text-[10px] font-extrabold rounded",
                          activePageId === p.id 
                            ? "bg-white dark:bg-zinc-900 text-purple-600 shadow-sm" 
                            : "text-zinc-450 hover:bg-zinc-200"
                        )}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Core Editor viewport */}
                <div className="flex-1 flex items-center justify-center p-8 overflow-auto relative">
                  {activePage ? (
                    <div 
                      id="editor-page-container"
                      className="relative bg-white shadow-xl dark:bg-zinc-900 flex items-center justify-center max-h-full aspect-[3/4]"
                      style={{ height: "80%" }}
                    >
                      <img 
                        src={activePage.thumbnail} 
                        alt="Active Page Editor" 
                        style={{ transform: `rotate(${activePage.rotation}deg)` }}
                        className="max-h-full max-w-full object-contain pointer-events-none select-none" 
                      />

                      {/* Signature Stamps absolute placement overlay layer */}
                      <div 
                        className="absolute inset-0 z-10"
                        id="stamp-canvas-boundaries"
                      >
                        {signatures.filter(s => s.pageId === activePageId).map((stamp) => (
                          <div
                            key={stamp.id}
                            style={{ 
                              left: `${stamp.x}%`, 
                              top: `${stamp.y}%`,
                              width: `${stamp.width}px`,
                              height: `${stamp.height}px`
                            }}
                            className="absolute border border-purple-500 bg-purple-500/10 cursor-move group select-none flex items-center justify-center"
                            onMouseDown={(e) => handleStampMouseDown(stamp.id, e)}
                            onTouchStart={(e) => handleStampTouchStart(stamp.id, e)}
                          >
                            <img src={stamp.base64Data} alt="Stamper" className="h-full w-full object-contain pointer-events-none select-none dark:invert" />
                            
                            {/* Action Handles */}
                            <button
                              onClick={() => removeStamp(stamp.id)}
                              className="absolute -top-2 -right-2 h-5 w-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow z-20"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-zinc-400">Select a page to edit or stamp signatures.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Signature Pad modal popover */}
      {showSignaturePad && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="text-base font-extrabold">Draw Digital Signature</h3>
              <button 
                onClick={() => setShowSignaturePad(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 bg-zinc-50 dark:bg-zinc-950 flex justify-center">
              <canvas
                ref={sigCanvasRef}
                width={400}
                height={200}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl cursor-crosshair touch-none"
              />
            </div>

            <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-between gap-3">
              <button
                onClick={clearCanvas}
                className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Clear Pad
              </button>
              <button
                onClick={saveSignature}
                className="px-5 py-2.5 rounded-xl bg-purple-650 text-white text-xs font-bold hover:bg-purple-700 shadow-md active:scale-98"
              >
                Save Template
              </button>
            </div>
          </motion.div>
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

export default function DocFlowPDFPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 gap-4 font-sans">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
        <p className="text-xs font-bold text-zinc-500 animate-pulse">Loading DocFlow PDF Studio...</p>
      </div>
    }>
      <DocFlowPDFContent />
    </Suspense>
  );
}
