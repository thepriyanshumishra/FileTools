"use client";

interface ProgressIndicatorProps {
  progress: number;
  status?: string;
  className?: string;
}

export function ProgressIndicator({ progress, status, className = '' }: ProgressIndicatorProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {status || 'Processing...'}
        </span>
        <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
