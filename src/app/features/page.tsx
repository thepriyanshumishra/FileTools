"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  ShieldCheckIcon, 
  CpuChipIcon, 
  CloudArrowDownIcon, 
  PaintBrushIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  TableCellsIcon,
  SparklesIcon
} from "@heroicons/react/24/outline";

export default function FeaturesPage() {
  const coreFeatures = [
    {
      title: "PhotoSuite Image Studio",
      description: "A complete browser-native graphic editor. Apply color adjustments (brightness, contrast, saturation, blur), crop overlays, draw annotations, add text components, and apply filters on a single coordinate canvas.",
      icon: PaintBrushIcon,
      highlight: "100% Client-Side Canvas",
      color: "from-purple-500/10 to-indigo-500/10 border-purple-500/20"
    },
    {
      title: "DocFlow PDF Studio",
      description: "Advanced PDF visual planner. Drag-and-drop pages to sort order, rotate sheets clockwise or counter-clockwise, select exclusions, stamp custom watermarks, add passwords, and draw custom signatures to position as layer stamps.",
      icon: DocumentTextIcon,
      highlight: "pdf-lib & pdf.js Engine",
      color: "from-blue-500/10 to-sky-500/10 border-blue-500/20"
    },
    {
      title: "TimelineStudio Video & Audio",
      description: "Visual timeline editor. Scan audio peaks dynamically using browser AudioContext, select precise start/end ranges with double-handle trimmers, and run local compilations via client-side FFmpeg WebAssembly.",
      icon: VideoCameraIcon,
      highlight: "FFmpeg WASM Binary",
      color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20"
    },
    {
      title: "CodeFormat Document Studio",
      description: "A split-view workspace featuring input vs syntax-highlighted formatted preview panels for JSON/XML/HTML/CSS, alongside an interactive, Excel-like sheet editor for managing CSV row/column data cells directly.",
      icon: TableCellsIcon,
      highlight: "Prism Tomorrow Grid",
      color: "from-indigo-500/10 to-violet-500/10 border-indigo-500/20"
    },
    {
      title: "Hybrid Storage Caching",
      description: "Auto-save engine that automatically syncs active file binary bytes and layout configuration sliders to local browser-native IndexedDB and metadata stores, letting users recover work from drafts instantly.",
      icon: CloudArrowDownIcon,
      highlight: "Offline IndexedDB Wrapper",
      color: "from-pink-500/10 to-rose-500/10 border-pink-500/20"
    },
    {
      title: "PWA Offline Readiness",
      description: "Progressive Web App support with custom Network-First service worker interceptors. Save the app to your device home screen and run file transcode utilities completely offline without any internet connection.",
      icon: CpuChipIcon,
      highlight: "Offline-First Service Worker",
      color: "from-amber-500/10 to-orange-500/10 border-amber-500/20"
    }
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 px-4 sm:px-6 lg:px-8 py-16">
      {/* Background spot gradients */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full bg-purple-500/10 border border-purple-500/20 px-4 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 mb-4"
          >
            <SparklesIcon className="h-4 w-4" />
            <span>Architecture & Feature Matrix</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-6"
          >
            SaaS Features, Built
            <span className="block bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              100% On The Client
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto"
          >
            FileTools bypasses the cloud entirely. All files are parsed, formatted, and converted inside the browser memory sandbox, guaranteeing absolute privacy.
          </motion.p>
        </div>

        {/* Feature Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {coreFeatures.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              whileHover={{ y: -4 }}
              className={`p-6 rounded-3xl border bg-gradient-to-br ${feature.color} backdrop-blur-xl flex flex-col justify-between hover:shadow-lg transition-all`}
            >
              <div className="space-y-4">
                <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl w-fit shadow-md">
                  <feature.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <span className="inline-block mt-1 text-[10px] font-bold font-mono uppercase bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-full">
                    {feature.highlight}
                  </span>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Private Sandbox Tech Specs Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-3xl p-8 border border-zinc-200/50 dark:border-zinc-800/50 relative overflow-hidden bg-white dark:bg-zinc-950"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-2xl rounded-full" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 rounded-2xl">
              <ShieldCheckIcon className="h-10 w-10" />
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-2xl font-bold">Privacy-First Execution Sandbox</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Online converters require files to upload to cloud databases, causing massive security risks. FileTools processes everything in-browser. By leveraging WebAssembly and Canvas APIs, files stay purely in memory, executing locally on your device.
              </p>
            </div>
            <Link 
              href="/" 
              className="w-full md:w-auto text-center px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold hover:shadow-lg transition-all"
            >
              Start Converting
            </Link>
          </div>
        </motion.div>

      </div>
    </main>
  );
}
