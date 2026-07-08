"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

// Structured posts matching our rich data in blog-data.ts, with git-derived publication dates
const posts = [
  { slug: "how-to-compress-pdf", title: "How to Compress PDF Files Without Losing Quality", excerpt: "Learn the best techniques to reduce PDF file size while maintaining quality. Step-by-step guide with tips and tricks.", date: "2026-07-09", category: "PDF Tools" },
  { slug: "convert-jpg-to-png", title: "JPG vs PNG: When to Use Each Format", excerpt: "Understand the differences between JPG and PNG formats and learn when to use each for optimal results.", date: "2026-07-09", category: "Image Tools" },
  { slug: "merge-pdf-files", title: "5 Ways to Merge PDF Files Online for Free", excerpt: "Discover multiple methods to combine PDF documents quickly and easily without installing software.", date: "2026-07-09", category: "PDF Tools" },
  { slug: "split-pdf-pages", title: "How to Split PDF into Separate Pages", excerpt: "Extract specific pages from PDF documents. Complete guide to splitting PDFs efficiently.", date: "2025-10-19", category: "PDF Tools" },
  { slug: "convert-png-to-jpg", title: "Convert PNG to JPG: Best Practices", excerpt: "Learn when and how to convert PNG images to JPG format for optimal file size and quality.", date: "2025-10-19", category: "Image Tools" },
  { slug: "rotate-pdf-pages", title: "Rotate PDF Pages: Quick Guide", excerpt: "Fix incorrectly oriented PDF pages. Learn how to rotate single or multiple pages easily.", date: "2025-10-19", category: "PDF Tools" },
  { slug: "video-compression-guide", title: "Video Compression Guide: Reduce File Size by 80%", excerpt: "Master video compression techniques to dramatically reduce file sizes while keeping quality high.", date: "2025-10-18", category: "Video Tools" },
  { slug: "audio-format-conversion", title: "Convert Audio Files: MP3, WAV, OGG Guide", excerpt: "Convert between audio formats for compatibility and quality.", date: "2025-10-17", category: "Audio Tools" },
  { slug: "image-format-guide", title: "Complete Image Format Guide: JPG, PNG, WebP, GIF", excerpt: "Understand all major image formats and choose the right one for your needs.", date: "2025-10-17", category: "Image Tools" },
  { slug: "pdf-to-word-conversion", title: "Convert PDF to Word: Maintain Formatting", excerpt: "Convert PDF documents to editable Word files while preserving layout and formatting.", date: "2025-10-17", category: "PDF Tools" },
  { slug: "compress-images-web", title: "Optimize Images for Web: Complete Guide", excerpt: "Reduce image file sizes for faster website loading. Best practices for web optimization.", date: "2025-10-17", category: "Image Tools" },
  { slug: "extract-pdf-pages", title: "Extract Pages from PDF Documents", excerpt: "Pull specific pages from large PDF files. Save time with selective extraction.", date: "2025-10-17", category: "PDF Tools" }
];

const categories = ["All", "PDF Tools", "Image Tools", "Video Tools", "Audio Tools"];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 px-4 sm:px-6 lg:px-8 py-16">
      {/* Background spot gradients */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* Title Block */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold sm:text-5xl md:text-6xl mb-4 tracking-tight">
            File Processing
            <span className="block bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Guides & Tutorials
            </span>
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            Practical tips, workflows, and guides to optimize, compress, and edit documents and media assets locally.
          </p>
        </div>

        {/* Filters and Search toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-zinc-200/50 dark:border-zinc-800/50">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                    : "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-64">
            <MagnifyingGlassIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/55 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-zinc-900 dark:text-zinc-100"
            />
          </div>
        </div>

        {/* Dynamic Card Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post, idx) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="glass hover-card border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold font-mono uppercase bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2.5 py-1 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                      {post.date}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold mb-2 group">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-6 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
                >
                  Read full article →
                </Link>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-zinc-500 dark:text-zinc-400">No guides found matching your query.</p>
          </div>
        )}
      </div>
    </main>
  );
}
