import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FileWithPreview extends File {
  preview?: string;
  progress?: number;
  status?: "pending" | "processing" | "success" | "error";
  error?: string;
}

interface ConversionStore {
  files: FileWithPreview[];
  outputFormat: string;
  isProcessing: boolean;
  setFiles: (files: FileWithPreview[]) => void;
  setOutputFormat: (format: string) => void;
  setProcessing: (isProcessing: boolean) => void;
  updateFileStatus: (
    fileIndex: number,
    status: FileWithPreview["status"]
  ) => void;
  updateFileProgress: (fileIndex: number, progress: number) => void;
  setFileError: (fileIndex: number, error: string) => void;
  reset: () => void;
}

export const useConversionStore = create<ConversionStore>()(
  persist(
    (set) => ({
      files: [],
      outputFormat: "",
      isProcessing: false,
      setFiles: (files) => set({ files }),
      setOutputFormat: (format) => set({ outputFormat: format }),
      setProcessing: (isProcessing) => set({ isProcessing }),
      updateFileStatus: (fileIndex, status) =>
        set((state) => ({
          files: state.files.map((file, index) =>
            index === fileIndex ? { ...file, status } : file
          ),
        })),
      updateFileProgress: (fileIndex, progress) =>
        set((state) => ({
          files: state.files.map((file, index) =>
            index === fileIndex ? { ...file, progress } : file
          ),
        })),
      setFileError: (fileIndex, error) =>
        set((state) => ({
          files: state.files.map((file, index) =>
            index === fileIndex ? { ...file, error, status: "error" } : file
          ),
        })),
      reset: () => set({ files: [], outputFormat: "", isProcessing: false }),
    }),
    {
      name: "conversion-store",
    }
  )
);
