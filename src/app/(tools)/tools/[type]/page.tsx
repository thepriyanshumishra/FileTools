"use client";

import { use, useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { ArrowUpTrayIcon, InformationCircleIcon, LightBulbIcon, StarIcon } from "@heroicons/react/24/outline";
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
import { ToastContainer } from "@/components/ui/toast";
import { trackEvent } from "@/lib/utils/analytics";
import { useFavoritesStore } from "@/lib/store/favorites";
import { useHistoryStore } from "@/lib/store/history";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { ToolOptions } from "@/components/ui/tool-options";
import { getToolOptions } from "@/lib/utils/tool-options-config";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface FileTypeToolsPageProps {
  params: Promise<{
    type: string;
  }>;
}

export default function FileTypeToolsPage({ params }: FileTypeToolsPageProps) {
  const { type } = use(params);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [processing, setProcessing] = useState(false);
  const [outputFilename, setOutputFilename] = useState('');
  const [pdfPreviews, setPdfPreviews] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: "success" | "error" }>>([]);
  const [showInstructions, setShowInstructions] = useState(false);
  const [toolOptions, setToolOptions] = useState<Record<string, string | number | boolean>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const { toggleFavorite, isFavorite } = useFavoritesStore();
  const { addToHistory } = useHistoryStore();

  useEffect(() => {
    if (selectedTool) {
      trackEvent({ tool: selectedTool, action: 'view' });
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

  // Find the file type configuration
  const fileType = fileCategories
    .flatMap((category) => category.types)
    .find((t) => t.extension === type);

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
      const result = await processTool({
        toolName: selectedTool,
        files: files as File[],
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
          fileName: file.name,
          fileType: fileType?.extension || 'unknown',
          toolName: selectedTool,
          fileSize: file.size,
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

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen">
      <Link
        href="/"
        className="glass inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-lg text-sm font-medium hover:scale-105 transition-transform"
      >
        ← Back to Home
      </Link>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          {fileType.name} Tools
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          {fileType.description}
        </p>
      </motion.div>

      {showSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="glass rounded-2xl p-12">
            <div className="mb-6">
              <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">✓</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">Download Complete!</h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Your file has been processed and downloaded successfully.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setShowSuccess(false);
                  setFiles([]);
                  setOutputFilename('');
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                {selectedTool?.includes('Merge') ? `Merge More ${fileType.name}s` : `Process Another ${fileType.name}`}
              </button>
              <button
                onClick={() => setSelectedTool(null)}
                className="px-6 py-3 border-2 border-zinc-300 dark:border-zinc-700 rounded-lg font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                Choose Different Tool
              </button>
              <Link
                href="/"
                className="px-6 py-3 border-2 border-zinc-300 dark:border-zinc-700 rounded-lg font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all inline-flex items-center justify-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </motion.div>
      ) : !selectedTool ? (
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
                "glass hover-card relative overflow-hidden rounded-2xl p-6 text-left transition-all cursor-pointer",
                tool.status === 'maintenance' && "opacity-60 cursor-not-allowed"
              )}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 ${fileType.color} opacity-10 blur-2xl rounded-full -mr-12 -mt-12`} />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold flex-1">{tool.name}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(type, tool.name);
                      }}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      {isFavorite(type, tool.name) ? (
                        <StarIconSolid className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <StarIcon className="h-5 w-5 text-zinc-400 hover:text-yellow-500" />
                      )}
                    </button>
                    <span className={cn(
                      "text-xs px-3 py-1 rounded-full font-semibold",
                      tool.status === 'working' 
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    )}>
                      {tool.status === 'working' ? '✓ Ready' : '⚠ Soon'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-auto max-w-3xl"
        >
          <button
            onClick={() => setSelectedTool(null)}
            className="glass inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-lg text-sm font-medium hover:scale-105 transition-transform"
          >
            ← Back to tools
          </button>

          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="glass rounded-2xl p-8 mb-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedTool}</h2>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {fileType.tools.find(t => t.name === selectedTool)?.description}
                </p>
              </div>
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="glass rounded-lg p-2 hover:scale-110 transition-transform"
              >
                <InformationCircleIcon className="h-6 w-6 text-purple-500" />
              </button>
            </div>

            <AnimatePresence>
              {showInstructions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4">
                    <h3 className="mb-3 flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-100">
                      <InformationCircleIcon className="h-5 w-5" />
                      How to use
                    </h3>
                    <ol className="mb-4 space-y-2 text-sm text-blue-800 dark:text-blue-200">
                      {getToolInstructions(selectedTool).steps.map((step, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="font-bold">{i + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                    <h4 className="mb-2 flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-100">
                      <LightBulbIcon className="h-5 w-5" />
                      Tips
                    </h4>
                    <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
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

            <div
              {...getRootProps()}
              className={cn(
                "glass border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all",
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
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-lg font-medium text-purple-600 dark:text-purple-400"
                >
                  Drop the files here...
                </motion.p>
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
          </motion.div>

          {/* Tool Options - Show after upload zone */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <ToolOptions
              toolName={selectedTool}
              options={getToolOptions(selectedTool)}
              values={toolOptions}
              onChange={handleOptionChange}
            />
          </motion.div>

          {files.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {requiresMultiple && files.length > 1 && (
                <div className="glass rounded-xl p-4 mb-4">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                    <span className="text-lg">↕️</span>
                    Drag cards to reorder them for merging
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
                                "glass rounded-xl overflow-hidden relative",
                                snapshot.isDragging && "shadow-2xl scale-105 z-50 opacity-90",
                                requiresMultiple && !processing && "cursor-grab active:cursor-grabbing hover:shadow-lg",
                                !requiresMultiple && "cursor-default"
                              )}
                            >
                              {requiresMultiple && (
                                <div className="absolute top-2 left-2 z-10">
                                  <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
                                    {index + 1}
                                  </div>
                                </div>
                              )}
                              {requiresMultiple && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFiles(prev => prev.filter((_, i) => i !== index));
                                  }}
                                  className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                                >
                                  ✕
                                </button>
                              )}
                              
                              <div className="w-full h-32">
                                {getFilePreview(file)}
                              </div>
                              
                              <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-semibold text-sm truncate flex-1">{file.name}</p>
                                  {file.status === 'processing' && (
                                    <span className="ml-2 h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                                  )}
                                  {file.status === 'success' && (
                                    <span className="ml-2 text-green-500">✓</span>
                                  )}
                                  {file.status === 'error' && (
                                    <span className="ml-2 text-red-500">✕</span>
                                  )}
                                </div>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
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

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-xl p-6"
              >
                <label className="block text-sm font-medium mb-2">
                  Output filename (optional)
                </label>
                <input
                  type="text"
                  value={outputFilename}
                  onChange={(e) => setOutputFilename(e.target.value)}
                  placeholder={`output.${fileType?.extension}`}
                  className="w-full px-4 py-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleProcess}
                disabled={processing}
                className={cn(
                  "w-full rounded-xl px-6 py-4 font-bold text-lg transition-all",
                  processing
                    ? "bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed opacity-50"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/50"
                )}
              >
                {processing ? "Processing..." : "Process Files"}
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      )}
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </main>
  );
}
