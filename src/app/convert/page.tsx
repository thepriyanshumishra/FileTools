"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  ArrowUpTrayIcon,
  CloudIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

interface FileWithPreview extends File {
  preview?: string;
}

export default function ConvertPage() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [outputFormat, setOutputFormat] = useState("");
  const [processing, setProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(
      acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      )
    );
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  const handleConvert = async () => {
    if (!outputFormat || files.length === 0) return;
    setProcessing(true);
    
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("outputFormat", outputFormat);

        const response = await fetch("/api/convert", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Conversion failed");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name.replace(/\.[^.]+$/, `.${outputFormat}`);
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      alert(`Successfully converted ${files.length} file(s)!`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Conversion failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-center text-3xl font-bold">Universal File Converter</h1>
      <p className="mb-4 text-center text-zinc-600 dark:text-zinc-400">
        Drop your files below to convert them to another format
      </p>
      <div className="mx-auto mb-8 max-w-2xl rounded-lg bg-blue-50 border border-blue-200 p-4 text-center dark:bg-blue-950/30 dark:border-blue-900">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 <strong>Tip:</strong> For specific file types, use dedicated tools from the homepage for better options and features!
        </p>
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "mx-auto mb-8 max-w-2xl rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-100/50 p-8 text-center transition-colors dark:border-zinc-700 dark:bg-zinc-800/50",
          isDragActive &&
            "border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/50"
        )}
      >
        <input {...getInputProps()} />
        <ArrowUpTrayIcon className="mx-auto mb-4 h-12 w-12 text-zinc-400" />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <>
            <p className="mb-2">
              Drag & drop files here, or click to select files
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Files will be processed locally when possible
            </p>
          </>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mx-auto mb-8 max-w-2xl space-y-4">
          {files.map((file) => (
            <motion.div
              key={file.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm dark:bg-zinc-800"
            >
              <div className="flex items-center gap-4">
                <span className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  {file.name.split(".").pop()?.toUpperCase()}
                </span>
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-2">
                {file.size < 10 * 1024 * 1024 ? (
                  <ComputerDesktopIcon className="h-5 w-5 text-green-500" />
                ) : (
                  <CloudIcon className="h-5 w-5 text-blue-500" />
                )}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Convert Options */}
      {files.length > 0 && (
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <label htmlFor="format" className="mb-2 block text-sm font-medium">
              Convert to:
            </label>
            <select
              id="format"
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <option value="">Select output format...</option>
              <optgroup label="Images">
                <option value="jpg">JPG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
                <option value="avif">AVIF</option>
                <option value="gif">GIF</option>
                <option value="tiff">TIFF</option>
              </optgroup>
            </select>
          </div>

          <button
            onClick={handleConvert}
            disabled={!outputFormat || processing}
            className="w-full rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700"
          >
            {processing ? "Converting..." : "Convert Files"}
          </button>

          {/* Warning Messages */}
          <div className="mt-4 space-y-2 text-sm">
            <p className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              ⚠️ Files will be deleted on refresh or quit
            </p>
            {files.some((f) => f.size >= 10 * 1024 * 1024) && (
              <p className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                ⚠️ Some files require internet connection for conversion
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
