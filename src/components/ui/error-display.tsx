"use client";

import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { getErrorMessage } from '@/lib/utils/error-messages';

interface ErrorDisplayProps {
  error: Error | string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorDisplay({ error, onRetry, onDismiss }: ErrorDisplayProps) {
  const errorInfo = getErrorMessage(error);

  return (
    <div className="glass rounded-2xl p-6 border-2 border-red-200 dark:border-red-900">
      <div className="flex items-start gap-4">
        <ExclamationTriangleIcon className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-red-700 dark:text-red-400">
              {errorInfo.message}
            </h3>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="mb-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
              Try these solutions:
            </p>
            <ul className="space-y-1">
              {errorInfo.solutions.map((solution, index) => (
                <li key={index} className="text-sm text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                  <span className="text-purple-600 dark:text-purple-400">•</span>
                  <span>{solution}</span>
                </li>
              ))}
            </ul>
          </div>

          {onRetry && (
            <button
              onClick={onRetry}
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
