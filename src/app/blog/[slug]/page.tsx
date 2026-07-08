import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { blogPosts } from "@/lib/blog-data";
import MediumArticleView from "@/components/blog-article-view";

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

Try FileTools today for all your file processing needs!`
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = blogPosts[resolvedParams.slug] || generalFallbackPost;

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

  return <MediumArticleView post={post} />;
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
