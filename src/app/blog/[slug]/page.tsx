import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts } from "@/lib/blog-data";

// Safe, clean browser-native Markdown-to-HTML parser function
function parseMarkdownText(text: string): string {
  let html = text;
  
  // Basic security escaping
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold: **text**
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Italic: *text*
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Inline Code: `code`
  html = html.replace(/`(.*?)`/g, "<code class='bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono text-xs text-purple-650 dark:text-purple-400'>$1</code>");

  // Links: [text](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' class='text-purple-600 dark:text-purple-400 hover:underline' target='_blank' rel='noopener noreferrer'>$1</a>");

  return html;
}

// Fallback high-quality long-form guide for other standard blog posts
const generalFallbackPost = {
  title: "Comprehensive File Processing Guide",
  date: "2026-07-09",
  category: "Guides",
  content: `# Comprehensive File Processing Guide

Modern web development enables client-side rendering capabilities that were previously restricted to native operating system packages. This guide covers how to optimize and handle documents and media files securely using browser-level sandboxes.

## Core Architectural Concepts

- **Memory Buffers**: Files are read into memory using \`ArrayBuffer\` and processed as raw binary bytes.
- **WebAssembly (WASM)**: Execution sandboxes that compile high-performance libraries (like FFmpeg) to run locally inside standard browser threads.
- **Client-Side Canvas**: Rendering contexts that let you crop, filter, and adjust images without transferring data to a server.

## Tips for Best Performance

### 1. Document Management
When processing PDFs, always compress the files after editing to remove duplicate fonts or metadata streams.

### 2. Media Optimization
- Always scale resolution targets (e.g. 4K to 1080p) to compress video sizes.
- Set appropriate Constant Rate Factors (CRF) when transcoding via FFmpeg.

### 3. Data Privacy
Choose local tools like **FileTools** that keep your data on your hardware, eliminating cloud upload dependencies.

Try FileTools today for all your file conversion and processing needs!`
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = blogPosts[resolvedParams.slug] || generalFallbackPost;
  
  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: `${post.title} | FileTools Blog`,
    description: post.content.substring(0, 160).replace(/[#*`]/g, ""),
  };
}

export default async function BlogPost({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const post = blogPosts[slug] || (additionalListContains(slug) ? generalFallbackPost : null);

  if (!post) {
    notFound();
  }

  // Calculate estimated reading time
  const wordsCount = post.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordsCount / 180));

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 px-4 sm:px-6 lg:px-8 py-16">
      {/* Background spot gradients */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />

      <article className="max-w-3xl mx-auto relative z-10">
        
        {/* Back Button */}
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-all hover:-translate-x-1 duration-200"
        >
          <span>←</span> Back to all guides
        </Link>

        {/* Metadata Header */}
        <div className="mb-6 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
          <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-bold uppercase tracking-wider text-[10px]">
            {post.category}
          </span>
          <span>•</span>
          <span>{post.date}</span>
          <span>•</span>
          <span>{readingTime} min read</span>
        </div>

        {/* Title */}
        <h1 className="mb-8 text-3.5xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
          {post.title}
        </h1>

        {/* Separator line */}
        <div className="h-px bg-zinc-200/60 dark:bg-zinc-800/60 w-full mb-8" />

        {/* Blog Body Container */}
        <div className="glass border border-zinc-200/50 dark:border-zinc-800/50 rounded-3xl p-6 sm:p-10 bg-white/50 dark:bg-zinc-950/50">
          <div className="space-y-6 text-base sm:text-lg leading-relaxed text-zinc-700 dark:text-zinc-350">
            {post.content.split('\n').map((paragraph, index) => {
              const trimmed = paragraph.trim();
              if (!trimmed) return null;

              if (paragraph.startsWith('# ')) {
                const parsed = parseMarkdownText(paragraph.slice(2));
                return <h1 key={index} className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-8 mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2" dangerouslySetInnerHTML={{ __html: parsed }} />;
              } 
              
              if (paragraph.startsWith('## ')) {
                const parsed = parseMarkdownText(paragraph.slice(3));
                return <h2 key={index} className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-6 mb-3" dangerouslySetInnerHTML={{ __html: parsed }} />;
              } 
              
              if (paragraph.startsWith('### ')) {
                const parsed = parseMarkdownText(paragraph.slice(4));
                return <h3 key={index} className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mt-4 mb-2" dangerouslySetInnerHTML={{ __html: parsed }} />;
              } 
              
              if (paragraph.startsWith('- ')) {
                const parsed = parseMarkdownText(paragraph.slice(2));
                return <li key={index} className="ml-6 my-2 list-disc text-zinc-650 dark:text-zinc-350" dangerouslySetInnerHTML={{ __html: parsed }} />;
              }
              
              if (paragraph.startsWith('|') && paragraph.endsWith('|')) {
                // Parse markdown table row
                const cells = paragraph.split('|').map(c => c.trim()).filter((_, i) => i > 0 && i < paragraph.split('|').length - 1);
                const isHeader = index === post.content.split('\n').findIndex(p => p.startsWith('|')) || (post.content.split('\n')[index - 1]?.startsWith('|') && post.content.split('\n')[index - 1]?.includes(':---'));
                if (paragraph.includes(':---')) return null; // Skip table separator row
                
                return (
                  <div key={index} className="overflow-x-auto my-4">
                    <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                      <tbody>
                        <tr className="bg-zinc-50 dark:bg-zinc-900/30">
                          {cells.map((cell, cIdx) => (
                            <td key={cIdx} className={`px-4 py-2 text-sm border border-zinc-200 dark:border-zinc-850 ${isHeader ? "font-bold bg-zinc-100 dark:bg-zinc-900" : ""}`} dangerouslySetInnerHTML={{ __html: parseMarkdownText(cell) }} />
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              }

              // Normal paragraph
              const parsed = parseMarkdownText(paragraph);
              return <p key={index} className="my-4 text-zinc-650 dark:text-zinc-350 leading-relaxed" dangerouslySetInnerHTML={{ __html: parsed }} />;
            })}
          </div>
        </div>

      </article>
    </main>
  );
}

// Check helper for fallback routes validation
function additionalListContains(slug: string): boolean {
  const list = [
    "image-format-guide", "pdf-to-word-conversion", "compress-images-web",
    "extract-pdf-pages", "convert-heic-to-jpg", "pdf-watermark-guide",
    "crop-images-online", "mp4-to-mp3-conversion", "pdf-page-numbers",
    "resize-image-dimensions", "merge-videos-online", "pdf-to-excel-conversion",
    "convert-webp-to-png", "trim-video-clips", "unlock-pdf-password",
    "image-background-removal", "video-to-gif-conversion", "organize-pdf-pages",
    "compress-png-images", "audio-format-conversion", "pdf-text-extraction",
    "flip-rotate-images", "video-speed-control", "pdf-image-extraction",
    "convert-svg-to-png", "compress-audio-files", "pdf-form-filling"
  ];
  return list.includes(slug);
}
