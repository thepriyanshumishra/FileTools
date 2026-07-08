"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  HeartIcon, 
  ShareIcon, 
  BookmarkIcon, 
  ClipboardDocumentIcon, 
  CheckIcon 
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

interface MediumArticleViewProps {
  post: {
    title: string;
    date: string;
    category: string;
    content: string;
  };
}

// Inline secure Markdown formatting compiler
function parseMarkdownText(text: string): string {
  let html = text;
  
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold: **text**
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // Italic: *text*
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Inline Code: `code`
  html = html.replace(/`(.*?)`/g, "<code class='bg-zinc-100 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded font-mono text-sm text-purple-600 dark:text-purple-400'>$1</code>");

  // Links: [text](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' class='text-purple-600 dark:text-purple-400 hover:underline' target='_blank' rel='noopener noreferrer'>$1</a>");

  return html;
}

export default function MediumArticleView({ post }: MediumArticleViewProps) {
  const [claps, setClaps] = useState(0);
  const [hasClapped, setHasClapped] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  // Estimated reading time calculation
  const wordsCount = post.content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordsCount / 180));

  // Scroll listener to update read progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClap = () => {
    setClaps(prev => prev + 1);
    setHasClapped(true);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans">
      
      {/* Viewport Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 z-50 transition-all duration-75"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.04] pointer-events-none" />

      <div className="max-w-2xl mx-auto px-4 py-12 sm:px-6 relative z-10">
        
        {/* Navigation back */}
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-all hover:-translate-x-1 duration-200"
        >
          <span>←</span> Back to Blog
        </Link>

        {/* Category Header tag */}
        <div className="mb-4">
          <span className="text-xs uppercase tracking-widest font-extrabold text-purple-600 dark:text-purple-400">
            {post.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5.5xl font-extrabold tracking-tight leading-tight mb-6">
          {post.title}
        </h1>

        {/* Medium-style Author info card */}
        <div className="flex items-center justify-between py-6 border-y border-zinc-150 dark:border-zinc-850 mb-10">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-sm">
              PM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold hover:underline cursor-pointer">Priyanshu Mishra</span>
                <span className="text-xs text-zinc-400">•</span>
                <button className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700">Follow</button>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                <span>{readingTime} min read</span>
                <span className="mx-1.5">•</span>
                <span>{post.date}</span>
              </div>
            </div>
          </div>

          {/* Social shares */}
          <div className="flex items-center gap-3 text-zinc-450 dark:text-zinc-500">
            <button 
              onClick={handleShare}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors relative"
              title="Copy link to article"
            >
              {copied ? <CheckIcon className="h-5 w-5 text-emerald-500" /> : <ShareIcon className="h-5 w-5 hover:text-zinc-800 dark:hover:text-zinc-200" />}
              {copied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] px-2 py-0.5 rounded font-sans shadow-md whitespace-nowrap animate-fade-in-down">
                  Link Copied!
                </span>
              )}
            </button>
            <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors">
              <BookmarkIcon className="h-5 w-5 hover:text-zinc-800 dark:hover:text-zinc-200" />
            </button>
          </div>
        </div>

        {/* Medium-style Body Typography layout */}
        <div className="font-serif text-[17px] sm:text-[19px] leading-8 sm:leading-[34px] text-zinc-800 dark:text-zinc-200 space-y-8 select-text">
          {post.content.split('\n').map((paragraph, index) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return null;

            // Headers
            if (paragraph.startsWith('# ')) {
              const parsed = parseMarkdownText(paragraph.slice(2));
              return (
                <h1 key={index} className="font-sans text-2xl sm:text-3.5xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-12 mb-4 border-b border-zinc-100 dark:border-zinc-900 pb-3" dangerouslySetInnerHTML={{ __html: parsed }} />
              );
            } 
            
            if (paragraph.startsWith('## ')) {
              const parsed = parseMarkdownText(paragraph.slice(3));
              return (
                <h2 key={index} className="font-sans text-xl sm:text-2.5xl font-bold text-zinc-900 dark:text-zinc-100 mt-10 mb-4" dangerouslySetInnerHTML={{ __html: parsed }} />
              );
            } 
            
            if (paragraph.startsWith('### ')) {
              const parsed = parseMarkdownText(paragraph.slice(4));
              return (
                <h3 key={index} className="font-sans text-lg sm:text-xl font-bold text-zinc-800 dark:text-zinc-200 mt-8 mb-2" dangerouslySetInnerHTML={{ __html: parsed }} />
              );
            }

            // Blockquotes
            if (paragraph.startsWith('> ')) {
              const parsed = parseMarkdownText(paragraph.slice(2));
              return (
                <blockquote key={index} className="border-l-4 border-purple-500 pl-5 italic my-6 text-zinc-650 dark:text-zinc-400 text-lg sm:text-xl" dangerouslySetInnerHTML={{ __html: parsed }} />
              );
            }

            // Bullet points
            if (paragraph.startsWith('- ')) {
              const parsed = parseMarkdownText(paragraph.slice(2));
              return (
                <li key={index} className="ml-6 pl-1 my-3 list-disc text-zinc-800 dark:text-zinc-200" dangerouslySetInnerHTML={{ __html: parsed }} />
              );
            }

            // Tables
            if (paragraph.startsWith('|') && paragraph.endsWith('|')) {
              const cells = paragraph.split('|').map(c => c.trim()).filter((_, i) => i > 0 && i < paragraph.split('|').length - 1);
              const isHeader = index === post.content.split('\n').findIndex(p => p.startsWith('|')) || (post.content.split('\n')[index - 1]?.startsWith('|') && post.content.split('\n')[index - 1]?.includes(':---'));
              if (paragraph.includes(':---')) return null;
              
              return (
                <div key={index} className="overflow-x-auto my-6 font-sans">
                  <table className="min-w-full border-collapse">
                    <tbody>
                      <tr className="bg-zinc-50 dark:bg-zinc-900/30">
                        {cells.map((cell, cIdx) => (
                          <td key={cIdx} className={`px-4 py-3 border border-zinc-200 dark:border-zinc-800 text-sm ${isHeader ? "font-bold bg-zinc-100 dark:bg-zinc-900" : ""}`} dangerouslySetInnerHTML={{ __html: parseMarkdownText(cell) }} />
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            }

            // Standard Paragraph
            const parsed = parseMarkdownText(paragraph);
            return (
              <p key={index} className="leading-relaxed text-zinc-850 dark:text-zinc-200" dangerouslySetInnerHTML={{ __html: parsed }} />
            );
          })}
        </div>

        {/* Medium-style Sticky/Bottom Claps bar */}
        <div className="mt-16 pt-8 border-t border-zinc-150 dark:border-zinc-850 flex items-center justify-between mb-16">
          <div className="flex items-center gap-6">
            <button 
              onClick={handleClap}
              className="flex items-center gap-2 group text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900/60 rounded-full group-hover:scale-110 transition-transform shadow-sm border border-zinc-100 dark:border-zinc-850">
                {hasClapped ? (
                  <HeartIconSolid className="h-6 w-6 text-purple-600 dark:text-purple-400 animate-pulse" />
                ) : (
                  <HeartIcon className="h-6 w-6" />
                )}
              </div>
              <span className="text-sm font-semibold">{claps} claps</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Liked this article? Leave some support!</span>
          </div>
        </div>

      </div>
    </div>
  );
}
