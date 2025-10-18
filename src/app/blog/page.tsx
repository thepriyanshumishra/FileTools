import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog - File Conversion Tips & Tutorials | FileTools",
  description: "Learn how to convert, compress, and edit files with our comprehensive guides and tutorials. Expert tips for PDF, image, video, and document processing.",
};

const posts = [
  {
    slug: "how-to-compress-pdf",
    title: "How to Compress PDF Files Without Losing Quality",
    excerpt: "Learn the best techniques to reduce PDF file size while maintaining quality. Step-by-step guide with tips and tricks.",
    date: "2024-01-15",
    category: "PDF Tools",
  },
  {
    slug: "convert-jpg-to-png",
    title: "JPG vs PNG: When to Use Each Format",
    excerpt: "Understand the differences between JPG and PNG formats and learn when to use each for optimal results.",
    date: "2024-01-14",
    category: "Image Tools",
  },
  {
    slug: "merge-pdf-files",
    title: "5 Ways to Merge PDF Files Online for Free",
    excerpt: "Discover multiple methods to combine PDF documents quickly and easily without installing software.",
    date: "2024-01-13",
    category: "PDF Tools",
  },
  {
    slug: "resize-images-bulk",
    title: "Bulk Image Resizing: Complete Guide",
    excerpt: "Save time by resizing multiple images at once. Learn the best practices for batch image processing.",
    date: "2024-01-12",
    category: "Image Tools",
  },
  {
    slug: "video-compression-guide",
    title: "Video Compression Guide: Reduce File Size by 80%",
    excerpt: "Master video compression techniques to dramatically reduce file sizes while keeping quality high.",
    date: "2024-01-11",
    category: "Video Tools",
  },
  {
    slug: "pdf-security-tips",
    title: "How to Password Protect Your PDF Files",
    excerpt: "Secure your sensitive documents with password protection. Learn about PDF encryption and security best practices.",
    date: "2024-01-10",
    category: "PDF Tools",
  },
];

export default function BlogPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">
          File Tools Blog
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Tips, tutorials, and guides for file conversion and processing
        </p>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="glass rounded-2xl p-6 hover:shadow-lg transition-all"
            >
              <div className="mb-3 flex items-center gap-2 text-sm">
                <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  {post.category}
                </span>
                <span className="text-zinc-500">{post.date}</span>
              </div>
              <h2 className="mb-2 text-xl font-bold">
                <Link
                  href={`/blog/${post.slug}`}
                  className="hover:text-purple-600 transition-colors"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                {post.excerpt}
              </p>
              <Link
                href={`/blog/${post.slug}`}
                className="text-purple-600 font-semibold hover:underline"
              >
                Read More →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
