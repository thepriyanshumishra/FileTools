"use client";

import { use, useCallback, useState, useEffect, Suspense, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { saveDraftData, getDraftData } from "@/lib/utils/db";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { ArrowUpTrayIcon, InformationCircleIcon, LightBulbIcon, StarIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import * as pdfjsLib from 'pdfjs-dist';
import { fileCategories } from "@/lib/utils/file-types";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/loading";
import { validateFile } from "@/lib/utils/file-conversion";

interface FileWithPreview extends File {
  preview?: string;
  progress?: number;
  status?: "pending" | "processing" | "success" | "error";
}
import { processTool, downloadBlob } from "@/lib/utils/tool-processor";
import { getToolInstructions } from "@/lib/utils/tool-instructions";
import { trackEvent } from "@/lib/utils/analytics";
import { useFavoritesStore } from "@/lib/store/favorites";
import { useHistoryStore } from "@/lib/store/history";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { ToolOptions } from "@/components/ui/tool-options";
import { getToolOptions } from "@/lib/utils/tool-options-config";
import { ImageCropper } from "@/components/ui/image-cropper";
import { useFileTransferStore } from "@/lib/store/file-transfer";
import { xlsxToGridData } from "@/lib/utils/document-tools";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface FileTypeToolsPageProps {
  params: Promise<{
    type: string;
  }>;
}

function FileTypeToolsPageContent({ params }: FileTypeToolsPageProps) {
  const { type } = use(params);
  
  const fileType = fileCategories
    .flatMap((category) => category.types)
    .find((t) => t.extension === type.toLowerCase());

  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [processing, setProcessing] = useState(false);
  const [outputFilename, setOutputFilename] = useState('');
  const [pdfPreviews, setPdfPreviews] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: "success" | "error" }>>([]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [toolOptions, setToolOptions] = useState<Record<string, string | number | boolean>>({});

  // Dedicated PDF workspace states
  const [allPagesPreviews, setAllPagesPreviews] = useState<string[]>([]);
  const [allPagesLoading, setAllPagesLoading] = useState<boolean>(false);
  const [pdfPassword, setPdfPassword] = useState("");
  const [pdfPasswordConfirm, setPdfPasswordConfirm] = useState("");
  const [pdfWatermarkText, setPdfWatermarkText] = useState("WATERMARK");
  const [pdfWatermarkOpacity, setPdfWatermarkOpacity] = useState(0.4);
  const [pdfWatermarkRotation, setPdfWatermarkRotation] = useState(45);
  const [pdfWatermarkColor, setPdfWatermarkColor] = useState("#ff0000");
  const [pdfCompressionPreset, setPdfCompressionPreset] = useState<"basic" | "high" | "low">("basic");
  const [pdfRotateDegrees, setPdfRotateDegrees] = useState<Record<number, number>>({});
  const [pdfDeletedPageIndices, setPdfDeletedPageIndices] = useState<Set<number>>(new Set());
  const [pdfActivePageOrder, setPdfActivePageOrder] = useState<number[]>([]);
  const [pdfPageRanges, setPdfPageRanges] = useState("1-3, 5");

  const [showSuccess, setShowSuccess] = useState(false);
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { addToHistory } = useHistoryStore();
  const { pendingFiles, clearPendingFiles } = useFileTransferStore();

  const searchParams = useSearchParams();
  const draftId = searchParams.get('draftId');
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const isRestoringDraft = useRef(false);

  // 1. Restore state from draftId search parameter on mount
  useEffect(() => {
    if (!draftId) return;
    
    const loadDraft = async () => {
      isRestoringDraft.current = true;
      try {
        const draft = await getDraftData(draftId);
        if (draft && draft.editorState) {
          const state = draft.editorState;
          
          // Reconstruct File from base64 string
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
          const file = new File([blob], state.fileName, { type: blob.type }) as FileWithPreview;
          file.preview = URL.createObjectURL(file);
          file.progress = 0;
          file.status = 'pending';
          
          setFiles([file]);
          setSelectedTool(state.selectedTool);
          setToolOptions(state.toolOptions || {});
          setOutputFilename(state.outputFilename || "");
          setPdfRotateDegrees(state.pdfRotateDegrees || {});
          setPdfDeletedPageIndices(new Set(state.pdfDeletedPageIndices || []));
          setPdfPageRanges(state.pdfPageRanges || "1-3, 5");
          setActiveDraftId(draftId);
        }
      } catch (err) {
        console.error("Failed to restore draft:", err);
      } finally {
        isRestoringDraft.current = false;
      }
    };
    
    loadDraft();
  }, [draftId]);

  // 2. Auto-save initial upload draft when a file is first uploaded and no activeDraftId exists
  useEffect(() => {
    if (files.length === 0 || !fileType || isRestoringDraft.current || activeDraftId) {
      return;
    }
    
    const file = files[0];
    const newDraftId = `draft_tool_${Date.now()}`;
    
    const saveNewFileDraft = async () => {
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = reader.result as string;
          const editorState = {
            fileName: file.name,
            fileType: fileType.extension,
            selectedTool,
            toolOptions,
            outputFilename,
            pdfRotateDegrees,
            pdfDeletedPageIndices: Array.from(pdfDeletedPageIndices),
            pdfPageRanges
          };
          
          await saveDraftData(newDraftId, base64Data, editorState);
          setActiveDraftId(newDraftId);
          
          // Add draft item to Processing History list
          addToHistory({
            id: newDraftId,
            fileName: file.name,
            fileType: fileType.extension,
            toolName: selectedTool || "File Tool",
            fileSize: file.size,
            status: "draft"
          });
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error("Failed to save new upload draft:", err);
      }
    };
    
    saveNewFileDraft();
  }, [files, activeDraftId, fileType, selectedTool, toolOptions, outputFilename, pdfRotateDegrees, pdfDeletedPageIndices, pdfPageRanges, addToHistory]);

  // 3. Debounced auto-saving of parameters when user tweaks options
  useEffect(() => {
    if (!activeDraftId || files.length === 0 || isRestoringDraft.current) return;
    const file = files[0];
    
    const updateDraftSettings = async () => {
      try {
        const draft = await getDraftData(activeDraftId);
        if (draft) {
          draft.editorState = {
            fileName: file.name,
            fileType: fileType?.extension || 'unknown',
            selectedTool,
            toolOptions,
            outputFilename,
            pdfRotateDegrees,
            pdfDeletedPageIndices: Array.from(pdfDeletedPageIndices),
            pdfPageRanges
          };
          await saveDraftData(activeDraftId, draft.base64Data, draft.editorState);
        }
      } catch (err) {
        console.error("Auto-save settings error:", err);
      }
    };
    
    const timer = setTimeout(updateDraftSettings, 1000);
    return () => clearTimeout(timer);
  }, [selectedTool, toolOptions, outputFilename, pdfRotateDegrees, pdfDeletedPageIndices, pdfPageRanges, activeDraftId, files, fileType]);

  const [excelData, setExcelData] = useState<{ sheetNames: string[]; sheets: Record<string, any[][]> } | null>(null);
  const [activeSheet, setActiveSheet] = useState<string>('');


  useEffect(() => {
    const loadAllPages = async () => {
      if (files.length > 0 && fileType?.extension === 'pdf' && 
          ["Organize Pages", "Remove Pages", "Split PDF", "Rotate Pages"].includes(selectedTool || "")) {
        setAllPagesLoading(true);
        setAllPagesPreviews([]);
        setPdfDeletedPageIndices(new Set());
        setPdfRotateDegrees({});
        try {
          const file = files[0];
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          const numPages = pdf.numPages;
          const urls: string[] = [];
          
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
              urls.push(canvas.toDataURL());
            }
          }
          setAllPagesPreviews(urls);
          setPdfActivePageOrder(Array.from({ length: numPages }, (_, i) => i));
        } catch (error) {
          console.error("Error loading PDF pages previews:", error);
        } finally {
          setAllPagesLoading(false);
        }
      } else {
        setAllPagesPreviews([]);
      }
    };
    loadAllPages();
  }, [files, selectedTool, fileType]);

  useEffect(() => {
    async function loadExcelData() {
      if (files.length > 0 && selectedTool === "Preview Sheet" && files[0].name.toLowerCase().endsWith('.xlsx')) {
        try {
          const data = await xlsxToGridData(files[0]);
          setExcelData(data);
          if (data.sheetNames.length > 0) {
            setActiveSheet(data.sheetNames[0]);
          }
        } catch (err) {
          console.error("Failed to parse excel data:", err);
          setExcelData(null);
        }
      } else {
        setExcelData(null);
        setActiveSheet('');
      }
    }
    loadExcelData();
  }, [files, selectedTool]);

  useEffect(() => {
    if (pendingFiles.length > 0) {
      // Find the file category and extension config first
      const extension = type.toLowerCase();
      const validFiles = pendingFiles.filter(f => f.name.toLowerCase().endsWith(`.${extension}`));
      if (validFiles.length > 0) {
        const newFiles = validFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
            progress: 0,
            status: "pending" as const,
          })
        );
        setFiles(newFiles);
        clearPendingFiles();
      }
    }
  }, [pendingFiles, type]);

  useEffect(() => {
    if (selectedTool) {
      trackEvent({ tool: selectedTool, action: 'view' });
      const optionsList = getToolOptions(selectedTool);
      const defaults: Record<string, string | number | boolean> = {};
      optionsList.forEach(opt => {
        defaults[opt.id] = opt.defaultValue;
      });
      setToolOptions(defaults);
    } else {
      setToolOptions({});
    }
  }, [selectedTool]);

  const handleOptionChange = (id: string, value: string | number | boolean) => {
    setToolOptions(prev => ({ ...prev, [id]: value }));
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onUpload: () => {
      if (selectedTool) {
        document.querySelector('input[type="file"]')?.dispatchEvent(new MouseEvent('click'));
      }
    },
    onProcess: () => {
      if (selectedTool && files.length > 0 && !processing) {
        handleProcess();
      }
    },
    onBack: () => {
      if (selectedTool) {
        setSelectedTool(null);
      }
    },
  });

  const addToast = (message: string, type: "success" | "error") => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    const loadPdfPreviews = async () => {
      for (const file of files) {
        if (file.type === 'application/pdf' && !pdfPreviews[file.name]) {
          try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const page = await pdf.getPage(1);
            const scale = 0.5;
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            if (!context) continue;
            
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            await page.render({ 
              canvasContext: context, 
              viewport: viewport,
              canvas: canvas
            }).promise;
            
            setPdfPreviews(prev => ({ ...prev, [file.name]: canvas.toDataURL() }));
          } catch (error) {
            console.error('Error rendering PDF preview:', error);
            setPdfPreviews(prev => ({ ...prev, [file.name]: 'error' }));
          }
        }
      }
    };
    
    if (files.length > 0) {
      loadPdfPreviews();
    }
  }, [files, pdfPreviews]);

  const onDragEnd = (result: { destination?: { index: number } | null; source: { index: number } }) => {
    if (!result.destination) return;
    const items = Array.from(files);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFiles(items);
  };

  const getFilePreview = (file: FileWithPreview) => {
    if (file.type.startsWith('image/')) {
      return <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />;
    } else if (file.type === 'application/pdf') {
      const preview = pdfPreviews[file.name];
      if (preview && preview !== 'error') {
        return <img src={preview} alt={file.name} className="w-full h-full object-cover" />;
      } else if (preview === 'error') {
        return <div className="w-full h-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-4xl">📕</div>;
      }
      return <div className="w-full h-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <div className="animate-pulse text-sm font-medium text-red-600">Loading...</div>
      </div>;
    } else if (file.type.startsWith('video/')) {
      return <div className="w-full h-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-4xl">🎬</div>;
    } else if (file.type.startsWith('audio/')) {
      return <div className="w-full h-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-4xl">🎵</div>;
    }
    return <div className="w-full h-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-4xl">📄</div>;
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter((file) => !validateFile(file));
    const newFiles = validFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        progress: 0,
        status: "pending" as const,
      })
    );
    
    // Check if tool requires multiple files
    const multipleFilesTools = ['Merge PDFs', 'Merge Audio', 'Merge Videos'];
    const requiresMultiple = selectedTool && multipleFilesTools.includes(selectedTool);
    
    if (requiresMultiple) {
      setFiles(prev => [...prev, ...newFiles]);
    } else {
      setFiles(newFiles);
    }
  }, [selectedTool]);



  const multipleFilesTools = ['Merge PDFs', 'Merge Audio', 'Merge Videos'];
  const requiresMultiple = !!(selectedTool && multipleFilesTools.includes(selectedTool));

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: requiresMultiple,
    accept: fileType
      ? {
          [`${fileType.extension}/*`]: [`.${fileType.extension}`],
        }
      : undefined,
  });



  if (!fileType) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-center text-2xl">File type not found</h1>
      </div>
    );
  }

  const handleProcess = async () => {
    if (!selectedTool || files.length === 0) return;
    
    // Check if tool is disabled in admin settings
    if (typeof window !== 'undefined') {
      try {
        const settings = localStorage.getItem('admin-settings');
        if (settings) {
          const parsed = JSON.parse(settings);
          const toolId = `${type}-${selectedTool}`;
          if (parsed.state?.enabledTools?.[toolId] === false) {
            addToast('This tool is currently disabled by administrator', 'error');
            return;
          }
        }
      } catch (e) {
        // ignore
      }
    }
    
    setProcessing(true);
    
    // Set all files to processing state
    setFiles(prev => prev.map(f => ({ ...f, status: 'processing' as const, progress: 0 })));

    try {
      let customParams: Record<string, any> = { ...toolOptions };

      if (fileType?.extension === 'pdf') {
        if (selectedTool === 'Protect PDF') {
          if (pdfPassword !== pdfPasswordConfirm) {
            throw new Error('Passwords do not match');
          }
          if (!pdfPassword) {
            throw new Error('Password cannot be empty');
          }
          customParams.password = pdfPassword;
        } else if (selectedTool === 'Unlock PDF') {
          customParams.password = pdfPassword;
        } else if (selectedTool === 'Add Watermark') {
          customParams.text = pdfWatermarkText;
        } else if (selectedTool === 'Organize Pages') {
          // Send remaining page indices
          const remainingIndices = pdfActivePageOrder.filter(idx => !pdfDeletedPageIndices.has(idx));
          if (remainingIndices.length === 0) {
            throw new Error('Cannot save PDF with zero pages');
          }
          customParams.pageOrder = remainingIndices;
        } else if (selectedTool === 'Remove Pages') {
          customParams.pageIndices = Array.from(pdfDeletedPageIndices);
          if (pdfDeletedPageIndices.size >= allPagesPreviews.length) {
            throw new Error('Cannot delete all pages of the PDF');
          }
        } else if (selectedTool === 'Rotate Pages') {
          const keys = Object.keys(pdfRotateDegrees);
          if (keys.length > 0) {
            customParams.rotation = pdfRotateDegrees[Number(keys[0])] || 90;
          } else {
            customParams.rotation = 90;
          }
        } else if (selectedTool === 'Split PDF') {
          try {
            const ranges: number[][] = [];
            const parts = pdfPageRanges.split(",");
            for (const part of parts) {
              const bounds = part.trim().split("-");
              if (bounds.length === 1) {
                const val = parseInt(bounds[0]) - 1;
                if (!isNaN(val) && val >= 0) {
                  ranges.push([val, val]);
                }
              } else if (bounds.length === 2) {
                const start = parseInt(bounds[0]) - 1;
                const end = parseInt(bounds[1]) - 1;
                if (!isNaN(start) && !isNaN(end) && start >= 0 && end >= start) {
                  ranges.push([start, end]);
                }
              }
            }
            if (ranges.length === 0) {
              throw new Error('Invalid page range format');
            }
            customParams.ranges = ranges;
          } catch (err) {
            throw new Error((err as Error).message || 'Failed to parse split ranges: Use format e.g. "1-3, 5"');
          }
        }
      }

      const result = await processTool({
        toolName: selectedTool,
        files: files as File[],
        params: customParams,
        onProgress: (progress) => {
          setFiles(prev => prev.map(f => ({ ...f, progress })));
        }
      });

      const filename = outputFilename || `output.${fileType?.extension || 'file'}`;

      if (Array.isArray(result)) {
        result.forEach((blob, i) => {
          const name = outputFilename ? `${outputFilename}_${i + 1}.${fileType?.extension}` : `output_${i + 1}.${fileType?.extension || 'file'}`;
          downloadBlob(blob, name);
        });
      } else {
        downloadBlob(result, filename);
      }

      // Set success state
      setFiles(prev => prev.map(f => ({ ...f, status: 'success' as const, progress: 100 })));
      
      // Add to history
      files.forEach(file => {
        addToHistory({
          id: activeDraftId || undefined,
          fileName: file.name,
          fileType: fileType?.extension || 'unknown',
          toolName: selectedTool || 'File Tool',
          fileSize: file.size,
          status: 'exported'
        });
      });
      
      addToast('Processing complete! File(s) downloaded.', 'success');
      
      // Track successful processing
      trackEvent({ 
        tool: selectedTool, 
        action: 'process',
        fileSize: files[0]?.size,
        fileType: fileType?.extension
      });
      
      // Show success page
      setShowSuccess(true);
    } catch (error) {
      console.error('Processing error:', error);
      setFiles(prev => prev.map(f => ({ ...f, status: 'error' as const })));
      trackEvent({ tool: selectedTool, action: 'error' });
      addToast('Error: ' + (error as Error).message, 'error');
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (fileType) {
      document.title = `${fileType.name} Tools - Free Online ${fileType.name} Converter | FileTools`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', `${fileType.description}. Free online ${fileType.name} tools. Process files instantly in your browser.`);
      }
    }
  }, [fileType]);

  return (
    <main className="relative min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Radial Spotlights and Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[50%] h-[30%] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="mx-auto max-w-7xl">
        {/* Upper Breadcrumb Navigation bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-purple-600 transition-colors"
          >
            ← Back to Home
          </Link>
          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
            <span>Category: {fileType.name}</span>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <span className="text-purple-600 dark:text-purple-400">.{fileType.extension}</span>
          </div>
        </div>

        {showSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-2xl text-center animate-scaleIn"
          >
            <div className="glass rounded-3xl p-12 border border-zinc-200/50 dark:border-zinc-900/50">
              <div className="mb-6">
                <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mb-4 border border-green-200 dark:border-green-800">
                  <span className="text-4xl text-green-600 dark:text-green-400">✓</span>
                </div>
                <h2 className="text-3xl font-extrabold mb-2">Process Complete!</h2>
                <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                  Your files have been processed and downloaded successfully.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    setShowSuccess(false);
                    setFiles([]);
                    setOutputFilename('');
                    setSelectedTool(null);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/20 transition-all scale-102 hover:scale-105 active:scale-98"
                >
                  Process Another File
                </button>
                <Link
                  href="/"
                  className="px-6 py-3 border border-zinc-300 dark:border-zinc-700 rounded-xl font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all inline-flex items-center justify-center"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </motion.div>
        ) : !selectedTool ? (
          /* STEP 2: SHOW GRID OF ACTION CARDS */
          <div className="space-y-8 animate-fadeIn">
            {/* Page Header */}
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h1 className="text-4xl font-extrabold mb-3 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {fileType.name} Tools
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400">
                {fileType.description}
              </p>
            </div>

            {/* Active Upload Banner */}
            {files.length > 0 && (
              <div className="glass rounded-3xl p-6 border border-purple-500/20 bg-purple-500/5 flex items-center justify-between flex-wrap gap-4 shadow-lg shadow-purple-500/5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl">
                    <DocumentTextIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">File Loaded: {files[0].name}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {(files[0].size / 1024 / 1024).toFixed(2)} MB • Ready to process. Select an action below.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFiles([])}
                  className="px-4 py-2 text-xs font-semibold text-red-600 hover:text-red-500 hover:bg-red-500/5 rounded-xl border border-red-500/10 transition-colors"
                >
                  Clear File
                </button>
              </div>
            )}

            {/* Cards Grid / Preview Split Layout */}
            {files.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Column: PDF/File Preview Card */}
                <div className="lg:col-span-1 glass rounded-3xl p-6 border border-zinc-200/50 dark:border-zinc-900/50 bg-white dark:bg-zinc-950 sticky top-6 shadow-sm flex flex-col items-center">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 w-full text-left">Document Preview</h3>
                  <div className="bg-zinc-50 dark:bg-zinc-900/20 rounded-2xl p-4 flex items-center justify-center border border-zinc-200/50 dark:border-zinc-800/30 w-full aspect-[3/4] overflow-hidden relative shadow-inner">
                    {getFilePreview(files[0])}
                  </div>
                  <div className="mt-4 w-full space-y-1">
                    <p className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200 truncate w-full text-center">{files[0].name}</p>
                    <p className="text-xs text-zinc-500 w-full text-center">{(files[0].size / 1024 / 1024).toFixed(2)} MB • {fileType.name} Document</p>
                  </div>
                </div>

                {/* Right Column: Actions Grid */}
                <div className="lg:col-span-2 grid gap-6 sm:grid-cols-2">
                  {fileType.tools.map((tool, index) => (
                    <motion.div
                      key={tool.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => tool.status !== 'maintenance' && setSelectedTool(tool.name)}
                      className={cn(
                        "glass hover-card relative overflow-hidden rounded-3xl p-6 text-left transition-all cursor-pointer border border-zinc-200/60 dark:border-zinc-900/60",
                        tool.status === 'maintenance' && "opacity-60 cursor-not-allowed"
                      )}
                    >
                      <div className={`absolute top-0 right-0 w-24 h-24 ${fileType.color} opacity-10 blur-2xl rounded-full -mr-12 -mt-12`} />
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-xl font-bold flex-1 pr-2">{tool.name}</h3>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(type, tool.name);
                              }}
                              className="p-1 hover:scale-110 transition-transform text-yellow-500"
                            >
                              {isFavorite(type, tool.name) ? (
                                <StarIconSolid className="h-5 w-5" />
                              ) : (
                                <StarIcon className="h-5 w-5 text-zinc-400" />
                              )}
                            </button>
                            <span className={cn(
                              "text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider",
                              tool.status === 'working' 
                                ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                                : "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400"
                            )}>
                              {tool.status === 'working' ? 'Ready' : 'Soon'}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          {tool.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {fileType.tools.map((tool, index) => (
                  <motion.div
                    key={tool.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => tool.status !== 'maintenance' && setSelectedTool(tool.name)}
                    className={cn(
                      "glass hover-card relative overflow-hidden rounded-3xl p-6 text-left transition-all cursor-pointer border border-zinc-200/60 dark:border-zinc-900/60",
                      tool.status === 'maintenance' && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    <div className={`absolute top-0 right-0 w-24 h-24 ${fileType.color} opacity-10 blur-2xl rounded-full -mr-12 -mt-12`} />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-xl font-bold flex-1 pr-2">{tool.name}</h3>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(type, tool.name);
                            }}
                            className="p-1 hover:scale-110 transition-transform text-yellow-500"
                          >
                            {isFavorite(type, tool.name) ? (
                              <StarIconSolid className="h-5 w-5" />
                            ) : (
                              <StarIcon className="h-5 w-5 text-zinc-400" />
                            )}
                          </button>
                          <span className={cn(
                            "text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider",
                            tool.status === 'working' 
                              ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                              : "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400"
                          )}>
                            {tool.status === 'working' ? 'Ready' : 'Soon'}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Dropzone area if files list is empty */}
            {files.length === 0 && (
              <div className="max-w-2xl mx-auto pt-6">
                <div
                  {...getRootProps()}
                  className={cn(
                    "glass border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all",
                    isDragActive
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/10 scale-105 shadow-lg shadow-purple-500/25"
                      : "border-zinc-300 dark:border-zinc-800 hover:border-purple-400 dark:hover:border-purple-600"
                  )}
                >
                  <input {...getInputProps()} />
                  <ArrowUpTrayIcon className="mx-auto mb-4 h-14 w-14 text-purple-500" />
                  <p className="text-lg font-bold mb-2">
                    Drag & drop files to select actions later
                  </p>
                  <p className="text-xs text-zinc-500">
                    Accepts .{fileType.extension} files
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* STEP 3: SHOW WORKSPACE PANEL (SINGLE-COLUMN WIDE LAYOUT) */
          <div className="max-w-6xl mx-auto space-y-6">
            <button
              onClick={() => {
                setSelectedTool(null);
                setFiles([]);
              }}
              className="text-xs font-extrabold text-zinc-500 hover:text-purple-650 hover:bg-zinc-550/10 dark:hover:bg-zinc-900/60 px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800"
            >
              ← Back to Actions
            </button>

            <div className="space-y-6">
              <motion.div
                key={selectedTool}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Active Tool Header card */}
                <div className="glass rounded-3xl p-6 md:p-8 border border-zinc-200/50 dark:border-zinc-900/50 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-extrabold">{selectedTool}</h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm md:text-base leading-relaxed">
                      {fileType.tools.find(t => t.name === selectedTool)?.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFavorite(type, selectedTool)}
                      className="glass p-2.5 rounded-xl hover:scale-110 transition-all text-yellow-500"
                      title="Add to Favorites"
                    >
                      {isFavorite(type, selectedTool) ? (
                        <StarIconSolid className="h-5 w-5" />
                      ) : (
                        <StarIcon className="h-5 w-5 text-zinc-400" />
                      )}
                    </button>
                    <button
                      onClick={() => setShowInstructions(!showInstructions)}
                      className="glass p-2.5 rounded-xl hover:scale-110 transition-all text-purple-600 dark:text-purple-400"
                      title="View Instructions"
                    >
                      <InformationCircleIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Collapsible Info/Instructions Box */}
                <AnimatePresence>
                  {showInstructions && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 p-5 border border-blue-200/30 dark:border-blue-800/10">
                        <h3 className="mb-3 flex items-center gap-2 font-bold text-blue-900 dark:text-blue-200">
                          <InformationCircleIcon className="h-5 w-5" />
                          How to use
                        </h3>
                        <ol className="mb-4 space-y-2 text-sm text-blue-800 dark:text-blue-300">
                          {getToolInstructions(selectedTool).steps.map((step, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="font-bold">{i + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                        <h4 className="mb-2 flex items-center gap-2 font-bold text-blue-900 dark:text-blue-200">
                          <LightBulbIcon className="h-5 w-5" />
                          Pro Tips
                        </h4>
                        <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
                          {getToolInstructions(selectedTool).tips.map((tip, i) => (
                            <li key={i} className="flex gap-2">
                              <span>•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Main Work Canvas Card */}
                <div className="glass rounded-3xl p-6 md:p-8 border border-zinc-200/50 dark:border-zinc-900/50 space-y-6">
                  {/* File Upload Dropzone (only show if file list is empty) */}
                  {files.length === 0 && (
                    <div
                      {...getRootProps()}
                      className={cn(
                        "glass border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all",
                        isDragActive
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-900/10 scale-105 shadow-lg shadow-purple-500/25"
                          : "border-zinc-300 dark:border-zinc-700 hover:border-purple-400 dark:hover:border-purple-600"
                      )}
                    >
                      <input {...getInputProps()} />
                      <motion.div
                        animate={isDragActive ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ repeat: isDragActive ? Infinity : 0, duration: 1 }}
                      >
                        <ArrowUpTrayIcon className="mx-auto mb-4 h-16 w-16 text-purple-500" />
                      </motion.div>
                      {isDragActive ? (
                        <p className="text-lg font-medium text-purple-600 dark:text-purple-400">
                          Drop the files here...
                        </p>
                      ) : (
                        <>
                          <p className="text-lg font-medium mb-2">
                            Drag & drop {requiresMultiple ? 'files' : 'a file'} here, or click to select
                          </p>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Accepts .{fileType.extension} files {requiresMultiple && '(multiple files allowed)'}
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  {/* Crop tool interactive canvas vs File Previews queue */}
                  {files.length > 0 && (
                    <div className="space-y-6">
                      {selectedTool === "Crop" ? (
                        <div className="glass rounded-2xl p-6 border border-zinc-200/50 dark:border-zinc-900/50">
                          <h3 className="text-lg font-bold mb-4 text-center">Adjust Crop Selection</h3>
                          <ImageCropper
                            file={files[0]}
                            onChange={handleOptionChange}
                          />
                        </div>
                      ) : selectedTool === "Preview Sheet" && excelData ? (
                        <div className="glass rounded-2xl p-6 border border-zinc-200/50 dark:border-zinc-900/50 space-y-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 gap-4">
                            <h3 className="text-lg font-bold">Workbook Preview</h3>
                            <div className="flex gap-2 overflow-x-auto max-w-full pb-1">
                              {excelData.sheetNames.map((sheetName) => (
                                <button
                                  key={sheetName}
                                  onClick={() => setActiveSheet(sheetName)}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all truncate max-w-[150px] whitespace-nowrap",
                                    activeSheet === sheetName
                                      ? "bg-purple-600 text-white shadow-md shadow-purple-500/15"
                                      : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                                  )}
                                >
                                  {sheetName}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div className="overflow-auto max-h-[450px] border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950/20">
                            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-sm text-left">
                              <thead className="bg-zinc-50 dark:bg-zinc-900 sticky top-0 z-10">
                                <tr>
                                  {Array.from({ length: excelData.sheets[activeSheet]?.slice(0, 10).reduce((max, r) => Math.max(max, r.length), 0) || 0 }).map((_, colIndex) => (
                                    <th
                                      key={colIndex}
                                      className="px-4 py-3 font-semibold text-xs text-zinc-500 uppercase tracking-wider border-r border-zinc-200 dark:border-zinc-800"
                                    >
                                      Column {colIndex + 1}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {excelData.sheets[activeSheet]?.slice(0, 100).map((row, rowIndex) => {
                                  const colCount = excelData.sheets[activeSheet]?.slice(0, 10).reduce((max, r) => Math.max(max, r.length), 0) || 0;
                                  return (
                                    <tr key={rowIndex} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30">
                                      {Array.from({ length: colCount }).map((_, cellIndex) => {
                                        const cell = row[cellIndex];
                                        return (
                                          <td
                                            key={cellIndex}
                                            className="px-4 py-3 border-r border-zinc-200 dark:border-zinc-800 truncate max-w-[200px]"
                                          >
                                            {cell !== undefined && cell !== null ? String(cell) : ""}
                                          </td>
                                        );
                                      })}
                                    </tr>
                                  );
                                })}
                                {excelData.sheets[activeSheet] && excelData.sheets[activeSheet].length > 100 && (
                                  <tr>
                                    <td
                                      colSpan={excelData.sheets[activeSheet]?.slice(0, 10).reduce((max, r) => Math.max(max, r.length), 0) || 1}
                                      className="px-4 py-3 text-center text-xs text-zinc-400 font-medium bg-zinc-50 dark:bg-zinc-900/10"
                                    >
                                      Showing top 100 rows. Export to CSV/JSON to view all.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : fileType?.extension === 'pdf' && ["Organize Pages", "Remove Pages", "Rotate Pages"].includes(selectedTool || "") ? (
                        /* DEDICATED PDF PAGE MANAGER WORKSPACE */
                        <div className="glass rounded-2xl p-6 md:p-8 border border-zinc-200/50 dark:border-zinc-900/50 space-y-6">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                            <div>
                              <h3 className="text-lg font-extrabold flex items-center gap-2">📄 Manage PDF Pages</h3>
                              <p className="text-xs text-zinc-500 mt-1">
                                {selectedTool === "Organize Pages" && "Drag/move pages to organize page order. Click 🔄 to rotate or 🗑️ to exclude pages."}
                                {selectedTool === "Remove Pages" && "Exclude pages by clicking the 🗑️ icon. De-selected pages will not be included in the compiled file."}
                                {selectedTool === "Rotate Pages" && "Rotate individual page orientations by clicking the 🔄 icon."}
                              </p>
                            </div>
                            <div className="text-xs font-bold bg-purple-600/10 text-purple-600 px-3.5 py-2 rounded-xl flex-shrink-0 select-none">
                              {pdfActivePageOrder.length - pdfDeletedPageIndices.size} of {allPagesPreviews.length} Pages Active
                            </div>
                          </div>

                          {allPagesLoading ? (
                            <div className="flex flex-col items-center justify-center p-16 text-center">
                              <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-650 border-t-transparent mb-4" />
                              <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-550 animate-pulse">Rendering page previews...</p>
                            </div>
                          ) : allPagesPreviews.length === 0 ? (
                            <div className="p-8 text-center text-zinc-500 text-sm">Failed to render page layouts. Ready to compile.</div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                              {pdfActivePageOrder.map((pageIdx, orderIdx) => {
                                const isDeleted = pdfDeletedPageIndices.has(pageIdx);
                                const rotation = pdfRotateDegrees[pageIdx] || 0;
                                return (
                                  <motion.div
                                    layout
                                    key={pageIdx}
                                    className={cn(
                                      "relative rounded-2xl border bg-white dark:bg-zinc-950 overflow-hidden shadow-sm transition-all p-3 flex flex-col items-center",
                                      isDeleted 
                                        ? "border-red-205 dark:border-red-950/40 bg-red-50/20 dark:bg-red-950/5 opacity-50" 
                                        : "border-zinc-200 dark:border-zinc-850 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-900/60"
                                    )}
                                  >
                                    {/* Rotate indicator overlay if rotated */}
                                    {rotation > 0 && (
                                      <span className="absolute top-2 left-2 z-20 bg-purple-600 text-white rounded-lg px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider select-none shadow">
                                        {rotation}°
                                      </span>
                                    )}

                                    {/* Thumbnail Preview Area */}
                                    <div className="w-full h-36 bg-zinc-50 dark:bg-zinc-900 rounded-lg flex items-center justify-center overflow-hidden relative">
                                      <img 
                                        src={allPagesPreviews[pageIdx]} 
                                        alt={`Page ${pageIdx + 1}`} 
                                        className="max-w-full max-h-full object-contain transition-transform duration-200" 
                                        style={{ transform: `rotate(${rotation}deg)` }}
                                      />
                                      {isDeleted && (
                                        <div className="absolute inset-0 bg-red-600/10 flex items-center justify-center select-none">
                                          <span className="bg-red-500 text-white font-extrabold uppercase text-[9px] px-2.5 py-1 rounded-full shadow tracking-wider">Excluded</span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Footer Label */}
                                    <div className="mt-3.5 w-full flex items-center justify-between px-1 text-xs">
                                      <span className="font-extrabold text-zinc-650 dark:text-zinc-400">Page {pageIdx + 1}</span>
                                      <span className="text-[10px] text-zinc-400 font-bold bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-md">Order {orderIdx + 1}</span>
                                    </div>

                                    {/* Control Options bar */}
                                    <div className="mt-3 flex items-center gap-1 w-full justify-between pt-3 border-t border-zinc-100 dark:border-zinc-850">
                                      <button
                                        onClick={() => {
                                          setPdfRotateDegrees(prev => ({
                                            ...prev,
                                            [pageIdx]: ((prev[pageIdx] || 0) + 90) % 360
                                          }));
                                        }}
                                        className="p-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-650 dark:text-zinc-400 hover:text-purple-600 transition-colors border border-zinc-150 dark:border-zinc-800"
                                        title="Rotate 90°"
                                      >
                                        🔄
                                      </button>
                                      
                                      <div className="flex gap-0.5">
                                        <button
                                          disabled={orderIdx === 0}
                                          onClick={() => {
                                            const newOrder = [...pdfActivePageOrder];
                                            const temp = newOrder[orderIdx];
                                            newOrder[orderIdx] = newOrder[orderIdx - 1];
                                            newOrder[orderIdx - 1] = temp;
                                            setPdfActivePageOrder(newOrder);
                                          }}
                                          className="p-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-650 dark:text-zinc-400 hover:text-purple-650 transition-colors disabled:opacity-30 border border-zinc-150 dark:border-zinc-800"
                                          title="Move Page Left"
                                        >
                                          ◀
                                        </button>
                                        <button
                                          disabled={orderIdx === pdfActivePageOrder.length - 1}
                                          onClick={() => {
                                            const newOrder = [...pdfActivePageOrder];
                                            const temp = newOrder[orderIdx];
                                            newOrder[orderIdx] = newOrder[orderIdx + 1];
                                            newOrder[orderIdx + 1] = temp;
                                            setPdfActivePageOrder(newOrder);
                                          }}
                                          className="p-1.5 rounded-lg bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-650 dark:text-zinc-400 hover:text-purple-650 transition-colors disabled:opacity-30 border border-zinc-150 dark:border-zinc-800"
                                          title="Move Page Right"
                                        >
                                          ▶
                                        </button>
                                      </div>

                                      <button
                                        onClick={() => {
                                          setPdfDeletedPageIndices(prev => {
                                            const next = new Set(prev);
                                            if (next.has(pageIdx)) next.delete(pageIdx);
                                            else next.add(pageIdx);
                                            return next;
                                          });
                                        }}
                                        className={cn(
                                          "p-1.5 rounded-lg text-white transition-colors border",
                                          isDeleted 
                                            ? "bg-green-600 hover:bg-green-700 border-green-700" 
                                            : "bg-red-500 hover:bg-red-650 border-red-650"
                                        )}
                                        title={isDeleted ? "Include Page" : "Exclude Page"}
                                      >
                                        {isDeleted ? "✓" : "🗑️"}
                                      </button>
                                    </div>
                                  </motion.div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : fileType?.extension === 'pdf' && ["Protect PDF", "Unlock PDF", "Compress PDF", "Add Watermark", "Split PDF"].includes(selectedTool || "") ? (
                        /* DEDICATED PDF FORM UTILITIES */
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
                          
                          {/* Left Panel: First page Preview */}
                          <div className="md:col-span-2 flex flex-col items-center justify-center p-6 bg-zinc-50/50 dark:bg-zinc-955/20 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
                            <p className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 mb-4 select-none">Document Preview</p>
                            <div className="relative max-w-full shadow-lg border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-white">
                              {pdfPreviews[files[0].name] ? (
                                <img src={pdfPreviews[files[0].name]} alt="First Page Preview" className="max-h-[320px] object-contain select-none" />
                              ) : (
                                <div className="h-48 w-36 flex items-center justify-center text-red-500 font-extrabold bg-red-50/40 text-sm">Loading Preview...</div>
                              )}
                            </div>
                            <p className="mt-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 select-none truncate max-w-full px-2">{files[0].name}</p>
                          </div>

                          {/* Right Panel: Settings inputs form */}
                          <div className="md:col-span-3 space-y-6">
                            
                            {/* 1. Protect PDF / Unlock PDF Option fields */}
                            {["Protect PDF", "Unlock PDF"].includes(selectedTool || "") && (
                              <div className="bg-zinc-50/50 dark:bg-zinc-955/20 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6">
                                <div>
                                  <h4 className="text-lg font-extrabold flex items-center gap-2">
                                    🔑 {selectedTool === "Protect PDF" ? "Encrypt Document" : "Decrypt Document"}
                                  </h4>
                                  <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 leading-relaxed">
                                    {selectedTool === "Protect PDF" 
                                      ? "Set an access password below to restrict viewing capabilities. Locked PDFs require this key to be opened."
                                      : "Remove security password restrictions. Provide the current file protection password to unlock."}
                                  </p>
                                </div>

                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                                      Password Key
                                    </label>
                                    <input
                                      type="password"
                                      value={pdfPassword}
                                      onChange={(e) => setPdfPassword(e.target.value)}
                                      placeholder="Enter password"
                                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-semibold"
                                    />
                                  </div>

                                  {selectedTool === "Protect PDF" && (
                                    <div>
                                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                                        Confirm Password Key
                                      </label>
                                      <input
                                        type="password"
                                        value={pdfPasswordConfirm}
                                        onChange={(e) => setPdfPasswordConfirm(e.target.value)}
                                        placeholder="Retype password"
                                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-semibold"
                                      />
                                      {pdfPassword !== "" && pdfPasswordConfirm !== "" && pdfPassword !== pdfPasswordConfirm && (
                                        <p className="mt-2 text-xs text-red-500 font-semibold">⚠️ Password confirmation does not match</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* 2. Compress PDF options */}
                            {selectedTool === "Compress PDF" && (
                              <div className="bg-zinc-50/50 dark:bg-zinc-955/20 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6">
                                <div>
                                  <h4 className="text-lg font-extrabold flex items-center gap-2">📦 Compression Levels</h4>
                                  <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 leading-relaxed">
                                    Select the target size optimization preset:
                                  </p>
                                </div>

                                <div className="space-y-4">
                                  {[
                                    { id: "high", title: "Extreme Compression", subtitle: "Low Quality, High Size Reduction", dpi: "72 DPI", desc: "Recommended for fast sharing over email or messaging chats." },
                                    { id: "basic", title: "Recommended Compression", subtitle: "Good Quality, Medium Size Reduction", dpi: "150 DPI", desc: "Best balance of text/image clarity and file size savings (Default)." },
                                    { id: "low", title: "Low Compression", subtitle: "High Quality, Low Size Reduction", dpi: "300 DPI", desc: "Print-ready high-resolution details with minimal compression artifacts." }
                                  ].map((level) => (
                                    <div
                                      key={level.id}
                                      onClick={() => setPdfCompressionPreset(level.id as any)}
                                      className={cn(
                                        "p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 bg-white dark:bg-zinc-950 select-none",
                                        pdfCompressionPreset === level.id
                                          ? "border-purple-600 ring-2 ring-purple-600/15 shadow-sm"
                                          : "border-zinc-200 dark:border-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-800"
                                      )}
                                    >
                                      <div>
                                        <p className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">{level.title}</p>
                                        <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 mt-0.5 uppercase tracking-wide">{level.subtitle}</p>
                                        <p className="text-zinc-500 text-xs mt-2 leading-relaxed">{level.desc}</p>
                                      </div>
                                      <span className="text-[10px] font-extrabold bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-full flex-shrink-0">
                                        {level.dpi}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 3. Add Watermark options */}
                            {selectedTool === "Add Watermark" && (
                              <div className="bg-zinc-50/50 dark:bg-zinc-955/20 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6">
                                <div>
                                  <h4 className="text-lg font-extrabold flex items-center gap-2">✍️ Watermark Details</h4>
                                  <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 leading-relaxed">
                                    Configure text stamp parameters:
                                  </p>
                                </div>

                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                                      Watermark Text
                                    </label>
                                    <input
                                      type="text"
                                      value={pdfWatermarkText}
                                      onChange={(e) => setPdfWatermarkText(e.target.value)}
                                      placeholder="e.g. DRAFT"
                                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-semibold"
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                                        Angle Rotation
                                      </label>
                                      <select
                                        value={pdfWatermarkRotation}
                                        onChange={(e) => setPdfWatermarkRotation(Number(e.target.value))}
                                        className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-xs font-bold focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-600/20 dark:border-zinc-700 dark:bg-zinc-800"
                                      >
                                        <option value={0}>Horizontal (0°)</option>
                                        <option value={45}>Diagonal (45°)</option>
                                        <option value={90}>Vertical (90°)</option>
                                        <option value={-45}>Reverse Diagonal (-45°)</option>
                                      </select>
                                    </div>
                                    
                                    <div>
                                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                                        Stamp Color
                                      </label>
                                      <div className="flex gap-2 items-center h-10">
                                        {["#ff0000", "#000000", "#0000ff", "#00ff00", "#8b5cf6"].map((color) => (
                                          <button
                                            key={color}
                                            onClick={() => setPdfWatermarkColor(color)}
                                            className={cn(
                                              "w-6 h-6 rounded-full border transition-all hover:scale-110",
                                              pdfWatermarkColor === color ? "scale-108 ring-2 ring-purple-600 border-transparent shadow" : "border-zinc-300 dark:border-zinc-850"
                                            )}
                                            style={{ backgroundColor: color }}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* 4. Split PDF options */}
                            {selectedTool === "Split PDF" && (
                              <div className="bg-zinc-50/50 dark:bg-zinc-955/20 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6">
                                <div>
                                  <h4 className="text-lg font-extrabold flex items-center gap-2">✂️ Split Rules</h4>
                                  <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 leading-relaxed">
                                    Set page ranges to carve out:
                                  </p>
                                </div>

                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                                      Page Split Range bounds
                                    </label>
                                    <input
                                      type="text"
                                      value={pdfPageRanges}
                                      onChange={(e) => setPdfPageRanges(e.target.value)}
                                      placeholder="e.g. 1-3, 5"
                                      className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-semibold"
                                    />
                                    <p className="text-[10px] text-zinc-455 dark:text-zinc-500 mt-2 font-bold leading-relaxed">
                                      Separate ranges with commas. Example: "1-3, 5" creates two files: Page 1 to 3, and Page 5.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                          </div>
                        </div>
                      ) : (
                        /* DEFAULT FILES PREVIEWS LIST GRID */
                        <div className="space-y-4">
                          {requiresMultiple && files.length > 1 && (
                            <div className="glass rounded-xl p-4 border border-zinc-200/50 dark:border-zinc-900/50">
                              <p className="text-sm text-zinc-650 dark:text-zinc-400 flex items-center gap-2 font-semibold">
                                  <span className="text-lg">↕️</span>
                                  Drag cards to reorder files for merging
                              </p>
                            </div>
                          )}

                          <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="files" direction="horizontal">
                              {(provided, snapshot) => (
                                <div 
                                  {...provided.droppableProps} 
                                  ref={provided.innerRef}
                                  className={cn(
                                    "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4",
                                    snapshot.isDraggingOver && requiresMultiple && "bg-purple-50/50 dark:bg-purple-900/10 rounded-xl p-3"
                                  )}
                                >
                                  {files.map((file, index) => (
                                    <Draggable 
                                      key={`${file.name}-${file.size}-${index}`}
                                      draggableId={`${file.name}-${file.size}-${index}`}
                                      index={index}
                                      isDragDisabled={!requiresMultiple || processing}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          style={provided.draggableProps.style}
                                          className={cn(
                                            "glass rounded-xl overflow-hidden relative border border-zinc-200 dark:border-zinc-900",
                                            snapshot.isDragging && "shadow-2xl scale-105 z-50 opacity-90",
                                            requiresMultiple && !processing && "cursor-grab active:cursor-grabbing hover:shadow-lg",
                                            !requiresMultiple && "cursor-default"
                                          )}
                                        >
                                          {requiresMultiple && (
                                            <div className="absolute top-2 left-2 z-10">
                                              <div className="bg-purple-650 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow-lg">
                                                {index + 1}
                                              </div>
                                            </div>
                                          )}
                                          {(!processing) && (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setFiles(prev => prev.filter((_, i) => i !== index));
                                              }}
                                              className="absolute top-2 right-2 z-10 bg-red-505 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-650 transition-colors shadow-lg text-xs"
                                            >
                                              ✕
                                            </button>
                                          )}
                                          
                                          <div className="w-full h-32 bg-zinc-50 dark:bg-zinc-950/25">
                                            {getFilePreview(file)}
                                          </div>
                                          
                                          <div className="p-4">
                                            <div className="flex items-center justify-between mb-2 gap-1.5">
                                              <p className="font-bold text-xs truncate flex-1">{file.name}</p>
                                              {file.status === 'processing' && (
                                                <span className="h-2 w-2 animate-pulse rounded-full bg-blue-550" />
                                              )}
                                              {file.status === 'success' && (
                                                <span className="text-green-500 text-xs">✓</span>
                                              )}
                                              {file.status === 'error' && (
                                                <span className="text-red-500 text-xs">✕</span>
                                              )}
                                            </div>
                                            <p className="text-[10px] text-zinc-505 dark:text-zinc-400 mb-2 font-bold">
                                              {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                            {(file.status === 'processing' || file.status === 'success') && (
                                              <ProgressBar progress={file.progress || 0} />
                                            )}
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
                      )}

                      {/* Settings Sliders and Options Panel (Only show if not PDF with custom views and not Crop) */}
                      {selectedTool !== "Crop" && !(fileType?.extension === 'pdf' && ["Organize Pages", "Remove Pages", "Split PDF", "Rotate Pages", "Protect PDF", "Unlock PDF", "Compress PDF", "Add Watermark"].includes(selectedTool || "")) && (
                        <div className="glass rounded-2xl p-6 border border-zinc-200/50 dark:border-zinc-900/50 bg-white dark:bg-zinc-950">
                          <h3 className="text-base font-extrabold mb-4">Adjust Settings</h3>
                          {getToolOptions(selectedTool).length === 0 ? (
                            <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900/20 p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/30">
                              <span className="text-2xl">⚡</span>
                              <div className="text-xs">
                                <p className="font-extrabold text-zinc-850 dark:text-zinc-200">No adjustment parameters required</p>
                                <p className="text-zinc-500 mt-0.5 leading-relaxed">This file tool runs fully automated client-side processing. Ready to compile.</p>
                              </div>
                            </div>
                          ) : (
                            <ToolOptions
                              toolName={selectedTool}
                              options={getToolOptions(selectedTool)}
                              values={toolOptions}
                              onChange={handleOptionChange}
                            />
                          )}
                        </div>
                      )}

                  {/* File Output Actions Footer */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-zinc-50/50 dark:bg-zinc-900/20 p-6 rounded-2xl border border-zinc-200/50 dark:border-zinc-900/50">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                            Output filename (optional)
                          </label>
                          <input
                            type="text"
                            value={outputFilename}
                            onChange={(e) => setOutputFilename(e.target.value)}
                            placeholder={`output.${fileType?.extension}`}
                            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          />
                        </div>
                        <div>
                          <button
                            onClick={handleProcess}
                            disabled={processing}
                            className={cn(
                              "w-full rounded-xl px-6 py-3.5 font-bold text-sm transition-all text-center",
                              processing
                                ? "bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed opacity-50"
                                : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-500/20 hover:scale-102 hover:scale-105 active:scale-98"
                            )}
                          >
                            {processing ? "Processing..." : "Process File"}
                          </button>
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              </motion.div>
            </div>

          </div>
        )}
      </div>

      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 rounded-lg p-4 shadow-lg backdrop-blur-sm animate-slideInRight ${
              toast.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800"
                : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800"
            }`}
          >
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
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

export default function FileTypeToolsPage(props: FileTypeToolsPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
        <p className="text-xs font-bold text-zinc-500 animate-pulse">Loading workspace tools...</p>
      </div>
    }>
      <FileTypeToolsPageContent {...props} />
    </Suspense>
  );
}
