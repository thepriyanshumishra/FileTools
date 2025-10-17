"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface ToolOption {
  id: string;
  label: string;
  type: "select" | "number" | "slider" | "toggle";
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue: string | number | boolean;
  description?: string;
}

interface ToolOptionsProps {
  toolName: string;
  options: ToolOption[];
  values: Record<string, string | number | boolean>;
  onChange: (id: string, value: string | number | boolean) => void;
}

export function ToolOptions({ toolName, options, values, onChange }: ToolOptionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (options.length === 0) return null;

  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <div className="text-left">
          <h3 className="font-semibold">Advanced Options</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Customize {toolName.toLowerCase()} settings
          </p>
        </div>
        <ChevronDownIcon
          className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-zinc-200 p-4 space-y-4 dark:border-zinc-800">
              {options.map((option) => (
                <div key={option.id}>
                  <label className="block">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">{option.label}</span>
                      {option.type === "slider" && (
                        <span className="text-sm font-bold text-purple-600">
                          {values[option.id] ?? option.defaultValue}
                        </span>
                      )}
                    </div>
                    {option.description && (
                      <p className="mb-2 text-xs text-zinc-500 dark:text-zinc-400">
                        {option.description}
                      </p>
                    )}

                    {option.type === "select" && (
                      <select
                        value={String(values[option.id] ?? option.defaultValue)}
                        onChange={(e) => onChange(option.id, e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800"
                      >
                        {option.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {option.type === "number" && (
                      <input
                        type="number"
                        min={option.min}
                        max={option.max}
                        step={option.step}
                        value={Number(values[option.id] ?? option.defaultValue)}
                        onChange={(e) => onChange(option.id, Number(e.target.value))}
                        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800"
                      />
                    )}

                    {option.type === "slider" && (
                      <div>
                        <input
                          type="range"
                          min={option.min}
                          max={option.max}
                          step={option.step}
                          value={Number(values[option.id] ?? option.defaultValue)}
                          onChange={(e) => onChange(option.id, Number(e.target.value))}
                          className="w-full accent-purple-600"
                        />
                        {option.min !== undefined && option.max !== undefined && (
                          <div className="mt-1 flex justify-between text-xs text-zinc-500">
                            <span>{option.min}</span>
                            <span>{option.max}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {option.type === "toggle" && (
                      <button
                        type="button"
                        onClick={() => onChange(option.id, !(values[option.id] ?? option.defaultValue))}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                          (values[option.id] ?? option.defaultValue) ? "bg-purple-600" : "bg-zinc-300 dark:bg-zinc-700"
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            (values[option.id] ?? option.defaultValue) ? "translate-x-5" : "translate-x-0"
                          }`}
                          style={{ marginTop: '2px', marginLeft: '2px' }}
                        />
                      </button>
                    )}
                  </label>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
