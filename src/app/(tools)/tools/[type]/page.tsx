"use client";

import { use, useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import * as pdfjsLib from 'pdfjs-dist';
import { fileCategories } from "@/lib/utils/file-types";
import { cn } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/loading";
import { validateFile } from "@/lib/utils/file-conversion";
import { FileWithPreview } from "@/lib/store/conversion";
import { processTool, downloadBlob } from "@/lib/utils/tool-processor";

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

  useEffect(() => {
    const loadPdfPreviews = async () => {
      for (const file of files) {
        if (file.type === 'application/pdf' && !pdfPreviews[file.name]) {
          try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            if (context) {
              await page.render({ canvasContext: context, viewport, canvas }).promise;
              setPdfPreviews(prev => ({ ...prev, [file.name]: canvas.toDataURL() }));
            }
          } catch (error) {
            console.error('Error rendering PDF preview:', error);
          }
        }
      }
    };
    loadPdfPreviews();
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
      return <img src={file.preview} alt={file.name} className="w-full h-32 object-cover rounded-t-xl" />;
    } else if (file.type === 'application/pdf') {
      if (pdfPreviews[file.name]) {
        return <img src={pdfPreviews[file.name]} alt={file.name} className="w-full h-32 object-cover rounded-t-xl" />;
      }
      return <div className="w-full h-32 bg-red-100 dark:bg-red-900/30 rounded-t-xl flex items-center justify-center text-sm font-bold text-red-600">Loading PDF...</div>;
    } else if (file.type.startsWith('video/')) {
      return <div className="w-full h-32 bg-purple-100 dark:bg-purple-900/30 rounded-t-xl flex items-center justify-center text-5xl">🎬</div>;
    } else if (file.type.startsWith('audio/')) {
      return <div className="w-full h-32 bg-green-100 dark:bg-green-900/30 rounded-t-xl flex items-center justify-center text-5xl">🎵</div>;
    }
    return <div className="w-full h-32 bg-zinc-100 dark:bg-zinc-800 rounded-t-xl flex items-center justify-center text-5xl">📄</div>;
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
    setProcessing(true);

    try {
      const result = await processTool({
        toolName: selectedTool,
        files: files as File[],
        onProgress: (progress) => {
          setFiles(prev => prev.map((f, i) => i === 0 ? { ...f, progress } : f));
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

      alert('Processing complete! File(s) downloaded.');
    } catch (error) {
      console.error('Processing error:', error);
      alert('Error processing file: ' + (error as Error).message);
    } finally {
      setProcessing(false);
      setFiles([]);
      setSelectedTool(null);
      setOutputFilename('');
    }
  };

  return (
    <main className="container mx-auto px-4 py-8 min-h-screen">
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

      {!selectedTool ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {fileType.tools.map((tool, index) => (
            <motion.button
              key={tool.name}
              onClick={() => setSelectedTool(tool.name)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              disabled={tool.status === 'maintenance'}
              className={cn(
                "glass hover-card relative overflow-hidden rounded-2xl p-6 text-left transition-all",
                tool.status === 'maintenance' && "opacity-60 cursor-not-allowed"
              )}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 ${fileType.color} opacity-10 blur-2xl rounded-full -mr-12 -mt-12`} />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold">{tool.name}</h3>
                  <span className={cn(
                    "text-xs px-3 py-1 rounded-full font-semibold",
                    tool.status === 'working' 
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  )}>
                    {tool.status === 'working' ? '✓ Ready' : '⚠ Soon'}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {tool.description}
                </p>
              </div>
            </motion.button>
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
            <h2 className="text-2xl font-bold mb-2">{selectedTool}</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              {fileType.tools.find(t => t.name === selectedTool)?.description}
            </p>

            <div
              {...getRootProps()}
              className={cn(
                "glass border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all",
                isDragActive
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/10 scale-105"
                  : "border-zinc-300 dark:border-zinc-700 hover:border-purple-400 dark:hover:border-purple-600"
              )}
            >
              <input {...getInputProps()} />
              <ArrowUpTrayIcon className="mx-auto mb-4 h-16 w-16 text-purple-500" />
              {isDragActive ? (
                <p className="text-lg font-medium">Drop the files here...</p>
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

          {files.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="files" direction="horizontal">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef}
                      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                    >
                      {files.map((file, index) => (
                        <Draggable 
                          key={file.name + index} 
                          draggableId={file.name + index} 
                          index={index}
                          isDragDisabled={!requiresMultiple}
                        >
                          {(provided, snapshot) => (
                            <motion.div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                              className={cn(
                                "glass rounded-xl overflow-hidden relative",
                                snapshot.isDragging && "shadow-2xl scale-105 z-50"
                              )}
                            >
                              {requiresMultiple && (
                                <div className="absolute top-2 left-2 z-10 flex gap-1">
                                  <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
                                    {index + 1}
                                  </div>
                                </div>
                              )}
                              {requiresMultiple && (
                                <button
                                  onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))}
                                  className="absolute top-2 right-2 z-10 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                                >
                                  ✕
                                </button>
                              )}
                              {getFilePreview(file)}
                              <div className="p-4">
                                <p className="font-semibold text-sm truncate mb-2">{file.name}</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                                <ProgressBar progress={file.progress || 0} />
                              </div>
                            </motion.div>
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
    </main>
  );
}
