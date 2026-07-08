"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import { fileCategories } from "@/lib/utils/file-types";
import { useFavoritesStore } from "@/lib/store/favorites";
import { useFileTransferStore } from "@/lib/store/file-transfer";
import { cn } from "@/lib/utils";
import { StarIcon } from "@heroicons/react/24/solid";
import { 
  SparklesIcon,
  ArrowUpTrayIcon,
  PhotoIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  FolderOpenIcon,
  StarIcon as StarIconOutline,
  CheckIcon
} from "@heroicons/react/24/outline";

export default function HomePage() {
  const router = useRouter();
  const { favorites } = useFavoritesStore();
  const { setPendingFiles } = useFileTransferStore();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Get favorite tools
  const favoriteTools = favorites.map(fav => {
    const [extension, toolName] = fav.split('-');
    const fileType = fileCategories
      .flatMap(cat => cat.types)
      .find(t => t.extension === extension);
    const tool = fileType?.tools.find(t => t.name === toolName);
    return { extension, toolName, fileType, tool };
  }).filter(f => f.fileType && f.tool);

  // File Dropzone Handler
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    const ext = file.name.split('.').pop()?.toLowerCase() || "";

    // Check if extension is supported in our fileCategories database
    const isSupported = fileCategories
      .flatMap(cat => cat.types)
      .some(t => t.extension === ext);

    if (isSupported) {
      setErrorMessage(null);
      setPendingFiles([file]);
      router.push(`/tools/${ext}`);
    } else {
      setErrorMessage(`Format ".${ext}" is not supported yet. Try PDF, PNG, MP3, MP4, etc.`);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  }, [router, setPendingFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false
  });

  const categoriesList = ["All", ...fileCategories.map(c => c.name)];

  const filteredTypes = fileCategories
    .filter(cat => activeCategory === "All" || cat.name === activeCategory)
    .flatMap(cat => cat.types);

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      
      {/* Radial Spotlights and Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative max-w-5xl mx-auto text-center mb-16 md:mb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="mb-6 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
            Universal Files
            <span className="block bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 dark:from-purple-400 dark:via-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Processed Instantly
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-base sm:text-lg text-zinc-600 dark:text-zinc-400 md:text-xl leading-relaxed">
            Convert, compress, and edit documents, images, audio, and videos right in your browser. Files never leave your device.
          </p>
        </motion.div>

        {/* Interactive Quick Dropzone */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div
            {...getRootProps()}
            className={`glass relative border-2 border-dashed rounded-3xl p-8 md:p-12 text-center cursor-pointer transition-all duration-300 overflow-hidden ${
              isDragActive
                ? "border-purple-500 bg-purple-500/5 scale-105 shadow-2xl shadow-purple-500/10"
                : "border-zinc-300 dark:border-zinc-800 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20"
            }`}
          >
            <input {...getInputProps()} />
            
            {/* Animated Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-indigo-600/5 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-md">
                <ArrowUpTrayIcon className={`h-8 w-8 ${isDragActive ? "animate-bounce" : ""}`} />
              </div>
              <div>
                <p className="text-lg md:text-xl font-bold">
                  {isDragActive ? "Drop your file here!" : "Drag & Drop any file to begin"}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                  Automatically detects format and opens the right tools instantly
                </p>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 text-sm font-semibold text-red-600 dark:text-red-400"
              >
                ⚠️ {errorMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core Feature Checkmarks */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-xs md:text-sm text-zinc-600 dark:text-zinc-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
              <span>Zero Server Uploads (100% Client-Side)</span>
            </div>
            <div className="hidden md:block text-zinc-300 dark:text-zinc-800">•</div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
              <span>Full Offline Support (Installable PWA)</span>
            </div>
            <div className="hidden md:block text-zinc-300 dark:text-zinc-800">•</div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
              <span>No Processing Limits or Account Required</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Flagship Studios Presentation Section */}
      <section className="max-w-6xl mx-auto mb-20 md:mb-28">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Flagship Unified Workspaces</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            Why do things one by one? Use our unified creative studios to process everything in one workspace.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "PhotoSuite",
              description: "Unified Image Studio. Crop, apply filters, adjust sliders, and draw annotations on a single visual canvas.",
              icon: PhotoIcon,
              badge: "Active",
              color: "border-purple-500/20 shadow-purple-500/5",
              iconColor: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
              href: "/tools/studio/image"
            },
            {
              title: "DocFlow",
              description: "Unified PDF Studio. Visually drag and reorder page grids, delete or rotate pages, and place hand-drawn e-signatures.",
              icon: DocumentTextIcon,
              badge: "Studio",
              color: "border-blue-500/20 shadow-blue-500/5",
              iconColor: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
              href: "#"
            },
            {
              title: "TimelineStudio",
              description: "Unified Video/Audio Timeline. Crop, trim intervals, adjust play speed, and volume using high-speed WASM FFmpeg.",
              icon: VideoCameraIcon,
              badge: "Studio",
              color: "border-emerald-500/20 shadow-emerald-500/5",
              iconColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
              href: "#"
            },
            {
              title: "CodeFormat",
              description: "Unified Document Editor. Format, lint, and convert JSON/XML code side-by-side or edit CSV databases in spreadsheets.",
              icon: FolderOpenIcon,
              badge: "Studio",
              color: "border-indigo-500/20 shadow-indigo-500/5",
              iconColor: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10",
              href: "#"
            }
          ].map((studio, idx) => (
            <motion.div
              key={studio.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              onClick={() => {
                if (studio.href !== "#") {
                  router.push(studio.href);
                }
              }}
              className={cn(
                "glass hover-card rounded-2xl p-6 border flex flex-col justify-between transition-all select-none",
                studio.color,
                studio.href !== "#" ? "cursor-pointer hover:border-purple-500/50 hover:shadow-purple-500/10" : "cursor-default"
              )}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${studio.iconColor}`}>
                    <studio.icon className="h-6 w-6" />
                  </div>
                  <span className={cn(
                    "text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full",
                    studio.badge === "Active"
                      ? "bg-green-500/10 text-green-400 border border-green-500/20 animate-pulse"
                      : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                  )}>
                    {studio.badge}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{studio.title}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                    {studio.description}
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                {studio.href !== "#" ? (
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1.5">
                    Open Workspace →
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-zinc-400 inline-flex items-center gap-1.5 opacity-60">
                    Coming in Studio Update →
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Favorites Section */}
      {favoriteTools.length > 0 && (
        <section className="max-w-6xl mx-auto mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Your Favorites</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">Quick shortcut access to your most used tools</p>
            </div>
            <StarIcon className="h-8 w-8 text-yellow-500 animate-pulse" />
          </div>
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteTools.map(({ extension, toolName, fileType, tool }) => (
              <Link
                key={`${extension}-${toolName}`}
                href={`/tools/${extension}`}
                className="glass hover-card group block rounded-2xl p-5 border border-zinc-200/60 dark:border-zinc-900/60 relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-20 h-20 ${fileType?.color} opacity-5 blur-2xl rounded-full`} />
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                      {fileType?.name} (.{extension})
                    </span>
                    <StarIcon className="h-4.5 w-4.5 text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold group-hover:text-purple-600 transition-colors">{toolName}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                      {tool?.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Main Interactive Tools Dashboard */}
      <section id="tools" className="max-w-6xl mx-auto mb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold sm:text-4xl">Interactive Tools Explorer</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            Select a category to filter all working 100% offline-ready browser tools.
          </p>
        </div>

        {/* Dynamic Category Pill Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categoriesList.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeCategory === category
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md scale-105"
                  : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Dynamic Tool Cards Grid */}
        <motion.div 
          layout
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredTypes.map((type) => (
              <motion.div
                layout
                key={type.extension}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <Link
                  href={`/tools/${type.extension}`}
                  className="glass hover-card group block rounded-3xl p-6 border border-zinc-200/50 dark:border-zinc-900/50 transition-all h-full flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Decorative corner light drop */}
                  <div className={`absolute top-0 right-0 w-32 h-32 ${type.color} opacity-5 blur-3xl rounded-full`} />

                  <div className="relative z-10 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] tracking-widest font-extrabold uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2.5 py-1 rounded-full">
                          .{type.extension}
                        </span>
                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                          {type.tools.length} Tools
                        </span>
                      </div>
                      <h3 className="text-xl font-bold group-hover:text-purple-600 transition-colors">
                        {type.name} Tools
                      </h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                        {type.description}
                      </p>
                    </div>

                    <div className="mt-6">
                      <div className="flex flex-wrap gap-1.5">
                        {type.tools.slice(0, 3).map((tool) => (
                          <span
                            key={tool.name}
                            className="text-[10px] font-semibold bg-zinc-50 dark:bg-zinc-900/40 text-zinc-600 dark:text-zinc-300 border border-zinc-100 dark:border-zinc-800/80 px-2.5 py-1 rounded-md"
                          >
                            {tool.name}
                          </span>
                        ))}
                        {type.tools.length > 3 && (
                          <span className="text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-md">
                            +{type.tools.length - 3} More
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto mb-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold">Trusted by Builders & Creators</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            Loved for privacy, speed, and clean code.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              name: "Sarah Chen",
              role: "Creative Designer",
              text: "The client-side PDF converter is extremely fast. Processing everything right in my web browser is a game changer for privacy.",
              rating: 5,
            },
            {
              name: "Mike Johnson",
              role: "Software Developer",
              text: "I love that there are no remote server uploads. Highly secure, clean utility workspaces that work perfectly on my local machine.",
              rating: 5,
            },
            {
              name: "Emma Davis",
              role: "Content Manager",
              text: "The local video compressor handles high resolution recordings and exports with perfect quality. My primary daily helper site.",
              rating: 5,
            },
          ].map((testimonial) => (
            <div
              key={testimonial.name}
              className="glass rounded-2xl p-6 border border-zinc-200/50 dark:border-zinc-900/50 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex gap-0.5">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-500 text-sm">★</span>
                  ))}
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm italic leading-relaxed">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                <p className="font-bold text-sm">{testimonial.name}</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
